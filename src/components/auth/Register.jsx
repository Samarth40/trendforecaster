import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    city: '',
    country: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('All fields are required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      console.log('Creating user account...');
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      console.log('User account created successfully');

      // Update user profile
      await updateProfile(userCredential.user, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });

      console.log('User profile updated');

      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        city: formData.city,
        country: formData.country,
        email: formData.email,
        createdAt: new Date().toISOString()
      });

      console.log('User data saved to Firestore');

      // Navigate to home page
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/operation-not-allowed':
          setError('Email/password accounts are not enabled. Please contact support.');
          break;
        case 'auth/weak-password':
          setError('Password is too weak. Use at least 6 characters');
          break;
        default:
          setError(`Registration failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden py-6">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Overlay */}
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 opacity-10 transform rotate-45"></div>
        
        {/* Animated Circles */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-purple-500 rounded-full filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-cyan-500 rounded-full filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0">
          {/* Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

          {/* Animated Shapes */}
          <div className="absolute top-1/4 left-1/3 w-12 h-12 border border-purple-500/20 rounded-lg transform rotate-45 animate-float"></div>
          <div className="absolute top-2/3 right-1/4 w-16 h-16 border border-cyan-500/20 rounded-full animate-float animation-delay-1000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-8 h-8 border border-purple-500/20 rounded-lg transform -rotate-12 animate-float animation-delay-2000"></div>
          
          {/* Glowing Dots */}
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-glow"></div>
          <div className="absolute top-2/3 left-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-glow animation-delay-1000"></div>
          <div className="absolute bottom-1/3 right-1/2 w-2 h-2 bg-purple-400 rounded-full animate-glow animation-delay-2000"></div>

          {/* Gradient Lines */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-slide"></div>
            <div className="absolute top-2/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent animate-slide animation-delay-1000"></div>
            <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent animate-slide animation-delay-2000"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md w-full mx-4 relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
            Create Account
          </h2>
          <p className="mt-2 text-gray-400">
            Join TrendForecaster today
          </p>
        </div>

        <div className="glass-effect rounded-lg p-6 backdrop-blur-lg bg-gray-800/40">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500 text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
                  First Name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="block w-full h-10 rounded-md bg-gray-700/50 border-gray-600 text-gray-300 text-sm focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-1">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="block w-full h-10 rounded-md bg-gray-700/50 border-gray-600 text-gray-300 text-sm focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full h-10 rounded-md bg-gray-700/50 border-gray-600 text-gray-300 text-sm focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">
                  City
                </label>
                <Input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  className="block w-full h-10 rounded-md bg-gray-700/50 border-gray-600 text-gray-300 text-sm focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-300 mb-1">
                  Country
                </label>
                <Input
                  id="country"
                  name="country"
                  type="text"
                  value={formData.country}
                  onChange={handleChange}
                  className="block w-full h-10 rounded-md bg-gray-700/50 border-gray-600 text-gray-300 text-sm focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="block w-full h-10 rounded-md bg-gray-700/50 border-gray-600 text-gray-300 text-sm focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="block w-full h-10 rounded-md bg-gray-700/50 border-gray-600 text-gray-300 text-sm focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2 rounded-md text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2" />
                  Creating Account...
                </div>
              ) : 'Create Account'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;