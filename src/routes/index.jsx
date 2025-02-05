import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import Landing from '../pages/Landing';
import Home from '../pages/Home';
import TrendAnalysis from '../pages/TrendAnalysis';
import Settings from '../pages/Settings';
import TrendDetailPage from '../pages/TrendDetailPage';
import AIContentChat from '../pages/AIContentChat';
import SavedIdeas from '../pages/SavedIdeas';
import NewsPage from '../components/news/NewsPage';
import NewsDetail from '../components/news/NewsDetail';
import ArticleView from '../components/news/ArticleView';
import Privacy from '../pages/Privacy';
import Terms from '../pages/Terms';
import Contact from '../pages/Contact';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1629] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
}

function RequireNoAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1629] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4F46E5]"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Route - Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Public Routes with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Auth Routes - Only accessible when not logged in */}
      <Route
        path="/login"
        element={
          <RequireNoAuth>
            <Login />
          </RequireNoAuth>
        }
      />
      <Route
        path="/register"
        element={
          <RequireNoAuth>
            <Register />
          </RequireNoAuth>
        }
      />

      {/* Protected Routes - Only accessible when logged in */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Home />} />
        <Route path="trends" element={<TrendAnalysis />} />
        <Route path="trend/:trendName" element={<TrendDetailPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="news/article/:id" element={<ArticleView />} />
        <Route path="chat" element={<AIContentChat />} />
        <Route path="settings" element={<Settings />} />
        <Route path="saved-ideas" element={<SavedIdeas />} />
      </Route>

      {/* Catch all other routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default AppRoutes; 