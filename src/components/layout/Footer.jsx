import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github, Twitter, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const footerLinks = {
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Contact Us', href: '/contact' }
    ],
    social: [
      { name: 'GitHub', href: 'https://github.com', icon: Github },
      { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
      { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
    ],
  };

  return (
    <footer className="bg-[#0F1629] relative">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-purple-500/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-20" />

      <div className="relative border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 px-6 py-12">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] p-0.5">
                  <div className="w-full h-full rounded-[10px] bg-[#0F1629] flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#60A5FA] to-[#06B6D4]">
                  TrendForecaster
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering creators and businesses with AI-driven insights for better content and market analysis.
              </p>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-gray-200 font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors inline-flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-blue-500 mr-0 group-hover:mr-2 transition-all duration-300" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-gray-200 font-semibold mb-4">Contact</h3>
              <ul className="space-y-3">
                <li>
                  <a href="mailto:samarthshinde9023@gmail.com" className="text-gray-400 hover:text-white transition-colors inline-flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    samarthshinde9023@gmail.com
                  </a>
                </li>
                <li>
                  <span className="text-gray-400 inline-flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    +91 92658 85486
                  </span>
                </li>
                <li>
                  <span className="text-gray-400 inline-flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Pune, Maharashtra
                  </span>
                </li>
              </ul>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-gray-200 font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                {footerLinks.social.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
                  >
                    <link.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="border-t border-gray-800 px-6 py-4"
          >
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} TrendForecaster. All rights reserved.
              </p>
              <div className="flex items-center space-x-2 mt-4 md:mt-0">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-gray-400 text-sm">All systems operational</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
} 