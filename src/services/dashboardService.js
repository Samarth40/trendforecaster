import { trendService } from './trendService';
import { aiService } from './aiService';
import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  getDocs,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  setDoc,
  writeBatch,
  arrayUnion,
  getDoc,
  addDoc,
  deleteDoc
} from 'firebase/firestore';

class DashboardService {
  constructor() {
    this.listeners = new Map();
    this.userStats = new Map();
    this.activityBuffer = new Map(); // Buffer for batching updates
    this.updateTimeout = null;
  }

  // Initialize user stats document with all required fields
  async initializeUserStats(userId) {
    try {
      const userStatsRef = doc(db, 'userStats', userId);
      const initialStats = {
        userId: userId, // Add userId to the document
        trendStatsCount: 0,
        contentStatsCount: 0,
        lastActive: serverTimestamp(),
        activeTrendsCount: 0,
        totalIdeasCount: 0,
        currentEngagementRate: 0,
        // Add activity tracking
        activityHistory: [],
        dailyActivityCount: 0,
        lastActivityDate: serverTimestamp(),
        // Add performance metrics
        averageResponseTime: 0,
        totalInteractions: 0,
        // Add session tracking
        sessionCount: increment(1), // Increment session count on initialization
        totalSessionDuration: 0,
        currentSessionStart: serverTimestamp(),
        createdAt: serverTimestamp() // Add creation timestamp
      };
      
      await setDoc(userStatsRef, initialStats, { merge: true });
      
      // Also create initial documents in other collections
      await this.initializeUserCollections(userId);
      
      return initialStats;
    } catch (error) {
      console.error('Error initializing user stats:', error);
      return null;
    }
  }

  // Initialize other collections for the user
  async initializeUserCollections(userId) {
    try {
      const batch = writeBatch(db);
      
      // Initialize user engagement document
      const engagementRef = doc(collection(db, 'userEngagement'), userId);
      batch.set(engagementRef, {
        userId: userId,
        impressions: 0,
        interactions: 0,
        shares: 0,
        comments: 0,
        lastUpdated: serverTimestamp()
      }, { merge: true });

      // Initialize user trends document
      const trendsRef = doc(collection(db, 'trends'), userId);
      batch.set(trendsRef, {
        userId: userId,
        lastUpdated: serverTimestamp()
      }, { merge: true });

      // Initialize user content ideas document
      const ideasRef = doc(collection(db, 'contentIdeas'), userId);
      batch.set(ideasRef, {
        userId: userId,
        lastUpdated: serverTimestamp()
      }, { merge: true });

      await batch.commit();
    } catch (error) {
      console.error('Error initializing user collections:', error);
    }
  }

  // Buffer activity updates for batch processing
  bufferActivityUpdate(userId, activityType, data) {
    if (!this.activityBuffer.has(userId)) {
      this.activityBuffer.set(userId, new Map());
    }
    
    const userBuffer = this.activityBuffer.get(userId);
    userBuffer.set(activityType, {
      timestamp: new Date(), // Use regular Date object
      data: data
    });

    // Schedule a batch update
    this.scheduleBatchUpdate(userId);
  }

  // Schedule batch update with debouncing
  scheduleBatchUpdate(userId) {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }

    this.updateTimeout = setTimeout(() => {
      this.processBatchUpdate(userId);
    }, 2000); // Batch updates every 2 seconds
  }

  // Process batch updates
  async processBatchUpdate(userId) {
    if (!this.activityBuffer.has(userId)) return;

    const userBuffer = this.activityBuffer.get(userId);
    if (userBuffer.size === 0) return;

    try {
      const batch = writeBatch(db);
      const userStatsRef = doc(db, 'userStats', userId);
      
      // Create valid activity entries with regular timestamps
      const validActivities = Array.from(userBuffer.entries())
        .map(([type, activity]) => {
          // Ensure the activity data doesn't contain any serverTimestamp values
          const cleanData = {};
          if (activity.data) {
            Object.entries(activity.data).forEach(([key, value]) => {
              if (value !== undefined && value !== null) {
                cleanData[key] = value;
              }
            });
          }

          return {
            type,
            timestamp: activity.timestamp.toISOString(),
            data: cleanData
          };
        })
        .filter(activity => activity.timestamp && activity.type);

      // First update: Array operations
      if (validActivities.length > 0) {
        await updateDoc(userStatsRef, {
          activityHistory: arrayUnion(...validActivities)
        });
      }

      // Second update: Field operations with serverTimestamp
      const fieldUpdates = {
        lastActive: serverTimestamp(),
        dailyActivityCount: increment(userBuffer.size),
        lastActivityDate: serverTimestamp()
      };

      // Add specific updates from buffer
      userBuffer.forEach((activity, type) => {
        if (activity.data) {
          Object.entries(activity.data).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              fieldUpdates[`${type}_${key}`] = value;
            }
          });
        }
      });

      // Apply field updates in a separate operation
      await updateDoc(userStatsRef, fieldUpdates);

      // Clear the buffer after successful update
      userBuffer.clear();
    } catch (error) {
      console.error('Error processing batch update:', error);
    }
  }

  // Track user activity
  async trackUserActivity(userId, activityType, data = {}) {
    try {
      const timestamp = serverTimestamp();
      const activityData = {
        type: activityType,
        timestamp,
        data: {
          ...data,
          platform: data.platform || 'All Platforms',
          category: data.category || 'General'
        }
      };

      // Get the user stats document
      const userStatsRef = doc(db, 'userStats', userId);
      const userStatsDoc = await getDoc(userStatsRef);

      if (userStatsDoc.exists()) {
        const currentStats = userStatsDoc.data();
        const activityHistory = currentStats.activityHistory || [];

        // Add new activity to the beginning of the array and keep only last 50 activities
        const updatedHistory = [
          activityData,
          ...activityHistory
        ].slice(0, 50);

        // Update activity counts
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayActivities = updatedHistory.filter(
          activity => activity.timestamp >= todayStart
        ).length;

        // Update the document with new activity data
        await updateDoc(userStatsRef, {
          activityHistory: updatedHistory,
          lastActive: timestamp,
          dailyActivityCount: todayActivities,
          [`activityCounts.${activityType}`]: increment(1)
        });

        // If it's a trend or content activity, store it separately
        if (activityType === 'CreateTrend' || activityType === 'UpdateTrend') {
          await this.storeTrendActivity(userId, activityData);
        } else if (activityType === 'CreateContent' || activityType === 'UpdateContent') {
          await this.storeContentActivity(userId, activityData);
        }
      }
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  // Store trend-related activity
  async storeTrendActivity(userId, activityData) {
    try {
      const trendActivityRef = collection(db, 'trendActivities');
      await addDoc(trendActivityRef, {
        userId,
        ...activityData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error storing trend activity:', error);
    }
  }

  // Store content-related activity
  async storeContentActivity(userId, activityData) {
    try {
      const savedIdeaData = {
        userId,
        title: activityData.data?.title || 'New Idea',
        description: activityData.data?.description || '',
        platform: activityData.data?.platform || 'All Platforms',
        category: activityData.data?.category || 'General',
        status: 'New',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add to savedIdeas collection
      const docRef = await addDoc(collection(db, 'savedIdeas'), savedIdeaData);

      // Update user stats
      const userStatsRef = doc(db, 'userStats', userId);
      await updateDoc(userStatsRef, {
        totalSavedIdeas: increment(1),
        lastUpdated: serverTimestamp()
      });

      // Track the activity
      await this.trackUserActivity(userId, 'SaveIdea', {
        ideaId: docRef.id,
        title: savedIdeaData.title,
        platform: savedIdeaData.platform,
        category: savedIdeaData.category,
        timestamp: new Date()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error storing saved idea:', error);
      throw error;
    }
  }

  // Save a new idea directly
  async saveIdea(userId, ideaData) {
    try {
      const savedIdeaData = {
        userId,
        title: ideaData.title || 'New Idea',
        description: ideaData.description || '',
        platform: ideaData.platform || 'All Platforms',
        category: ideaData.category || 'General',
        status: ideaData.status || 'New',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        type: ideaData.type || 'Content',
        difficulty: ideaData.difficulty || 'Medium',
        outline: ideaData.outline || [],
        modalContent: ideaData.modalContent // Include the modalContent
      };

      // Add to savedIdeas collection
      const docRef = await addDoc(collection(db, 'savedIdeas'), savedIdeaData);

      // Update user stats
      const userStatsRef = doc(db, 'userStats', userId);
      await updateDoc(userStatsRef, {
        totalSavedIdeas: increment(1),
        lastUpdated: serverTimestamp()
      });

      // Track the activity
      await this.trackUserActivity(userId, 'SaveIdea', {
        ideaId: docRef.id,
        title: savedIdeaData.title,
        platform: savedIdeaData.platform,
        category: savedIdeaData.category,
        timestamp: new Date()
      });

      return docRef.id;
    } catch (error) {
      console.error('Error saving idea:', error);
      throw error;
    }
  }

  // Get formatted recent activities
  getRecentActivities(activityHistory = []) {
    return activityHistory
      .slice(0, 5)
      .map(activity => {
        const baseActivity = {
          timestamp: activity.timestamp,
          type: activity.type
        };

        switch (activity.type) {
          case 'CreateTrend':
            return {
              ...baseActivity,
              icon: 'TrendingUp',
              title: `Created trend: ${activity.data.name}`,
              subtitle: `${activity.data.platform} • ${activity.data.category}`,
              growth: activity.data.growth || 0
            };
          case 'UpdateTrend':
            return {
              ...baseActivity,
              icon: 'RefreshCw',
              title: `Updated trend: ${activity.data.name}`,
              subtitle: `${activity.data.platform} • ${activity.data.category}`,
              growth: activity.data.growth || 0
            };
          case 'SaveIdea':
            return {
              ...baseActivity,
              icon: 'Bookmark',
              title: `Saved idea: ${activity.data.title}`,
              subtitle: `${activity.data.platform} • ${activity.data.category}`,
              status: activity.data.status || 'New'
            };
          case 'UpdateSavedIdea':
            return {
              ...baseActivity,
              icon: 'Edit',
              title: `Updated saved idea: ${activity.data.title}`,
              subtitle: `${activity.data.platform} • ${activity.data.category}`,
              status: activity.data.status || 'Updated'
            };
          case 'SessionStart':
            return {
              ...baseActivity,
              icon: 'LogIn',
              title: 'Started new session',
              subtitle: 'User logged in'
            };
          case 'SessionEnd':
            return {
              ...baseActivity,
              icon: 'LogOut',
              title: 'Ended session',
              subtitle: `Duration: ${this.formatDuration(activity.data.sessionDuration)}`
            };
          default:
            return {
              ...baseActivity,
              icon: 'Activity',
              title: 'User activity',
              subtitle: `Type: ${activity.type}`
            };
        }
      });
  }

  // Format duration for display
  formatDuration(ms) {
    if (!ms) return '0s';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  // Enhanced subscription with real-time updates
  subscribeToStats(userId, callback) {
    try {
      // Initialize user stats first
      this.initializeUserStats(userId);

      // Subscribe to user stats with real-time updates
      const userStatsListener = onSnapshot(
        doc(db, 'userStats', userId),
        {
          next: (doc) => {
            if (doc.exists()) {
              const data = doc.data();
              this.userStats.set(userId, data);
              
              // Calculate real-time metrics
              const realtimeStats = this.calculateRealtimeStats(data);
              callback({
                type: 'userStats',
                data: realtimeStats
              });
            } else {
              // If document doesn't exist, initialize it
              this.initializeUserStats(userId);
            }
          },
          error: (error) => {
            console.error('Error in user stats subscription:', error);
            callback({
              type: 'error',
              data: { message: 'Error fetching user stats' }
            });
          }
        }
      );

      // Subscribe to saved ideas with real-time updates
      const ideasListener = onSnapshot(
        query(
          collection(db, 'savedIdeas'),
          where('userId', '==', userId)
        ),
        {
          next: async (snapshot) => {
            try {
              const ideas = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                  id: doc.id,
                  title: data.title || 'New Saved Idea',
                  platform: data.platform || 'All Platforms',
                  category: data.category || 'General',
                  createdAt: data.createdAt?.toDate() || new Date(),
                  description: data.description || '',
                  status: data.status || 'Saved'
                };
              });

              // Sort in memory instead of using orderBy
              ideas.sort((a, b) => b.createdAt - a.createdAt);

              const savedIdeasStats = {
                totalIdeas: ideas.length,
                monthlyGrowth: this.calculateMonthlyGrowth(ideas),
                topPlatforms: this.getTopPlatforms(ideas),
                recentIdeas: ideas.slice(0, 5).map(idea => ({
                  title: idea.title,
                  platform: idea.platform,
                  category: idea.category,
                  createdAt: idea.createdAt,
                  status: idea.status
                }))
              };
              
              // Validate data before updating
              const updateData = {
                totalSavedIdeas: savedIdeasStats.totalIdeas,
                monthlyGrowthRate: savedIdeasStats.monthlyGrowth,
                lastUpdated: serverTimestamp()
              };

              if (savedIdeasStats.recentIdeas.length > 0) {
                updateData.recentSavedIdeas = savedIdeasStats.recentIdeas;
              }

              // Update user stats with validated data
              await updateDoc(doc(db, 'userStats', userId), updateData);

              callback({
                type: 'content',
                data: savedIdeasStats
              });
            } catch (error) {
              console.error('Error processing saved ideas:', error);
              callback({
                type: 'error',
                data: { message: 'Error processing saved ideas: ' + error.message }
              });
            }
          }
        }
      );

      // Store all listeners for cleanup
      this.listeners.set(userId, [
        userStatsListener,
        ideasListener
      ]);

      // Start activity tracking
      this.startActivityTracking(userId);
    } catch (error) {
      console.error('Error setting up subscriptions:', error);
      callback({
        type: 'error',
        data: { message: 'Error setting up real-time updates: ' + error.message }
      });
    }
  }

  // Start tracking user activity
  startActivityTracking(userId) {
    // Update activity every minute
    const activityInterval = setInterval(() => {
      this.trackUserActivity(userId, 'SessionActive', {
        timestamp: new Date(),
        sessionDuration: this.calculateSessionDuration(this.userStats.get(userId)?.currentSessionStart)
      });
    }, 60000);

    // Store interval for cleanup
    this.listeners.set(userId + '_activity', activityInterval);
  }

  // Enhanced unsubscribe method
  unsubscribeFromStats(userId) {
    // Clear all Firestore listeners
    const userListeners = this.listeners.get(userId);
    if (userListeners) {
      userListeners.forEach(listener => listener());
      this.listeners.delete(userId);
    }

    // Clear activity tracking interval
    const activityInterval = this.listeners.get(userId + '_activity');
    if (activityInterval) {
      clearInterval(activityInterval);
      this.listeners.delete(userId + '_activity');
    }

    // Final activity update
    this.trackUserActivity(userId, 'SessionEnd', {
      timestamp: new Date(),
      sessionDuration: this.calculateSessionDuration(this.userStats.get(userId)?.currentSessionStart)
    });
  }

  calculateTrendStats(trends) {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const activeTrends = trends.filter(trend => 
      new Date(trend.timestamp) > lastWeek
    );

    const weeklyGrowth = this.calculateWeeklyGrowth(trends);

    return {
      activeTrends: activeTrends.length,
      weeklyGrowth,
      topCategories: this.getTopCategories(trends),
      recentActivity: this.getRecentActivity(trends)
    };
  }

  calculateContentStats(ideas) {
    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const monthlyIdeas = ideas.filter(idea => 
      new Date(idea.createdAt) > lastMonth
    );

    const monthlyGrowth = ((monthlyIdeas.length - ideas.length) / ideas.length) * 100;

    return {
      totalIdeas: ideas.length,
      monthlyGrowth: monthlyGrowth || 0,
      topPlatforms: this.getTopPlatforms(ideas),
      recentIdeas: ideas.slice(0, 5)
    };
  }

  calculateWeeklyGrowth(trends) {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyTrends = trends.filter(trend => trend.timestamp > lastWeek);
    const previousWeekTrends = trends.filter(trend => 
      trend.timestamp <= lastWeek && 
      trend.timestamp > new Date(lastWeek.getTime() - 7 * 24 * 60 * 60 * 1000)
    );

    if (previousWeekTrends.length === 0) return 0;
    return ((weeklyTrends.length - previousWeekTrends.length) / previousWeekTrends.length) * 100;
  }

  getTopCategories(trends) {
    const categories = trends.reduce((acc, trend) => {
      if (!trend.category) return acc;
      acc[trend.category] = (acc[trend.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category);
  }

  getTopPlatforms(ideas) {
    const platforms = ideas.reduce((acc, idea) => {
      if (!idea.platform) return acc;
      acc[idea.platform] = (acc[idea.platform] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(platforms)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([platform]) => platform);
  }

  getRecentActivity(trends) {
    return trends
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)
      .map(trend => ({
        type: 'trend',
        name: trend.name,
        timestamp: trend.timestamp,
        growth: trend.growth,
        platform: trend.platform
      }));
  }

  async getEngagementRate(userId) {
    try {
      const trendsRef = collection(db, 'trends');
      const q = query(
        trendsRef,
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const trends = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      if (!trends.length) return 0;

      const totalEngagement = trends.reduce((sum, trend) => sum + (trend.engagement || 0), 0);
      return (totalEngagement / trends.length).toFixed(1);
    } catch (error) {
      console.error('Error calculating engagement rate:', error);
      return 0;
    }
  }

  calculateEngagementRate(engagementData) {
    if (!engagementData) return 0;
    
    const {
      impressions = 0,
      interactions = 0,
      shares = 0,
      comments = 0
    } = engagementData;

    const totalInteractions = interactions + (shares * 2) + (comments * 3);
    return impressions > 0 
      ? ((totalInteractions / impressions) * 100).toFixed(1)
      : 0;
  }

  // Get user's current session stats
  getUserSessionStats(userId) {
    return this.userStats.get(userId) || {
      trendStatsCount: 0,
      contentStatsCount: 0,
      lastActive: null,
      activeTrendsCount: 0,
      totalIdeasCount: 0,
      currentEngagementRate: 0
    };
  }

  // Track when user leaves dashboard
  async trackSessionEnd(userId) {
    try {
      const sessionStats = this.getUserSessionStats(userId);
      await this.trackUserActivity(userId, 'SessionEnd', {
        sessionDuration: Date.now() - new Date(sessionStats.lastActive).getTime(),
        totalActions: sessionStats.trendStatsCount + sessionStats.contentStatsCount
      });
    } catch (error) {
      console.error('Error tracking session end:', error);
    }
  }

  getDefaultStats() {
    return {
      trends: {
        activeTrends: 0,
        weeklyGrowth: 0,
        topCategories: [],
        recentActivity: []
      },
      content: {
        totalIdeas: 0,
        monthlyGrowth: 0,
        topPlatforms: [],
        recentIdeas: []
      },
      engagement: 0,
      session: {
        duration: 0,
        totalActions: 0,
        lastActive: null
      }
    };
  }

  // Calculate real-time statistics with enhanced metrics
  calculateRealtimeStats(data) {
    if (!data) {
      return this.getDefaultStats();
    }
    
    return {
      dailyActivity: {
        count: data.dailyActivityCount || 0,
        lastActive: data.lastActive || null,
        streak: this.calculateStreak(data.activityHistory || []),
        todayActions: this.calculateTodayActions(data.activityHistory || [])
      },
      performance: {
        responseTime: data.averageResponseTime || 0,
        interactions: data.totalInteractions || 0,
        sessionDuration: this.calculateSessionDuration(data.currentSessionStart),
        activeTime: this.calculateActiveTime(data.activityHistory || [])
      },
      trends: {
        activeTrends: data.activeTrendsCount || 0,
        weeklyGrowth: data.weeklyGrowthRate || 0,
        topCategories: data.topCategories || [],
        recentTrends: Array.isArray(data.recentTrends) ? data.recentTrends : []
      },
      engagement: {
        rate: data.currentEngagementRate || 0,
        change: this.calculateEngagementChange(data.engagementHistory || []),
        lastUpdate: data.lastEngagementUpdate || null
      },
      recentActivities: this.getRecentActivities(data.activityHistory || [])
    };
  }

  // Calculate today's actions
  calculateTodayActions(activityHistory) {
    const today = new Date().toDateString();
    return activityHistory
      .filter(activity => new Date(activity.timestamp).toDateString() === today)
      .length;
  }

  // Calculate active time
  calculateActiveTime(activityHistory) {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivity = activityHistory.filter(
      activity => new Date(activity.timestamp) > last24Hours
    );

    return recentActivity.reduce((total, activity) => {
      return total + (activity.data?.duration || 0);
    }, 0);
  }

  // Calculate engagement rate change
  calculateEngagementChange(trends) {
    if (!trends || trends.length < 2) return 0;
    
    const recentTrends = trends.slice(0, Math.floor(trends.length / 2));
    const olderTrends = trends.slice(Math.floor(trends.length / 2));
    
    const recentEngagement = recentTrends.reduce((sum, trend) => sum + (trend.engagement || 0), 0) / recentTrends.length;
    const olderEngagement = olderTrends.reduce((sum, trend) => sum + (trend.engagement || 0), 0) / olderTrends.length;
    
    if (olderEngagement === 0) return 0;
    return ((recentEngagement - olderEngagement) / olderEngagement) * 100;
  }

  // Calculate current session duration
  calculateSessionDuration(sessionStart) {
    if (!sessionStart) return 0;
    return Date.now() - new Date(sessionStart.toDate()).getTime();
  }

  // Calculate activity streak
  calculateStreak(activityHistory = []) {
    if (!activityHistory.length) return 0;
    
    const dates = activityHistory
      .map(activity => new Date(activity.timestamp).toDateString())
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b) - new Date(a));

    let streak = 1;
    for (let i = 1; i < dates.length; i++) {
      const curr = new Date(dates[i]);
      const prev = new Date(dates[i - 1]);
      const diffDays = Math.floor((prev - curr) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) streak++;
      else break;
    }
    
    return streak;
  }

  // Calculate monthly growth
  calculateMonthlyGrowth(ideas) {
    const now = new Date();
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const monthlyIdeas = ideas.filter(idea => idea.createdAt > lastMonth);
    const previousMonthIdeas = ideas.filter(idea => 
      idea.createdAt <= lastMonth && 
      idea.createdAt > new Date(lastMonth.getTime() - 30 * 24 * 60 * 60 * 1000)
    );

    if (previousMonthIdeas.length === 0) return 0;
    return ((monthlyIdeas.length - previousMonthIdeas.length) / previousMonthIdeas.length) * 100;
  }

  // Unsubscribe from saved ideas
  unsubscribeFromSavedIdeas(userId) {
    const listener = this.listeners.get(userId + '_savedIdeas');
    if (listener) {
      listener();
      this.listeners.delete(userId + '_savedIdeas');
    }
  }

  // Initialize saved ideas collection for user
  async initializeSavedIdeas(userId) {
    try {
      // First check if user already has any saved ideas
      const savedIdeasRef = collection(db, 'savedIdeas');
      const q = query(savedIdeasRef, where('userId', '==', userId), limit(1));
      const snapshot = await getDocs(q);

      // Initialize user stats if needed
      if (snapshot.empty) {
        // Update user stats with initial values
        const userStatsRef = doc(db, 'userStats', userId);
        await updateDoc(userStatsRef, {
          totalSavedIdeas: 0,
          lastUpdated: serverTimestamp()
        });
      }

      return null;
    } catch (error) {
      console.error('Error initializing saved ideas:', error);
      throw error;
    }
  }

  // Subscribe to saved ideas
  async subscribeToSavedIdeas(userId, callback) {
    try {
      // First ensure the user has a document in userStats
      const userStatsRef = doc(db, 'userStats', userId);
      const userStatsDoc = await getDoc(userStatsRef);

      if (!userStatsDoc.exists()) {
        await this.initializeUserStats(userId);
      }

      // Create a composite query with limit
      const savedIdeasQuery = query(
        collection(db, 'savedIdeas'),
        where('userId', '==', userId),
        limit(100)
      );

      const savedIdeasListener = onSnapshot(
        savedIdeasQuery,
        {
          next: async (snapshot) => {
            try {
              const ideas = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date(),
                title: doc.data().title || 'New Idea',
                description: doc.data().description || '',
                platform: doc.data().platform || 'All Platforms',
                category: doc.data().category || 'General',
                status: doc.data().status || 'New',
                type: doc.data().type || 'Content',
                difficulty: doc.data().difficulty || 'Medium',
                outline: doc.data().outline || [],
                modalContent: doc.data().modalContent // Include modalContent in the returned data
              }));

              // Sort by creation date
              ideas.sort((a, b) => b.createdAt - a.createdAt);

              callback({
                type: 'success',
                data: ideas
              });

              // Update user stats with total count
              await updateDoc(userStatsRef, {
                totalSavedIdeas: ideas.length,
                lastUpdated: serverTimestamp()
              });
            } catch (error) {
              console.error('Error processing saved ideas:', error);
              callback({
                type: 'error',
                data: { message: 'Error processing saved ideas' }
              });
            }
          },
          error: (error) => {
            console.error('Error in saved ideas subscription:', error);
            callback({
              type: 'error',
              data: { message: 'Error fetching saved ideas' }
            });
          }
        }
      );

      // Store listener for cleanup
      this.listeners.set(userId + '_savedIdeas', savedIdeasListener);
    } catch (error) {
      console.error('Error setting up saved ideas subscription:', error);
      callback({
        type: 'error',
        data: { message: 'Error setting up saved ideas subscription' }
      });
    }
  }

  // Delete a saved idea
  async deleteSavedIdea(userId, ideaId) {
    try {
      const ideaRef = doc(db, 'savedIdeas', ideaId);
      const ideaDoc = await getDoc(ideaRef);

      if (!ideaDoc.exists()) {
        throw new Error('Idea not found');
      }

      if (ideaDoc.data().userId !== userId) {
        throw new Error('Unauthorized');
      }

      await deleteDoc(ideaRef);

      // Track activity
      await this.trackUserActivity(userId, 'DeleteIdea', {
        ideaId,
        title: ideaDoc.data().title,
        timestamp: new Date()
      });

      return true;
    } catch (error) {
      console.error('Error deleting saved idea:', error);
      throw error;
    }
  }

  // Update a saved idea
  async updateSavedIdea(userId, ideaId, updates) {
    try {
      const ideaRef = doc(db, 'savedIdeas', ideaId);
      const ideaDoc = await getDoc(ideaRef);

      if (!ideaDoc.exists()) {
        throw new Error('Idea not found');
      }

      if (ideaDoc.data().userId !== userId) {
        throw new Error('Unauthorized');
      }

      await updateDoc(ideaRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Track activity
      await this.trackUserActivity(userId, 'UpdateSavedIdea', {
        ideaId,
        title: updates.title || ideaDoc.data().title,
        timestamp: new Date()
      });

      return true;
    } catch (error) {
      console.error('Error updating saved idea:', error);
      throw error;
    }
  }
}

// Create and export the instance
const dashboardServiceInstance = new DashboardService();
export { dashboardServiceInstance as dashboardService };
export default dashboardServiceInstance; 