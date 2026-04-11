import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Home, ShieldCheck, TrendingUp,
  Banknote, Zap, Activity, AlertTriangle,
  Search, Filter, ChevronRight, Eye, ToggleLeft,
  UserCheck, UserX, BarChart3, PieChart, Calendar
} from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { cn } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, householdsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=50'),
        api.get('/admin/households?limit=50')
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users || []);
      setHouseholds(householdsRes.data.households || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserActive = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-active`);
      fetchAdminData();
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  const handleChangeUserRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchAdminData();
    } catch (err) {
      console.error('Error changing user role:', err);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const incomeChartData = stats ? [
    { name: 'Low Income', value: stats.incomeBracketBreakdown.low, color: '#10b981' },
    { name: 'Middle Income', value: stats.incomeBracketBreakdown.middle, color: '#3b82f6' },
    { name: 'High Income', value: stats.incomeBracketBreakdown.high, color: '#8b5cf6' },
  ] : [];

  const householdTypeChartData = stats ? stats.householdTypeBreakdown.map((item, idx) => ({
    name: item._id.replace('_', ' '),
    value: item.count,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'][idx % 4]
  })) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e14] p-12 space-y-12 animate-pulse">
        <div className="h-20 w-1/4 bg-slate-900 rounded-2xl" />
        <div className="grid grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-44 bg-slate-900 rounded-3xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] p-8 pb-32">
      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic">
            Admin <span className="text-blue-500">Command</span>
          </h1>
          <p className="text-slate-500 font-bold tracking-tight italic">
            Grid-wide oversight and user management.
          </p>
        </div>
        <Badge className="bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-2xl px-4 py-2 text-[9px] uppercase tracking-widest">
          <ShieldCheck size={14} className="inline mr-2" />
          {user?.email}
        </Badge>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <Card className="bg-[#161b2a] border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl">
              <Users size={28} />
            </div>
            <Badge className="bg-blue-500/10 text-blue-500 border-none text-[9px] uppercase tracking-widest">
              +{stats?.totalUsers || 0} Total
            </Badge>
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Active Users</p>
          <h3 className="text-4xl font-black text-white tracking-tighter">{stats?.totalUsers || 0}</h3>
        </Card>

        <Card className="bg-[#161b2a] border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <Home size={28} />
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[9px] uppercase tracking-widest">
              +{stats?.totalHouseholds || 0} Total
            </Badge>
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Households</p>
          <h3 className="text-4xl font-black text-white tracking-tighter">{stats?.totalHouseholds || 0}</h3>
        </Card>

        <Card className="bg-[#161b2a] border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl">
              <Banknote size={28} />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">Low Income</p>
          <h3 className="text-4xl font-black text-white tracking-tighter">{stats?.incomeBracketBreakdown?.low || 0}</h3>
        </Card>

        <Card className="bg-[#161b2a] border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="p-4 bg-purple-500/10 text-purple-500 rounded-2xl">
              <TrendingUp size={28} />
            </div>
          </div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">High Income</p>
          <h3 className="text-4xl font-black text-white tracking-tighter">{stats?.incomeBracketBreakdown?.high || 0}</h3>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-8">
        {['overview', 'users', 'households'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === tab
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "bg-[#161b2a] text-slate-500 hover:text-white border border-slate-800"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-[#161b2a] border border-slate-800 rounded-[3rem] p-10 shadow-2xl">
            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center gap-3">
              <PieChart size={24} className="text-blue-500" />
              Income Distribution
            </h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={incomeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {incomeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-6">
              {incomeChartData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.name}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-[#161b2a] border border-slate-800 rounded-[3rem] p-10 shadow-2xl">
            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center gap-3">
              <BarChart3 size={24} className="text-emerald-500" />
              Household Types
            </h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={householdTypeChartData}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {householdTypeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card className="bg-[#161b2a] border border-slate-800 rounded-[3rem] p-10 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
              <Users size={24} className="text-blue-500" />
              User Registry
            </h4>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 h-12 bg-[#0b0e14] border border-slate-800 rounded-2xl text-white text-sm font-bold focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="h-12 px-4 bg-[#0b0e14] border border-slate-800 rounded-2xl text-white text-sm font-bold focus:outline-none focus:border-blue-500/50"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredUsers.map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between p-6 bg-[#0b0e14] border border-slate-800 rounded-2xl hover:border-blue-500/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-white font-black",
                    u.isActive ? "bg-blue-600" : "bg-slate-700"
                  )}>
                    {u.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-white font-bold">{u.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={cn(
                    "text-[9px] uppercase tracking-widest border-none",
                    u.role === 'admin' ? "bg-purple-500/10 text-purple-500" : "bg-blue-500/10 text-blue-500"
                  )}>
                    {u.role}
                  </Badge>
                  <Badge className={cn(
                    "text-[9px] uppercase tracking-widest border-none",
                    u.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <button
                    onClick={() => handleToggleUserActive(u._id)}
                    className="p-2 text-slate-500 hover:text-white transition-colors"
                    title={u.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {u.isActive ? <UserCheck size={18} /> : <UserX size={18} />}
                  </button>
                  <button
                    onClick={() => handleChangeUserRole(u._id, u.role === 'admin' ? 'user' : 'admin')}
                    className="p-2 text-slate-500 hover:text-white transition-colors"
                    title="Toggle Role"
                  >
                    <ToggleLeft size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Households Tab */}
      {activeTab === 'households' && (
        <Card className="bg-[#161b2a] border border-slate-800 rounded-[3rem] p-10 shadow-2xl">
          <h4 className="text-xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center gap-3">
            <Home size={24} className="text-emerald-500" />
            Household Registry
          </h4>

          <div className="space-y-4">
            {households.map((h) => (
              <div
                key={h._id}
                className="flex items-center justify-between p-6 bg-[#0b0e14] border border-slate-800 rounded-2xl hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white font-black">
                    <Home size={20} />
                  </div>
                  <div>
                    <p className="text-white font-bold">{h.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                      {h.members?.length || 0} members • {h.householdType}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className="bg-slate-800 text-slate-400 border-none text-[9px] uppercase tracking-widest">
                    {h.tariffType}
                  </Badge>
                  <Badge className="bg-blue-500/10 text-blue-500 border-none text-[9px] uppercase tracking-widest">
                    {h.incomeBracket}
                  </Badge>
                  <button
                    onClick={() => navigate(`/admin/households/${h._id}`)}
                    className="p-2 text-slate-500 hover:text-emerald-500 transition-colors"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;
