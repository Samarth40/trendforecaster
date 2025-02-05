import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, userData, loading: isLoading, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items based on auth state and current page
  const navItems = user ? [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Trends', href: '/dashboard/trends' },
    { label: 'News', href: '/dashboard/news' },
    { label: 'AI Chat', href: '/dashboard/chat' }
  ] : [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'FAQ', href: '#faq' }
  ];

  const handleNavigation = (href) => {
    setIsMenuOpen(false);
    if (href.startsWith('#') && location.pathname === '/') {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(href);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/50 backdrop-blur-xl border-b border-white/10' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/"
              className="flex items-center space-x-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] flex items-center justify-center transform transition-all duration-300 group-hover:scale-110">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#60A5FA] to-[#06B6D4] font-display tracking-tight">
                TrendForecaster
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isLoading ? (
              <div className="flex items-center gap-4">
                <div className="w-20 h-8 rounded-md bg-white/10 animate-pulse" />
                <div className="w-20 h-8 rounded-md bg-white/10 animate-pulse" />
              </div>
            ) : navItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className={`text-gray-300 hover:text-white transition-colors font-sans font-medium text-base ${
                  location.pathname === item.href ? 'text-white font-semibold' : ''
                }`}
                onClick={() => handleNavigation(item.href)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoading ? (
              <div className="flex items-center gap-4">
                <div className="w-20 h-8 rounded-md bg-white/10 animate-pulse" />
                <div className="w-20 h-8 rounded-md bg-white/10 animate-pulse" />
              </div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                {userData && (
                  <div className="text-gray-300 font-sans">
                    {userData.firstName}
                  </div>
                )}
                <Button
                  variant="ghost"
                  className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
                  onClick={logout}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white transition-colors font-sans font-medium"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white hover:opacity-90 transition-opacity font-sans font-medium"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={{ height: isMenuOpen ? 'auto' : 0 }}
        className="md:hidden overflow-hidden bg-[#0F1629] border-t border-white/10"
      >
        <div className="px-4 py-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center gap-4">
              <div className="w-20 h-8 rounded-md bg-white/10 animate-pulse" />
              <div className="w-20 h-8 rounded-md bg-white/10 animate-pulse" />
            </div>
          ) : navItems.map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              className={`block w-full text-left px-4 py-2 text-gray-300 hover:text-white transition-colors font-medium ${
                location.pathname === item.href ? 'text-white font-semibold' : ''
              }`}
              onClick={() => handleNavigation(item.href)}
            >
              {item.label}
            </Button>
          ))}
          {isLoading ? (
            <div className="flex items-center gap-4">
              <div className="w-20 h-8 rounded-md bg-white/10 animate-pulse" />
              <div className="w-20 h-8 rounded-md bg-white/10 animate-pulse" />
            </div>
          ) : user ? (
            <>
              {userData && (
                <div className="px-4 py-2 text-gray-300 font-sans">
                  {userData.firstName}
                </div>
              )}
              <Button
                variant="ghost"
                className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white transition-colors"
                onClick={logout}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white transition-colors font-sans font-medium"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button
                className="block w-full text-left px-4 py-2 text-gray-300 hover:text-white transition-colors font-sans font-medium"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar; 