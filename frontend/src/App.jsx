import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminRegister from './pages/Admin/AdminRegister';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

import Analytics from './pages/Analytics';
import Appliances from './pages/Appliances';
import Landing from './pages/Landing';
import Tips from './pages/Tips';
import Alerts from './pages/Alerts';
import Household from './pages/Household';
import Readings from './pages/Readings';
import Settings from './pages/Settings';
import { ArrowUp } from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!user) return <Navigate to="/" />;

  // Redirect admins to admin dashboard if they try to access user dashboard
  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-700 to-blue-500 origin-left z-[110]"
      style={{ scaleX }}
    />
  );
};

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 400) setIsVisible(true);
      else setIsVisible(false);
    };
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1, translateY: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-10 right-10 z-[110] p-4 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20"
        >
          <ArrowUp size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const AppContent = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isAuthPage = ['/login', '/register', '/admin/register', '/forgot-password'].includes(pathname) || pathname.startsWith('/reset-password');

  const isLandingPage = pathname === '/';
  const isAdminRoute = pathname.startsWith('/admin');

  // Landing page and operational dashboard logic
  const showSidebar = user && !isLandingPage && !isAuthPage;
  const showNavbar = !showSidebar && !isAuthPage;

  // Determine redirect based on role
  const userDashboard = user?.role === 'admin' ? '/admin/dashboard' : '/dashboard';

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500 selection:text-white overflow-x-hidden">
      <ScrollProgressBar />
      <ScrollToTop />

      {showNavbar && <Navbar key={user ? 'auth' : 'guest'} />}

      <div className={showSidebar ? "flex min-h-screen" : "relative"}>
        {showSidebar && <Sidebar className="shrink-0" />}

        <main className={showSidebar ? "flex-1 lg:ml-72 w-full min-h-screen relative" : "w-full pt-16 lg:pt-20"}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to={userDashboard} />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to={userDashboard} />} />
            <Route path="/admin/register" element={!user ? <AdminRegister /> : <Navigate to={userDashboard} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />


            {/* User Routes */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
            <Route path="/appliances" element={<PrivateRoute><Appliances /></PrivateRoute>} />
            <Route path="/readings" element={<PrivateRoute><Readings /></PrivateRoute>} />
            <Route path="/tips" element={<PrivateRoute><Tips /></PrivateRoute>} />
            <Route path="/alerts" element={<PrivateRoute><Alerts /></PrivateRoute>} />
            <Route path="/households" element={<PrivateRoute><Household /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
