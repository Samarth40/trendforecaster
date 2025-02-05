import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { newsService } from '../../services/newsService';
import LoadingSpinner from '../common/LoadingSpinner';
import { ArrowLeft, Share2, Bookmark, Clock, Calendar, User } from 'lucide-react';

export default function ArticleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const decodedId = decodeURIComponent(id);
        const response = await newsService.getArticleById(decodedId);
        setArticle(response);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1629] flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-[#0F1629] p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/dashboard/news')}
            className="flex items-center text-indigo-400 hover:text-indigo-300 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to News
          </button>
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl">
            {error || 'Article not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1629] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Navigation */}
          <button
            onClick={() => navigate('/dashboard/news')}
            className="flex items-center text-indigo-400 hover:text-indigo-300 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to News
          </button>

          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
              </span>
              <span className="text-gray-400 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {article.readTime} min read
              </span>
            </div>
            <h1 className="text-4xl font-bold text-gray-100 mb-4">{article.title}</h1>
            <div className="flex items-center gap-6 text-gray-400">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Article Image */}
          {article.imageUrl && (
            <div className="relative h-[400px] rounded-xl overflow-hidden mb-8">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-invert max-w-none">
            {/* Description */}
            <div className="text-xl text-gray-300 mb-8 leading-relaxed">
              {article.description}
            </div>

            {/* Full Content */}
            <div 
              className="text-gray-300 space-y-6"
              dangerouslySetInnerHTML={{ __html: article.fullContent }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-8 pt-8 border-t border-gray-800">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Read on The Guardian
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 