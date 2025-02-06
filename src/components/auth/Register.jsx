import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, fetchSignInMethodsForEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();

    try {
      // First check if a user with this email already exists
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create user document in Firestore if it doesn't exist
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          profileImage: user.photoURL,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        toast.success('Account created successfully with Google!');
      } else {
        toast.success('Successfully signed in with Google!');
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Google registration error:', error);
      
      // Check if the error is because email already exists
      if (error.code === 'auth/account-exists-with-different-credential') {
        try {
          // Get sign-in methods for this email
          const email = error.customData.email;
          const methods = await fetchSignInMethodsForEmail(auth, email);
          
          if (methods.includes('password')) {
            setError('An account already exists with this email. Please use your email/password to sign in.');
          } else {
            setError('An account already exists with this email using a different sign-in method.');
          }
        } catch (innerError) {
          console.error('Error checking existing account:', innerError);
          setError('Failed to sign up with Google. Please try again.');
        }
      } else {
        setError('Failed to sign up with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden">
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

      <div className="max-w-sm w-full mx-4 relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
            Create Account
          </h2>
          <p className="mt-2 text-gray-400 text-sm">
            Start your journey with TrendForecaster
          </p>
        </div>

        <div className="glass-effect rounded-lg p-6 backdrop-blur-lg bg-gray-800/40">
          <form onSubmit={handleEmailRegister} className="space-y-4">
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
                <input
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
                <input
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
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full h-10 rounded-md bg-gray-700/50 border-gray-600 text-gray-300 text-sm focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
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
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="block w-full h-10 rounded-md bg-gray-700/50 border-gray-600 text-gray-300 text-sm focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-2 rounded-md text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-medium"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Create Account'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="w-full h-10 rounded-md text-gray-300 bg-gray-700/50 hover:bg-gray-700/70 transition-colors border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-medium"
            >
              <img src="/google.svg" alt="Google" className="w-5 h-5 mr-2" />
              Sign up with Google
            </button>
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

        {/* Features Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="glass-effect rounded-md p-3 bg-gray-800/40">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-purple-500/10 rounded-md">
                <svg
                  className="w-4 h-4 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <div className="text-xs">
                <p className="font-medium text-gray-300">Trend Analysis</p>
                <p className="text-gray-400">Real-time insights</p>
              </div>
            </div>
          </div>

          <div className="glass-effect rounded-md p-3 bg-gray-800/40">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-cyan-500/10 rounded-md">
                <svg
                  className="w-4 h-4 text-cyan-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <div className="text-xs">
                <p className="font-medium text-gray-300">Content Ideas</p>
                <p className="text-gray-400">AI-powered suggestions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;