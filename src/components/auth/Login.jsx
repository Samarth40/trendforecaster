import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, fetchSignInMethodsForEmail, linkWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      toast.success('Successfully logged in!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      
      // Provide user-friendly error messages based on Firebase error codes
      switch (error.code) {
        case 'auth/invalid-credential':
          setError(
            'The email or password is incorrect. Please try again or click "Forgot password?" to reset your password.'
          );
          break;
        case 'auth/user-not-found':
          setError(
            'No account found with this email. Please check your email or sign up for a new account.'
          );
          break;
        case 'auth/wrong-password':
          setError(
            'Incorrect password. Please try again or use the "Forgot password?" option.'
          );
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled. Please contact support.');
          break;
        case 'auth/too-many-requests':
          setError(
            'Too many failed login attempts. Please try again later or reset your password.'
          );
          break;
        case 'auth/network-request-failed':
          setError(
            'Network error. Please check your internet connection and try again.'
          );
          break;
        default:
          setError(
            'Unable to sign in at this time. Please try again later.'
          );
      }

      // Clear password field on error
      setFormData(prev => ({
        ...prev,
        password: ''
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();

    try {
      // First try to sign in with Google
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const credential = GoogleAuthProvider.credentialFromResult(result);

      // Check if user exists in Firestore
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create new user document if first time
        await setDoc(userRef, {
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          profileImage: user.photoURL,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }

      toast.success('Successfully logged in with Google!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      
      // Check if the error is because email already exists
      if (error.code === 'auth/account-exists-with-different-credential') {
        try {
          // Get sign-in methods for this email
          const email = error.customData.email;
          const methods = await fetchSignInMethodsForEmail(auth, email);
          
          if (methods.includes('password')) {
            setError('An account already exists with this email. Please use your email/password to sign in first, then link your Google account from settings.');
          } else {
            setError('An account already exists with this email using a different sign-in method.');
          }
        } catch (innerError) {
          console.error('Error checking existing account:', innerError);
          setError('Failed to sign in with Google. Please try again.');
        }
      } else {
        setError('Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast.success('Password reset email sent! Please check your inbox.');
      setShowResetModal(false);
      setError('');
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Failed to send reset email');
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
            Welcome Back
          </h2>
          <p className="mt-2 text-gray-400 text-sm">
            Sign in to continue to TrendForecaster
          </p>
        </div>

        <div className="glass-effect rounded-lg p-6 backdrop-blur-lg bg-gray-800/40">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500 text-red-500 text-sm">
                {error}
              </div>
            )}

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

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Forgot password?
              </button>
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
              ) : 'Sign In'}
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
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-10 rounded-md text-gray-300 bg-gray-700/50 hover:bg-gray-700/70 transition-colors border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm font-medium"
            >
              <img src="/google.svg" alt="Google" className="w-5 h-5 mr-2" />
              Sign in with Google
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium">
                Sign up
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

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-effect rounded-lg p-6 backdrop-blur-lg bg-gray-800/90 max-w-md w-full border border-gray-700"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Reset Password</h3>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="block w-full h-10 rounded-md bg-gray-700/50 border-gray-600 text-gray-300 text-sm focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-cyan-500 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Login; 