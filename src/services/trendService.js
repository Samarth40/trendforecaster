import { db, auth } from '../config/firebase';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import { signInAnonymously } from 'firebase/auth';

// Load API keys from environment variables
const newsApiKey = import.meta.env.VITE_NEWS_API_KEY || process.env.REACT_APP_NEWS_API_KEY;
const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY || process.env.REACT_APP_YOUTUBE_API_KEY;
const githubToken = import.meta.env.VITE_GITHUB_TOKEN || process.env.REACT_APP_GITHUB_TOKEN;

// API endpoints
const API_CONFIG = {
  news: {
    baseUrl: 'https://newsdata.io/api/1/news',
    rateLimit: 100, // requests per day
    retryAttempts: 3
  },
  youtube: {
    baseUrl: 'https://www.googleapis.com/youtube/v3',
    rateLimit: 10000, // quota points per day
    retryAttempts: 2
  },
  reddit: {
    baseUrl: 'https://www.reddit.com',
    rateLimit: 60, // requests per minute
    retryAttempts: 3
  },
  hackernews: {
    baseUrl: 'https://hacker-news.firebaseio.com/v0',
    rateLimit: 500, // requests per minute
    retryAttempts: 3
  },
  github: {
    baseUrl: 'https://api.github.com',
    rateLimit: 5000, // requests per hour
    retryAttempts: 2
  }
};

class TrendService {
  constructor() {
    this.trendsCollection = collection(db, 'trends');
    this.cache = new Map();
    this.cacheTimeout = parseInt(import.meta.env.VITE_CACHE_TIMEOUT) || 5 * 60 * 1000; // 5 minutes
    this.rateLimiters = new Map();
    
    // Platform-specific rate limit configurations
    this.rateLimitConfig = {
      news: {
        requests: 0,
        maxRequests: parseInt(import.meta.env.VITE_NEWS_MAX_REQUESTS) || 25, // Daily limit for free tier
        resetInterval: 24 * 60 * 60 * 1000, // 24 hours
        minInterval: parseInt(import.meta.env.VITE_NEWS_MIN_INTERVAL) || 300000, // 5 minutes between requests
        cacheDuration: parseInt(import.meta.env.VITE_NEWS_CACHE_DURATION) || 1800000 // 30 minutes cache
      },
      hackernews: {
        requests: 0,
        maxRequests: 5, // Per minute
        resetInterval: 60 * 1000, // 1 minute
        minInterval: 2000 // 2 seconds between requests
      },
      github: {
        requests: 0,
        maxRequests: 30, // Per minute
        resetInterval: 60 * 1000, // 1 minute
        minInterval: 2000 // 2 seconds between requests
      }
    };

    // Initialize rate limit trackers
    Object.keys(this.rateLimitConfig).forEach(platform => {
      this.rateLimiters.set(platform, {
        timestamp: 0,
        requests: 0,
        lastReset: Date.now(),
        retryAfter: null
      });
    });

    // Initialize axios instances with proper headers and params
    this.axiosInstances = {
      github: axios.create({
        baseURL: API_CONFIG.github.baseUrl,
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${githubToken}`, // Changed from Bearer to token
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }),
      news: axios.create({
        baseURL: API_CONFIG.news.baseUrl,
        params: {
          apikey: newsApiKey
        },
        headers: {
          'Accept': 'application/json'
        },
        validateStatus: function (status) {
          return status < 500; // Resolve only if status is less than 500
        }
      }),
      youtube: axios.create({
        baseURL: API_CONFIG.youtube.baseUrl,
        params: {
          key: youtubeApiKey
        }
      }),
      reddit: axios.create({
        baseURL: API_CONFIG.reddit.baseUrl,
        headers: {
          'Accept': 'application/json'
        },
        params: {
          raw_json: 1
        }
      }),
      hackernews: axios.create({
        baseURL: API_CONFIG.hackernews.baseUrl
      })
    };

    // Add response interceptors for error handling
    Object.values(this.axiosInstances).forEach(instance => {
      instance.interceptors.response.use(
        response => {
          // Extract rate limit headers
          const rateLimitRemaining = response.headers?.['x-ratelimit-remaining'];
          const rateLimitReset = response.headers?.['x-ratelimit-reset'];
          
          if (rateLimitRemaining !== undefined) {
            const platform = this.getPlatformFromUrl(response.config.baseURL);
            const limiter = this.rateLimiters.get(platform);
            if (limiter) {
              limiter.requests = this.rateLimitConfig[platform].maxRequests - parseInt(rateLimitRemaining);
              if (rateLimitReset) {
                limiter.lastReset = parseInt(rateLimitReset) * 1000;
              }
            }
          }
          return response;
        },
        this.handleApiError
      );
    });

    this.ensureAuthentication();
  }

  // Add authentication method
  async ensureAuthentication() {
    try {
      // Check if user is already authenticated
      if (auth.currentUser) {
        console.log('User is already authenticated:', auth.currentUser.uid);
        return auth.currentUser;
      }

      // If anonymous auth is not needed, just return null or handle accordingly
      console.log('No authenticated user. Please sign in to access features.');
      return null;

      // Removed anonymous authentication attempt since it's disabled
      /* 
      try {
        const userCredential = await signInAnonymously(auth);
        console.log('Anonymous authentication successful');
        return userCredential.user;
      } catch (error) {
        console.error('Anonymous authentication is not enabled in Firebase. Please enable it in the Firebase Console.');
        throw new Error('Anonymous authentication is not enabled. Please contact the administrator.');
      }
      */
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  // Get platform from URL
  getPlatformFromUrl(url = '') {
    if (url.includes('newsdata.io')) return 'news';
    if (url.includes('api.github.com')) return 'github';
    if (url.includes('hacker-news')) return 'hackernews';
    if (url.includes('reddit.com')) return 'reddit';
    if (url.includes('googleapis.com')) return 'youtube';
    return 'unknown';
  }

  // Generic API call with retry mechanism
  async makeApiCall(platform, endpoint, config = {}, retryCount = 0) {
    const apiConfig = API_CONFIG[platform];
    
    try {
      // Check rate limit
      if (this.isRateLimited(platform)) {
        await this.waitForRateLimit(platform);
      }

      // Check cache
      const cacheKey = `${platform}:${endpoint}:${JSON.stringify(config)}`;
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) return cachedData;

      // Make API call
      const response = await this.axiosInstances[platform].get(endpoint, config);
      
      // Cache response
      this.setInCache(cacheKey, response.data);
      
      return response.data;
    } catch (error) {
      if (retryCount < apiConfig.retryAttempts && this.shouldRetry(error)) {
        // Exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeApiCall(platform, endpoint, config, retryCount + 1);
      }
      throw error;
    }
  }

  // Cache management
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.duration) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setInCache(key, data, duration = this.cacheTimeout) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      duration: duration
    });
  }

  // Rate limiting
  isRateLimited(platform) {
    const limiter = this.rateLimiters.get(platform);
    const config = this.rateLimitConfig[platform];
    if (!limiter || !config) return false;

    const now = Date.now();

    // Check for retry-after
    if (limiter.retryAfter && now < limiter.retryAfter) {
      console.log(`Rate limit active for ${platform} for another ${Math.ceil((limiter.retryAfter - now) / 1000)} seconds`);
      return true;
    }

    // Reset counter if reset interval has passed
    if (now - limiter.lastReset >= config.resetInterval) {
      limiter.requests = 0;
      limiter.lastReset = now;
      limiter.retryAfter = null;
      this.rateLimiters.set(platform, limiter);
      return false;
    }

    // Check if we've exceeded the rate limit
    if (limiter.requests >= config.maxRequests) {
      console.log(`Rate limit exceeded for ${platform}: ${limiter.requests}/${config.maxRequests} requests`);
      return true;
    }

    // Check minimum interval between requests
    const timeSinceLastRequest = now - limiter.timestamp;
    if (timeSinceLastRequest < config.minInterval) {
      console.log(`Minimum interval not met for ${platform}. Waiting ${(config.minInterval - timeSinceLastRequest) / 1000} seconds`);
      return true;
    }

    return false;
  }

  updateRateLimit(platform) {
    const limiter = this.rateLimiters.get(platform);
    const config = this.rateLimitConfig[platform];
    if (!limiter || !config) return;

    limiter.timestamp = Date.now();
    limiter.requests++;
    this.rateLimiters.set(platform, limiter);
  }

  shouldRetry(error) {
    return (
      error.response?.status === 429 || // Rate limit
      error.response?.status === 503 || // Service unavailable
      error.code === 'ECONNRESET' ||
      error.code === 'ETIMEDOUT'
    );
  }

  // Update saveTrendAnalysis method
  async saveTrendAnalysis(data) {
    try {
      await this.ensureAuthentication();
      const docRef = await addDoc(this.trendsCollection, {
        ...data,
        timestamp: serverTimestamp(),
        userId: auth.currentUser?.uid
      });
      return docRef.id;
    } catch (error) {
      // Check if the error is due to being blocked by client
      if (error.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
          error.code === 'failed-precondition' ||
          error.name === 'FirebaseError') {
        console.warn('Firestore access is blocked or unavailable. Data will not be persisted:', error);
        // Return a mock ID for consistency
        return `local-${Date.now()}`;
      }
      
      // Handle authentication errors
      if (error.code === 'permission-denied') {
        try {
          await this.ensureAuthentication();
          return this.saveTrendAnalysis(data);
        } catch (authError) {
          console.warn('Authentication retry failed:', authError);
          return `local-${Date.now()}`;
        }
      }

      // Log other errors but don't throw
      console.error('Error saving to Firestore:', error);
      return `local-${Date.now()}`;
    }
  }

  // Update handleApiError method
  handleApiError = async (error) => {
    const platform = this.getPlatformFromUrl(error?.config?.baseURL);
    const limiter = this.rateLimiters.get(platform);
    
    if (error.response) {
      // Handle rate limiting
      if (error.response.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        if (retryAfter && limiter) {
          limiter.retryAfter = Date.now() + (parseInt(retryAfter) * 1000);
          this.rateLimiters.set(platform, limiter);
        }
      }
      // Handle authentication errors
      else if (error.response.status === 401 || error.response.status === 403) {
        await this.ensureAuthentication();
      }
    }
    
    throw error;
  };

  // Get trending news from NewsData.io with enhanced caching and error handling
  async getNewsTrends(country = 'us') {
    try {
      const cacheKey = `news:trends:${country}`;
      const cachedData = this.getFromCache(cacheKey);
      
      if (cachedData) {
        console.log('Using cached news data');
        return cachedData;
      }

      // Check rate limit before making the call
      if (this.isRateLimited('news')) {
        console.log('News API rate limited, using cached data if available...');
        const fallbackData = this.getFromCache(cacheKey);
        if (fallbackData) {
          return fallbackData;
        }
        console.log('No cached data available, returning empty array');
        return [];
      }

      const response = await this.makeApiCall('news', '', {
        params: {
          country: country,
          language: 'en',
          category: 'technology,business,entertainment'
        }
      });

      // Handle error response from NewsData.io
      if (response.status === 'error') {
        console.error('NewsData.io API error:', response.results || response.message);
        const fallbackData = this.getFromCache(cacheKey);
        if (fallbackData) {
          return fallbackData;
        }
        return [];
      }

      if (!response?.results || !Array.isArray(response.results)) {
        console.error('Invalid news response format:', response);
        const fallbackData = this.getFromCache(cacheKey);
        if (fallbackData) {
          return fallbackData;
        }
        return [];
      }

      const processedResults = this.processNewsTrends(response.results);
      
      // Cache with platform-specific duration
      this.setInCache(cacheKey, processedResults, this.rateLimitConfig.news.cacheDuration);
      
      // Update rate limit tracking
      this.updateRateLimit('news');
      
      return processedResults;
    } catch (error) {
      console.error('Error fetching news trends:', error);
      
      // Handle rate limit errors
      if (error.response?.status === 429) {
        console.warn('NewsData.io rate limit exceeded. Using cached data if available...');
        // Update rate limit tracking
        const limiter = this.rateLimiters.get('news');
        if (limiter) {
          limiter.requests = this.rateLimitConfig.news.maxRequests;
          limiter.retryAfter = Date.now() + (24 * 60 * 60 * 1000); // 24 hours for free tier
          this.rateLimiters.set('news', limiter);
        }
        
        const cachedData = this.getFromCache(`news:trends:${country}`);
        if (cachedData) {
          return cachedData;
        }
      }
      
      return [];
    }
  }

  // Process news trends with complete information
  processNewsTrends(articles) {
    if (!Array.isArray(articles)) {
      console.error('Invalid articles format:', articles);
      return [];
    }

    return articles.map(article => ({
      name: article.title || 'Untitled',
      description: article.description || article.content || '',
      volume: Math.floor(Math.random() * 1000) + 500,
      url: article.link || '',
      platform: 'news',
      category: article.category?.[0]?.toLowerCase() || 'general',
      timestamp: article.pubDate ? new Date(article.pubDate).getTime() : Date.now(),
      source: article.source_id || 'unknown',
      image: article.image_url || null,
      keywords: Array.isArray(article.keywords) ? article.keywords : [],
      sentiment: this.calculateSentiment(article.title + ' ' + (article.description || '')),
      growth: Math.floor(Math.random() * 100),
      engagement: {
        shares: Math.floor(Math.random() * 1000),
        comments: Math.floor(Math.random() * 500)
      }
    }));
  }

  // Get YouTube Trending Videos with complete information
  async getYoutubeTrends(regionCode = 'US') {
    try {
      const response = await this.makeApiCall('youtube', '/videos', {
        params: {
          part: 'snippet,statistics',
          chart: 'mostPopular',
          regionCode: regionCode,
          maxResults: 10
        }
      });
      return this.processYoutubeTrends(response.items);
    } catch (error) {
      console.error('Error fetching YouTube trends:', error);
      return [];
    }
  }

  // Process YouTube trends with complete information
  processYoutubeTrends(videos) {
    if (!videos) return [];
    return videos.map(video => ({
      name: video.snippet.title,
      description: video.snippet.description,
      views: parseInt(video.statistics.viewCount),
      likes: parseInt(video.statistics.likeCount),
      comments: parseInt(video.statistics.commentCount),
      thumbnail: video.snippet.thumbnails.high.url,
      channelTitle: video.snippet.channelTitle,
      url: `https://youtube.com/watch?v=${video.id}`,
      platform: 'youtube',
      category: video.snippet.categoryId,
      timestamp: new Date(video.snippet.publishedAt).getTime(),
      growth: Math.floor(Math.random() * 100),
      engagement: {
        likes: parseInt(video.statistics.likeCount),
        comments: parseInt(video.statistics.commentCount),
        shares: Math.floor(Math.random() * 10000)
      }
    }));
  }

  // Calculate sentiment (mock implementation)
  calculateSentiment(text) {
    const positiveWords = ['great', 'amazing', 'good', 'excellent', 'innovative', 'success'];
    const negativeWords = ['bad', 'poor', 'failure', 'terrible', 'worst', 'problem'];
    
    text = text.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => {
      if (text.includes(word)) score += 1;
    });
    
    negativeWords.forEach(word => {
      if (text.includes(word)) score -= 1;
    });
    
    if (score > 0) return 'Positive';
    if (score < 0) return 'Negative';
    return 'Neutral';
  }

  // Get all platform trends with enhanced data
  async getAllPlatformTrends() {
    try {
      const user = await this.ensureAuthentication();
      
      // If no authenticated user, return empty trends
      if (!user) {
        return {
          trends: {},
          message: 'Authentication required to view trends'
        };
      }

      // Get trends from all platforms in parallel with proper error handling
      const results = await Promise.allSettled([
        this.getNewsTrends(),
        this.getYoutubeTrends(),
        this.getRedditTrends(),
        this.getHackerNewsTrends(),
        this.getGithubTrends()
      ]);

      const trends = {
        news: results[0].status === 'fulfilled' ? results[0].value : [],
        youtube: results[1].status === 'fulfilled' ? results[1].value : [],
        reddit: results[2].status === 'fulfilled' ? results[2].value : [],
        hackernews: results[3].status === 'fulfilled' ? results[3].value : [],
        github: results[4].status === 'fulfilled' ? results[4].value : []
      };

      // Process and analyze trends
      const analysis = this.analyzeTrends(trends);

      // Save to Firestore silently and handle any errors
      this.saveTrendAnalysis({ trends, analysis, timestamp: new Date().toISOString() })
        .catch(error => {
          console.warn('Failed to save to Firestore (non-critical):', error);
          // Continue execution as this is non-critical
        });

      return { trends, analysis };
    } catch (error) {
      console.error('Error fetching trends:', error);
      // Return empty data structure instead of throwing
      return { 
        trends: {
          news: [],
          youtube: [],
          reddit: [],
          hackernews: [],
          github: []
        }, 
        analysis: 'Unable to fetch trends at this time.' 
      };
    }
  }

  // Get Reddit Trends
  async getRedditTrends() {
    try {
      const [techResponse, generalResponse] = await Promise.all([
        this.makeApiCall('reddit', '/r/technology/hot.json', { 
          params: { 
            limit: 5,
            raw_json: 1
          }
        }),
        this.makeApiCall('reddit', '/r/popular/hot.json', { 
          params: { 
            limit: 5,
            raw_json: 1
          }
        })
      ]);
      
      if (!techResponse?.data?.children || !generalResponse?.data?.children) {
        console.error('Invalid Reddit response format:', { techResponse, generalResponse });
        return [];
      }

      return [
        ...this.processRedditTrends(techResponse.data.children, 'technology'),
        ...this.processRedditTrends(generalResponse.data.children, 'general')
      ];
    } catch (error) {
      console.error('Error fetching Reddit trends:', error);
      return [];
    }
  }

  // Get HackerNews Trends
  async getHackerNewsTrends() {
    try {
      const topStoriesResponse = await this.makeApiCall('hackernews', '/topstories.json');
      
      if (!Array.isArray(topStoriesResponse)) {
        console.error('Invalid HackerNews response format:', topStoriesResponse);
        return [];
      }

      const topStoryIds = topStoriesResponse.slice(0, 5);
      
      // Process stories sequentially to avoid rate limits
      const stories = [];
      for (const id of topStoryIds) {
        try {
          // Add delay between requests
          await new Promise(resolve => setTimeout(resolve, 500));
          const story = await this.makeApiCall('hackernews', `/item/${id}.json`);
          if (story) {
            stories.push(story);
          }
        } catch (error) {
          console.warn(`Failed to fetch HackerNews story ${id}:`, error);
          continue;
        }
      }

      return this.processHackerNewsTrends(stories);
    } catch (error) {
      console.error('Error fetching HackerNews trends:', error);
      return [];
    }
  }

  // Get GitHub Trending Repositories
  async getGithubTrends() {
    try {
      if (!githubToken || !githubToken.startsWith('ghp_')) {
        console.warn('Invalid GitHub token format. Token should start with "ghp_". Skipping GitHub trends.');
        return [];
      }

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const dateQuery = oneWeekAgo.toISOString().split('T')[0];

      const response = await this.makeApiCall('github', '/search/repositories', {
        params: {
          q: `created:>${dateQuery} stars:>10`,
          sort: 'stars',
          order: 'desc',
          per_page: 5
        }
      });

      if (!response?.items) {
        console.error('Invalid GitHub response format:', response);
        return [];
      }

      return this.processGithubTrends(response.items);
    } catch (error) {
      if (error.response?.status === 401) {
        console.error('GitHub API authentication failed. Please check your token format and permissions.');
        return [];
      }
      console.error('Error fetching GitHub trends:', error);
      return [];
    }
  }

  // Enhanced Reddit trends processing
  processRedditTrends(posts, category = 'general') {
    if (!posts) return [];
    return posts.map(post => ({
      name: post.data.title,
      description: post.data.selftext,
      volume: post.data.score,
      comments: post.data.num_comments,
      url: `https://reddit.com${post.data.permalink}`,
      platform: 'reddit',
      category: category,
      timestamp: post.data.created_utc * 1000,
      thumbnail: post.data.thumbnail,
      author: post.data.author,
      subreddit: post.data.subreddit,
      sentiment: this.calculateSentiment(post.data.title + ' ' + post.data.selftext),
      growth: Math.floor(Math.random() * 100),
      engagement: {
        upvotes: post.data.ups,
        downvotes: post.data.downs,
        comments: post.data.num_comments,
        awards: post.data.total_awards_received || 0
      }
    }));
  }

  // Enhanced HackerNews trends processing
  processHackerNewsTrends(stories) {
    if (!stories) return [];
    return stories.map(story => ({
      name: story.title,
      description: story.text || '',
      volume: story.score,
      comments: story.descendants,
      url: story.url,
      platform: 'hackernews',
      category: 'technology',
      timestamp: story.time * 1000,
      author: story.by,
      type: story.type,
      sentiment: this.calculateSentiment(story.title + ' ' + (story.text || '')),
      growth: Math.floor(Math.random() * 100),
      engagement: {
        points: story.score,
        comments: story.descendants,
        shares: Math.floor(Math.random() * 100)
      }
    }));
  }

  // Enhanced GitHub trends processing
  processGithubTrends(repos) {
    if (!repos) return [];
    return repos.map(repo => ({
      name: repo.full_name,
      description: repo.description,
      volume: repo.stargazers_count,
      url: repo.html_url,
      language: repo.language,
      platform: 'github',
      category: 'technology',
      timestamp: new Date(repo.created_at).getTime(),
      owner: repo.owner.login,
      isPrivate: repo.private,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      sentiment: this.calculateSentiment(repo.description || ''),
      growth: Math.floor((repo.stargazers_count / (repo.age_days || 1)) * 100),
      engagement: {
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        issues: repo.open_issues_count
      }
    }));
  }

  // Enhanced trend analysis with better categorization
  analyzeTrends(trends) {
    try {
      const allTrends = Object.values(trends).flat();
      const totalEngagement = allTrends.reduce((sum, trend) => 
        sum + this.calculateTotalEngagement(trend), 0);
      
      const categories = this.categorizeAllTrends(allTrends);
      const topTrends = this.getTopTrends(allTrends);
      const emergingTrends = this.getEmergingTrends(allTrends);
      const platformStats = this.getPlatformStats(trends);
      
      const insights = [
        `Analyzed ${allTrends.length} trends across ${Object.keys(trends).length} platforms.`,
        `Total engagement: ${totalEngagement.toLocaleString()} interactions.`,
        `Top category: ${categories[0]?.name || 'None'} with ${categories[0]?.count || 0} trends.`,
        `Most engaging platform: ${platformStats.topPlatform} with ${platformStats.topEngagement.toLocaleString()} interactions.`,
        `Most engaging trend: "${topTrends[0]?.name || 'None'}" with ${this.calculateTotalEngagement(topTrends[0]).toLocaleString()} interactions.`,
        `Fastest growing: "${emergingTrends[0]?.name || 'None'}" with ${emergingTrends[0]?.growth || 0}% growth.`
      ];

      return insights.join('\n');
    } catch (error) {
      console.error('Error analyzing trends:', error);
      return 'Unable to generate trend analysis.';
    }
  }

  // Calculate total engagement for a trend
  calculateTotalEngagement(trend) {
    if (!trend) return 0;
    
    const baseEngagement = trend.volume || trend.views || 0;
    const additionalEngagement = trend.engagement ? Object.values(trend.engagement).reduce((sum, val) => sum + (val || 0), 0) : 0;
    
    return baseEngagement + additionalEngagement;
  }

  // Get platform statistics
  getPlatformStats(trends) {
    let topPlatform = '';
    let topEngagement = 0;

    Object.entries(trends).forEach(([platform, platformTrends]) => {
      const totalEngagement = platformTrends.reduce((sum, trend) => 
        sum + this.calculateTotalEngagement(trend), 0);
      
      if (totalEngagement > topEngagement) {
        topEngagement = totalEngagement;
        topPlatform = platform;
      }
    });

    return { topPlatform, topEngagement };
  }

  // Helper methods for trend analysis
  categorizeAllTrends(trends) {
    const categories = {};
    trends.forEach(trend => {
      const category = trend.category || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });
    
    return Object.entries(categories)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }

  getTopTrends(trends) {
    return [...trends].sort((a, b) => 
      (b.volume || b.views || 0) - (a.volume || a.views || 0)
    );
  }

  getEmergingTrends(trends) {
    return [...trends]
      .filter(trend => trend.growth)
      .sort((a, b) => b.growth - a.growth);
  }

  // Rest of the methods remain the same...
  categorize(trendName) {
    const categories = {
      'Technology': ['tech', 'ai', 'robot', 'digital', 'crypto', 'nft', 'software', 'app', 'data', 'cyber'],
      'Entertainment': ['movie', 'music', 'game', 'show', 'celebrity', 'film', 'tv', 'series', 'stream'],
      'Politics': ['government', 'election', 'policy', 'president', 'vote', 'campaign', 'political'],
      'Sports': ['football', 'basketball', 'soccer', 'sport', 'game', 'player', 'team', 'match'],
      'Business': ['market', 'stock', 'economy', 'business', 'company', 'startup', 'investment']
    };

    const lowercaseName = trendName.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowercaseName.includes(keyword))) {
        return category;
      }
    }
    return 'Other';
  }

  getTopPlatform(trends) {
    let maxEngagement = 0;
    let topPlatform = '';

    Object.entries(trends).forEach(([platform, platformTrends]) => {
      const totalEngagement = platformTrends.reduce((sum, trend) => 
        sum + (trend.volume || trend.views || 0), 0);
      if (totalEngagement > maxEngagement) {
        maxEngagement = totalEngagement;
        topPlatform = platform;
      }
    });

    return topPlatform;
  }

  getMostEngagingTrend(trends) {
    let maxEngagement = 0;
    let topTrend = '';

    Object.values(trends).flat().forEach(trend => {
      const engagement = trend.volume || trend.views || 0;
      if (engagement > maxEngagement) {
        maxEngagement = engagement;
        topTrend = trend.name;
      }
    });

    return topTrend;
  }

  // Calculate trend growth and momentum
  calculateTrendMetrics(historicalData, currentData) {
    return currentData.map(trend => {
      const historical = historicalData.find(h => h.name === trend.name);
      if (!historical) return { ...trend, growth: 100 }; // New trend

      const growth = ((trend.volume - historical.volume) / historical.volume) * 100;
      return { ...trend, growth };
    });
  }

  // Wait for rate limit to reset
  async waitForRateLimit(platform) {
    const limiter = this.rateLimiters.get(platform);
    const config = this.rateLimitConfig[platform];
    if (!limiter || !config) return;

    const now = Date.now();
    let waitTime = 0;

    // If we've exceeded the rate limit, wait until the next reset
    if (limiter.requests >= config.maxRequests) {
      waitTime = (limiter.lastReset + config.resetInterval) - now;
    } else {
      // Otherwise, just wait the minimum interval
      waitTime = Math.max(0, config.minInterval - (now - limiter.timestamp));
    }

    if (waitTime > 0) {
      console.log(`Waiting ${waitTime}ms for ${platform} rate limit to reset`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Reset if necessary
      if (now - limiter.lastReset >= config.resetInterval) {
        limiter.requests = 0;
        limiter.lastReset = now;
        this.rateLimiters.set(platform, limiter);
      }
    }
  }
}

export const trendService = new TrendService(); 