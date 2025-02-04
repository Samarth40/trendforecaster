import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { dashboardService } from '../services/dashboardService';
import { activityTracker } from '../services/activityTracker';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, TrendingUp, RefreshCw, FileText, Edit, LogIn, LogOut, Activity, MessageSquareMore, Sparkles, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

// Add LoadingBar component
const LoadingBar = () => (
  <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
    <motion.div
      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
      initial={{ width: "0%" }}
      animate={{ width: "100%" }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  </div>
);

function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Never';
  const now = new Date();
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
  if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  return 'Just now';
}

// Icon mapping
const ACTIVITY_ICONS = {
  TrendingUp,
  RefreshCw,
  FileText,
  Edit,
  LogIn,
  LogOut,
  Activity
};

function Home() {
  const [user, loading] = useAuthState(auth);
  const [stats, setStats] = useState({
    trends: {
      activeTrends: 0,
      weeklyGrowth: 0,
      topCategories: [],
      recentTrends: []
    },
    content: {
      totalIdeas: 0,
      monthlyGrowth: 0,
      topPlatforms: [],
      recentIdeas: []
    },
    platforms: {
      active: 0,
      connected: [],
      platforms: {}
    },
    dailyActivity: {
      count: 0,
      lastActive: null,
      streak: 0,
      todayActions: 0
    },
    performance: {
      responseTime: 0,
      interactions: 0,
      sessionDuration: 0,
      activeTime: 0
    },
    recentActivities: []
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Guest');

  useEffect(() => {
    if (!user) {
      // Reset stats when user is not authenticated
      setStats({
        trends: {
          activeTrends: 0,
          weeklyGrowth: 0,
          topCategories: [],
          recentTrends: []
        },
        content: {
          totalIdeas: 0,
          monthlyGrowth: 0,
          topPlatforms: [],
          recentIdeas: []
        },
        platforms: {
          active: 0,
          connected: [],
          platforms: {}
        },
        dailyActivity: {
          count: 0,
          lastActive: null,
          streak: 0,
          todayActions: 0
        },
        performance: {
          responseTime: 0,
          interactions: 0,
          sessionDuration: 0,
          activeTime: 0
        },
        recentActivities: []
      });
      return;
    }

    let unsubscribeStats;
    let unsubscribeTrends;

    const initializeDashboard = async () => {
      try {
        // Initialize user data first
        await dashboardService.initializeUserStats(user.uid);
        
        // Subscribe to trend updates
        unsubscribeTrends = dashboardService.subscribeToTrendUpdates((trendUpdate) => {
          setStats(prev => ({
            ...prev,
            trends: {
              ...prev.trends,
              activeTrends: trendUpdate.activeTrends
            },
            platforms: trendUpdate.platforms
          }));
        });

        // Subscribe to stats updates
        unsubscribeStats = dashboardService.subscribeToStats(user.uid, (update) => {
          if (update.type === 'error') {
            setError(update.data.message);
            return;
          }

          if (update.type === 'userStats') {
            setStats(prev => ({
              ...prev,
              dailyActivity: update.data.dailyActivity,
              performance: update.data.performance,
              recentActivities: update.data.recentActivities
            }));
          }

          if (update.type === 'content') {
            setStats(prev => ({
              ...prev,
              content: update.data
            }));
          }
        });

        // Start trend monitoring
        dashboardService.startTrendMonitoring();

      } catch (error) {
        console.error('Error initializing dashboard:', error);
        setError('Failed to load dashboard data');
      }
    };

    initializeDashboard();

    // Cleanup function
    return () => {
      console.log('Cleaning up subscriptions...');
      if (unsubscribeStats) {
        unsubscribeStats();
        console.log('Stats unsubscribed');
      }
      if (unsubscribeTrends) {
        unsubscribeTrends();
        console.log('Trends unsubscribed');
      }
      dashboardService.stopTrendMonitoring();
      // Clear any errors when unmounting
      setError(null);
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      const name = getFirstName();
      console.log('Setting username to:', name);
      setUserName(name);
    } else {
      setUserName('Guest');
    }
  }, [user, user?.email, loading]);

  // Format duration for display
  const formatDuration = (ms) => {
    if (!ms) return '0s';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Render activity item
  const ActivityItem = ({ activity }) => {
    const Icon = ACTIVITY_ICONS[activity.icon] || Activity;
    const growthColor = activity.growth >= 0 ? 'text-green-400' : 'text-red-400';
    const statusColor = activity.status === 'Published' ? 'text-green-400' : 'text-yellow-400';

    return (
      <div className="flex items-center p-4 rounded-lg bg-gray-800 bg-opacity-50">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 flex items-center justify-center">
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="ml-4 flex-grow">
          <p className="text-sm font-medium text-gray-100">
            {activity.title}
          </p>
          <p className="text-sm text-gray-400">
            {activity.subtitle}
          </p>
        </div>
        <div className="ml-auto text-right">
          {activity.growth !== undefined && (
            <span className={`text-sm font-medium ${growthColor}`}>
              {activity.growth >= 0 ? '+' : ''}{activity.growth}%
            </span>
          )}
          {activity.status && (
            <span className={`text-sm font-medium ${statusColor}`}>
              {activity.status}
            </span>
          )}
          <p className="text-sm text-gray-400">
            {formatTimeAgo(activity.timestamp)}
          </p>
        </div>
      </div>
    );
  };

  const AIChatbotCTA = () => (
    <div className="relative overflow-hidden space-y-8">
      {/* Centered Heading Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400">
          Your AI-Powered Trend Analysis Assistant
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Get instant insights, content ideas, and market analysis with our advanced AI assistant.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Content: Chat Preview */}
        <div className="lg:col-span-7 bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-2xl p-6 relative overflow-hidden">
          {/* Chat Interface Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-700/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-gray-200 font-medium">AI Assistant</h3>
                <p className="text-xs text-gray-400">Online • Ready to help</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="space-y-4 min-h-[300px]">
            <div className="flex items-start space-x-3 max-w-md">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
                  <MessageSquareMore className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="bg-purple-500/10 backdrop-blur-sm rounded-2xl rounded-tl-none p-4">
                <p className="text-sm text-gray-300">How can I identify emerging trends in my industry?</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 max-w-md ml-auto">
              <div className="bg-cyan-500/10 backdrop-blur-sm rounded-2xl rounded-tr-none p-4">
                <p className="text-sm text-gray-300">I'll analyze market data and social signals to identify emerging trends. Let me break down the top 3 trends in your industry...</p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 max-w-md">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
                  <MessageSquareMore className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="bg-purple-500/10 backdrop-blur-sm rounded-2xl rounded-tl-none p-4">
                <p className="text-sm text-gray-300">That's exactly what I needed! Can you also suggest content ideas for these trends?</p>
              </div>
            </div>

            {/* Typing Indicator */}
            <div className="flex items-center space-x-2 ml-11">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse delay-200"></div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="mt-4 flex items-center gap-2 bg-white/5 rounded-xl p-2">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 bg-transparent border-0 focus:ring-0 text-gray-300 text-sm placeholder-gray-500"
              disabled
            />
            <button className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 text-white">
              <MessageSquareMore className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Content: Features */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            {[
              {
                icon: Sparkles,
                title: "Smart Trend Detection",
                description: "Identify emerging trends before they go mainstream"
              },
              {
                icon: MessageSquareMore,
                title: "24/7 AI Support",
                description: "Get instant answers to your trend analysis questions"
              },
              {
                icon: TrendingUp,
                title: "Market Intelligence",
                description: "Data-driven insights for better decision making"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 backdrop-blur-sm hover:from-purple-500/20 hover:to-cyan-500/20 transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-200">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <button
              onClick={() => navigate('/dashboard/chat')}
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-medium flex items-center justify-center space-x-2 hover:shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
            >
              <MessageSquareMore className="w-5 h-5" />
              <span>Start Your AI Journey</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Get user's first name
  const getFirstName = () => {
    try {
      if (loading) {
        return 'Loading...';
      }

      if (!user) {
        return 'Guest';
      }

      // Check if user is authenticated but anonymous
      if (user.isAnonymous) {
        return 'Guest';
      }

      // Check for display name from auth
      if (user.displayName) {
        return user.displayName.split(' ')[0];
      }

      // Check for email
      if (user.email) {
        const emailName = user.email.split('@')[0];
        // Capitalize first letter and format the name
        return emailName.charAt(0).toUpperCase() + emailName.slice(1).toLowerCase();
      }

      // Default case
      return 'Guest';
    } catch (error) {
      console.error('Error in getFirstName:', error);
      return 'Guest';
    }
  };

  // Update the welcome message to be simple and direct
  const getWelcomeMessage = () => {
    return 'Welcome, Explorer!';
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      // First unsubscribe from all listeners
      dashboardService.unsubscribeFromStats(user?.uid);
      dashboardService.stopTrendMonitoring();
      
      // Then sign out
      await auth.signOut();
      
      // Reset local state
      setStats({
        trends: {
          activeTrends: 0,
          weeklyGrowth: 0,
          topCategories: [],
          recentTrends: []
        },
        content: {
          totalIdeas: 0,
          monthlyGrowth: 0,
          topPlatforms: [],
          recentIdeas: []
        },
        platforms: {
          active: 0,
          connected: [],
          platforms: {}
        },
        dailyActivity: {
          count: 0,
          lastActive: null,
          streak: 0,
          todayActions: 0
        },
        performance: {
          responseTime: 0,
          interactions: 0,
          sessionDuration: 0,
          activeTime: 0
        },
        recentActivities: []
      });
      setError(null);
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-effect rounded-xl p-4 border border-red-500/20 bg-red-500/10"
          >
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Section */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              {getWelcomeMessage()}
            </h1>
            <p className="mt-2 text-gray-400">
              Track, analyze, and forecast trending topics across social media platforms.
            </p>
          </div>
          
          {/* Streak Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 md:mt-0 flex items-center bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl p-4"
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {loading ? '...' : stats.dailyActivity.streak}
                    </span>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-200">Day Streak!</p>
                <p className="text-sm text-gray-400">
                  {loading ? 'Loading...' : stats.dailyActivity.streak === 0 
                    ? 'Start your streak today!'
                    : `Keep it going! Come back tomorrow`}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {!loading && (
          <div className="mt-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/Samarth40/trendforecaster"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 hover:from-purple-500/20 hover:to-cyan-500/20 rounded-lg transition-all duration-300"
              >
                <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-gray-300 hover:text-white transition-colors">View on GitHub</span>
              </a>
              <div className="h-6 w-px bg-gray-700"></div>
              <p className="text-sm text-gray-400">
                An open-source project for trend analysis and forecasting
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span>Open Source</span>
              </div>
              <span className="text-gray-600">•</span>
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                <span>MIT License</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Trends Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300"
          onClick={() => navigate('/dashboard/trends')}
        >
          <div className="flex items-center justify-between">
            <div className="w-full">
              <p className="text-sm font-medium text-gray-400">Active Trends</p>
              {loading ? (
                <div className="space-y-3 mt-2">
                  <div className="h-8 w-24 bg-gray-700/50 rounded animate-pulse" />
                  <LoadingBar />
                </div>
              ) : (
                <>
                  <p className="mt-2 text-3xl font-bold text-purple-400">
                    {stats.trends.activeTrends}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">Currently monitoring across platforms</p>
                </>
              )}
            </div>
            <div className="p-3 bg-purple-500 bg-opacity-10 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Saved Ideas Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-xl p-6 cursor-pointer hover:bg-gray-800/50 transition-all"
          onClick={() => navigate('/dashboard/saved-ideas')}
        >
          <div className="flex items-center justify-between">
            <div className="w-full">
              <p className="text-sm font-medium text-gray-400">Saved Ideas</p>
              {loading ? (
                <div className="space-y-3 mt-2">
                  <div className="h-8 w-24 bg-gray-700/50 rounded animate-pulse" />
                  <LoadingBar />
                </div>
              ) : (
                <>
                  <p className="mt-2 text-3xl font-bold text-cyan-400">
                    {stats.content.totalIdeas}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">Content ideas in your collection</p>
                </>
              )}
            </div>
            <div className="p-3 bg-cyan-500 bg-opacity-10 rounded-lg">
              <svg
                className="w-6 h-6 text-cyan-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Platform Coverage Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <div className="w-full">
              <p className="text-sm font-medium text-gray-400">Platform Coverage</p>
              {loading ? (
                <div className="space-y-3 mt-2">
                  <div className="h-8 w-24 bg-gray-700/50 rounded animate-pulse" />
                  <LoadingBar />
                </div>
              ) : (
                <>
                  <p className="mt-2 text-3xl font-bold text-emerald-400">
                    {`${stats.platforms.active}/7`}
                  </p>
                </>
              )}
            </div>
            <div className="p-3 bg-emerald-500 bg-opacity-10 rounded-lg">
              <svg
                className="w-6 h-6 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </div>
          </div>
          <div className="mt-4">
            {loading ? (
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-6 w-20 bg-gray-700/50 rounded-full animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {stats.platforms.connected.length > 0 ? (
                  stats.platforms.connected.map((platform) => (
                    <span
                      key={platform}
                      className="px-2 py-1 text-sm font-medium text-emerald-400 bg-emerald-500 bg-opacity-10 rounded-full"
                    >
                      {platform}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">No active platforms</span>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* AI Chatbot CTA Section */}
      <AIChatbotCTA />
    </div>
  );
}

export default Home; 