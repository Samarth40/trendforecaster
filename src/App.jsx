import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';
import './index.css';
import './config/firebase'; // Import to ensure Firebase is initialized

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-900 text-gray-100">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
