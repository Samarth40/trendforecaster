import React, { useState, useEffect } from 'react';
import { newsService } from '../../services/newsService';
import NewsCard from './NewsCard';
import NewsCategories from './NewsCategories';
import SearchBar from '../common/SearchBar';
import LoadingSpinner from '../common/LoadingSpinner';
import { motion } from 'framer-motion';

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('world');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchNews();
  }, [category, page]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let articles;
      if (searchQuery) {
        articles = await newsService.searchNews(searchQuery, page, 10);
      } else {
        articles = await newsService.getTopNews(category, page, 10);
      }

      // Filter out articles with undefined or null properties
      articles = articles.filter(article => 
        article.title && 
        article.description && 
        article.url
      );

      if (articles.length === 0 && page === 1) {
        setError(`No ${category} news found. Please try a different category or search term.`);
      }

      setNews(prev => page === 1 ? articles : [...prev, ...articles]);
      setHasMore(articles.length === 10); // NewsData.io returns max 10 results per page
    } catch (err) {
      console.error('Error fetching news:', err);
      if (err.message === 'API rate limit exceeded' || err.message === 'API rate limit exceeded. Please try again later.') {
        setError(
          'Daily API request limit reached. Showing cached news. Please try again tomorrow for fresh updates.'
        );
        // Don't set hasMore to false here as we might still have cached data
      } else if (err.message === 'Invalid API response') {
        setError('Unable to fetch news at the moment. Please try again later.');
      } else if (err.message === 'Invalid API parameters') {
        setError('There was an issue with the news request. Please try a different category.');
        console.error('API Parameter Error:', err);
      } else if (err.response?.status === 401) {
        setError('API key is invalid or expired. Please check your configuration.');
      } else if (err.response?.status === 403) {
        setError('Access to the news API is forbidden. Please check your API key.');
      } else {
        setError('Failed to fetch news. Please try again later.');
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setPage(1);
    try {
      setLoading(true);
      setError(null);
      const articles = await newsService.searchNews(query, 1, 10);
      
      // Filter out articles with undefined or null properties
      const validArticles = articles.filter(article => 
        article.title && 
        article.description && 
        article.url
      );

      if (validArticles.length === 0) {
        setError('No results found for your search. Please try different keywords.');
      }

      setNews(validArticles);
      setHasMore(validArticles.length === 10);
    } catch (err) {
      console.error('Error searching news:', err);
      if (err.message === 'API rate limit exceeded' || err.message === 'API rate limit exceeded. Please try again later.') {
        setError(
          'Daily API request limit reached. Showing cached results. Please try again tomorrow for fresh updates.'
        );
        // Don't set hasMore to false here as we might still have cached data
      } else if (err.message === 'Invalid API response') {
        setError('Unable to search news at the moment. Please try again later.');
      } else if (err.message === 'Invalid API parameters') {
        setError('There was an issue with the search request. Please try different keywords.');
        console.error('API Parameter Error:', err);
      } else {
        setError('Failed to search news. Please try again later.');
      }
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (newCategory) => {
    if (newCategory === category) return;
    setCategory(newCategory);
    setPage(1);
    setSearchQuery('');
    setNews([]); // Clear existing news before loading new category
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1629] py-8">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <div className="inline-block">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-transparent bg-clip-text mb-4">
              Latest News
            </h1>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"></div>
          </div>
          <div className="max-w-2xl mx-auto mt-8">
            <SearchBar 
              onSearch={handleSearch} 
              placeholder="Search news..."
              className="w-full bg-[#1A1F32]/50 text-gray-200 border border-gray-700/50 focus:border-indigo-500 rounded-xl"
            />
          </div>
        </div>

        <NewsCategories 
          selectedCategory={category} 
          onCategoryChange={handleCategoryChange} 
        />

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-6 py-4 rounded-xl relative mb-6 backdrop-blur-sm" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {news.map((article, index) => (
            <motion.div
              key={article.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <NewsCard article={article} />
            </motion.div>
          ))}
        </motion.div>

        {loading && (
          <div className="flex justify-center my-12">
            <LoadingSpinner size="large" />
          </div>
        )}

        {!loading && hasMore && news.length > 0 && (
          <div className="flex justify-center mt-12">
            <button
              onClick={loadMore}
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white font-semibold py-3 px-8 rounded-xl transition duration-200 transform hover:scale-105 hover:shadow-xl shadow-indigo-500/20"
            >
              Load More
            </button>
          </div>
        )}

        {!loading && !hasMore && news.length > 0 && (
          <p className="text-center text-gray-400 mt-12">
            No more articles to load.
          </p>
        )}

        {!loading && news.length === 0 && !error && (
          <div className="text-center bg-[#1A1F32]/50 rounded-xl p-8 mt-8 border border-gray-700/50 backdrop-blur-sm">
            <p className="text-gray-300 text-lg">No articles found. Try a different search or category.</p>
          </div>
        )}
      </div>
    </div>
  );
} 