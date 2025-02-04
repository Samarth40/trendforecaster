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

  async getTopNews(category = 'general', page = 1, pageSize = 10) {
    const cacheKey = `top-${category}-${page}-${pageSize}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.api.get('/top-headlines', {
        params: {
          country: 'us',
          category,
          page,
          pageSize
        }
      });

      const processedData = this.processArticles(response.data.articles || []);
      this.setInCache(cacheKey, processedData);
      return processedData;
    } catch (error) {
      console.error('Error fetching top news:', error);
      throw error;
    }
  }

  async searchNews(query, page = 1, pageSize = 10) {
    const cacheKey = `search-${query}-${page}-${pageSize}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.api.get('/everything', {
        params: {
          q: query,
          page,
          pageSize,
          language: 'en',
          sortBy: 'publishedAt'
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

  processArticles(articles) {
    return articles.map(article => ({
      id: this.generateId(article.url),
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      imageUrl: article.urlToImage,
      source: article.source.name,
      author: article.author,
      publishedAt: new Date(article.publishedAt),
      category: this.categorizeArticle(article.title + ' ' + (article.description || ''))
    }));
  }

  generateId(url) {
    return btoa(url).replace(/[^a-zA-Z0-9]/g, '');
  }

  categorizeArticle(text) {
    const categories = {
      technology: ['tech', 'software', 'ai', 'digital', 'cyber', 'robot'],
      business: ['business', 'economy', 'market', 'stock', 'trade'],
      science: ['science', 'research', 'study', 'discovery'],
      health: ['health', 'medical', 'covid', 'disease', 'treatment'],
      entertainment: ['movie', 'film', 'music', 'celebrity', 'entertainment'],
      sports: ['sport', 'football', 'basketball', 'soccer', 'game']
    };

    text = text.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }
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