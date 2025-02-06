import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Briefcase, MapPin, Link as LinkIcon, Twitter, Linkedin, Github, Mail, X } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { motion, AnimatePresence } from 'framer-motion';

const PublicProfile = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          setError('Profile not found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1629]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F1629]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-2">{error}</h1>
            <p className="text-gray-400">The profile you're looking for doesn't exist or is not accessible.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1629]">
      <Navbar />
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="relative">
            {/* Background Banner */}
            <div className="h-48 rounded-xl bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            </div>

            {/* Profile Image and Basic Info */}
            <div className="relative -mt-24 px-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="relative">
                  <div 
                    className="w-40 h-40 rounded-full border-4 border-black overflow-hidden bg-black cursor-pointer transition-transform hover:scale-105"
                    onClick={() => setIsImageModalOpen(true)}
                  >
                    <img
                      src={userData?.profileImage || '/default-avatar.png'}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      {userData?.firstName} {userData?.lastName}
                    </h1>
                    {userData?.position && userData?.company && (
                      <p className="text-gray-400 flex items-center justify-center sm:justify-start gap-2 mt-1">
                        <Briefcase className="w-4 h-4" />
                        {userData.position} at {userData.company}
                      </p>
                    )}
                    {userData?.location && (
                      <p className="text-gray-400 flex items-center justify-center sm:justify-start gap-2 mt-1">
                        <MapPin className="w-4 h-4" />
                        {userData.location}
                      </p>
                    )}
                  </div>

                  {/* Social Links */}
                  <div className="flex items-center justify-center sm:justify-start gap-4 mt-4">
                    {userData?.email && (
                      <a
                        href={`mailto:${userData.email}`}
                        className="text-gray-400 hover:text-purple-400 transition-colors"
                      >
                        <Mail className="w-5 h-5" />
                      </a>
                    )}
                    {userData?.website && (
                      <a
                        href={userData.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-purple-400 transition-colors"
                      >
                        <LinkIcon className="w-5 h-5" />
                      </a>
                    )}
                    {userData?.twitter && (
                      <a
                        href={userData.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-purple-400 transition-colors"
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                    {userData?.linkedin && (
                      <a
                        href={userData.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-purple-400 transition-colors"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {userData?.github && (
                      <a
                        href={userData.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-purple-400 transition-colors"
                      >
                        <Github className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="space-y-8">
            {/* Bio Section */}
            {userData?.bio && (
              <Card className="p-6 bg-black/50 backdrop-blur-sm border-gray-800">
                <p className="text-gray-300 whitespace-pre-wrap">{userData.bio}</p>
              </Card>
            )}

            {/* Interests & Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userData?.interests?.length > 0 && (
                <Card className="p-6 bg-black/50 backdrop-blur-sm border-gray-800">
                  <h2 className="text-xl font-semibold text-white mb-4">Interests</h2>
                  <div className="flex flex-wrap gap-2">
                    {userData.interests.map((interest, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-purple-500/20 text-purple-300"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {userData?.skills?.length > 0 && (
                <Card className="p-6 bg-black/50 backdrop-blur-sm border-gray-800">
                  <h2 className="text-xl font-semibold text-white mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {userData.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-cyan-500/20 text-cyan-300"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {/* Image Modal */}
      <AnimatePresence>
        {isImageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsImageModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full max-h-[80vh] rounded-lg overflow-hidden bg-black/50 backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/50 rounded-full p-2 backdrop-blur-sm transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="w-full h-full flex items-center justify-center p-4">
                <img
                  src={userData?.profileImage || '/default-avatar.png'}
                  alt="Profile"
                  className="max-w-full max-h-[70vh] rounded-lg object-contain"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublicProfile; 