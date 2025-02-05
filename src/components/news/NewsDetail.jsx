import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { newsService } from '../../services/newsService';
import LoadingSpinner from '../common/LoadingSpinner';

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullContent, setFullContent] = useState(null);
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const articles = await newsService.getTopNews();
        const foundArticle = articles.find(a => a.id === id);
        
        if (!foundArticle) {
          setError('Article not found');
          return;
        }
        
        setArticle(foundArticle);
        fetchFullContent(foundArticle.url);
      } catch (err) {
        setError('Failed to load article');
        console.error('Error loading article:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const fetchFullContent = async (url) => {
    try {
      setLoadingContent(true);
      const content = await newsService.getFullArticle(url);
      if (content) {
        setFullContent(content);
      }
    } catch (error) {
      console.error('Error fetching full content:', error);
    } finally {
      setLoadingContent(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0F1629]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F1629] py-8">
        <div className="container mx-auto px-4">
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
          <button
            onClick={() => navigate('/dashboard/news')}
            className="mt-4 text-indigo-400 hover:text-indigo-300"
          >
            ← Back to News
          </button>
        </div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#0F1629] py-8"
    >
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => navigate('/dashboard/news')}
          className="mb-6 flex items-center text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to News
        </button>

        <article className="bg-[#1A1F32] rounded-xl shadow-lg overflow-hidden border border-gray-800">
          {article.imageUrl && (
            <div className="relative h-96 overflow-hidden">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F1629]/80 to-transparent"></div>
            </div>
          )}

          <div className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-900/50 text-indigo-200 border border-indigo-500/50">
                {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
              </span>
              <span className="text-gray-400 text-sm">
                {formatDistanceToNow(article.publishedAt, { addSuffix: true })}
              </span>
              <span className="text-gray-400 text-sm flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {article.readTime} min read
              </span>
            </div>

            <h1 className="text-4xl font-bold text-white mb-6">
              {article.title}
            </h1>

            <div className="flex items-center mb-8">
              <div className="flex items-center text-gray-400">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8m-2 12a2 2 0 01-2-2v-1" />
                </svg>
                <span>{article.source}</span>
              </div>
              {article.author && (
                <div className="flex items-center text-gray-400 ml-6">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{article.author}</span>
                </div>
              )}
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-lg leading-relaxed mb-8">
                {article.description}
              </p>
              
              {loadingContent ? (
                <div className="flex justify-center my-8">
                  <LoadingSpinner size="medium" />
                </div>
              ) : fullContent ? (
                <div className="text-gray-300 text-lg leading-relaxed space-y-6">
                  {fullContent.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="text-gray-300">
                        {paragraph}
                      </p>
                    )
                  ))}
                </div>
              ) : (
                <p className="text-gray-300 text-lg leading-relaxed mb-8">
                  {article.content}
                </p>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-800">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
              >
                Read Original Article
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </article>
      </div>
    </motion.div>
  );
} 