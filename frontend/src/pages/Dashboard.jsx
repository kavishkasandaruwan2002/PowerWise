import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import {
  Zap, DollarSign, Activity, Leaf,
  ArrowUpRight, ArrowDownRight, AlertTriangle, Lightbulb,
  TrendingUp, Calendar, ChevronRight, Share2, Download,
  Bell, Settings, History, Info, Clock, ShieldCheck,
  CheckCircle2, XCircle, Power, Menu, BarChart3
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import { cn } from '../components/ui';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [tips, setTips] = useState([]);
  const [appliances, setAppliances] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const endpoints = [
        api.get('/readings'),
        api.get('/readings/compare'),
        api.get('/appliances'),
        api.get('/v1/alerts')
      ];

      const hasHousehold = !!user?.household;
      if (hasHousehold) {
        const householdId = user.household._id || user.household;
        endpoints.push(api.get(`/prediction/${householdId}/predict`));
        endpoints.push(api.get('/v1/tips/recommendations'));
      }

      const results = await Promise.all(endpoints);
      let readingsRes, compareRes, appliancesRes, alertsRes, predictionRes, tipsRes;

      if (hasHousehold) {
        [readingsRes, compareRes, appliancesRes, alertsRes, predictionRes, tipsRes] = results;
      } else {
        [readingsRes, compareRes, appliancesRes, alertsRes] = results;
      }

      if (readingsRes?.data?.data && readingsRes.data.data.length > 0) {
        setData(readingsRes.data.data.slice(0, 7).map(r => ({
          name: new Date(r.readingDate).toLocaleDateString('en-US', { weekday: 'short' }),
          consumption: r.consumption || r.readingValue,
        })).reverse());
      }

      if (compareRes) setSummary(compareRes.data.data);
      if (appliancesRes) setAppliances(appliancesRes.data.data || []);
      if (alertsRes) setAlerts((alertsRes.data.data || []).slice(0, 3));
      if (tipsRes) setTips((tipsRes.data.data?.recommendations || []).slice(0, 2));
      if (predictionRes) setPrediction(predictionRes.data.prediction);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const distributionData = [
    { name: 'AC', value: 400, color: '#3b82f6', max: 500 },
    { name: 'Fridge', value: 300, color: '#10b981', max: 500 },
    { name: 'Lighting', value: 200, color: '#f59e0b', max: 500 },
    { name: 'Electronics', value: 150, color: '#8b5cf6', max: 500 },
    { name: 'Other', value: 100, color: '#64748b', max: 500 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e14] p-12 space-y-12 animate-pulse">
        <div className="h-20 w-1/4 bg-slate-900 rounded-2xl" />
        <div className="grid grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => <div key={i} className="h-44 bg-slate-900 rounded-3xl" />)}
        </div>
        <div className="h-[400px] bg-slate-900 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] p-8 pb-32 overflow-x-hidden">
      {/* Dashboard Topbar */}
      <header className="flex items-center justify-between mb-12">
        <button className="p-2 text-slate-500 hover:text-white transition-colors">
          <Menu size={24} />
        </button>
        <div className="flex items-center space-x-6">
          <button className="relative p-2 text-slate-500 hover:text-white transition-colors">
            <Bell size={24} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-bold text-white">User Profile</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Regular User</p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-black border-4 border-slate-900 shadow-xl overflow-hidden ring-4 ring-blue-500/10">
              {user?.name?.[0] || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">Household Overview</h1>
          <p className="text-slate-500 font-bold tracking-tight">Monitoring your energy pulse in real-time.</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={() => navigate('/readings')} className="bg-[#3b82f6] hover:bg-blue-600 text-white font-black px-8 py-3 rounded-2xl text-xs uppercase tracking-widest flex items-center shadow-lg shadow-blue-500/10 transition-all border-none">
            <Activity size={18} className="mr-3" />
            Log Reading
          </Button>
          <Button onClick={() => navigate('/appliances')} className="bg-[#161b2a] border border-slate-800 px-6 py-3 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all">
            <Zap size={14} className="mr-2 inline" />
            Manage Appliances
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {/* Live Usage */}
        <div className="bg-[#161b2a] p-10 rounded-[2.5rem] border border-slate-800 relative transition-all hover:scale-[1.02] cursor-pointer shadow-2xl group overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl shadow-inner">
              <Zap size={28} />
            </div>
            <div className="flex items-center text-red-400 bg-red-400/5 px-3 py-1.5 rounded-full border border-red-400/10 text-[10px] font-black tracking-widest uppercase">
              <ArrowUpRight size={14} className="mr-1" />
              +12%
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3">Live Usage</p>
            <h3 className="text-4xl font-black text-white tracking-tighter">
              {summary?.actual ? `${summary.actual} kW` : "2.4 kW"}
            </h3>
          </div>
          <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-500/5 blur-[40px] rounded-full group-hover:bg-blue-500/10 transition-all" />
        </div>

        {/* Monthly Bill */}
        <div className="bg-[#161b2a] p-10 rounded-[2.5rem] border border-slate-800 relative transition-all hover:scale-[1.02] cursor-pointer shadow-2xl group overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl shadow-inner">
              <DollarSign size={28} />
            </div>
            <div className="flex items-center text-emerald-400 bg-emerald-400/5 px-3 py-1.5 rounded-full border border-emerald-400/10 text-[10px] font-black tracking-widest uppercase">
              <ArrowDownRight size={14} className="mr-1" />
              -3.2%
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3">
               {prediction ? "AI Projected Bill" : "Est. Monthly Bill"}
            </p>
            <h3 className="text-4xl font-black text-white tracking-tighter transition-colors group-hover:text-emerald-400">
              {prediction?.estimatedBillRs ? `Rs.${prediction.estimatedBillRs}` : (summary?.estimatedBillRs ? `Rs.${summary.estimatedBillRs}` : "$142.50")}
            </h3>
          </div>
          <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-emerald-500/5 blur-[40px] rounded-full group-hover:bg-emerald-500/10 transition-all" />
        </div>

        {/* Active Devices */}
        <div className="bg-[#161b2a] p-10 rounded-[2.5rem] border border-slate-800 relative transition-all hover:scale-[1.02] cursor-pointer shadow-2xl group overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="p-4 bg-slate-800 text-slate-100 rounded-2xl shadow-inner">
              <Activity size={28} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3">Active Appliances</p>
            <h3 className="text-4xl font-black text-white tracking-tighter">
              {appliances.length || "12"}
            </h3>
          </div>
        </div>

        {/* Efficiency */}
        <div className="bg-[#161b2a] p-10 rounded-[2.5rem] border border-slate-800 relative transition-all hover:scale-[1.02] cursor-pointer shadow-2xl group overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl shadow-inner">
              <TrendingUp size={28} />
            </div>
            <div className="flex items-center text-red-400 bg-red-400/5 px-3 py-1.5 rounded-full border border-red-400/10 text-[10px] font-black tracking-widest uppercase">
              <ArrowUpRight size={14} className="mr-1" />
              +5
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3">Efficiency Score</p>
            <h3 className="text-4xl font-black text-white tracking-tighter">88/100</h3>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 bg-[#161b2a] p-10 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-3">
              <BarChart3 className="text-blue-500" size={24} />
              <h4 className="text-xl font-bold text-white tracking-tight italic">Regional Consumption History</h4>
            </div>
            <div className="flex items-center bg-slate-900/80 p-2 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
              {['Week', 'Month', 'Year'].map(t => (
                <button
                  key={t}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all",
                    t === 'Week' ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.2} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 700 }}
                />
                <Tooltip
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: '#0b0e14',
                    border: '1px solid #1e293b',
                    borderRadius: '24px',
                    padding: '20px',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="consumption"
                  stroke="#3b82f6"
                  strokeWidth={6}
                  fillOpacity={1}
                  fill="url(#colorBlue)"
                  animationDuration={2500}
                  animationEasing="ease-in-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Distribution */}
        <div className="bg-[#161b2a] p-10 rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col h-full transform transition-all hover:translate-y-[-5px]">
          <div className="flex items-center space-x-3 mb-10">
            <Zap className="text-emerald-500" size={24} />
            <h4 className="text-xl font-bold text-white tracking-tight italic">Energy Distribution</h4>
          </div>

          <div className="space-y-8 flex-1">
            {distributionData.map((item) => (
              <div key={item.name} className="space-y-4 group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-300 group-hover:text-white transition-colors">{item.name}</span>
                  <span className="text-xs font-black text-white">{item.value} kWh</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / item.max) * 100}%` }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800/50">
            <Button onClick={() => navigate('/appliances')} variant="ghost" className="w-full text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center p-0 h-auto">
              View Detals <ChevronRight size={14} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
