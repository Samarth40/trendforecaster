import axios from 'axios';

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsapi.org/v2';

class NewsService {
  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'X-Api-Key': NEWS_API_KEY
      }
    });

    // Initialize cache
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async getTopNews(category = 'general', page = 1, pageSize = 20, days = 1) {
    const cacheKey = `top-${category}-${page}-${pageSize}-${days}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      let response;
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      
      // Format dates in YYYY-MM-DD format
      const from = fromDate.toISOString().split('T')[0];
      const to = toDate.toISOString().split('T')[0];

      if (category === 'general') {
        response = await this.api.get('/everything', {
          params: {
            q: 'news',
            language: 'en',
            from,
            to,
            sortBy: 'publishedAt',
            page,
            pageSize,
            domains: 'bbc.com,cnn.com,reuters.com,nytimes.com,theguardian.com,apnews.com'
          }
        });
      } else {
        response = await this.api.get('/everything', {
          params: {
            q: `${category} news`,
            language: 'en',
            from,
            to,
            sortBy: 'publishedAt',
            page,
            pageSize,
            domains: 'bbc.com,cnn.com,reuters.com,nytimes.com,theguardian.com,apnews.com'
          }
        });
      }

      const processedData = this.processArticles(response.data.articles || []);
      const filteredData = category === 'general' 
        ? processedData.filter(article => !article.category || article.category === 'general')
        : processedData.filter(article => article.category === category);
      
      this.setInCache(cacheKey, filteredData);
      return filteredData;
    } catch (error) {
      console.error('Error fetching top news:', error);
      throw error;
    }
  }

  async searchNews(query, page = 1, pageSize = 20, days = 1) {
    const cacheKey = `search-${query}-${page}-${pageSize}-${days}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);
      
      // Format dates in YYYY-MM-DD format
      const from = fromDate.toISOString().split('T')[0];
      const to = toDate.toISOString().split('T')[0];

      const response = await this.api.get('/everything', {
        params: {
          q: query,
          page,
          pageSize,
          language: 'en',
          from,
          to,
          sortBy: 'publishedAt',
          domains: 'bbc.com,cnn.com,reuters.com,nytimes.com,theguardian.com,apnews.com'
        }
      });

      const processedData = this.processArticles(response.data.articles || []);
      this.setInCache(cacheKey, processedData);
      return processedData;
    } catch (error) {
      console.error('Error searching news:', error);
      throw error;
    }
  }

  async getFullArticle(url) {
    try {
      const response = await axios.get(url);
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.data, 'text/html');
      
      // Try to find the main article content
      const article = doc.querySelector('article') || 
                     doc.querySelector('.article-content') || 
                     doc.querySelector('.story-content') ||
                     doc.querySelector('main');
      
      if (article) {
        return article.textContent.trim();
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching full article:', error);
      return null;
    }
  }

  processArticles(articles) {
    return articles.map(article => ({
      id: this.generateId(article.url),
      title: article.title,
      description: article.description,
      content: article.content,
      fullContent: null,
      url: article.url,
      imageUrl: article.urlToImage,
      source: article.source.name,
      author: article.author,
      publishedAt: new Date(article.publishedAt),
      category: this.categorizeArticle(article.title + ' ' + (article.description || '')),
      readTime: this.calculateReadTime(article.content || article.description || ''),
      daysAgo: this.calculateDaysAgo(new Date(article.publishedAt))
    }));
  }

  calculateReadTime(text) {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const readTime = Math.ceil(words / wordsPerMinute);
    return readTime < 1 ? 1 : readTime;
  }

  calculateDaysAgo(publishedDate) {
    const now = new Date();
    const diffTime = Math.abs(now - publishedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  generateId(url) {
    return btoa(url).replace(/[^a-zA-Z0-9]/g, '');
  }

  categorizeArticle(text) {
    const categoryPatterns = {
      technology: [
        'tech', 'software', 'ai', 'digital', 'cyber', 'robot', 'programming',
        'computer', 'internet', 'app', 'smartphone', 'gadget', 'innovation'
      ],
      business: [
        'business', 'economy', 'market', 'stock', 'trade', 'finance',
        'investment', 'startup', 'company', 'industry', 'corporate', 'revenue'
      ],
      science: [
        'science', 'research', 'study', 'discovery', 'space', 'physics',
        'chemistry', 'biology', 'experiment', 'laboratory', 'scientist'
      ],
      health: [
        'health', 'medical', 'covid', 'disease', 'treatment', 'hospital',
        'doctor', 'patient', 'medicine', 'vaccine', 'wellness', 'healthcare'
      ],
      entertainment: [
        'movie', 'film', 'music', 'celebrity', 'entertainment', 'hollywood',
        'actor', 'actress', 'singer', 'concert', 'tv', 'show', 'series'
      ],
      sports: [
        'sport', 'football', 'basketball', 'soccer', 'game', 'player',
        'team', 'match', 'tournament', 'championship', 'athlete', 'racing'
      ]
    };

    text = text.toLowerCase();
    
    // Check each category's patterns
    for (const [category, patterns] of Object.entries(categoryPatterns)) {
      if (patterns.some(pattern => text.includes(pattern))) {
        return category;
      }
    }

    // If no specific category is found, check if it's a general news article
    const generalPatterns = [
      'news', 'update', 'report', 'world', 'country', 'government',
      'policy', 'society', 'community', 'people', 'public'
    ];

    if (generalPatterns.some(pattern => text.includes(pattern))) {
      return 'general';
    }

    // Default to general if no specific category is identified
    return 'general';
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  setInCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

export const newsService = new NewsService(); 