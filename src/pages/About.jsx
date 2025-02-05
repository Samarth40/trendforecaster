import React from 'react';
import { motion } from 'framer-motion';
import { Bot, TrendingUp, Sparkles, Shield } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Real-time Trend Analysis',
      description: 'Stay ahead of the curve with our advanced trend detection algorithms.'
    },
    {
      icon: Bot,
      title: 'AI-Powered Insights',
      description: 'Get intelligent content suggestions and market analysis from our AI.'
    },
    {
      icon: Sparkles,
      title: 'Smart Content Generation',
      description: 'Create engaging content tailored to trending topics and your audience.'
    },
    {
      icon: Shield,
      title: 'Reliable & Secure',
      description: 'Your data is protected with enterprise-grade security measures.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F1629] py-16">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-transparent bg-clip-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            About TrendForecaster
          </motion.h1>
          <motion.p 
            className="text-gray-400 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            We're building the future of trend analysis and content creation, helping creators and businesses stay ahead in the digital landscape.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="bg-[#1A1F32]/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-200 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Mission Statement */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h2 
            className="text-3xl font-bold text-gray-200 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Our Mission
          </motion.h2>
          <motion.p 
            className="text-gray-400 text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            To empower creators and businesses with AI-driven insights and tools that help them understand trends, create compelling content, and make data-driven decisions in real-time.
          </motion.p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'Active Users', value: '10,000+' },
            { label: 'Trends Analyzed', value: '1M+' },
            { label: 'Content Generated', value: '500K+' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="bg-[#1A1F32]/50 backdrop-blur-sm p-8 rounded-xl border border-gray-800 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 