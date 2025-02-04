import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { socialMediaService } from '../../services/socialMediaService';
import { FaReddit, FaHackerNews, FaGithub } from 'react-icons/fa';

const SocialMediaTrends = () => {
  const [trends, setTrends] = useState({
    reddit: [],
    hackernews: [],
    github: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reddit');

  useEffect(() => {
    fetchTrends();
  }, []);

  const fetchTrends = async () => {
    setLoading(true);
    try {
      const [redditTrends, hackerNewsTrends, githubTrends] = await Promise.all([
        socialMediaService.getRedditTrending(),
        socialMediaService.getHackerNewsTrends(),
        socialMediaService.getGithubTrending()
      ]);

      setTrends({
        reddit: redditTrends,
        hackernews: hackerNewsTrends,
        github: githubTrends
      });
    } catch (error) {
      console.error('Error fetching trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const platformIcons = {
    reddit: <FaReddit className="w-5 h-5" />,
    hackernews: <FaHackerNews className="w-5 h-5" />,
    github: <FaGithub className="w-5 h-5" />
  };

  const renderTrendItem = (item, platform) => {
    switch (platform) {
      case 'reddit':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect p-4 rounded-lg"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-400">{item.subreddit}</span>
                <div className="flex items-center space-x-3 text-sm text-gray-400">
                  <span>↑ {item.score.toLocaleString()}</span>
                  <span>💬 {item.comments.toLocaleString()}</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-100">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                  {item.title}
                </a>
              </h3>
            </div>
          </motion.div>
        );
      
      case 'hackernews':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect p-4 rounded-lg"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-orange-400">by {item.by}</span>
                <div className="flex items-center space-x-3 text-sm text-gray-400">
                  <span>↑ {item.score.toLocaleString()}</span>
                  <span>💬 {item.comments.toLocaleString()}</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-100">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                  {item.title}
                </a>
              </h3>
              <span className="text-sm text-gray-400">
                {new Date(item.time).toLocaleString()}
              </span>
            </div>
          </motion.div>
        );
      
      case 'github':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect p-4 rounded-lg"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-400">{item.language || 'Various'}</span>
                <span className="text-sm text-gray-400">⭐ {item.stars.toLocaleString()}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-100">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                  {item.name}
                </a>
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-100">Trending Now</h2>
        <button
          onClick={fetchTrends}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-400 to-cyan-400 text-white hover:opacity-90 transition-opacity"
        >
          Refresh
        </button>
      </div>

      {/* Platform Tabs */}
      <div className="flex space-x-4 border-b border-gray-700">
        {Object.keys(platformIcons).map((platform) => (
          <button
            key={platform}
            onClick={() => setActiveTab(platform)}
            className={`flex items-center space-x-2 px-4 py-2 text-gray-400 hover:text-white transition-colors ${
              activeTab === platform
                ? 'border-b-2 border-cyan-400 text-white'
                : ''
            }`}
          >
            {platformIcons[platform]}
            <span className="capitalize">
              {platform === 'hackernews' ? 'Hacker News' : platform}
            </span>
          </button>
        ))}
      </div>

      {/* Trends List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
          </div>
        ) : (
          <div className="grid gap-4">
            {trends[activeTab].map((item, index) => (
              <div key={index}>{renderTrendItem(item, activeTab)}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaTrends; 