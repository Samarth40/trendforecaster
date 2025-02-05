import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../config/firebase';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import AnimatedBackground from '../components/layout/AnimatedBackground';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../components/ui/accordion"

function Landing() {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  // Navigation items based on auth state
  const navItems = user ? [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'News', href: '/dashboard/news' },
    { label: 'Trends', href: '/dashboard/trends' },
    { label: 'Chat', href: '/dashboard/chat' }
  ] : [
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' }
  ];

  const handleNavigation = (href) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(href);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1629] text-white relative overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section - Enhanced with better layout and animations */}
      <section className="relative min-h-screen flex items-center justify-center w-full pt-20 overflow-hidden">
        <AnimatedBackground />
        <div className="absolute inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.8,
                delay: 0.5,
                ease: [0, 0.71, 0.2, 1.01]
              }}
              className="absolute -top-20 left-1/2 transform -translate-x-1/2"
            >
              <div className="w-40 h-40 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 blur-2xl" />
            </motion.div>
            
            <motion.h1 
              className="text-6xl md:text-8xl font-bold mb-8 font-display tracking-tight"
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#60A5FA] via-[#4F46E5] to-[#06B6D4] inline-block transform hover:scale-105 transition-transform duration-300">
                Predict Tomorrow's Trends Today
              </span>
            </motion.h1>
            <motion.p 
              className="text-3xl text-gray-300 mb-6 max-w-3xl mx-auto font-display relative"
            >
              <span className="relative">
                AI-Powered Trend Forecasting for Smarter Business Decisions
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                  <path d="M0 4C50 4 50 4 100 4C150 4 150 4 200 4" stroke="url(#paint0_linear)" strokeWidth="2" strokeDasharray="4 4"/>
                  <defs>
                    <linearGradient id="paint0_linear" x1="0" y1="0" x2="200" y2="0">
                      <stop stopColor="#60A5FA" />
                      <stop offset="0.5" stopColor="#4F46E5" />
                      <stop offset="1" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </motion.p>
            <motion.div 
              className="flex flex-wrap justify-center gap-6 mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button 
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 px-8 py-6 text-lg relative overflow-hidden group"
                onClick={() => navigate('/register')}
              >
                <span className="relative z-10">Start Analyzing Trends</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
              <Button 
                variant="outline"
                className="px-8 py-6 text-lg border-2 relative overflow-hidden group hover:text-white transition-colors duration-300"
                onClick={() => {
                  const element = document.querySelector('#features');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="relative z-10">Explore Features</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem & Solution - Enhanced with creative elements */}
      <section className="min-h-screen w-full flex items-center justify-center relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-cyan-500/5" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
              
              <h2 className="text-4xl md:text-5xl font-bold mb-8 relative">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                  Struggling to Stay Ahead of Market Trends?
              </span>
            </h2>
              <p className="text-xl text-gray-300 mb-8 relative">
                Don't let emerging trends catch you off guard. Our AI-powered platform predicts market movements before they happen, giving you the competitive edge.
              </p>
              <ul className="space-y-6 relative">
                {[
                  'Predict trends 6 months before they go mainstream',
                  'Reduce market research time by 75%',
                  'Make data-driven decisions with 98% accuracy'
                ].map((benefit, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-center text-gray-300 group"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <span className="group-hover:text-white transition-colors duration-300">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="aspect-video rounded-2xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 backdrop-blur-xl border border-white/10 p-2 relative group hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-2xl blur group-hover:blur-xl transition-all duration-500" />
                <div className="relative h-full rounded-xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                    alt="AI-Powered Analytics Dashboard"
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-200">Live Trend Analysis</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Powerful Features Section */}
      <section id="features" className="w-full py-24 relative">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                Powerful Features
              </span>
            </h2>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"></div>
          </div>

          {/* Features Grid with Creative Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative bg-[#1A1F32] rounded-xl p-6 h-full transform transition-transform duration-300 hover:-translate-y-2">
                  {/* Feature Icon */}
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-[#0F1629] rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <div className="h-px flex-grow bg-gradient-to-r from-indigo-500 to-transparent"></div>
                  </div>

                  {/* Feature Content */}
                  <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-indigo-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">
                    {feature.description}
                  </p>

                  {/* Interactive Element */}
                  <div 
                    onClick={() => navigate(feature.link)}
                    className="mt-6 flex items-center text-sm text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer hover:text-indigo-300"
                  >
                    <span className="mr-2">Learn more</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>

                  {/* Decorative Corner */}
                  <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                    <div className="absolute top-0 right-0 w-4 h-4 bg-indigo-500 rounded-bl-xl transform rotate-45 translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Interactive Feature Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-[#1A1F32] rounded-2xl p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: "Real-time Analysis", icon: "⚡" },
                { label: "Smart Predictions", icon: "🎯" },
                { label: "Data Visualization", icon: "📊" }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 rounded-xl bg-[#0F1629] hover:bg-indigo-500/10 transition-colors">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-gray-200">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Section - New Modern Design */}
      <section className="w-full py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-cyan-500/5" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-16">
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                World-Class Security
              </span>
            </motion.h2>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"></div>
            <motion.p 
              className="text-xl text-gray-300 max-w-2xl mx-auto mt-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Your data security is our highest priority. We employ state-of-the-art security measures to ensure your information is protected at all times.
            </motion.p>
          </div>

          {/* Main Security Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Security Stats */}
            <motion.div
              className="col-span-1 md:col-span-2 relative"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-2xl blur-3xl" />
              <Card className="relative h-full bg-black/50 backdrop-blur-xl border border-white/10">
                <CardHeader className="p-6 border-b border-white/10">
                  <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                    Security by the Numbers
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { value: "99.99%", label: "Uptime", icon: "⚡" },
                      { value: "24/7", label: "Monitoring", icon: "👁️" },
                      { value: "<1ms", label: "Response Time", icon: "⚡" },
                      { value: "256-bit", label: "Encryption", icon: "🔒" }
                    ].map((stat, index) => (
                      <div key={index} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Card className="relative bg-black/30 border-white/5 group-hover:border-white/20 transition-all duration-300">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="text-2xl">{stat.icon}</div>
                            <div>
                              <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                                {stat.value}
                              </div>
                              <div className="text-sm text-gray-400">{stat.label}</div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Security Status */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-2xl blur-3xl" />
              <Card className="relative h-full bg-black/50 backdrop-blur-xl border border-white/10">
                <CardHeader className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                      Status
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm text-green-400">All Systems Active</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {[
                      { name: "Data Centers", status: "Operational", icon: "🏢" },
                      { name: "API Services", status: "Active", icon: "🔌" },
                      { name: "Backup Systems", status: "Running", icon: "💾" },
                      { name: "Security Scans", status: "In Progress", icon: "🛡️" }
                    ].map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{service.icon}</span>
                          <span className="text-gray-300">{service.name}</span>
                        </div>
                        <span className="text-sm px-2 py-1 rounded-full bg-green-400/10 text-green-400">
                          {service.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Security Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <Card className="relative bg-black/50 backdrop-blur-xl border border-white/10 group-hover:border-white/20 transition-all duration-300">
                  <CardHeader className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 p-3 mb-4 group-hover:scale-110 transition-all duration-300">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Security Certifications */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-8 px-8 py-4 rounded-2xl bg-black/30 border border-white/10">
              {["ISO 27001", "GDPR", "SOC 2", "HIPAA"].map((cert, index) => (
                <div key={index} className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-300">{cert}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section - Enhanced Modern Design */}
      <section id="faq" className="w-full py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="max-w-4xl mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 animate-gradient-x">
                Frequently Asked Questions
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              Everything you need to know about our trend forecasting platform
            </p>
          </motion.div>

          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Accordion type="single" collapsible>
                  <AccordionItem value={`item-${index}`} className="border-none">
                    <AccordionTrigger className="group relative w-full">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-t-xl opacity-0 group-hover:opacity-100 group-data-[state=open]:opacity-100 transition-all duration-300" />
                      <Card className="w-full bg-black/50 backdrop-blur-xl border-white/10 group-data-[state=open]:border-white/20 transition-all duration-300">
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <svg
                                  className="w-3 h-3 text-cyan-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <h3 className="text-lg font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 transition-all duration-300">
                                {faq.question}
                              </h3>
                  </div>
                            <div className="w-5 h-5 flex items-center justify-center">
                              <svg
                                className="w-3 h-3 text-gray-400 transform transition-transform duration-300 group-data-[state=open]:rotate-180"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                  </div>
                </div>
                        </CardHeader>
                      </Card>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card className="bg-black/30 backdrop-blur-xl border-t-0 rounded-t-none">
                        <CardContent className="p-6">
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-gray-300 leading-relaxed"
                          >
                            {faq.answer}
                          </motion.div>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {faq.tags && faq.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-3 py-1 rounded-full text-sm bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-gray-300 border border-white/10"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            ))}
          </div>

          {/* Quick Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <p className="text-gray-400">
              Still have questions?{" "}
              <Button
                variant="link"
                className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
                onClick={() => navigate('/contact')}
              >
                Contact our support team →
              </Button>
            </p>
          </motion.div>
        </div>
      </section>

      {/* How It Works - Modern Redesign */}
      <section id="how-it-works" className="w-full py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-cyan-500/5" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-16">
            <motion.span 
              className="inline-block text-sm font-medium text-cyan-400 mb-4 px-4 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Step-by-Step Guide
            </motion.span>
            <motion.h2 
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                Your Journey to Trend Mastery
              </span>
            </motion.h2>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full"></div>
            <motion.p 
              className="text-xl text-gray-300 max-w-3xl mx-auto mt-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Follow our proven process to unlock the power of AI-driven trend forecasting and stay ahead of the curve
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="bg-[#1A1F32] border-l-4 border-indigo-500 rounded-r-xl p-8 h-full transition-all duration-300 hover:translate-x-2">
                  {/* Step Number and Title */}
                  <div className="flex items-center mb-6">
                    <span className="text-5xl font-bold text-indigo-500/50 mr-4 font-display">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-xl font-semibold text-white">
                      {step.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-gray-400 mb-6 pl-2 border-l border-gray-700">
                    {step.description}
                  </p>

                  {/* Features List */}
                  <div className="space-y-3 pl-2">
                    {step.features.map((feature, featureIndex) => (
                      <div 
                        key={featureIndex} 
                        className="flex items-center text-gray-300 hover:text-indigo-400 transition-colors group/item"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 group-hover/item:bg-indigo-500 mr-3 transition-colors"></div>
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Progress Line */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/20 to-transparent"></div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA - Updated Style */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-6 p-6 bg-[#1A1F32] rounded-xl border-t border-indigo-500/20">
              <div className="flex items-center gap-4">
                <div className="h-12 w-1 bg-indigo-500/50 rounded-full"></div>
                <div className="text-left">
                  <div className="text-lg font-medium text-white">Ready to start?</div>
                  <div className="text-sm text-gray-400">Setup takes less than 5 minutes</div>
                </div>
              </div>
              <Button 
                className="bg-indigo-500 hover:bg-indigo-600 px-8 py-3 text-white rounded-lg transition-colors"
                onClick={() => navigate('/register')}
              >
                Get Started Now
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

// Features data
const features = [
  {
    title: "AI-Powered News Analysis",
    description: "Stay informed with our comprehensive news aggregation and analysis across multiple categories and sources.",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 20a2 2 0 002-2V8m-2 12a2 2 0 01-2-2v-1" />
      </svg>
    ),
    link: "/dashboard/news"
  },
  {
    title: "Trend Detection",
    description: "Advanced algorithms analyze market data to identify emerging trends and provide actionable insights.",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    link: "/dashboard/trends"
  },
  {
    title: "AI Chat Assistant",
    description: "Get instant insights and analysis with our AI-powered chatbot, trained to help with trend analysis and content ideas.",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    link: "/dashboard/chat"
  }
];

// Steps data
const steps = [
  {
    title: "Browse Latest News",
    description: "Access curated news from multiple sources across different categories.",
    features: [
      "Real-time news updates",
      "Category-based filtering",
      "Detailed article views"
    ]
  },
  {
    title: "Analyze Trends",
    description: "Identify and track emerging trends in your industry.",
    features: [
      "Trend visualization",
      "Historical data analysis",
      "Market insights"
    ]
  },
  {
    title: "Get AI Assistance",
    description: "Leverage our AI chatbot for deeper insights and analysis.",
    features: [
      "Instant responses",
      "Trend predictions",
      "Content suggestions"
    ]
  }
];

const securityFeatures = [
  {
    title: "Data Encryption",
    description: "End-to-end encryption for all trend data",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )
  },
  {
    title: "AI Protection",
    description: "Protected AI models and algorithms",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    title: "Secure Analytics",
    description: "Protected trend analysis data",
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  }
];

const faqs = [
  {
    question: "How accurate are your trend predictions?",
    answer: "Our AI models achieve 98% accuracy in trend prediction, based on analyzing millions of data points across social media, news, and market data sources.",
    tags: ["AI", "Accuracy", "Predictions"]
  },
  {
    question: "How early can you identify trends?",
    answer: "We typically identify trends 3-6 months before they go mainstream, giving you a significant competitive advantage in your market.",
    tags: ["Timeline", "Early Detection"]
  },
  {
    question: "What industries do you cover?",
    answer: "We cover 15+ industries including fashion, technology, consumer goods, entertainment, and more. Each industry has specialized trend detection parameters.",
    tags: ["Industries", "Coverage", "Specialization"]
  },
  {
    question: "Can I customize the trend parameters?",
    answer: "Yes, Pro and Enterprise users can customize trend sensitivity, industry focus, and alert thresholds to match their specific needs.",
    tags: ["Customization", "Features", "Settings"]
  },
  {
    question: "How do you handle data accuracy?",
    answer: "We use multiple data sources and advanced verification algorithms to ensure trend data accuracy. Our system continuously learns and improves prediction accuracy.",
    tags: ["Data Quality", "Verification", "AI Learning"]
  }
];

export default Landing; 