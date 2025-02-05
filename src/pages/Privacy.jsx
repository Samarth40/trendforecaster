import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, UserCheck, Bell, Mail } from 'lucide-react';

export default function Privacy() {
  const sections = [
    {
      title: 'Information We Collect',
      icon: UserCheck,
      content: [
        'Account information (email, name)',
        'Usage data and analytics',
        'Content and trends you interact with',
        'Device and browser information'
      ]
    },
    {
      title: 'How We Use Your Information',
      icon: Bell,
      content: [
        'To provide and improve our services',
        'To personalize your experience',
        'To analyze trends and usage patterns',
        'To communicate with you about our services'
      ]
    },
    {
      title: 'Data Security',
      icon: Shield,
      content: [
        'We use industry-standard security measures',
        'Data is encrypted in transit and at rest',
        'Regular security audits and monitoring',
        'Limited employee access to personal data'
      ]
    },
    {
      title: 'Your Rights',
      icon: Lock,
      content: [
        'Access your personal data',
        'Request data correction or deletion',
        'Opt-out of marketing communications',
        'Data portability options'
      ]
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
                  <Shield className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-transparent bg-clip-text">
              Privacy Policy
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
          className="prose prose-invert max-w-none"
        >
          <div className="bg-[#1A1F32]/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 mb-12">
            <p className="text-gray-300 leading-relaxed">
              At TrendForecaster, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information. We are committed to maintaining the trust and confidence of our visitors to our web site.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center gap-3 text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20 p-8"
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
              If you have any questions about our privacy policy or how we handle your data, please contact us at{' '}
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