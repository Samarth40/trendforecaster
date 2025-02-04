import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated news data - replace with actual API call
    const fetchNews = async () => {
      try {
        // Simulated delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setNews([
          {
            id: 1,
            title: "AI Revolution in Content Creation",
            category: "Technology",
            date: "2024-02-20",
            summary: "New AI models are transforming how content creators work, enabling more efficient and creative production processes.",
            readTime: "5 min read"
          },
          {
            id: 2,
            title: "Social Media Trends 2024",
            category: "Social Media",
            date: "2024-02-19",
            summary: "Short-form video content continues to dominate social media platforms, with new features being rolled out.",
            readTime: "4 min read"
          },
          {
            id: 3,
            title: "Digital Marketing Evolution",
            category: "Marketing",
            date: "2024-02-18",
            summary: "Personalization and AI-driven campaigns are becoming the new standard in digital marketing strategies.",
            readTime: "6 min read"
          }
        ]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news:', error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-display text-white">Trending News</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 rounded-lg bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors">
            Latest
          </button>
          <button className="px-4 py-2 rounded-lg bg-[#1E293B] text-gray-300 hover:bg-[#2D3748] transition-colors">
            Popular
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {news.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-[#1E293B] rounded-xl p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-sm font-medium text-[#4F46E5] bg-[#4F46E5]/10 px-3 py-1 rounded-full">
                  {item.category}
                </span>
                <h2 className="text-xl font-semibold text-white mt-2">{item.title}</h2>
              </div>
              <button className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
            </div>
            <p className="text-gray-300 mb-4">{item.summary}</p>
            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>{new Date(item.date).toLocaleDateString()}</span>
              <span>{item.readTime}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default News; 