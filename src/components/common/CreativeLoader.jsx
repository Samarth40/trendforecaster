import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

export default function CreativeLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-[#0F1629]/95 backdrop-blur-sm z-[9999] flex items-center justify-center"
    >
      <div className="relative flex flex-col items-center">
        {/* Logo Container */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ 
            y: [-20, 0, -20],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Main container */}
          <div className="w-20 h-20 rounded-xl bg-[#1A1F32] border-2 border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            {/* Icon with glow effect */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40" />
              <TrendingUp className="w-8 h-8 text-indigo-500 relative z-10" />
            </motion.div>
          </div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="text-lg font-medium bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-transparent bg-clip-text">
            TrendForecaster
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ...
            </motion.span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
} 