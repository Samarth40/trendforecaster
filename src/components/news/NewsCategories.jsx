import React from 'react';
import PropTypes from 'prop-types';

const categories = [
  { id: 'world', label: 'World News' },
  { id: 'technology', label: 'Technology' },
  { id: 'sport', label: 'Sports' },
  { id: 'business', label: 'Business' },
  { id: 'politics', label: 'Politics' },
  { id: 'culture', label: 'Culture & Arts' },
  { id: 'lifeandstyle', label: 'Life & Style' },
  { id: 'science', label: 'Science' },
  { id: 'environment', label: 'Environment' },
  { id: 'media', label: 'Media' }
];

export default function NewsCategories({ selectedCategory, onCategoryChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onCategoryChange(id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
            selectedCategory === id
              ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white'
              : 'bg-[#1A1F32]/50 text-gray-300 hover:bg-[#1A1F32] border border-gray-700/50 hover:border-indigo-500/50'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

NewsCategories.propTypes = {
  selectedCategory: PropTypes.string.isRequired,
  onCategoryChange: PropTypes.func.isRequired
}; 