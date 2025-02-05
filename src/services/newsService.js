import axios from 'axios';

const GUARDIAN_API_KEY = import.meta.env.VITE_GUARDIAN_API_KEY || '7b171588-f6e2-4953-9eae-7e9e47a6e821';
const BASE_URL = 'https://content.guardianapis.com';

// Valid sections for The Guardian API
const VALID_CATEGORIES = {
  world: 'world',
  technology: 'technology',
  sport: 'sport',
  business: 'business',
  politics: 'politics',
  culture: 'culture',
  lifeandstyle: 'lifeandstyle',  // Guardian uses 'lifeandstyle' for lifestyle section
  science: 'science',
  environment: 'environment',
  media: 'media'
};

class NewsService {
  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL
    });

    // Initialize cache
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache for fresh news
    this.loadCacheFromStorage();
  }

  loadCacheFromStorage() {
    try {
      const savedCache = localStorage.getItem('guardian_cache');
      if (savedCache) {
        const parsed = JSON.parse(savedCache);
        Object.entries(parsed).forEach(([key, value]) => {
          if (Date.now() - value.timestamp < this.cacheTimeout) {
            this.cache.set(key, value);
          }
        });
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
  }

  saveToStorage() {
    try {
      const cacheObj = {};
      this.cache.forEach((value, key) => {
        cacheObj[key] = value;
      });
      localStorage.setItem('guardian_cache', JSON.stringify(cacheObj));
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }

  validateCategory(category) {
    return Object.keys(VALID_CATEGORIES).includes(category.toLowerCase());
  }

  async getTopNews(category = 'world', page = 1, pageSize = 10) {
    const cacheKey = `top-${category}-${page}-${pageSize}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log('Fetching news for category:', category);
      const params = {
        'api-key': GUARDIAN_API_KEY,
        'page': page,
        'page-size': pageSize,
        'show-fields': 'all',
        'order-by': 'newest',
        'section': VALID_CATEGORIES[category.toLowerCase()]
      };

      // For world news, we want to include international news
      if (category === 'world') {
        params.section = 'world|international';
        params['tag'] = 'world/world';
      }

      const response = await this.api.get('/search', { params });

      if (!response.data?.response?.results) {
        console.error('Invalid API response:', response.data);
        throw new Error('Invalid API response');
      }

      const processedData = this.processArticles(response.data.response.results, category);
      this.setInCache(cacheKey, processedData);
      return processedData;
    } catch (error) {
      console.error('Error in getTopNews:', error.response?.data || error.message);
      throw error;
    }
  }

  async searchNews(query, page = 1, pageSize = 10) {
    if (!query || query.trim().length === 0) {
      throw new Error('Invalid API parameters: search query is required');
    }

    const cacheKey = `search-${query}-${page}-${pageSize}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log('Searching news for query:', query);
      const params = {
        'api-key': GUARDIAN_API_KEY,
        'q': query.trim(),
        'page': page,
        'page-size': pageSize,
        'show-fields': 'all',
        'order-by': 'relevance'
      };

      const response = await this.api.get('/search', { params });

      if (!response.data?.response?.results) {
        console.error('Invalid API response:', response.data);
        throw new Error('Invalid API response');
      }

      const processedData = this.processArticles(response.data.response.results);
      this.setInCache(cacheKey, processedData);
      return processedData;
    } catch (error) {
      console.error('Error in searchNews:', error.response?.data || error.message);
      throw error;
    }
  }

  processArticles(articles, requestedCategory) {
    if (!Array.isArray(articles)) {
      console.error('Invalid articles data:', articles);
      return [];
    }

    return articles.map(article => {
      try {
        const fields = article.fields || {};
        // Use the requested category instead of the article's section
        const category = requestedCategory || article.sectionName?.toLowerCase() || 'world';
        
        return {
          id: article.id,
          title: article.webTitle,
          description: fields.trailText || fields.standfirst || '',
          content: fields.bodyText || '',
          fullContent: fields.body || null,
          url: article.webUrl,
          imageUrl: fields.thumbnail || fields.main || null,
          source: 'The Guardian',
          author: fields.byline || 'The Guardian',
          publishedAt: new Date(article.webPublicationDate),
          category: category,
          readTime: this.calculateReadTime(fields.bodyText || fields.trailText || ''),
          daysAgo: this.calculateDaysAgo(new Date(article.webPublicationDate))
        };
      } catch (error) {
        console.error('Error processing article:', error, article);
        return null;
      }
    }).filter(article => article !== null);
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('Returning cached data for:', key);
      return cached.data;
    }
    this.cache.delete(key);
    this.saveToStorage();
    return null;
  }

  setInCache(key, data) {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    this.cache.set(key, cacheData);
    this.saveToStorage();
  }

  // Helper methods remain the same
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
    return btoa(url || Date.now().toString()).replace(/[^a-zA-Z0-9]/g, '');
  }

  async getArticleById(id) {
    const cacheKey = `article-${id}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log('Fetching article by ID:', id);
      const params = {
        'api-key': GUARDIAN_API_KEY,
        'show-fields': 'all',
        'show-tags': 'all',
        'show-elements': 'all'
      };

      // The Guardian API expects the ID in the format: world/2024/mar/20/example-article
      // Remove the leading forward slash if present
      const cleanId = id.startsWith('/') ? id.slice(1) : id;
      
      const response = await this.api.get(`/${cleanId}`, { params });

      if (!response.data?.response?.content) {
        console.error('Invalid API response:', response.data);
        throw new Error('Invalid API response');
      }

      const article = response.data.response.content;
      const fields = article.fields || {};
      
      const processedArticle = {
        id: article.id,
        title: article.webTitle,
        description: fields.trailText || fields.standfirst || '',
        content: fields.bodyText || '',
        fullContent: fields.body || null,
        url: article.webUrl,
        imageUrl: fields.thumbnail || fields.main || null,
        source: 'The Guardian',
        author: fields.byline || 'The Guardian',
        publishedAt: new Date(article.webPublicationDate),
        category: article.sectionName?.toLowerCase() || 'world',
        readTime: this.calculateReadTime(fields.bodyText || fields.trailText || ''),
        daysAgo: this.calculateDaysAgo(new Date(article.webPublicationDate))
      };

      this.setInCache(cacheKey, processedArticle);
      return processedArticle;
    } catch (error) {
      console.error('Error in getArticleById:', error.response?.data || error.message);
      throw error;
    }
  }
}

export const newsService = new NewsService(); 