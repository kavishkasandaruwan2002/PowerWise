import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, Zap, BarChart3, LogOut, User, 
  Settings, Bell, Search, Menu, X, ArrowRight
} from 'lucide-react';
import { Button, cn } from '../ui';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHomePage = location.pathname === '/';

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Telemetry', path: '/analytics', icon: <BarChart3 size={18} /> },
    { name: 'Grid Nodes', path: '/appliances', icon: <Zap size={18} /> },
  ];

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-6 lg:px-12",
        isScrolled ? "py-4" : "py-8"
      )}
    >
      <div 
        className={cn(
          "max-w-[1600px] mx-auto rounded-[2.5rem] px-8 py-4 flex items-center justify-between transition-all duration-700 border shadow-2xl relative overflow-hidden",
          isScrolled 
            ? "bg-[#161b2a]/80 backdrop-blur-2xl border-blue-500/10 shadow-blue-900/10" 
            : "bg-[#0b0e14]/40 backdrop-blur-md border-white/5 shadow-none"
        )}
      >
        {/* Animated Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-blue-600/5 to-transparent pointer-events-none" />

        {/* Logo Section */}
        <Link to="/" className="flex items-center space-x-4 group relative z-10 transition-transform active:scale-95">
          <div className="relative">
            <div className="bg-blue-600 p-3 rounded-2xl group-hover:rotate-[-12deg] transition-all duration-500 shadow-xl shadow-blue-600/30 group-hover:scale-110 flex items-center justify-center">
              <Zap className="text-white fill-white" size={24} />
            </div>
            <div className="absolute -inset-1 bg-blue-500 opacity-0 group-hover:opacity-20 blur-xl rounded-full transition-opacity" />
          </div>
          <div className="flex flex-col -space-y-1.5">
            <span className="text-2xl font-black text-white tracking-tighter uppercase italic transition-all group-hover:translate-x-1">
              Power<span className="text-blue-600">Wise</span>
            </span>
            <span className="text-[9px] font-black tracking-[0.4em] text-slate-500 uppercase ml-0.5 italic">Energy Intelligence</span>
          </div>
        </Link>

        {user ? (
          <>
            {/* Authenticated Desktop Nav - Hidden on Home Page */}
            {!isHomePage && (
              <div className="hidden lg:flex items-center bg-[#0b0e14]/50 rounded-[1.5rem] p-1.5 border border-slate-800/50 shadow-inner">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => cn(
                      "flex items-center space-x-3 px-8 py-3 rounded-xl transition-all duration-500 font-black text-[10px] uppercase tracking-[0.2em] relative overflow-hidden italic",
                      isActive 
                        ? "text-blue-500 bg-blue-500/5" 
                        : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                    )}
                  >
                    <span className={cn(
                      "transition-colors",
                      location.pathname === item.path ? "text-blue-500" : "text-slate-600"
                    )}>{item.icon}</span>
                    <span>{item.name}</span>
                    {location.pathname === item.path && (
                      <motion.div 
                        layoutId="active-nav"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 shadow-[0_0_8px_#3b82f6]"
                      />
                    )}
                  </NavLink>
                ))}
              </div>
            )}

            {/* Desktop User Actions */}
            <div className="hidden lg:flex items-center space-x-6">
              {isHomePage ? (
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="h-14 px-10 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/20 border-none flex items-center gap-4 transition-all"
                >
                  Launch Dashboard <ArrowRight size={16} />
                </Button>
              ) : (
                <>
                  <div className="flex items-center space-x-4 pr-6 border-r border-slate-800">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-white uppercase italic tracking-tighter">{user.name || 'Admin Node'}</span>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Operator v02</span>
                    </div>
                    <div className="avatar w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black text-sm shadow-xl relative group cursor-pointer transition-transform hover:scale-105 active:scale-95">
                      {user.name?.[0] || 'A'}
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#161b2a] shadow-[0_0_5px_#3b82f6] animate-pulse" />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                      <Button variant="ghost" className="h-12 w-12 p-0 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-blue-500 hover:border-blue-500/30 transition-all">
                        <Bell size={20} />
                      </Button>
                      <Button 
                        onClick={handleLogout} 
                        className="h-12 px-6 bg-[#0b0e14] border border-red-900/20 text-red-500 hover:bg-red-500/10 font-black text-[10px] rounded-2xl uppercase tracking-widest flex items-center gap-3 transition-all"
                      >
                        <LogOut size={16} />
                        <span>Disconnect</span>
                      </Button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-8">
            <Link to="/login" className="text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all italic pr-2">
                Sign In
            </Link>
            <Button 
                onClick={() => navigate('/register')} 
                className="h-14 px-10 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/20 border-none relative overflow-hidden group transition-all"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <span className="relative flex items-center gap-4">
                    Sign Up <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" />
                </span>
            </Button>
          </div>
        )}

        {/* Mobile Controller Button */}
        <button 
          className="lg:hidden relative z-[101] p-4 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-500 active:scale-95 transition-all"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile OS Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(40px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            className="fixed inset-0 z-[100] bg-[#0b0e14]/90 lg:hidden flex flex-col p-12 pt-40"
          >
            <div className="flex flex-col space-y-12">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => cn(
                      "text-6xl font-black transition-all flex items-center space-x-6 italic uppercase tracking-tighter",
                      isActive ? "text-blue-500" : "text-slate-800 hover:text-white"
                    )}
                  >
                    <span className="text-xl opacity-20 font-black tracking-widest h-1 w-12 bg-current" />
                    <span>{item.name}</span>
                  </NavLink>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto space-y-8">
               <motion.div 
                 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                 className="pt-12 border-t border-slate-900 flex flex-col gap-6"
               >
                  <button onClick={handleLogout} className="flex items-center text-red-500 font-black text-2xl gap-6 uppercase italic tracking-tighter">
                     <LogOut size={32} />
                     <span>Terminate Uplink</span>
                  </button>
               </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
