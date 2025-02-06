import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../config/firebase';
import { 
  signOut, 
  setPersistence, 
  browserSessionPersistence, 
  onAuthStateChanged,
  signInAnonymously 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { dashboardService } from '../services/dashboardService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, loading] = useAuthState(auth);
  const [authChecked, setAuthChecked] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

  // Set initial persistence to session only
  useEffect(() => {
    setPersistence(auth, browserSessionPersistence)
      .catch(error => {
        console.error('Error setting auth persistence:', error);
        setAuthError(error.message);
      });
  }, []);

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', user ? 'User present' : 'No user');
      
      if (!loading) {
        setAuthChecked(true);
        if (!user) {
          setUserData(null);
          setUserLoading(false);
          console.log('👤 No authenticated user');
        } else {
          console.log('👤 User authenticated:', user.uid);
        }
      }
    });

    return () => unsubscribe();
  }, [loading]);

  // Fetch user data from Firestore when auth state changes
  useEffect(() => {
    let unsubscribed = false;

    const fetchUserData = async () => {
      if (user && !unsubscribed) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (!unsubscribed) {
            if (userSnap.exists()) {
              setUserData(userSnap.data());
              console.log('📊 User data fetched successfully');
            } else {
              console.log('📊 No user data found in Firestore');
            }
            setUserLoading(false);
          }
        } catch (error) {
          console.error('❌ Error fetching user data:', error);
          setAuthError(error.message);
          if (!unsubscribed) {
            setUserLoading(false);
          }
        }
      }
    };

    if (user) {
      fetchUserData();
    }

    return () => {
      unsubscribed = true;
    };
  }, [user]);

  const logout = async () => {
    const logPrefix = '🚪 [Logout]';
    console.group(`${logPrefix} Starting logout process...`);
    
    try {
      if (!user) {
        console.log(`${logPrefix} No user to log out`);
        console.groupEnd();
        return;
      }

      // Store user ID and email for logging
      const userId = user.uid;
      const userEmail = user.email || 'anonymous';
      console.log(`${logPrefix} Processing logout for user: ${userEmail} (${userId})`);

      // Step 1: Clear all subscriptions and listeners
      console.group(`${logPrefix} Step 1: Cleaning up subscriptions`);
      try {
        console.log(`${logPrefix} Unsubscribing from stats...`);
        dashboardService.unsubscribeFromStats(userId);
        
        console.log(`${logPrefix} Running full cleanup...`);
        await dashboardService.cleanup().catch(error => {
          console.warn(`${logPrefix} Non-critical cleanup error:`, error.message);
        });
        console.log(`${logPrefix} Cleanup completed`);
      } catch (cleanupError) {
        console.warn(`${logPrefix} Cleanup warning:`, cleanupError.message);
      }
      console.groupEnd();

      // Step 2: Clear all browser storage
      console.group(`${logPrefix} Step 2: Clearing browser storage`);
      try {
        // Clear all Firebase and app-related storage
        const dbsToDelete = [
          'firebaseLocalStorageDb',
          'firebase-messaging-database',
          'firebaseAuth',
          'firestore',
          'indexeddb.sqlite'
        ];
        
        // Delete all related IndexedDB databases
        dbsToDelete.forEach(dbName => {
          try {
            indexedDB.deleteDatabase(dbName);
            console.log(`${logPrefix} Deleted IndexedDB: ${dbName}`);
          } catch (e) {
            console.warn(`${logPrefix} Error deleting IndexedDB ${dbName}:`, e);
          }
        });

        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear specific Firebase items
        localStorage.removeItem('firebase:host:trendforecaster-17617.firebaseapp.com');
        localStorage.removeItem('firebase:previous_websocket_failure');
        
        console.log(`${logPrefix} Browser storage cleared`);
      } catch (storageError) {
        console.error(`${logPrefix} Storage cleanup error:`, storageError.message);
      }
      console.groupEnd();

      // Step 3: Sign out from Firebase
      console.group(`${logPrefix} Step 3: Firebase sign out`);
      try {
        // First set persistence to none to prevent auto sign-in
        console.log(`${logPrefix} Setting persistence to none...`);
        await setPersistence(auth, browserSessionPersistence);
        
        // Sign out
        console.log(`${logPrefix} Initiating Firebase sign out...`);
        await signOut(auth);
        
        console.log(`${logPrefix} Firebase sign out successful`);
      } catch (signOutError) {
        console.error(`${logPrefix} Firebase sign out error:`, signOutError.message);
        setAuthError(signOutError.message);
      }
      console.groupEnd();

      // Step 4: Clear application state
      console.group(`${logPrefix} Step 4: Clearing application state`);
      try {
        setUserData(null);
        setUserLoading(false);
        setAuthChecked(false);
        setAuthError(null);
        
        // Navigate to home
        console.log(`${logPrefix} Redirecting to home...`);
        navigate('/', { replace: true });
      } catch (finalError) {
        console.error(`${logPrefix} Final cleanup error:`, finalError.message);
        setAuthError(finalError.message);
      }
      console.groupEnd();

      console.log(`${logPrefix} Logout completed successfully ✅`);
    } catch (error) {
      console.error(`${logPrefix} Critical error during logout:`, error.message);
      setAuthError(error.message);
      
      // Emergency cleanup
      try {
        await auth.signOut();
        setUserData(null);
        setUserLoading(false);
        localStorage.clear();
        sessionStorage.clear();
        navigate('/', { replace: true });
      } catch (emergencyError) {
        console.error(`${logPrefix} Emergency cleanup failed:`, emergencyError.message);
      }
    }
    console.groupEnd();
  };

  const value = {
    user,
    userData,
    setUserData,
    loading: loading || userLoading,
    authChecked,
    authError,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 