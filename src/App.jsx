import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';
import './index.css';
import './config/firebase'; // Import to ensure Firebase is initialized
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-900 text-gray-100">
            <AppRoutes />
          </div>
        </AuthProvider>
      </Router>
    </>
  );
}

export default App;
