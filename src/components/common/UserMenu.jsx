import { useState } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userData, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitial = () => {
    if (userData?.firstName) {
      return userData.firstName[0].toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
        <div className="w-20 h-4 bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 flex items-center justify-center text-white font-medium">
          {getInitial()}
        </div>
        <span className="text-gray-300">
          {userData?.firstName || 'Guest'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 glass-effect rounded-lg shadow-xl z-50 border border-gray-800">
          <div className="py-1">
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800"
            >
              Profile Settings
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu; 