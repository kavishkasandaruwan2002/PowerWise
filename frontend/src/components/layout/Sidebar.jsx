import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Zap, TrendingUp, Lightbulb,
  AlertCircle, Home, LogOut, Settings, Activity,
  ShieldCheck, Users
} from 'lucide-react';
import { cn } from '../ui';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = String(user?.role || '').toLowerCase() === 'admin';

  const userNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Meter Readings', path: '/readings', icon: <Activity size={20} /> },
    { name: 'Appliances', path: '/appliances', icon: <Zap size={20} /> },
    { name: 'Predictions', path: '/analytics', icon: <TrendingUp size={20} /> },
    { name: 'Energy Tips', path: '/tips', icon: <Lightbulb size={20} /> },
    { name: 'Alerts', path: '/alerts', icon: <AlertCircle size={20} /> },
    { name: 'Households', path: '/households', icon: <Home size={20} /> },
  ];

  const adminNavItems = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: <ShieldCheck size={20} /> },
    { name: 'Tip Management', path: '/admin/tips', icon: <Lightbulb size={20} /> },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <div className="w-72 h-screen fixed left-0 top-0 bg-[#0b0e14] border-r border-slate-800/40 flex flex-col z-[100] transition-all duration-500">
      {/* Sidebar Logo */}
      <div 
        className="p-10 flex items-center space-x-3 group cursor-pointer" 
        onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/') }
      >
        <div className="bg-blue-600 p-2.5 rounded-2xl group-hover:rotate-[-5deg] transition-all duration-300 shadow-xl shadow-blue-500/10">
          <Zap className="text-white fill-white" size={24} />
        </div>
        <span className="text-2xl font-black text-white tracking-tighter group-hover:text-blue-400 transition-colors">
          Power<span className="text-blue-500">Wise</span>
        </span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-6 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              'flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-sm tracking-tight relative group',
              isActive
                ? 'text-white bg-[#161b2a] shadow-inner'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-3 bottom-3 w-1.5 bg-blue-500 rounded-r-full"
                  />
                )}
                <div className={cn('transition-colors', isActive ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-300')}>
                  {item.icon}
                </div>
                <span>{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-8 border-t border-slate-800/30 space-y-4">
        {isAdmin && (
          <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck size={16} className="text-purple-500" />
              <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest">Admin Mode</span>
            </div>
            <p className="text-[9px] text-slate-500 font-bold">{user?.email}</p>
          </div>
        )}
        <button
          onClick={() => navigate('/settings')}
          className="flex items-center space-x-4 px-6 py-3 rounded-xl text-slate-500 hover:text-white transition-all w-full text-sm font-bold"
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-4 px-6 py-4 rounded-2xl text-slate-500 hover:text-red-400 transition-all w-full group"
        >
          <div className="flex items-center space-x-4 group-hover:translate-x-1 transition-transform">
            <LogOut size={20} className="group-hover:rotate-[-10deg] transition-transform" />
            <span className="text-sm font-black uppercase tracking-widest">Sign Out</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
