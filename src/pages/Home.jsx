import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { dashboardService } from '../services/dashboardService';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, TrendingUp, RefreshCw, FileText, Edit, LogIn, LogOut, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const [user] = useAuthState(auth);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    let unsubscribeStats;
    let unsubscribeTrends;

    const initializeDashboard = async () => {
      setLoading(true);
      try {
        // Start trend monitoring
        dashboardService.startTrendMonitoring();

        // Subscribe to trend updates
        unsubscribeTrends = dashboardService.subscribeToTrendUpdates((update) => {
          setStats(prev => ({
            ...prev,
            trends: {
              ...prev.trends,
              activeTrends: update.activeTrends
            },
            platforms: {
              active: update.platforms.active,
              connected: update.platforms.connected,
              platforms: update.platforms.platforms
            }
          }));
        });

        // Subscribe to real-time stats
        unsubscribeStats = dashboardService.subscribeToStats(user.uid, (update) => {
          if (update.type === 'error') {
            setError(update.data.message);
            return;
          }

          setStats(prev => ({
            ...prev,
            [update.type]: update.data
          }));
        });

      } catch (error) {
        console.error('Error initializing dashboard:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();

    // Cleanup function
    return () => {
      if (typeof unsubscribeStats === 'function') unsubscribeStats();
      if (typeof unsubscribeTrends === 'function') unsubscribeTrends();
      dashboardService.stopTrendMonitoring();
      dashboardService.unsubscribeFromStats(user.uid);
    };
  }, [user]);

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
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
          Welcome back, {user?.email?.split('@')[0] || 'Guest'}!
        </h1>
        <p className="mt-2 text-gray-400">
          Track, analyze, and forecast trending topics across social media platforms.
        </p>
        {!loading && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Session: {formatDuration(stats.performance.sessionDuration)}</span>
              <span>•</span>
              <span>Today's Actions: {stats.dailyActivity.todayActions}</span>
              <span>•</span>
              <span>Streak: {stats.dailyActivity.streak} days</span>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Active Time: {formatDuration(stats.performance.activeTime)}</span>
              <span>•</span>
              <span>Last Active: {formatTimeAgo(stats.dailyActivity.lastActive)}</span>
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
            <div>
              <p className="text-sm font-medium text-gray-400">Active Trends</p>
              <p className="mt-2 text-3xl font-bold text-purple-400">
                {loading ? '...' : stats.trends.activeTrends}
              </p>
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
          <div className="mt-4">
            <div className="flex items-center">
              <span className={`text-sm font-medium ${stats.trends.weeklyGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {loading ? '...' : `${stats.trends.weeklyGrowth.toFixed(1)}%`}
              </span>
              <span className="ml-2 text-gray-400 text-sm">from last week</span>
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
            <div>
              <p className="text-sm font-medium text-gray-400">Saved Ideas</p>
              <p className="mt-2 text-3xl font-bold text-cyan-400">
                {loading ? '...' : stats.content.totalIdeas}
              </p>
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
          <div className="mt-4">
            <div className="flex items-center">
              <span className={`text-sm font-medium ${stats.content.monthlyGrowth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {loading ? '...' : `${stats.content.monthlyGrowth.toFixed(1)}%`}
              </span>
              <span className="ml-2 text-gray-400 text-sm">from last month</span>
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
            <div>
              <p className="text-sm font-medium text-gray-400">Platform Coverage</p>
              <p className="mt-2 text-3xl font-bold text-emerald-400">
                {loading ? '...' : `${stats.platforms.active}/7`}
              </p>
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
            <div className="flex flex-wrap gap-2">
              {loading ? (
                <span className="text-sm text-gray-400">Loading platforms...</span>
              ) : stats.platforms.connected.length > 0 ? (
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
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-xl p-6"
      >
        <h2 className="text-xl font-bold text-gray-100 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="h-16 bg-gray-800 bg-opacity-50 rounded-lg" />
              ))}
            </div>
          ) : stats.recentActivities?.length > 0 ? (
            stats.recentActivities.map((activity, index) => (
              <ActivityItem key={index} activity={activity} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              No recent activity to display
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default Home; 