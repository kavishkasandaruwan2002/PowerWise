import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, Bell, CheckCircle2, Info, X, 
  Trash2, ShieldAlert, Zap, TrendingUp, AlertCircle, 
  Eye, Calendar, Filter
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import { cn } from '../components/ui';
import api from '../services/api';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const res = await api.get('/v1/alerts');
            console.log('Alert response:', res.data);
            setAlerts(res.data.data || []);
        } catch (err) {
            console.error('Error fetching alerts:', err);
            // Handled completely without high-fidelity mock data fallback.
            // setAlerts([...]); // Mock data removed
            alert('Failed to fetch alerts. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const markRead = async (id) => {
        try {
            await api.put(`/v1/alerts/${id}/read`);
            setAlerts(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a));
        } catch (err) {
            console.error('Failed to mark read:', err);
            alert('Failed to mark alert as read. Please try again.');
        }
    };

    const deleteAlert = async (id) => {
        try {
            await api.delete(`/v1/alerts/${id}`);
            setAlerts(prev => prev.filter(a => a._id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete alert. Please try again.');
        }
    };

    const severityStyles = {
        critical: "bg-red-500/10 border-red-500/30 text-red-500 shadow-red-500/10",
        warning: "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-amber-500/10",
        info: "bg-blue-500/10 border-blue-500/30 text-blue-500 shadow-blue-500/10"
    };

    const severityIcons = {
        critical: <ShieldAlert size={28} />,
        warning: <AlertTriangle size={28} />,
        info: <Info size={28} />
    };

    const filteredAlerts = alerts.filter(a => filter === 'all' ? true : a.severity === filter);

    return (
        <div className="min-h-screen bg-[#0b0e14] p-8 pb-32">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic">Crisis <span className="text-blue-500">Center</span></h1>
                    <p className="text-slate-500 font-bold tracking-tight italic">Real-time anomaly detection and critical grid notifications.</p>
                </motion.div>
                
                <div className="flex items-center space-x-4">
                   <div className="flex bg-[#161b2a] border border-slate-800 rounded-2xl p-1.5 shadow-2xl">
                       {['all', 'critical', 'warning', 'info'].map(f => (
                           <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "px-6 py-2 rounded-[1rem] text-[9px] font-black uppercase tracking-widest transition-all",
                                    filter === f ? "bg-blue-600 text-white" : "text-slate-500 hover:text-slate-200"
                                )}
                           >
                               {f}
                           </button>
                       ))}
                   </div>
                   <Button variant="ghost" className="h-12 px-6 bg-[#161b2a] border border-slate-800 rounded-2xl text-slate-400 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all shadow-2xl">
                      Clear Logs
                   </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="h-32 bg-[#161b2a] rounded-[2.5rem] animate-pulse border border-slate-900" />
                        ))
                    ) : filteredAlerts.map((alert, i) => (
                        <motion.div
                            key={alert._id}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, x: 50 }}
                            transition={{ delay: i * 0.05 }}
                            layout
                        >
                            <Card className={cn(
                                "relative bg-[#161b2a] border rounded-[2.5rem] p-8 overflow-hidden transition-all duration-500 group shadow-2xl",
                                alert.isRead ? "border-slate-800 opacity-60" : "border-slate-800"
                            )}>
                                <div className="flex items-center gap-8 relative z-10">
                                    <div className={cn(
                                        "p-5 rounded-[1.5rem] border shadow-xl transition-transform duration-500 group-hover:scale-110",
                                        severityStyles[alert.severity]
                                    )}>
                                        {severityIcons[alert.severity]}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-4">
                                                <h3 className={cn(
                                                    "text-xl font-black italic tracking-tighter uppercase",
                                                    alert.severity === 'critical' ? 'text-red-500' : 'text-white'
                                                )}>{alert.title}</h3>
                                                {!alert.isRead && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-pulse" />
                                                )}
                                            </div>
                                            <div className="flex items-center text-[9px] text-slate-500 font-black uppercase tracking-widest">
                                                <Calendar size={12} className="mr-2" />
                                                {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <p className="text-slate-400 text-sm font-bold tracking-tight italic leading-relaxed pr-24">
                                            {alert.message}
                                        </p>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {!alert.isRead && (
                                            <Button 
                                                onClick={() => markRead(alert._id)}
                                                className="bg-blue-600 hover:bg-blue-500 text-white font-black px-6 h-12 rounded-xl text-[9px] uppercase tracking-widest border-none shadow-xl shadow-blue-600/10"
                                            >
                                                Mark Read
                                            </Button>
                                        )}
                                        <Button 
                                            onClick={() => deleteAlert(alert._id)}
                                            variant="ghost" 
                                            className="h-12 w-12 p-0 bg-[#0b0e14] border border-slate-800 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Background Accents */}
                                <div className={cn(
                                    "absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-transparent pointer-events-none opacity-20",
                                    alert.severity === 'critical' ? 'from-red-500/20' : 
                                    alert.severity === 'warning' ? 'from-amber-500/20' : 'from-blue-500/20'
                                )} />
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {!loading && filteredAlerts.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-40 text-center"
                    >
                         <div className="w-24 h-24 bg-[#161b2a] border border-slate-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl relative">
                            <CheckCircle2 size={40} className="text-emerald-500" />
                            <div className="absolute inset-0 bg-emerald-500/5 blur-2xl rounded-full" />
                        </div>
                        <h4 className="text-xl font-black text-slate-500 italic uppercase">All Clear</h4>
                        <p className="text-slate-600 font-bold mt-2">Zero critical events detected in your current session.</p>
                        <Button onClick={fetchAlerts} className="mt-8 bg-[#161b2a] hover:bg-[#1f263a] text-blue-500 font-black px-8 h-14 rounded-2xl text-[9px] uppercase tracking-widest border border-slate-800 shadow-2xl">
                           Execute Re-scan
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Alerts;
