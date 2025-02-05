import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LoadingProvider } from './contexts/LoadingContext';
import AppRoutes from './routes';
import './index.css';
import './config/firebase'; // Import to ensure Firebase is initialized
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollToTop from './components/common/ScrollToTop';

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
        <ScrollToTop />
        <LoadingProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </LoadingProvider>
      </Router>
    </>
  );
}

export default App;
