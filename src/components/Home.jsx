import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { user, loading } = useAuth();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !loading) {
      setError('Please sign in to access all features');
    } else {
      setError(null);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome to TrendForecaster</h1>
          <p className="text-gray-600 mb-6">
            Sign in to access powerful trend analysis and content generation features.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {/* Rest of your existing home content */}
    </div>
  );
} 