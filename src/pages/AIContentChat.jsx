import React from 'react';
import AIChat from '../components/AIChat';

const AIContentChat = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-white">AI Content Assistant</h1>
          <p className="text-gray-400 mt-2">Chat with your AI assistant to create engaging social media content</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <AIChat />
        </div>
        
        <div className="lg:col-span-4 space-y-6">
          {/* Features Card */}
          <div className="bg-[#1a2236] rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Features</h2>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-300">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                Content Creation for Multiple Platforms
              </li>
              <li className="flex items-center text-gray-300">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                Engagement Strategy Tips
              </li>
              <li className="flex items-center text-gray-300">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                Hashtag Recommendations
              </li>
              <li className="flex items-center text-gray-300">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                Content Calendar Planning
              </li>
              <li className="flex items-center text-gray-300">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                Trend Analysis & Insights
              </li>
            </ul>
          </div>

          {/* Tips Card */}
          <div className="bg-[#1a2236] rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Pro Tips</h2>
            <ul className="space-y-3">
              <li className="text-gray-300 text-sm">
                <span className="text-purple-400 font-semibold">💡 Be Specific:</span> The more details you provide, the better the content suggestions.
              </li>
              <li className="text-gray-300 text-sm">
                <span className="text-purple-400 font-semibold">🎯 Set Goals:</span> Mention your content objectives for targeted recommendations.
              </li>
              <li className="text-gray-300 text-sm">
                <span className="text-purple-400 font-semibold">📱 Specify Platform:</span> Mention which social media platform you're creating for.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIContentChat; 