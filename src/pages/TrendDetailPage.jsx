import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { trendService } from '../services/trendService';
import { aiService } from '../services/aiService';
import { Line } from 'react-chartjs-2';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import { dashboardService } from '../services/dashboardService';
import { toast } from 'react-toastify';
import { Bookmark } from 'lucide-react';

const TrendDetailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { trendName } = useParams();
  const [trend, setTrend] = useState(location.state?.trend || null);
  const [loading, setLoading] = useState(!location.state?.trend);
  const [error, setError] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [summary, setSummary] = useState('');
  const [contentIdeas, setContentIdeas] = useState([]);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [activePlatform, setActivePlatform] = useState('Instagram');
  const [user] = useAuthState(auth);
  const [savedIdeas, setSavedIdeas] = useState(new Set());

  useEffect(() => {
    if (!trend && trendName) {
      fetchTrendData();
    }
    if (trend) {
      generateHistoricalData();
      handleGenerateSummary();
    }
  }, [trendName, trend]);

  useEffect(() => {
    if (user) {
      const unsubscribe = dashboardService.subscribeToSavedIdeas(user.uid, (update) => {
        if (update.type === 'success') {
          const savedIdeaIds = new Set(update.data.map(idea => idea.title));
          setSavedIdeas(savedIdeaIds);
        }
      });

      // Return cleanup function
      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
        // Also unsubscribe from saved ideas
        dashboardService.unsubscribeFromSavedIdeas(user.uid);
      };
    }
  }, [user]);

  const fetchTrendData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await trendService.getAllPlatformTrends();
      if (result) {
        const allTrends = Object.values(result.trends).flat();
        const foundTrend = allTrends.find(
          t => t.name.toLowerCase() === decodeURIComponent(trendName).toLowerCase()
        );
        
        if (foundTrend) {
          setTrend(foundTrend);
        } else {
          setError('Trend not found');
        }
      }
    } catch (err) {
      setError('Failed to fetch trend data. Please try again later.');
      console.error('Error fetching trend:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateHistoricalData = () => {
    // Generate mock historical data for the chart
    const days = 7;
    const baseValue = trend.volume || trend.views || 1000;
    const data = {
      labels: Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        return date.toLocaleDateString();
      }),
      datasets: [
        {
          label: 'Engagement',
          data: Array.from({ length: days }, (_, i) => {
            const variance = Math.random() * 0.3 - 0.15; // -15% to +15%
            return Math.round(baseValue * (1 + variance));
          }),
          fill: false,
          borderColor: 'rgb(139, 92, 246)',
          tension: 0.4,
          pointBackgroundColor: 'rgb(139, 92, 246)',
        }
      ]
    };
    setHistoricalData(data);
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const generatedSummary = await aiService.generateSummary(trend);
      setSummary(generatedSummary);
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary('Failed to generate summary. Please try again.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleGenerateIdeas = async () => {
    if (!trend) return;

    setIsGeneratingIdeas(true);
    try {
      const specificIdeas = [
        {
          title: `${trend.name} - YouTube Short Analysis`,
          type: 'YouTube Short',
          difficulty: 'Medium',
          description: `A concise, engaging YouTube Short analyzing the key aspects of ${trend.name} and its ${trend.growth}% growth in ${trend.category}.`,
          outline: [
            'Hook: Attention-grabbing statistic',
            'Context: Brief background',
            'Analysis: Key implications',
            'Call-to-action: Engagement prompt'
          ],
          recommendedPlatforms: ['YouTube']
        },
        {
          title: `${trend.name} - Expert Podcast Discussion`,
          type: 'Podcast',
          difficulty: 'Hard',
          description: `An in-depth podcast episode exploring ${trend.name}, featuring expert insights and analysis of its impact on ${trend.category}.`,
          outline: [
            'Introduction and trend overview',
            'Expert interview and insights',
            'Market impact analysis',
            'Future predictions and recommendations'
          ],
          recommendedPlatforms: ['Spotify', 'Apple Podcasts']
        },
        {
          title: `${trend.name} - Comprehensive Article`,
          type: 'Article',
          difficulty: 'Medium',
          description: `A detailed article analyzing ${trend.name}, its ${trend.growth}% growth, and implications for ${trend.category}.`,
          outline: [
            'Executive Summary',
            'Trend Analysis',
            'Market Impact',
            'Future Outlook'
          ],
          recommendedPlatforms: ['Blog', 'Medium']
        },
        {
          title: `${trend.name} - Social Media Campaign`,
          type: 'Social Post',
          difficulty: 'Easy',
          description: `A multi-platform social media campaign highlighting key insights about ${trend.name} and its impact on ${trend.category}.`,
          outline: [
            'Platform-specific content creation',
            'Engagement strategy',
            'Hashtag optimization',
            'Cross-platform coordination'
          ],
          recommendedPlatforms: ['Instagram', 'Twitter', 'LinkedIn', 'Threads']
        }
      ];

      console.log('Generated content ideas:', specificIdeas);
      setContentIdeas(specificIdeas);
    } catch (error) {
      console.error('Error generating content ideas:', error);
      setContentIdeas([]);
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleSaveIdea = async (idea) => {
    if (!user) {
      toast.error('Please sign in to save ideas');
      return;
    }

    const isAlreadySaved = savedIdeas.has(idea.title);
    const toastId = isAlreadySaved ? 'deleting-idea' : 'saving-idea';
    
    try {
      // Show loading toast immediately
      toast.loading(isAlreadySaved ? 'Removing from saved...' : 'Saving idea...', { 
        toastId 
      });

      if (isAlreadySaved) {
        // Find and delete the saved idea
        const savedIdea = await dashboardService.findSavedIdeaByTitle(user.uid, idea.title);
        if (savedIdea) {
          await dashboardService.deleteSavedIdea(user.uid, savedIdea.id);
          setSavedIdeas(prev => {
            const newSet = new Set(prev);
            newSet.delete(idea.title);
            return newSet;
          });
          toast.update(toastId, {
            render: 'Removed from saved ideas',
            type: 'success',
            isLoading: false,
            autoClose: 2000
          });
        }
      } else {
        // Create modal content based on idea type
        const modalContent = {
          overview: idea.description,
          type: idea.type?.toLowerCase() || 'content',
          content: {}
        };

        // Add content based on type
        if (idea.type?.toLowerCase().includes('video') || idea.type?.toLowerCase().includes('youtube')) {
          modalContent.content.video = {
            sections: idea.outline?.map((section, index) => ({
              title: section,
              content: {
                visual: index === 0 
                  ? `Welcome back to [Channel Name], today we're diving deep into ${trend.name}.`
                  : index === 1
                  ? "Let's analyze the key aspects of this situation:"
                  : index === 2
                  ? "Based on our analysis, here are the key findings:"
                  : "To wrap things up, here's what you need to know:",
                audio: index === 0 
                  ? `WAIT! Stop scrolling! This trend in ${trend.category}...`
                  : index === 1
                  ? `Here's what's happening with ${trend.name}...`
                  : index === 2
                  ? `The impact on ${trend.category} is HUGE...`
                  : `Experts predict this will transform...`,
                overlay: index === 0 
                  ? `${trend.growth}% GROWTH 📈`
                  : index === 1
                  ? "MASSIVE ENGAGEMENT 🔥"
                  : index === 2
                  ? "WHY IT MATTERS ⚡"
                  : "INDUSTRY CHANGING 🚀"
              }
            }))
          };
        } else if (idea.type?.toLowerCase().includes('article')) {
          modalContent.content.article = {
            sections: idea.outline?.map((section, index) => ({
              title: section,
              content: index === 0 
                ? `In a significant development that's capturing attention across ${trend.category}, ${trend.name} has emerged as a pivotal moment. This comprehensive analysis explores the implications and what it means for all stakeholders involved.`
                : index === 1
                ? `The key aspects of this development include:\n• Detailed analysis of the trend's growth (${trend.growth}% increase)\n• Impact on ${trend.category} landscape\n• Stakeholder perspectives and reactions`
                : index === 2
                ? `With ${(trend.volume || trend.views || 0).toLocaleString()} engagements, this trend demonstrates significant market interest. Expert analysis suggests [key insights and implications for the industry].`
                : `As this situation continues to evolve, the implications for ${trend.category} are clear. Stakeholders should monitor these developments closely as they shape the future landscape of the industry.`
            }))
          };
        } else if (idea.type?.toLowerCase().includes('podcast')) {
          modalContent.content.podcast = {
            sections: idea.outline?.map((section, index) => ({
              title: section,
              content: index === 0
                ? `Welcome back to [Podcast Name]! Today we're diving deep into a fascinating trend in ${trend.category}: ${trend.name}.`
                : index === 1
                ? `Let's break down the numbers: We're seeing a ${trend.growth}% growth rate and ${(trend.volume || trend.views || 0).toLocaleString()} engagements.`
                : index === 2
                ? `The implications for ${trend.category} are significant. Industry experts suggest this could revolutionize how we approach...`
                : `To wrap up our discussion on ${trend.name}, let's talk about what this means for the future...`
            })),
            productionNotes: {
              duration: "30-45 minutes",
              format: "Interview style with expert insights",
              segments: [
                "Trend Introduction (5 mins)",
                "Data Analysis (10 mins)",
                "Expert Interview (20 mins)",
                "Future Implications (10 mins)"
              ],
              technicalRequirements: {
                audio: "High-quality stereo recording",
                editing: "Professional intro/outro music",
                distribution: "All major podcast platforms"
              }
            }
          };
        } else if (idea.type?.toLowerCase().includes('post') || 
                   idea.recommendedPlatforms?.some(p => 
                     ['instagram', 'facebook', 'twitter', 'linkedin', 'threads'].includes(p.toLowerCase())
                   )) {
          modalContent.content.social = {
            instagram: {
              caption: `✨ Breaking Trends Alert! 📱\n\n🔍 ${trend.name}\n\n📊 Key Insights:\n• 📈 ${trend.growth}% Growth\n• 🎯 Impact: ${trend.category}\n• 👥 ${(trend.volume || trend.views || 0).toLocaleString()} Engagements\n\n💡 What are your thoughts on this trend?\n\n👇 Share your perspective in the comments!\n\n.\n.\n.`,
              hashtags: `#trending #${trend.category.replace(/\s+/g, '')} ${trend.keywords?.map(k => `#${k.replace(/\s+/g, '')}`).join(' ')} #trendalert #trendwatch #innovation #growth`
            },
            twitter: {
              thread: [
                `🚨 Breaking: ${trend.name}`,
                `Here's what you need to know 🧵👇`,
                `📊 The numbers:\n• ${trend.growth}% growth rate\n• ${(trend.volume || trend.views || 0).toLocaleString()} engagements\n• Significant impact on ${trend.category}`,
                `💡 Key takeaway: This trend represents a major shift in how we approach ${trend.category}.`,
                `🔄 RT & Follow for more trend insights!`
              ],
              hashtags: `$trend #${trend.category.replace(/\s+/g, '')}Trends #TrendAlert ${trend.keywords?.slice(0, 2).map(k => `#${k.replace(/\s+/g, '')}`).join(' ')}`
            },
            threads: {
              thread: [
                `🌟 Trend Spotlight: ${trend.name}`,
                `Let's dive into why this matters for ${trend.category} 🔍`,
                `📈 Growth Metrics:\n• ${trend.growth}% increase in adoption\n• ${(trend.volume || trend.views || 0).toLocaleString()} community engagements\n• Rising interest in ${trend.category}`,
                `🎯 Impact Analysis:\n• Transforming ${trend.category}\n• Creating new opportunities\n• Driving innovation`,
                `💫 What's Next:\n• Expected continued growth\n• Emerging use cases\n• Industry adaptation`,
                `Join the conversation! What's your take on this trend? 💭`
              ],
              hashtags: `#${trend.category.replace(/\s+/g, '')}Trends #Innovation #FutureOfTech ${trend.keywords?.slice(0, 2).map(k => `#${k.replace(/\s+/g, '')}`).join(' ')}`
            },
            linkedin: {
              article: `📊 Industry Insight: ${trend.name}\n\nI'm excited to share a significant trend that's reshaping ${trend.category}.\n\nKey Findings:\n\n📈 Growth: ${trend.growth}% increase\n🎯 Market Impact: ${(trend.volume || trend.views || 0).toLocaleString()} engagements\n💡 Industry Implications: Transforming how we approach ${trend.category}\n\nWhat are your thoughts on this development? How do you see it impacting our industry?\n\nLet's discuss in the comments below. 👇`,
              hashtags: `#Innovation #${trend.category.replace(/\s+/g, '')} #ProfessionalDevelopment ${trend.keywords?.slice(0, 3).map(k => `#${k.replace(/\s+/g, '')}`).join(' ')} #IndustryTrends #Business`
            }
          };
        }

        // Save the idea
        await dashboardService.saveIdea(user.uid, {
          ...idea,
          modalContent
        });

        // Update local state immediately
        setSavedIdeas(prev => new Set([...prev, idea.title]));

        // Update toast to success
        toast.update(toastId, {
          render: 'Idea saved successfully!',
          type: 'success',
          isLoading: false,
          autoClose: 2000
        });
      }
    } catch (error) {
      console.error('Error handling idea:', error);
      toast.update(toastId, {
        render: isAlreadySaved ? 'Failed to remove idea' : 'Failed to save idea',
        type: 'error',
        isLoading: false,
        autoClose: 2000
      });
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(243, 244, 246)',
        borderColor: 'rgb(75, 85, 99)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      },
      y: {
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: {
          color: 'rgb(156, 163, 175)'
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-400 hover:text-gray-300 transition-colors"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Trends
      </button>

      {loading ? (
        <div className="glass-effect rounded-xl p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="glass-effect rounded-xl p-6">
          <div className="text-red-400">{error}</div>
          <button
            onClick={fetchTrendData}
            className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-400 to-cyan-400 text-white hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      ) : trend ? (
        <>
          {/* Trend Header */}
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                  {trend.name}
                </h1>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-500 bg-opacity-20 text-purple-300 text-sm">
                    {trend.platform.charAt(0).toUpperCase() + trend.platform.slice(1)}
                  </span>
                  {trend.category && (
                    <span className="px-3 py-1 rounded-full bg-blue-500 bg-opacity-20 text-blue-300 text-sm">
                      {trend.category}
                    </span>
                  )}
                  {trend.sentiment && (
                    <span className={`px-3 py-1 rounded-full ${
                      trend.sentiment === 'Positive' ? 'bg-green-500 bg-opacity-20 text-green-300' :
                      trend.sentiment === 'Negative' ? 'bg-red-500 bg-opacity-20 text-red-300' :
                      'bg-gray-500 bg-opacity-20 text-gray-300'
                    } text-sm`}>
                      {trend.sentiment}
                    </span>
                  )}
                </div>
              </div>
              {trend.growth && (
                <div className={`text-2xl font-bold ${trend.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {trend.growth >= 0 ? '+' : ''}{trend.growth}%
                </div>
              )}
            </div>
            {trend.description && (
              <p className="mt-4 text-gray-300">{trend.description}</p>
            )}
            {trend.url && (
              <a
                href={trend.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center text-purple-400 hover:text-purple-300"
              >
                View Source
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>

          {/* AI Summary */}
          <div className="glass-effect rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.5 2c-5.621 0-10.211 4.443-10.475 10h-3.025l5 6.625 5-6.625h-2.975c.257-3.351 3.06-6 6.475-6 3.584 0 6.5 2.916 6.5 6.5s-2.916 6.5-6.5 6.5c-1.863 0-3.542-.793-4.728-2.053l-2.427 3.216c1.877 1.754 4.389 2.837 7.155 2.837 5.79 0 10.5-4.71 10.5-10.5s-4.71-10.5-10.5-10.5z"/>
              </svg>
              AI Summary
            </h2>
            
            {isGeneratingSummary ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-300">Generating summary...</span>
              </div>
            ) : summary ? (
              <div className="space-y-6">
                {/* Key Points */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-purple-300">Key Points</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass-effect p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-200 mb-2">
                        <span className="text-purple-400">📈</span>
                        <span className="font-medium">Growth Rate</span>
                      </div>
                      <p className="text-gray-400 text-sm">{trend.growth}% increase in engagement</p>
                    </div>
                    <div className="glass-effect p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-200 mb-2">
                        <span className="text-purple-400">🎯</span>
                        <span className="font-medium">Category Impact</span>
                      </div>
                      <p className="text-gray-400 text-sm">Trending in {trend.category}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Analysis */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-purple-300">Quick Analysis</h3>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>Engagement: {(trend.volume || trend.views || 0).toLocaleString()} interactions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>Platform: {trend.platform.charAt(0).toUpperCase() + trend.platform.slice(1)}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>Sentiment: {trend.sentiment || 'Neutral'}</span>
                    </li>
                  </ul>
                </div>

                {/* Summary */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-purple-300">Summary</h3>
                  <div className="space-y-4 text-gray-300">
                    {/* Context */}
                    <div className="glass-effect p-3 rounded-lg">
                      <p className="text-sm leading-relaxed">
                        {trend.name} has emerged as a significant trend in {trend.category}, showing a {trend.growth}% growth rate. This development has garnered {(trend.volume || trend.views || 0).toLocaleString()} interactions across {trend.platform}.
                      </p>
                    </div>

                    {/* Key Findings */}
                    <div className="glass-effect p-3 rounded-lg">
                      <h4 className="text-sm font-medium text-purple-200 mb-2">Key Findings</h4>
                      <ul className="list-none space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400">•</span>
                          <span>Impact: {summary.split('.')[0]}.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400">•</span>
                          <span>Significance: {summary.split('.')[1] || 'Represents a major shift in the industry'}.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400">•</span>
                          <span>Implications: {summary.split('.')[2] || 'Could influence future developments in ' + trend.category}.</span>
                        </li>
                      </ul>
                    </div>

                    {/* Market Response */}
                    <div className="glass-effect p-3 rounded-lg">
                      <h4 className="text-sm font-semibold text-purple-200 mb-2">Market Response</h4>
                      <p className="text-sm">
                        Sentiment is {trend.sentiment || 'Neutral'} with significant engagement across {trend.platform}. 
                        {trend.keywords?.length > 0 ? ` Related topics include ${trend.keywords.slice(0, 3).join(', ')}.` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400">No summary available</p>
            )}
          </div>

          {/* Trend Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-effect rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Engagement</h3>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
                {(trend.volume || trend.views || 0).toLocaleString()}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                {trend.platform === 'youtube' ? 'Views' : 'Mentions'}
              </p>
            </div>

            {trend.engagement && (
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">Interactions</h3>
                <div className="space-y-2">
                  {trend.engagement.likes && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Likes</span>
                      <span className="text-gray-100">{trend.engagement.likes.toLocaleString()}</span>
                    </div>
                  )}
                  {trend.engagement.comments && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Comments</span>
                      <span className="text-gray-100">{trend.engagement.comments.toLocaleString()}</span>
                    </div>
                  )}
                  {trend.engagement.shares && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Shares</span>
                      <span className="text-gray-100">{trend.engagement.shares.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {trend.timestamp && (
              <div className="glass-effect rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">Published</h3>
                <div className="text-gray-300">
                  {new Date(trend.timestamp).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(trend.timestamp).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>

          {/* Historical Data Chart */}
          {historicalData && (
            <div className="glass-effect rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-100 mb-4">Engagement History</h2>
              <div className="h-64">
                <Line data={historicalData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Additional Information */}
          {(trend.keywords?.length > 0 || trend.channelTitle || trend.source) && (
            <div className="glass-effect rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-100 mb-4">Additional Information</h2>
              <div className="space-y-4">
                {trend.channelTitle && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400">Channel</h3>
                    <p className="text-gray-100">{trend.channelTitle}</p>
                  </div>
                )}
                {trend.source && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400">Source</h3>
                    <p className="text-gray-100">{trend.source}</p>
                  </div>
                )}
                {trend.keywords?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400">Keywords</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {trend.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full bg-gray-700 text-gray-300 text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content Ideas Section */}
          <div className="glass-effect rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-100">Content Ideas</h2>
              <button
                onClick={handleGenerateIdeas}
                disabled={isGeneratingIdeas}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-400 to-cyan-400 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isGeneratingIdeas ? 'Generating Ideas...' : 'Generate Ideas'}
              </button>
            </div>

            {contentIdeas.length > 0 && (
              <div className="mt-6 space-y-4">
                {contentIdeas.slice(0, 5).map((idea, index) => (
                  <motion.div
                    key={index}
                    className="w-full glass-effect rounded-lg p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                    onClick={() => setSelectedIdea(idea)}
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="px-3 py-1 rounded-full bg-purple-500 bg-opacity-20 text-purple-300 text-sm">
                          {idea.type || 'Content'}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-100">
                          {idea.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-sm text-gray-400">
                          Difficulty: {idea.difficulty || 'Medium'}
                        </span>
                        <span className="text-sm text-gray-400">
                          {(idea.estimatedEngagement || 0).toLocaleString()} interactions
                        </span>
                        <svg 
                          className="w-5 h-5 text-gray-400" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Content Idea Modal */}
          {selectedIdea && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
              >
                <div className="glass-effect rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
                  {/* Content */}
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full bg-purple-500 bg-opacity-20 text-purple-300 text-sm">
                            {selectedIdea.type || 'Content'}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-blue-500 bg-opacity-20 text-blue-300 text-sm">
                            {selectedIdea.difficulty || 'Medium'} Difficulty
                          </span>
                          <button
                            onClick={() => handleSaveIdea(selectedIdea)}
                            className={`px-4 py-1 rounded-lg text-white text-sm flex items-center gap-2 transition-all duration-200 ${
                              savedIdeas.has(selectedIdea.title) 
                                ? 'bg-purple-600 hover:bg-purple-700' 
                                : 'bg-gray-800 hover:bg-gray-700'
                            }`}
                          >
                            <Bookmark 
                              className={`w-4 h-4 transition-all duration-200 ${
                                savedIdeas.has(selectedIdea.title) ? 'fill-current' : ''
                              }`}
                            />
                            {savedIdeas.has(selectedIdea.title) ? 'Saved' : 'Save Idea'}
                          </button>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-100 mt-3">
                          {selectedIdea.title}
                        </h2>
                      </div>
                      <button
                        onClick={() => setSelectedIdea(null)}
                        className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Overview Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-100 mb-2">Overview</h3>
                      <p className="text-gray-300">{selectedIdea.description}</p>
                    </div>

                    {/* Content Structure based on type */}
                    <div className="mt-4">
                      {(selectedIdea.type?.toLowerCase().includes('video') || selectedIdea.type?.toLowerCase().includes('youtube')) && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-gray-300">Video Script</h4>
                          <div className="space-y-6 content-structure">
                            {selectedIdea.outline?.map((section, i) => (
                              <div key={i} className="glass-effect p-4 rounded-lg">
                                <h5 className="text-gray-300 font-semibold mb-3">
                                  {i + 1}. {section}
                                </h5>
                                <div className="space-y-3 text-gray-400">
                                  <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-24 text-sm font-medium text-purple-300">Visual:</div>
                                    <p>{i === 0 
                                      ? "Fast-paced zoom in on trending graph or key statistic"
                                      : i === 1
                                      ? "Screen split showing trend data and industry impact"
                                      : i === 2
                                      ? "Quick bullet points animation with key statistics"
                                      : "Dynamic subscribe button animation with channel highlights"}</p>
                                  </div>
                                  <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-24 text-sm font-medium text-purple-300">Audio:</div>
                                    <p>{i === 0 
                                      ? `WAIT! Stop scrolling! This trend in ${trend.category}...`
                                      : i === 1
                                      ? `Here's what's happening with ${trend.name}...`
                                      : i === 2
                                      ? `The impact on ${trend.category} is HUGE...`
                                      : "Follow for daily trend updates and industry insights!"}</p>
                                  </div>
                                  <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-24 text-sm font-medium text-purple-300">Text Overlay:</div>
                                    <p>{i === 0 
                                      ? `${trend.growth}% GROWTH 📈`
                                      : i === 1
                                      ? "MASSIVE ENGAGEMENT 🔥"
                                      : i === 2
                                      ? "WHY IT MATTERS ⚡"
                                      : "INDUSTRY CHANGING 🚀"}</p>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {/* Production Notes */}
                            <div className="glass-effect p-4 rounded-lg border-t border-gray-700">
                              <h5 className="text-gray-300 font-semibold mb-3">Production Notes</h5>
                              <div className="space-y-3 text-gray-400 text-sm">
                                <p>• Duration: 60 seconds maximum</p>
                                <p>• Aspect Ratio: 9:16 vertical format</p>
                                <p>• Style: Fast-paced, dynamic transitions</p>
                                <p>• Music: Upbeat, trending background track</p>
                                <p>• Captions: Auto-generated + manual review</p>
                                <p>• Graphics: Trending style animations and effects</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedIdea.type?.toLowerCase().includes('article') && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-gray-300">Article Content</h4>
                          <div className="space-y-6 content-structure">
                            {selectedIdea.outline?.map((section, i) => (
                              <div key={i} className="glass-effect p-4 rounded-lg">
                                <h5 className="text-gray-300 font-semibold mb-3">
                                  {i + 1}. {section}
                                </h5>
                                <div className="space-y-3 text-gray-400" data-platform="article-content">
                                  {i === 0 && (
                                    <p>
                                      In a significant development that's capturing attention across {trend.category}, 
                                      {trend.name} has emerged as a pivotal moment. This comprehensive analysis 
                                      explores the implications and what it means for all stakeholders involved.
                                    </p>
                                  )}
                                  {i === 1 && (
                                    <>
                                      <p>The key aspects of this development include:</p>
                                      <ul className="list-disc list-inside space-y-2 ml-4">
                                        <li>Detailed analysis of the trend's growth ({trend.growth}% increase)</li>
                                        <li>Impact on {trend.category} landscape</li>
                                        <li>Stakeholder perspectives and reactions</li>
                                      </ul>
                                    </>
                                  )}
                                  {i === 2 && (
                                    <p>
                                      With {(trend.volume || trend.views || 0).toLocaleString()} engagements,
                                      this trend demonstrates significant market interest. Expert analysis suggests
                                      [key insights and implications for the industry].
                                    </p>
                                  )}
                                  {i === 3 && (
                                    <p>
                                      As this situation continues to evolve, the implications for {trend.category}
                                      are clear. Stakeholders should monitor these developments closely as they
                                      shape the future landscape of the industry.
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedIdea.type?.toLowerCase().includes('podcast') && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-gray-300">Podcast Script</h4>
                          <div className="space-y-6">
                            {/* Intro Section */}
                            <div className="glass-effect p-4 rounded-lg">
                              <h5 className="text-gray-300 font-semibold mb-3">1. Show Introduction</h5>
                              <div className="space-y-3 text-gray-400">
                                <p>[Intro Music Fade In]</p>
                                <p>"Welcome to [Podcast Name], your go-to source for the latest trends and insights in {trend.category}. I'm your host [Name], and today we're diving deep into a fascinating development that's been making waves across the industry."</p>
                                <p>"We're talking about {trend.name}, a trend that has seen an incredible {trend.growth}% growth and generated over {(trend.volume || trend.views || 0).toLocaleString()} engagements."</p>
                              </div>
                            </div>

                            {/* Topic Overview */}
                            <div className="glass-effect p-4 rounded-lg">
                              <h5 className="text-gray-300 font-semibold mb-3">2. Topic Overview</h5>
                              <div className="space-y-3 text-gray-400">
                                <p>"Before we dive in with our expert guest, let me set the stage for our listeners:"</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                  <li>The emergence of this trend in {trend.category}</li>
                                  <li>Key statistics and growth metrics</li>
                                  <li>Initial market response and reactions</li>
                                </ul>
                                <p>"The implications of this trend are significant, and that's exactly what we'll be exploring today."</p>
                              </div>
                            </div>

                            {/* Expert Discussion */}
                            <div className="glass-effect p-4 rounded-lg">
                              <h5 className="text-gray-300 font-semibold mb-3">3. Expert Interview Segments</h5>
                              <div className="space-y-3 text-gray-400">
                                <p className="font-medium">Segment 1: Understanding the Trend</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                  <li>"What factors have contributed to the rapid growth of {trend.name}?"</li>
                                  <li>"How does this trend compare to similar developments in {trend.category}?"</li>
                                  <li>"What makes this particular trend significant?"</li>
                                </ul>

                                <p className="font-medium mt-4">Segment 2: Impact Analysis</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                  <li>"How is this affecting different stakeholders in the industry?"</li>
                                  <li>"What opportunities does this trend present?"</li>
                                  <li>"What potential challenges should we be aware of?"</li>
                                </ul>

                                <p className="font-medium mt-4">Segment 3: Future Outlook</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                  <li>"Where do you see this trend heading in the next 6-12 months?"</li>
                                  <li>"What should our listeners be preparing for?"</li>
                                  <li>"Any specific recommendations for our audience?"</li>
                                </ul>
                              </div>
                            </div>

                            {/* Audience Q&A */}
                            <div className="glass-effect p-4 rounded-lg">
                              <h5 className="text-gray-300 font-semibold mb-3">4. Listener Questions</h5>
                              <div className="space-y-3 text-gray-400">
                                <p>"Now, let's address some questions from our listeners:"</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                  <li>"How can individuals/businesses best capitalize on this trend?"</li>
                                  <li>"What skills or resources are needed to engage with this trend?"</li>
                                  <li>"Are there any potential risks to consider?"</li>
                                </ul>
                              </div>
                            </div>

                            {/* Conclusion */}
                            <div className="glass-effect p-4 rounded-lg">
                              <h5 className="text-gray-300 font-semibold mb-3">5. Wrap-up</h5>
                              <div className="space-y-3 text-gray-400">
                                <p>"That brings us to the end of today's deep dive into {trend.name}. Here are the key takeaways:"</p>
                                <ul className="list-disc list-inside space-y-2 ml-4">
                                  <li>Growth metrics and significance</li>
                                  <li>Expert insights and predictions</li>
                                  <li>Action items for our listeners</li>
                                </ul>
                                <p>"Thank you for tuning in to [Podcast Name]. Don't forget to subscribe and join us next week for more insights into the latest trends in {trend.category}."</p>
                                <p>[Outro Music Fade In]</p>
                              </div>
                            </div>

                            {/* Production Notes */}
                            <div className="glass-effect p-4 rounded-lg border-t border-gray-700">
                              <h5 className="text-gray-300 font-semibold mb-3">Production Notes</h5>
                              <div className="space-y-3 text-gray-400 text-sm">
                                <p>• Episode Duration: 45-60 minutes</p>
                                <p>• Format: Interview-style with expert guest</p>
                                <p>• Technical Requirements: High-quality microphone, quiet recording environment</p>
                                <p>• Distribution: Spotify, Apple Podcasts, YouTube</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {(selectedIdea.type?.toLowerCase().includes('post') || 
                        (selectedIdea.recommendedPlatforms?.some(p => 
                          ['instagram', 'facebook', 'twitter', 'linkedin', 'threads'].includes(p.toLowerCase())
                        ) && 
                        !selectedIdea.type?.toLowerCase().includes('video') && 
                        !selectedIdea.type?.toLowerCase().includes('article') && 
                        !selectedIdea.type?.toLowerCase().includes('podcast'))) && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-gray-300">Social Media Content</h4>
                          
                          {/* Social Media Platform Mini Navbar */}
                          <div className="flex flex-col space-y-4">
                            <div className="flex space-x-2 border-b border-gray-700">
                              {['Instagram', 'Twitter', 'Threads', 'LinkedIn'].map((platform) => (
                                <button
                                  key={platform}
                                  onClick={() => setActivePlatform(platform)}
                                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                                    activePlatform === platform 
                                      ? 'text-purple-400' 
                                      : 'text-gray-400 hover:text-gray-300'
                                  }`}
                                >
                                  {platform}
                                  {activePlatform === platform && (
                                    <motion.div
                                      layoutId="activePlatform"
                                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
                                      initial={false}
                                    />
                                  )}
                                </button>
                              ))}
                            </div>

                            {/* Platform Specific Content */}
                            <div className="space-y-4">
                              {activePlatform === 'Instagram' && (
                                <div className="glass-effect p-4 rounded-lg">
                                  <div className="space-y-4">
                                    <div>
                                      <h6 className="text-sm font-semibold text-purple-300 mb-2">Instagram Caption</h6>
                                      <p className="text-gray-300" data-platform="instagram-caption">
                                        ✨ Breaking Trends Alert! 📱<br/>
                                        <br/>
                                        🔍 {trend.name}<br/>
                                        <br/>
                                        📊 Key Insights:<br/>
                                        • 📈 {trend.growth}% Growth<br/>
                                        • 🎯 Impact: {trend.category}<br/>
                                        • 👥 {(trend.volume || trend.views || 0).toLocaleString()} Engagements<br/>
                                        <br/>
                                        💡 What are your thoughts on this trend?<br/>
                                        <br/>
                                        👇 Share your perspective in the comments!<br/>
                                        <br/>
                                        .<br/>
                                        .<br/>
                                        .<br/>
                                      </p>
                                    </div>
                                    <div>
                                      <h6 className="text-sm font-semibold text-purple-300 mb-2">Hashtags</h6>
                                      <p className="text-gray-400" data-platform="instagram-hashtags">
                                        #trending #{trend.category.replace(/\s+/g, '')} 
                                        {trend.keywords?.map(k => ` #${k.replace(/\s+/g, '')}`).join('')}
                                        #trendalert #trendwatch #innovation #growth
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {activePlatform === 'Twitter' && (
                                <div className="glass-effect p-4 rounded-lg">
                                  <div className="space-y-4">
                                    <div>
                                      <h6 className="text-sm font-semibold text-purple-300 mb-2">Twitter Thread</h6>
                                      <div className="space-y-3 text-gray-300" data-platform="twitter-thread">
                                        <p>🚨 Breaking: {trend.name}</p>
                                        <p>Here's what you need to know 🧵👇</p>
                                        <p>📊 The numbers:<br/>
                                           • {trend.growth}% growth rate<br/>
                                           • {(trend.volume || trend.views || 0).toLocaleString()} engagements<br/>
                                           • Significant impact on {trend.category}</p>
                                        <p>💡 Key takeaway: This trend represents a major shift in how we approach {trend.category}.</p>
                                        <p>🔄 RT & Follow for more trend insights!</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h6 className="text-sm font-semibold text-purple-300 mb-2">Hashtags</h6>
                                      <p className="text-gray-400" data-platform="twitter-hashtags">
                                        $trend #{trend.category.replace(/\s+/g, '')}Trends #TrendAlert
                                        {trend.keywords?.slice(0, 2).map(k => ` #${k.replace(/\s+/g, '')}`).join('')}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {activePlatform === 'Threads' && (
                                <div className="glass-effect p-4 rounded-lg">
                                  <div className="space-y-4">
                                    <div>
                                      <h6 className="text-sm font-semibold text-purple-300 mb-2">Threads Content</h6>
                                      <div className="space-y-3 text-gray-300" data-platform="threads-content">
                                        <p>🌟 Trend Spotlight: {trend.name}</p>
                                        <p>Let's dive into why this matters for {trend.category} 🔍</p>
                                        <p>📈 Growth Metrics:<br/>
                                           • {trend.growth}% increase in adoption<br/>
                                           • {(trend.volume || trend.views || 0).toLocaleString()} community engagements<br/>
                                           • Rising interest in {trend.category}</p>
                                        <p>🎯 Impact Analysis:<br/>
                                           • Transforming {trend.category}<br/>
                                           • Creating new opportunities<br/>
                                           • Driving innovation</p>
                                        <p>💫 What's Next:<br/>
                                           • Expected continued growth<br/>
                                           • Emerging use cases<br/>
                                           • Industry adaptation</p>
                                        <p>Join the conversation! What's your take on this trend? 💭</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h6 className="text-sm font-semibold text-purple-300 mb-2">Hashtags</h6>
                                      <p className="text-gray-400" data-platform="threads-hashtags">
                                        #{trend.category.replace(/\s+/g, '')}Trends #Innovation #FutureOfTech
                                        {trend.keywords?.slice(0, 2).map(k => ` #${k.replace(/\s+/g, '')}`).join('')}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {activePlatform === 'LinkedIn' && (
                                <div className="glass-effect p-4 rounded-lg">
                                  <div className="space-y-4">
                                    <div>
                                      <h6 className="text-sm font-semibold text-purple-300 mb-2">LinkedIn Article</h6>
                                      <div className="space-y-3 text-gray-300" data-platform="linkedin-article">
                                        <p>📊 Industry Insight: {trend.name}</p>
                                        <p>I'm excited to share a significant trend that's reshaping {trend.category}.</p>
                                        <p>Key Findings:</p>
                                        <p>📈 Growth: {trend.growth}% increase<br/>
                                           🎯 Market Impact: {(trend.volume || trend.views || 0).toLocaleString()} engagements<br/>
                                           💡 Industry Implications: Transforming how we approach {trend.category}</p>
                                        <p>What are your thoughts on this development? How do you see it impacting our industry?</p>
                                        <p>Let's discuss in the comments below. 👇</p>
                                      </div>
                                    </div>
                                    <div>
                                      <h6 className="text-sm font-semibold text-purple-300 mb-2">Hashtags</h6>
                                      <p className="text-gray-400" data-platform="linkedin-hashtags">
                                        #Innovation #{trend.category.replace(/\s+/g, '')} #ProfessionalDevelopment
                                        {trend.keywords?.slice(0, 3).map(k => ` #${k.replace(/\s+/g, '')}`).join('')}
                                        #IndustryTrends #Business
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </>
      ) : null}
    </div>
  );
};

export default TrendDetailPage; 