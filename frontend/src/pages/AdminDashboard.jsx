import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Home, Lightbulb, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { listAdminTips } from '../services/tipsService';
import { Button } from '../components/ui';

const StatCard = ({ title, value, icon: Icon, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    className="rounded-[2rem] border border-slate-800 bg-[#161b2a] p-6 shadow-2xl"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black">{title}</p>
        <h3 className="text-4xl font-black text-white italic tracking-tighter mt-3">{value}</h3>
        <p className="text-sm text-slate-500 font-bold mt-2">{subtitle}</p>
      </div>
      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
        <Icon size={24} />
      </div>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [tipList, setTipList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsRes, tipsRes] = await Promise.all([
        api.get('/admin/stats'),
        listAdminTips({ limit: 100 }),
      ]);

      setStats(statsRes.data?.stats || statsRes.data || null);
      setTipList(tipsRes?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDashboard();
  }, []);

  const activeTipsCount = useMemo(() => tipList.filter((tip) => tip.isActive).length, [tipList]);
  const inactiveTipsCount = useMemo(() => tipList.filter((tip) => !tip.isActive).length, [tipList]);

  return (
    <div className="min-h-screen bg-[#0b0e14] p-8 pb-24">
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-5">
          <ShieldCheck size={14} />
          Admin Control
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
          Admin <span className="text-blue-500">Dashboard</span>
        </h1>
        <p className="text-slate-500 font-bold mt-3">
          Monitor platform activity and manage the energy tip library.
        </p>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 rounded-[2rem] bg-[#161b2a] border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[2rem] border border-red-500/20 bg-red-500/10 p-6">
          <p className="text-red-400 font-bold">{error}</p>
          <button
            onClick={fetchAdminDashboard}
            className="mt-4 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            <StatCard title="Users" value={stats?.totalUsers ?? 0} subtitle="Active registered users" icon={Users} />
            <StatCard title="Households" value={stats?.totalHouseholds ?? 0} subtitle="Tracked household profiles" icon={Home} />
            <StatCard title="Active Tips" value={activeTipsCount} subtitle="Tips available for users" icon={Lightbulb} />
            <StatCard title="Inactive Tips" value={inactiveTipsCount} subtitle="Archived or disabled tips" icon={LayoutDashboard} />
          </div>

          <div className="rounded-[2rem] border border-slate-800 bg-[#161b2a] p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-black text-white italic tracking-tighter mb-2">Tip Library Snapshot</h2>
                <p className="text-slate-500 font-bold">Latest tip records from the admin library.</p>
              </div>
              <Link to="/admin/tips">
                <Button className="!rounded-2xl !text-[10px] !uppercase !tracking-[0.18em] bg-blue-600 hover:bg-blue-500 text-white border-none">
                  Open Tip Management
                </Button>
              </Link>
            </div>

            {tipList.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-[#0b0e14] p-6 text-slate-500 font-bold">
                No tips found yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {tipList.slice(0, 6).map((tip) => (
                  <div key={tip._id} className="rounded-2xl border border-slate-800 bg-[#0b0e14] p-5">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <h3 className="text-white font-black tracking-tight">{tip.title}</h3>
                      <span
                        className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-[0.2em] ${
                          tip.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/30 text-slate-400'
                        }`}
                      >
                        {tip.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm font-bold mb-3">{tip.description}</p>
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">
                      <span>{tip.category}</span>
                      <span>•</span>
                      <span>{tip.effortLevel}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
