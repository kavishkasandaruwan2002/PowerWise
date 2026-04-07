import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, Bookmark, CheckCircle2, ChevronRight, 
  Leaf, Info, TrendingDown, DollarSign, Sparkles, Filter, 
  X, AlertTriangle, CloudSun
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import { cn } from '../components/ui';
import api from '../services/api';

const Tips = () => {
    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchTips();
    }, []);

    const fetchTips = async () => {
        try {
            const res = await api.get('/v1/tips/recommendations');
            setTips(res.data.data.recommendations || []);
        } catch (err) {
            console.error('Error fetching tips:', err);
            // Enhanced Mock data for high-fidelity demo
            setTips([
                {
                    _id: '1',
                    tip: {
                        title: 'Optimize HVAC Thermodynamic Flow',
                        description: 'Adjust your smart thermostat to 72°F during peak solar radiation to reduce compressor fatigue.',
                        category: 'Climate Control',
                        difficulty: 'Low',
                        impact: 'High'
                    },
                    estimatedSavings: { kwhMonthly: 45, lkrMonthly: 1200 }
                },
                {
                    _id: '2',
                    tip: {
                        title: 'Smart LED Grid Integration',
                        description: 'Replace remaining incandescent bulbs with 5W Smart LEDs to achieve 85% lighting efficiency.',
                        category: 'Lighting',
                        difficulty: 'Medium',
                        impact: 'Medium'
                    },
                    estimatedSavings: { kwhMonthly: 15, lkrMonthly: 450 }
                },
                   {
                    _id: '3',
                    tip: {
                        title: 'Phantom Load Mitigation',
                        description: 'Deploy smart strips to eliminate standby power consumption from entertainment nodes.',
                        category: 'Electronics',
                        difficulty: 'Low',
                        impact: 'Low'
                    },
                    estimatedSavings: { kwhMonthly: 8, lkrMonthly: 200 }
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const implementTip = async (id) => {
        try {
            await api.post(`/v1/tips/${id}/implement`);
            setTips(prev => prev.filter(t => t._id !== id));
        } catch (err) {
            console.error('Implementation failed:', err);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0e14] p-8 pb-32">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic">Energy <span className="text-blue-500">Intelligence</span></h1>
                    <p className="text-slate-500 font-bold tracking-tight italic">Personalized strategies to optimize your grid performance.</p>
                </motion.div>
                
                <div className="flex items-center space-x-4">
                   <div className="flex bg-[#161b2a] border border-slate-800 rounded-2xl p-1.5 shadow-2xl">
                       {['all', 'climate', 'lighting'].map(f => (
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
                   <Button variant="ghost" className="h-12 w-12 p-0 bg-[#161b2a] border border-slate-800 rounded-2xl text-blue-500">
                      <Bookmark size={18} />
                   </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="h-64 bg-[#161b2a] rounded-[3rem] animate-pulse border border-slate-900" />
                    ))
                ) : (
                    tips.map((item, i) => (
                        <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="bg-[#161b2a] border border-slate-800 rounded-[3rem] p-10 overflow-hidden relative group hover:border-blue-500/30 transition-all shadow-2xl h-full flex flex-col">
                                <div className="flex items-start justify-between mb-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-5 bg-blue-600/10 text-blue-500 rounded-[1.5rem] border border-blue-500/20 shadow-xl shadow-blue-500/5 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                            <Lightbulb size={28} className="fill-blue-500/10" />
                                        </div>
                                        <div>
                                            <Badge variant="info" className="bg-blue-500/10 text-blue-500 border-none rounded-xl text-[8px] px-3 py-1 uppercase tracking-widest mb-1 italic">
                                                {item.tip.category}
                                            </Badge>
                                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{item.tip.title}</h3>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2 text-emerald-400 font-black text-sm italic">
                                            <TrendingDown size={16} />
                                            -{item.estimatedSavings.kwhMonthly}kWh
                                        </div>
                                        <span className="text-[10px] text-slate-600 uppercase font-black tracking-widest">Est. Monthly</span>
                                    </div>
                                </div>

                                <p className="text-slate-500 text-sm font-bold tracking-tight italic mb-10 leading-relaxed max-w-[90%] relative z-10">
                                    {item.tip.description}
                                </p>

                                <div className="mt-auto flex items-end justify-between relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-slate-600 uppercase font-black tracking-[0.2em] mb-1">Impact</span>
                                            <div className="flex gap-1">
                                                {[...Array(3)].map((_, idx) => (
                                                    <div key={idx} className={cn(
                                                        "w-4 h-1.5 rounded-full",
                                                        idx < (item.tip.impact === 'High' ? 3 : item.tip.impact === 'Medium' ? 2 : 1) 
                                                            ? "bg-blue-500 shadow-[0_0_8px_#3b82f6]" 
                                                            : "bg-slate-800"
                                                    )} />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-slate-600 uppercase font-black tracking-[0.2em] mb-1">Complexity</span>
                                            <span className="text-white text-[10px] font-black uppercase tracking-widest">{item.tip.difficulty}</span>
                                        </div>
                                    </div>

                                    <Button onClick={() => implementTip(item._id)} className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 h-14 rounded-2xl text-[9px] uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 border-none transition-all group/btn">
                                        Implement Node
                                        <Sparkles size={14} className="ml-3 group-hover/btn:rotate-12 transition-transform" />
                                    </Button>
                                </div>

                                {/* Background Accents */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/[0.02] blur-[80px] rounded-full group-hover:bg-blue-600/[0.05] transition-all duration-700" />
                                <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-emerald-600/[0.02] blur-[80px] rounded-full" />
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            {tips.length === 0 && !loading && (
                 <div className="py-40 text-center">
                    <div className="w-24 h-24 bg-[#161b2a] border border-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl relative">
                        <Sparkles size={40} className="text-slate-700" />
                        <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full animate-pulse" />
                    </div>
                    <h4 className="text-xl font-black text-slate-500 italic uppercase tracking-tighter">Optimization Complete</h4>
                    <p className="text-slate-600 font-bold mt-2">All intelligence nodes have been processed for your current grid state.</p>
                    <div className="mt-12 flex justify-center gap-6">
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-black text-white italic tracking-tighter">88%</span>
                            <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest mt-1">Grid Health</span>
                        </div>
                        <div className="w-px h-12 bg-slate-800" />
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-black text-emerald-500 italic tracking-tighter">A+</span>
                            <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest mt-1">Efficiency</span>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default Tips;
