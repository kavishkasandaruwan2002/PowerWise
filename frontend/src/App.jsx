import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Analytics from './pages/Analytics';
import Appliances from './pages/Appliances';
import Landing from './pages/Landing';
import { cn } from './components/ui';
import { ArrowUp } from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  return user ? children : <Navigate to="/" />;
};

const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-700 to-blue-500 origin-left z-[110] shadow-[0_0_15px_rgba(59,130,246,0.5)]"
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
          className="fixed bottom-10 right-10 z-[110] p-4 bg-blue-600 text-white rounded-2xl shadow-[0_20px_50px_-10px_rgba(59,130,246,0.5)] border border-blue-400/20 backdrop-blur-xl group transition-all"
          aria-label="Scroll to top"
        >
          <ArrowUp size={24} className="group-hover:animate-bounce" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

import Sidebar from './components/layout/Sidebar';

const AuthWrapper = ({ children }) => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isAuthPage = ['/login', '/register'].includes(pathname);
  const isLandingPage = pathname === '/';

  if (isAuthPage) {
    return <div className="w-full h-full animate-in fade-in duration-500">{children}</div>;
  }

  if (user && !isLandingPage) {
    return (
      <div className="flex min-h-screen bg-[#0b0e14]">
        <Sidebar className="hidden lg:block shrink-0" />
        <main className="flex-1 lg:ml-72 w-full p-0 min-h-screen relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.05),transparent_50%)] pointer-events-none" />
          {children}
        </main>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="w-full pt-20">
        {children}
      </div>
    </>
  );
};

import Tips from './pages/Tips';
import Alerts from './pages/Alerts';
import Household from './pages/Household';
import Readings from './pages/Readings';
import Settings from './pages/Settings';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500 selection:text-white overflow-x-hidden">
        <ScrollProgressBar />
        <ScrollToTop />
        <AuthWrapper>
          <div className="w-full h-full">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />

              <Route path="/analytics" element={
                <PrivateRoute>
                  <Analytics />
                </PrivateRoute>
              } />

              <Route path="/appliances" element={
                <PrivateRoute>
                  <Appliances />
                </PrivateRoute>
              } />

              <Route path="/readings" element={
                <PrivateRoute>
                  <Readings />
                </PrivateRoute>
              } />

              <Route path="/tips" element={
                <PrivateRoute>
                  <Tips />
                </PrivateRoute>
              } />

              <Route path="/alerts" element={
                <PrivateRoute>
                  <Alerts />
                </PrivateRoute>
              } />

              <Route path="/households" element={
                <PrivateRoute>
                  <Household />
                </PrivateRoute>
              } />

              <Route path="/settings" element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              } />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </AuthWrapper>
      </div>
    </Router>
  );
}

export default App;
