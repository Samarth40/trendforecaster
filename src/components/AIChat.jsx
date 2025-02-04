import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Copy, Check, Sparkles } from 'lucide-react';
import { aiService } from '../services/aiService';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI content creation assistant. I can help you create engaging content for various social media platforms, suggest content strategies, and provide creative ideas. What would you like to create today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [error, setError] = useState(null);
  const chatContainerRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      // Get AI response using the service
      const aiResponse = await aiService.generateResponse(input);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setError('Failed to get response. Please try again.');
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble generating a response right now. Please try again in a moment.",
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-[500px] bg-[#1a2236] rounded-xl overflow-hidden border border-white/10">
      {/* Chat Header */}
      <div className="p-3 border-b border-white/10 bg-[#1E293B]">
        <div className="flex items-center space-x-2">
          <Bot className="w-6 h-6 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">AI Content Assistant</h2>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
      >
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex items-start space-x-2 ${
                message.role === 'assistant' ? 'justify-start' : 'justify-end'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-purple-400" />
                </div>
              )}
              <div className={`relative group max-w-[80%] ${
                message.role === 'assistant' 
                  ? `bg-[#2D3748] text-white ${message.isError ? 'border border-red-500/50' : ''}`
                  : 'bg-purple-500/10 text-purple-100'
              } rounded-lg p-3`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.role === 'assistant' && !message.isError && (
                  <button
                    onClick={() => copyToClipboard(message.content, index)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                    )}
                  </button>
                )}
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-400" />
                </div>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
              <div className="bg-[#2D3748] rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-3 py-2 bg-red-500/10 border-t border-red-500/20">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-[#1E293B]">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about content creation..."
            className="flex-1 bg-[#2D3748] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChat; 