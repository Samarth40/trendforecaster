import React from 'react';
import { motion } from 'framer-motion';

const categories = [
  { id: 'general', name: 'General', icon: '📰' },
  { id: 'technology', name: 'Technology', icon: '💻' },
  { id: 'business', name: 'Business', icon: '💼' },
  { id: 'science', name: 'Science', icon: '🔬' },
  { id: 'health', name: 'Health', icon: '🏥' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
  { id: 'sports', name: 'Sports', icon: '⚽' }
];

export default function NewsCategories({ selectedCategory, onSelectCategory }) {
  return (
    <div className="mb-12 overflow-x-auto scrollbar-hide">
      <div className="flex flex-nowrap gap-4 justify-start md:justify-center min-w-full px-4">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`
              px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap
              backdrop-blur-sm
              ${selectedCategory === category.id
                ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-[#1A1F32]/50 text-gray-400 hover:bg-[#1A1F32] border border-gray-700/50 hover:border-indigo-500/50'
              }
              flex items-center space-x-2
            `}
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.name}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
} 