import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { motion } from 'framer-motion';
import { trendService } from '../services/trendService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const NoDataMessage = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <svg
      className="w-12 h-12 text-gray-400 mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <p className="text-gray-400">{message}</p>
  </div>
);

const VALID_CATEGORIES = {
  general: 'General',
  technology: 'Technology',
  business: 'Business',
  entertainment: 'Entertainment',
  science: 'Science',
  politics: 'Politics',
  sports: 'Sports'
};

const PLATFORM_NAMES = {
  news: 'News',
  youtube: 'YouTube',
  reddit: 'Reddit',
  hackernews: 'Hacker News',
  github: 'GitHub'
};

function TrendAnalysis() {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [timeRange, setTimeRange] = useState('24h');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('engagement');
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);

  useEffect(() => {
    fetchTrendData();
  }, [selectedPlatform, timeRange, selectedCategory, sortBy]);

  const fetchTrendData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await trendService.getAllPlatformTrends();
      if (result) {
        const { trends: newTrends, analysis: newAnalysis } = result;
        
        // Extract all available platforms and categories
        const platforms = new Set();
        const categories = new Set();
        
        Object.entries(newTrends).forEach(([platform, platformTrends]) => {
          if (platformTrends && platformTrends.length > 0) {
            platforms.add(platform);
            platformTrends.forEach(trend => {
              if (trend.category && 
                  typeof trend.category === 'string' && 
                  trend.category.toLowerCase() in VALID_CATEGORIES) {
                categories.add(trend.category.toLowerCase());
              }
            });
          }
        });

        // Update available platforms with proper names and counts
        setAvailablePlatforms([
          { id: 'all', name: 'All Platforms' },
          ...Array.from(platforms).map(platform => ({
            id: platform,
            name: PLATFORM_NAMES[platform] || platform.charAt(0).toUpperCase() + platform.slice(1),
            count: newTrends[platform]?.length || 0
          }))
        ]);

        // Update available categories with proper names and counts
        const categoryCounts = {};
        Object.values(newTrends).flat().forEach(trend => {
          if (trend.category && trend.category.toLowerCase() in VALID_CATEGORIES) {
            const cat = trend.category.toLowerCase();
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
          }
        });

        setAvailableCategories([
          { id: 'all', name: 'All Categories' },
          ...Array.from(categories).map(category => ({
            id: category,
            name: VALID_CATEGORIES[category],
            count: categoryCounts[category] || 0
          }))
        ]);
        
        // Process trends based on filters
        let processedTrends = [];
        if (selectedPlatform === 'all') {
          processedTrends = Object.values(newTrends).flat();
        } else {
          processedTrends = newTrends[selectedPlatform] || [];
        }

        // Apply category filter with proper category matching
        if (selectedCategory !== 'all') {
          processedTrends = processedTrends.filter(trend => 
            trend.category?.toLowerCase() === selectedCategory.toLowerCase()
          );
        }

        // Apply time range filter
        processedTrends = filterByTimeRange(processedTrends, timeRange);

        // Apply search filter
        if (searchQuery) {
          processedTrends = processedTrends.filter(trend =>
            trend.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            trend.description?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        // Apply sorting
        processedTrends = sortTrends(processedTrends, sortBy);

        // Update chart data with top trends
        if (processedTrends.length > 0) {
          updateChartData(processedTrends.slice(0, 5));
        } else {
          setChartData(null);
        }
        
        setTrends(processedTrends);
        setAnalysis(newAnalysis);
      }
    } catch (err) {
      setError('Failed to fetch trend data. Please try again later.');
      console.error('Error fetching trends:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterByTimeRange = (trends, range) => {
    const now = new Date();
    const timeLimit = new Date();

    switch (range) {
      case '24h':
        timeLimit.setHours(now.getHours() - 24);
        break;
      case '7d':
        timeLimit.setDate(now.getDate() - 7);
        break;
      case '30d':
        timeLimit.setDate(now.getDate() - 30);
        break;
      default:
        return trends;
    }

    return trends.filter(trend => {
      const trendDate = trend.timestamp ? new Date(trend.timestamp) : now;
      return trendDate >= timeLimit;
    });
  };

  const sortTrends = (trends, sortType) => {
    const trendsCopy = [...trends];
    
    switch (sortType) {
      case 'engagement':
        return trendsCopy.sort((a, b) => {
          const aEngagement = calculateTotalEngagement(a);
          const bEngagement = calculateTotalEngagement(b);
          if (bEngagement === aEngagement) {
            return (b.growth || 0) - (a.growth || 0); // Secondary sort by growth
          }
          return bEngagement - aEngagement;
        });
        
      case 'growth':
        return trendsCopy.sort((a, b) => {
          const growthDiff = (b.growth || 0) - (a.growth || 0);
          if (growthDiff === 0) {
            return calculateTotalEngagement(b) - calculateTotalEngagement(a); // Secondary sort by engagement
          }
          return growthDiff;
        });
        
      case 'recent':
        return trendsCopy.sort((a, b) => {
          const timeDiff = (b.timestamp || 0) - (a.timestamp || 0);
          if (timeDiff === 0) {
            return calculateTotalEngagement(b) - calculateTotalEngagement(a); // Secondary sort by engagement
          }
          return timeDiff;
        });
        
      default:
        return trendsCopy;
    }
  };

  const calculateTotalEngagement = (trend) => {
    if (!trend) return 0;
    
    const baseEngagement = trend.volume || trend.views || 0;
    const additionalEngagement = trend.engagement 
      ? Object.values(trend.engagement).reduce((sum, val) => sum + (val || 0), 0)
      : 0;
    const growthBonus = trend.growth ? (baseEngagement * (trend.growth / 100)) : 0;
    
    return baseEngagement + additionalEngagement + growthBonus;
  };

  const getTopTrends = (trends) => {
    // Sort by engagement and growth
    return trends
      .sort((a, b) => {
        const aScore = calculateTotalEngagement(a) * (1 + (a.growth || 0) / 100);
        const bScore = calculateTotalEngagement(b) * (1 + (b.growth || 0) / 100);
        return bScore - aScore;
      })
      .slice(0, 3);
  };

  const getEmergingTrends = (trends) => {
    // Sort by growth rate and recency
    return trends
      .sort((a, b) => {
        const aScore = (a.growth || 0) * (a.timestamp || Date.now());
        const bScore = (b.growth || 0) * (b.timestamp || Date.now());
        return bScore - aScore;
      })
      .slice(0, 3);
  };

  const updateChartData = (trendData) => {
    const labels = trendData.map(trend => trend.name);
    const engagementData = trendData.map(trend => trend.volume || trend.views);
    const growthData = trendData.map(trend => trend.growth || 0);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Engagement',
          data: engagementData,
          fill: false,
          borderColor: 'rgb(139, 92, 246)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.4,
          pointBackgroundColor: 'rgb(139, 92, 246)',
          yAxisID: 'y',
        },
        {
          label: 'Growth Rate',
          data: growthData,
          fill: false,
          borderColor: 'rgb(52, 211, 153)',
          backgroundColor: 'rgba(52, 211, 153, 0.1)',
          tension: 0.4,
          pointBackgroundColor: 'rgb(52, 211, 153)',
          yAxisID: 'y1',
        }
      ]
    });
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'rgb(156, 163, 175)',
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(243, 244, 246)',
        borderColor: 'rgb(75, 85, 99)',
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.dataset.yAxisID === 'y') {
              label += context.parsed.y.toLocaleString();
            } else {
              label += context.parsed.y.toFixed(1) + '%';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          maxRotation: 30,
          minRotation: 30,
          font: {
            size: 10
          },
          callback: function(value, index, values) {
            // Get the original label
            const label = this.getLabelForValue(value);
            // Truncate the label if it's too long
            return label.length > 20 ? label.substring(0, 20) + '...' : label;
          }
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Engagement',
          color: 'rgb(139, 92, 246)',
        },
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: function(value) {
            return value.toLocaleString();
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Growth Rate (%)',
          color: 'rgb(52, 211, 153)',
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: 'rgb(156, 163, 175)',
          callback: function(value) {
            return value.toFixed(1) + '%';
          }
        }
      }
    }
  };

  const timeRanges = [
    { id: '24h', name: 'Last 24 Hours' },
    { id: '7d', name: 'Last 7 Days' },
    { id: '30d', name: 'Last 30 Days' }
  ];

  const sortOptions = [
    { id: 'engagement', name: 'Engagement' },
    { id: 'growth', name: 'Growth' },
    { id: 'recent', name: 'Recent' }
  ];

  const filteredTrends = trends.filter(trend => 
    trend.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topTrends = getTopTrends(filteredTrends);
  const emergingTrends = getEmergingTrends(
    filteredTrends.filter(trend => !topTrends.includes(trend))
  );

  const handleTrendClick = (trend) => {
    navigate(`/dashboard/trend/${encodeURIComponent(trend.name)}`, { state: { trend } });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass-effect rounded-xl p-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
          Trend Analysis
        </h1>
        <p className="mt-2 text-gray-400">
          Analyze and track trending topics across different platforms
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="glass-effect rounded-xl p-4 bg-red-500 bg-opacity-10 border border-red-500">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="glass-effect rounded-xl p-6 border border-gray-700 border-opacity-40">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search trends..."
            className="flex-1 min-w-[200px] px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 text-gray-100 placeholder-gray-500 border border-gray-700 border-opacity-40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 text-gray-100 border border-gray-700 border-opacity-40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all cursor-pointer appearance-none min-w-[160px] pr-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQgNmw0IDQgNC00IiBzdHJva2U9IiM5Q0E3QjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem] hover:bg-opacity-70"
          >
            {availablePlatforms.map(platform => (
              <option key={platform.id} value={platform.id} className="bg-gray-800 text-gray-100">
                {platform.name} {platform.id !== 'all' && `(${platform.count})`}
              </option>
            ))}
          </select>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 text-gray-100 border border-gray-700 border-opacity-40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all cursor-pointer appearance-none min-w-[160px] pr-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQgNmw0IDQgNC00IiBzdHJva2U9IiM5Q0E3QjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem] hover:bg-opacity-70"
          >
            {timeRanges.map(range => (
              <option key={range.id} value={range.id} className="bg-gray-800 text-gray-100">
                {range.name}
              </option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 text-gray-100 border border-gray-700 border-opacity-40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all cursor-pointer appearance-none min-w-[160px] pr-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQgNmw0IDQgNC00IiBzdHJva2U9IiM5Q0E3QjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem] hover:bg-opacity-70"
          >
            {availableCategories.map(category => (
              <option key={category.id} value={category.id} className="bg-gray-800 text-gray-100">
                {category.name} {category.id !== 'all' && `(${category.count})`}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-800 bg-opacity-50 text-gray-100 border border-gray-700 border-opacity-40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all cursor-pointer appearance-none min-w-[160px] pr-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTQgNmw0IDQgNC00IiBzdHJva2U9IiM5Q0E3QjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem] hover:bg-opacity-70"
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id} className="bg-gray-800 text-gray-100">
                {option.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Summary */}
        {!loading && (
          <div className="mt-4 p-3 rounded-lg bg-gray-800 bg-opacity-30 border border-gray-700 border-opacity-50">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>
                Showing {filteredTrends.length} {filteredTrends.length === 1 ? 'trend' : 'trends'}
                {selectedPlatform !== 'all' && ` from ${selectedPlatform}`}
                {selectedCategory !== 'all' && ` in ${selectedCategory}`}
                {` for the ${timeRanges.find(r => r.id === timeRange)?.name.toLowerCase()}`}
                {searchQuery && ` matching "${searchQuery}"`}
                {`, sorted by ${sortOptions.find(o => o.id === sortBy)?.name.toLowerCase()}`}
              </p>
            </div>
          </div>
        )}

        {filteredTrends.length === 0 && !loading && (
          <div className="mt-4 p-4 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 border-opacity-50">
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No trends found with the current filters. Try adjusting your search criteria.</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Insights */}
      {!loading && (
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500 bg-opacity-20">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-100">AI Insights</h2>
                <p className="text-sm text-gray-400">Real-time analysis of trending patterns</p>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              Updated {new Date().toLocaleTimeString()}
            </div>
          </div>
          
          {analysis ? (
            <div className="space-y-4">
              {analysis.split('\n').map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-800 bg-opacity-50 hover:bg-opacity-70 transition-all"
                >
                  <div className="mt-1">
                    {index === 0 ? (
                      <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                    ) : index === 1 ? (
                      <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                    ) : index === 2 ? (
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    ) : index === 3 ? (
                      <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    ) : index === 4 ? (
                      <div className="w-2 h-2 rounded-full bg-red-400"></div>
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{insight}</p>
                </div>
              ))}
              
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-purple-500 bg-opacity-10 border border-purple-500 border-opacity-20">
                  <div className="text-sm text-gray-400">Total Trends</div>
                  <div className="text-2xl font-bold text-purple-400 mt-1">
                    {filteredTrends.length}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-cyan-500 bg-opacity-10 border border-cyan-500 border-opacity-20">
                  <div className="text-sm text-gray-400">Active Platforms</div>
                  <div className="text-2xl font-bold text-cyan-400 mt-1">
                    {availablePlatforms.length - 1}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-green-500 bg-opacity-10 border border-green-500 border-opacity-20">
                  <div className="text-sm text-gray-400">Categories</div>
                  <div className="text-2xl font-bold text-green-400 mt-1">
                    {availableCategories.length - 1}
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-20">
                  <div className="text-sm text-gray-400">Avg Growth</div>
                  <div className="text-2xl font-bold text-yellow-400 mt-1">
                    {(filteredTrends.reduce((acc, trend) => acc + (trend.growth || 0), 0) / filteredTrends.length).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <NoDataMessage message="No analysis available for the current selection." />
          )}
        </div>
      )}

      {/* Trend Performance Chart */}
      {chartData && (
        <div className="glass-effect rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-100">Trend Performance</h2>
              <p className="text-sm text-gray-400 mt-1">Engagement and growth analysis of top trends</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                <span className="text-sm text-gray-400">Engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-sm text-gray-400">Growth Rate</span>
              </div>
            </div>
          </div>
          <div className="h-[400px]">
            <Line data={chartData} options={chartOptions} />
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {chartData.labels.map((label, index) => (
              <div key={label} className="glass-effect p-3 rounded-lg">
                <div className="text-sm font-medium text-gray-300">{label}</div>
                <div className="mt-1 flex justify-between items-center">
                  <span className="text-xs text-purple-400">
                    {chartData.datasets[0].data[index].toLocaleString()} views
                  </span>
                  <span className={`text-xs ${chartData.datasets[1].data[index] >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {chartData.datasets[1].data[index] >= 0 ? '+' : ''}{chartData.datasets[1].data[index].toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-effect rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Top Trending Topics</h2>
          <div className="space-y-4">
            {loading ? (
              Array(3).fill(null).map((_, index) => (
                <div key={index} className="animate-pulse flex items-center p-4 rounded-lg bg-gray-800 bg-opacity-50">
                  <div className="w-10 h-10 rounded-full bg-gray-700" />
                  <div className="ml-4 space-y-2 flex-1">
                    <div className="h-4 bg-gray-700 rounded w-1/2" />
                    <div className="h-3 bg-gray-700 rounded w-3/4" />
                  </div>
                </div>
              ))
            ) : topTrends.length > 0 ? (
              topTrends.map((trend, index) => (
                <motion.div
                  key={trend.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center p-4 rounded-lg bg-gray-800 bg-opacity-50 hover:bg-opacity-70 transition-all cursor-pointer"
                  onClick={() => handleTrendClick(trend)}
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 flex items-center justify-center text-white font-bold">
                      #{index + 1}
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-100">
                      {trend.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {trend.volume || trend.views} {trend.platform === 'youtube' ? 'views' : 'mentions'} • {trend.platform.charAt(0).toUpperCase() + trend.platform.slice(1)}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className={`text-sm font-medium ${trend.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trend.growth >= 0 ? '+' : ''}{trend.growth}%
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <NoDataMessage message="No trending topics found for the selected filters." />
            )}
          </div>
        </div>

        <div className="glass-effect rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-100 mb-4">Emerging Trends</h2>
          <div className="space-y-4">
            {loading ? (
              Array(3).fill(null).map((_, index) => (
                <div key={index} className="animate-pulse flex items-center p-4 rounded-lg bg-gray-800 bg-opacity-50">
                  <div className="w-10 h-10 rounded-full bg-gray-700" />
                  <div className="ml-4 space-y-2 flex-1">
                    <div className="h-4 bg-gray-700 rounded w-1/2" />
                    <div className="h-3 bg-gray-700 rounded w-3/4" />
                  </div>
                </div>
              ))
            ) : emergingTrends.length > 0 ? (
              emergingTrends.map((trend, index) => (
                <motion.div
                  key={trend.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center p-4 rounded-lg bg-gray-800 bg-opacity-50 hover:bg-opacity-70 transition-all cursor-pointer"
                  onClick={() => handleTrendClick(trend)}
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
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
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-100">
                      {trend.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {trend.platform.charAt(0).toUpperCase() + trend.platform.slice(1)} • {trend.volume || trend.views} {trend.platform === 'youtube' ? 'views' : 'mentions'}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-green-400 text-sm font-medium">
                      +{trend.growth}%
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <NoDataMessage message="No emerging trends found for the selected filters." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrendAnalysis; 