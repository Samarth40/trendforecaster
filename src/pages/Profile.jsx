import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { toast } from 'react-toastify';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Camera, Briefcase, MapPin, Link as LinkIcon, Twitter, Linkedin, Github, Mail, Edit2, Share2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from '../components/ui/select';

// Cloudinary configuration
const CLOUDINARY_UPLOAD_PRESET = 'trendforecaster_profile';
const CLOUDINARY_CLOUD_NAME = 'dherd7qxm';

// Predefined lists
const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
  'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad',
  'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
  'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli', 'Vasai-Virar',
  'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai',
  'Allahabad', 'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior',
  'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Chandigarh'
].sort();

const PREDEFINED_SKILLS = {
  'Programming Languages': [
    'JavaScript', 'Python', 'Java', 'C++', 'Ruby', 'PHP', 'Swift', 'Go', 'Rust',
    'TypeScript', 'Kotlin', 'C#', 'Scala', 'R', 'MATLAB'
  ],
  'Web Development': [
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask',
    'Ruby on Rails', 'HTML5', 'CSS3', 'SASS/SCSS', 'Tailwind CSS', 'Bootstrap',
    'WordPress', 'GraphQL', 'REST APIs'
  ],
  'Mobile Development': [
    'React Native', 'Flutter', 'iOS Development', 'Android Development',
    'Xamarin', 'Ionic', 'SwiftUI', 'Kotlin Multiplatform'
  ],
  'Cloud & DevOps': [
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins',
    'CI/CD', 'Terraform', 'Linux', 'Git', 'GitHub Actions'
  ],
  'Data Science & AI': [
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP',
    'Computer Vision', 'Data Analysis', 'Data Visualization', 'SQL',
    'Big Data', 'Hadoop', 'Spark'
  ],
  'Design': [
    'UI Design', 'UX Design', 'Figma', 'Adobe XD', 'Photoshop',
    'Illustrator', 'Sketch', 'InVision', 'Prototyping'
  ],
  'Soft Skills': [
    'Project Management', 'Team Leadership', 'Communication',
    'Problem Solving', 'Agile Methodology', 'Scrum', 'Time Management'
  ]
};

const Profile = () => {
  const { user, userData, setUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedSkillCategory, setSelectedSkillCategory] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    company: '',
    position: '',
    website: '',
    twitter: '',
    linkedin: '',
    github: '',
    interests: [],
    skills: [],
    newInterest: '',
    newSkill: '',
    profileImage: null
  });

  useEffect(() => {
    if (userData) {
      setFormData(prev => ({
        ...prev,
        ...userData,
        interests: userData.interests || [],
        skills: userData.skills || []
      }));
    }
  }, [userData]);

  // Generate shareable URL
  useEffect(() => {
    if (user) {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}/profile/${user.uid}`);
    }
  }, [user]);

  // Handle share button click
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Profile URL copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddInterest = () => {
    if (formData.newInterest.trim() && !formData.interests.includes(formData.newInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, prev.newInterest.trim()],
        newInterest: ''
      }));
    }
  };

  const handleAddSkill = () => {
    if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: ''
      }));
    }
  };

  const handleRemoveInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        throw new Error('No authenticated user found');
      }

      let profileImageUrl = userData?.profileImage || null;

      // Upload profile image if changed
      if (formData.profileImage && formData.profileImage instanceof File) {
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('file', formData.profileImage);
          uploadFormData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
          uploadFormData.append('folder', 'profile-images');

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: 'POST',
              body: uploadFormData,
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to upload image');
          }

          const data = await response.json();
          profileImageUrl = data.secure_url;
        } catch (error) {
          console.error('Error uploading profile image:', error);
          toast.error('Failed to upload profile image: ' + error.message);
          throw error;
        }
      }

      // Prepare user data for update
      const updatedData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        location: formData.location,
        company: formData.company,
        position: formData.position,
        website: formData.website,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
        github: formData.github,
        interests: formData.interests,
        skills: formData.skills,
        profileImage: profileImageUrl,
        updatedAt: new Date().toISOString()
      };

      // Update user data in Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updatedData);

      // Update local state
      setUserData(updatedData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Modify the location input in the form to use Select
  const locationInput = (
    <div className="md:col-span-2">
      <label className="block text-sm font-medium text-gray-400 mb-1">
        Location
      </label>
      <div className="relative">
        <Select
          value={formData.location}
          onValueChange={(value) => {
            if (value === 'other') {
              const customCity = prompt('Enter your city name:');
              if (customCity?.trim()) {
                setFormData(prev => ({ ...prev, location: customCity.trim() }));
              }
            } else {
              setFormData(prev => ({ ...prev, location: value }));
            }
          }}
        >
          <SelectTrigger className="bg-black/50 text-gray-200 border-gray-700 hover:bg-black/70">
            <SelectValue placeholder="Select your city" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1F32] border border-gray-700 text-gray-200 max-h-[300px] overflow-y-auto z-50">
            <SelectGroup>
              <SelectLabel>Popular Cities</SelectLabel>
              {INDIAN_CITIES.slice(0, 6).map((city) => (
                <SelectItem 
                  key={city} 
                  value={city}
                  className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer"
                >
                  {city}
                </SelectItem>
              ))}
              <SelectSeparator />
              <SelectLabel>All Cities</SelectLabel>
              {INDIAN_CITIES.slice(6).map((city) => (
                <SelectItem 
                  key={city} 
                  value={city}
                  className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer"
                >
                  {city}
                </SelectItem>
              ))}
              <SelectSeparator />
              <SelectItem 
                value="other"
                className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer text-cyan-400"
              >
                + Add Other City
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Add skill selection UI
  const skillSelection = (
    <div className="mt-6">
      <label className="block text-sm font-medium text-gray-400 mb-1">
        Skills
      </label>
      <div className="space-y-4">
        <Select
          value={selectedSkillCategory}
          onValueChange={setSelectedSkillCategory}
        >
          <SelectTrigger className="bg-black/50 text-gray-200 border-gray-700 hover:bg-black/70">
            <SelectValue placeholder="Select skill category" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1F32] border border-gray-700 text-gray-200 max-h-[300px] overflow-y-auto z-50">
            {Object.keys(PREDEFINED_SKILLS).map((category) => (
              <SelectItem 
                key={category} 
                value={category}
                className="hover:bg-gray-800 focus:bg-gray-800 cursor-pointer"
              >
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedSkillCategory && (
          <div className="flex flex-wrap gap-2 mt-4">
            {PREDEFINED_SKILLS[selectedSkillCategory].map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className={`cursor-pointer ${
                  formData.skills.includes(skill)
                    ? 'bg-cyan-500/40 text-cyan-200'
                    : 'bg-black/50 text-gray-400 hover:bg-cyan-500/20 hover:text-cyan-300'
                }`}
                onClick={() => {
                  if (formData.skills.includes(skill)) {
                    handleRemoveSkill(skill);
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      skills: [...prev.skills, skill]
                    }));
                  }
                }}
              >
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Add share button in the profile header
  const shareButton = !isEditing && (
    <Button
      onClick={handleShare}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Share2 className="w-4 h-4" />
      Share Profile
    </Button>
  );

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
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
              <div className="relative group">
                <div className="w-40 h-40 rounded-full border-4 border-black overflow-hidden bg-black">
                  <img
                    src={previewImage || userData?.profileImage || '/default-avatar.png'}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      {userData?.firstName} {userData?.lastName}
                    </h1>
                    {userData?.position && userData?.company && (
                      <p className="text-gray-400 flex items-center gap-2 mt-1">
                        <Briefcase className="w-4 h-4" />
                        {userData.position} at {userData.company}
                      </p>
                    )}
                    {userData?.location && (
                      <p className="text-gray-400 flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4" />
                        {userData.location}
                      </p>
                    )}
                  </div>
                  {!isEditing ? (
                    <div className="hidden sm:flex items-center gap-2">
                      {shareButton}
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-gradient-to-r from-purple-500 to-cyan-500"
                      >
                        Edit Profile
                      </Button>
                    </div>
                  ) : (
                    <div className="hidden sm:flex items-center gap-2">
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-gradient-to-r from-purple-500 to-cyan-500"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {!isEditing && (
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
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-8">
            <Card className="p-6 bg-black/50 backdrop-blur-sm border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    First Name
                  </label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="bg-black/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Last Name
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="bg-black/50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Bio
                  </label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    className="bg-black/50"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Company
                  </label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    className="bg-black/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Position
                  </label>
                  <Input
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    className="bg-black/50"
                  />
                </div>
                {locationInput}
              </div>
            </Card>

            <Card className="p-6 bg-black/50 backdrop-blur-sm border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4">Social Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Website
                  </label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="bg-black/50"
                    placeholder="https://"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Twitter
                  </label>
                  <Input
                    value={formData.twitter}
                    onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
                    className="bg-black/50"
                    placeholder="https://twitter.com/"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    LinkedIn
                  </label>
                  <Input
                    value={formData.linkedin}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                    className="bg-black/50"
                    placeholder="https://linkedin.com/in/"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    GitHub
                  </label>
                  <Input
                    value={formData.github}
                    onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                    className="bg-black/50"
                    placeholder="https://github.com/"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-black/50 backdrop-blur-sm border-gray-800">
              <h2 className="text-xl font-semibold text-white mb-4">Interests & Skills</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Interests
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.interests.map((interest, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => handleRemoveInterest(interest)}
                          className="ml-2 hover:text-red-400"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={formData.newInterest}
                      onChange={(e) => setFormData(prev => ({ ...prev, newInterest: e.target.value }))}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                      className="bg-black/50"
                      placeholder="Add an interest"
                    />
                    <Button
                      type="button"
                      onClick={handleAddInterest}
                      variant="outline"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {skillSelection}
              </div>
            </Card>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                onClick={() => setIsEditing(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-purple-500 to-cyan-500"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        ) : (
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

            {/* Mobile Edit Button */}
            <div className="sm:hidden">
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full"
                variant="outline"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 