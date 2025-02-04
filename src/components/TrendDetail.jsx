import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiService } from '../services/aiService';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { X } from 'lucide-react';

const TrendDetail = ({ trend }) => {
  const [contentIdeas, setContentIdeas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleGenerateIdeas = async () => {
    setIsLoading(true);
    try {
      const ideas = await aiService.generateContentIdeas(trend);
      setContentIdeas(ideas.slice(0, 5)); // Only take first 5 ideas
    } catch (error) {
      console.error('Error generating content ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const Modal = ({ idea, onClose }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass-effect rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <span className="px-3 py-1 rounded-full bg-purple-500 bg-opacity-20 text-purple-300 text-sm">
            {idea.type}
          </span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-100 mb-4">{idea.title}</h3>
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-300 mb-2">Description</h4>
            <p className="text-gray-400">{idea.description}</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-300 mb-2">Outline</h4>
            <ul className="list-disc list-inside space-y-2">
              {idea.outline.map((item, i) => (
                <li key={i} className="text-gray-400">{item}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-300 mb-2">Recommended Platforms</h4>
            <div className="flex flex-wrap gap-2">
              {idea.recommendedPlatforms.map((platform, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-blue-500 bg-opacity-20 text-blue-300 text-sm"
                >
                  {platform}
                </span>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-gray-300 mb-2">Additional Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400">Difficulty Level</p>
                <p className="text-lg font-semibold text-gray-200">{idea.difficulty}</p>
              </div>
              <div>
                <p className="text-gray-400">Estimated Engagement</p>
                <p className="text-lg font-semibold text-gray-200">
                  {idea.estimatedEngagement.toLocaleString()} interactions
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Trend Header */}
      <div className="glass-effect rounded-xl p-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
          {trend.name}
        </h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-purple-500 bg-opacity-20 text-purple-300 text-sm">
            {trend.platform}
          </span>
          {trend.category && (
            <span className="px-3 py-1 rounded-full bg-blue-500 bg-opacity-20 text-blue-300 text-sm">
              {trend.category}
            </span>
          )}
        </div>
        <p className="mt-4 text-gray-300">{trend.description}</p>
      </div>

      {/* Trend Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-effect rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Engagement</h3>
          <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            {(trend.volume || trend.views || 0).toLocaleString()}
          </div>
          <p className="text-sm text-gray-400 mt-1">
            {trend.platform === 'youtube' ? 'Views' : 'Mentions'}
          </p>
        </div>
        {trend.sentiment && (
          <div className="glass-effect rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Sentiment</h3>
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
              {trend.sentiment}
            </div>
            <p className="text-sm text-gray-400 mt-1">Overall Sentiment</p>
          </div>
        )}
        <div className="glass-effect rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Growth</h3>
          <div className={`text-3xl font-bold ${trend.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend.growth >= 0 ? '+' : ''}{trend.growth}%
          </div>
          <p className="text-sm text-gray-400 mt-1">Last 24 hours</p>
        </div>
      </div>

      {/* Content Ideas Section */}
      <div className="glass-effect rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-100">Content Ideas</h2>
          <button
            onClick={handleGenerateIdeas}
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-400 to-cyan-400 text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? 'Generating Ideas...' : 'Generate Ideas'}
          </button>
        </div>

        {contentIdeas.length > 0 && (
          <div className="mt-6">
            <div className="grid grid-cols-5 gap-4">
              {contentIdeas.map((idea, index) => (
                <div
                  key={index}
                  className="glass-effect rounded-lg overflow-hidden hover:bg-gray-800 hover:bg-opacity-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedIdea(idea);
                    setIsModalOpen(true);
                  }}
                >
                  <div className="p-4">
                    <div className="flex flex-col gap-3">
                      <span className="px-3 py-1 rounded-full bg-purple-500 bg-opacity-20 text-purple-300 text-sm w-fit">
                        {idea.type}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-100 line-clamp-2">
                        {idea.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-3">
                        {idea.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="flex flex-col gap-2">
                        <span className="text-sm text-gray-400">
                          Difficulty: {idea.difficulty}
                        </span>
                        <span className="text-sm text-gray-400">
                          {idea.estimatedEngagement.toLocaleString()} interactions
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && selectedIdea && (
          <Modal idea={selectedIdea} onClose={() => {
            setIsModalOpen(false);
            setSelectedIdea(null);
          }} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrendDetail; 