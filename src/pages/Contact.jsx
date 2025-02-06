import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Mail, MessageSquare, User } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';
import Footer from '../components/layout/Footer';

export default function Contact() {
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await emailjs.sendForm(
        'service_euci9c6',
        'template_9py9fpm',
        formRef.current,
        'qADHIQp58ZDAzLBGq'
      );

      setSubmitted(true);
      toast.success('Message sent successfully!');
      // Reset form
      formRef.current.reset();

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#0F1629] py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-transparent bg-clip-text">
              Get in Touch
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Have questions or feedback? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#1A1F32]/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-800"
            >
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-400 mb-2 text-sm">Your Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                      type="text"
                      name="user_name"
                      required
                      className="w-full bg-[#0F1629]/50 border border-gray-800 rounded-xl py-3 px-5 pl-12 text-gray-300 focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-2 text-sm">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                      type="email"
                      name="user_email"
                      required
                      className="w-full bg-[#0F1629]/50 border border-gray-800 rounded-xl py-3 px-5 pl-12 text-gray-300 focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 mb-2 text-sm">Message</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                    <textarea
                      name="message"
                      required
                      rows="5"
                      className="w-full bg-[#0F1629]/50 border border-gray-800 rounded-xl py-3 px-5 pl-12 text-gray-300 focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="Your message here..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-xl text-white font-medium flex items-center justify-center space-x-2 transition-all duration-300 ${
                    loading
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:shadow-lg hover:shadow-indigo-500/25'
                  }`}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>

                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-400 text-center mt-4"
                  >
                    Thank you! Your message has been sent successfully.
                  </motion.div>
                )}
              </form>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-8"
            >
              {/* Contact Cards */}
              <div className="grid gap-6">
                <div className="bg-[#1A1F32]/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-200 mb-2">Email Us</h3>
                  <p className="text-gray-400">
                    For general inquiries:{' '}
                    <a href="mailto:samarthshinde9023@gmail.com" className="text-indigo-400 hover:text-indigo-300">
                      samarthshinde9023@gmail.com
                    </a>
                  </p>
                  <p className="text-gray-400">
                    For support:{' '}
                    <a href="mailto:samarthshinde9023@gmail.com" className="text-indigo-400 hover:text-indigo-300">
                      samarthshinde9023@gmail.com
                    </a>
                  </p>
                </div>

                {/* FAQ Section */}
                <div className="bg-[#1A1F32]/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                  <h3 className="text-xl font-semibold text-gray-200 mb-4">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-gray-300 font-medium mb-2">What is the typical response time?</h4>
                      <p className="text-gray-400">We usually respond within 24-48 hours during business days.</p>
                    </div>
                    <div>
                      <h4 className="text-gray-300 font-medium mb-2">Do you offer technical support?</h4>
                      <p className="text-gray-400">Yes, our technical team is available 24/7 to assist you.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
} 