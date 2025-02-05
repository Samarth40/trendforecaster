import React from 'react';
import { motion } from 'framer-motion';
import { Scale, FileCheck, UserCheck, Settings, BookOpen, Mail } from 'lucide-react';

export default function Terms() {
  const sections = [
    {
      title: 'Acceptance of Terms',
      icon: Scale,
      content: `By accessing and using TrendForecaster, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.`
    },
    {
      title: 'Use License',
      icon: FileCheck,
      content: `Permission is granted to temporarily access the materials (information or software) on TrendForecaster's website for personal, non-commercial transitory viewing only.`
    },
    {
      title: 'User Responsibilities',
      icon: UserCheck,
      subsections: [
        'Provide accurate and complete information when creating an account',
        'Maintain the security of your account credentials',
        'Use the service in compliance with all applicable laws',
        'Respect intellectual property rights'
      ]
    },
    {
      title: 'Service Modifications',
      icon: Settings,
      content: `We reserve the right to withdraw or amend our service, and any service or material we provide, in our sole discretion without notice. We will not be liable if for any reason all or any part of the service is unavailable at any time or for any period.`
    },
    {
      title: 'Intellectual Property',
      icon: BookOpen,
      content: `The Service and its original content, features, and functionality are owned by TrendForecaster and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.`
    }
  ];

  const lastUpdated = '2024-01-20';

  return (
    <div className="min-h-screen bg-[#0F1629] py-16 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-purple-500/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-20" />
      
      <div className="container mx-auto px-4 max-w-4xl relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-block">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 p-0.5">
                <div className="w-full h-full rounded-2xl bg-[#0F1629] flex items-center justify-center">
                  <Scale className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-transparent bg-clip-text">
              Terms of Service
            </h1>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"></div>
          </div>
          <p className="text-gray-400 mt-6">
            Last updated: {lastUpdated}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-8"
        >
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              className="bg-[#1A1F32]/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 hover:border-blue-500/50 transition-colors group"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 p-0.5 group-hover:scale-110 transition-transform">
                  <div className="w-full h-full rounded-xl bg-[#1A1F32] flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold text-gray-200">
                  {section.title}
                </h2>
              </div>
              {section.content && (
                <p className="text-gray-300 leading-relaxed">
                  {section.content}
                </p>
              )}
              {section.subsections && (
                <ul className="space-y-3 mt-4">
                  {section.subsections.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center gap-3 text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20 p-8"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 p-0.5">
                <div className="w-full h-full rounded-xl bg-[#1A1F32] flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-gray-200">
                Contact Us
              </h2>
            </div>
            <p className="text-gray-300">
              For any questions about these Terms of Service, please contact us at{' '}
              <a
                href="mailto:samarthshinde9023@gmail.com"
                className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
              >
                samarthshinde9023@gmail.com
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 