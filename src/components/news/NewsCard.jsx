import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export default function NewsCard({ article }) {
  const {
    id,
    title,
    description,
    imageUrl,
    source,
    publishedAt,
    category,
    url
  } = article;

  const getCategoryColor = (category) => {
    const colors = {
      technology: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
      business: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      science: 'bg-green-500/10 text-green-300 border-green-500/20',
      health: 'bg-red-500/10 text-red-300 border-red-500/20',
      entertainment: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
      sports: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
      general: 'bg-gray-500/10 text-gray-300 border-gray-500/20'
    };
    return colors[category] || colors.general;
  };

  const formatPublishedDate = (date) => {
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  return (
    <Link to={`/dashboard/news/${id}`} className="block group">
      <motion.article 
        className="bg-[#1A1F32]/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full border border-gray-700/50 hover:border-indigo-500/50"
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative h-48 overflow-hidden rounded-t-xl">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1A1F32] to-[#0F1629] flex items-center justify-center">
              <span className="text-gray-500">No image available</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1629]/80 to-transparent"></div>
          <div className="absolute top-4 left-4">
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${getCategoryColor(category)} backdrop-blur-sm`}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-200 mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:via-indigo-500 group-hover:to-purple-500 transition-all duration-300">
            {title}
          </h3>
          
          <p className="text-gray-400 mb-4 line-clamp-2">
            {description || 'No description available'}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span className="flex items-center bg-[#0F1629]/50 px-3 py-1.5 rounded-full">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8m-2 12a2 2 0 01-2-2v-1" />
              </svg>
              {source}
            </span>
            <span className="flex items-center bg-[#0F1629]/50 px-3 py-1.5 rounded-full">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatPublishedDate(publishedAt)}
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
} 