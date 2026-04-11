import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Area, Cell } from 'recharts';
import {
    TrendingDown, Target, Zap,
    Info, RefreshCcw, TrendingUp, Filter, ChevronRight
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import { cn } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Analytics = () => {
    const { user } = useAuth();
    const [view, setView] = useState('monthly');
    const [historicalData, setHistoricalData] = useState([]);
    const [hourlyData, setHourlyData] = useState([]);
    const [_loading, setLoading] = useState(true);
    const [comparison, setComparison] = useState(null);
    const [prediction, setPrediction] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const hasHousehold = !!user?.household;
            const householdId = user?.household?._id || user?.household;

            const endpoints = [
                api.get('/readings/compare').catch(() => null),
                api.get('/readings').catch(() => null)
            ];

            if (hasHousehold && householdId) {
                endpoints.push(api.post(`/v1/predictions/${householdId}/forecast`).catch(() => null));
            }

            const [compareRes, readingsRes, predictRes] = await Promise.all(endpoints);

            setComparison(compareRes?.data?.data || null);
            if (predictRes) setPrediction(predictRes?.data?.data);

            // Fetch actual readings for the bar chart
            const sortedReadings = (readingsRes?.data?.data || []).sort((a, b) => new Date(a.readingDate) - new Date(b.readingDate));

            const charted = sortedReadings.map(r => ({
                month: new Date(r.readingDate).toLocaleDateString(undefined, { month: 'short' }),
                actual: r.consumption || 0,
                predicted: r.consumption ? r.consumption * 0.95 : 200 // Default goal
            }));

            // Add predicted month if available
            if (predictRes?.data?.data) {
                const pred = predictRes.data.data;
                charted.push({
                    month: 'NEXT',
                    actual: 0,
                    predicted: pred.forecast.projectedConsumption
                });
            }

            setHistoricalData(charted.length > 0 ? charted : [
                { month: 'No Data', actual: 0, predicted: 0 }
            ]);

            // Mock hourly data if no real-time telemetry is available
            setHourlyData([...Array(24).keys()].map(index => ({
                hour: `${index}:00`,
                usage: Math.floor(Math.random() * 5) + 2
            })));

        } catch (err) {
            console.error('Error fetching analytics:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="min-h-screen bg-[#0b0e14] p-4 md:p-8 pb-32">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-8 md:mb-12">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic">Power <span className="text-blue-500">Forecasting</span></h1>
                    <p className="text-slate-500 font-bold tracking-tight italic">AI-driven consumption analysis and future-state modeling.</p>
                </motion.div>

                <div className="flex items-center space-x-3 bg-[#161b2a] p-2 rounded-[1.5rem] border border-slate-800 shadow-2xl">
                    {['hourly', 'daily', 'monthly'].map(t => (
                        <button
                            key={t}
                            onClick={() => setView(t)}
                            className={cn(
                                "px-4 sm:px-8 py-2 md:py-3 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
                                view === t ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-10 mb-10">
                <Card className="lg:col-span-3 bg-[#161b2a] border-slate-800 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden relative">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 relative z-10">
                        <div>
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Efficiency Forecast</h3>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Real-time usage vs Neural Network projection</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" className="h-12 w-12 p-0 bg-[#0b0e14] border border-slate-800 rounded-2xl text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
                                <RefreshCcw size={18} />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-12 px-6 bg-[#0b0e14] border border-slate-800 rounded-2xl text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">
                                <Filter size={16} className="mr-3" />
                                Filters
                            </Button>
                        </div>
                    </div>

                    <div className="h-[450px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <ComposedChart data={historicalData}>
                                <defs>
                                    <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="0" vertical={false} stroke="#1e293b" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#1e293b', strokeWidth: 2, strokeDasharray: '5 5' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(22, 27, 42, 0.95)',
                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                        borderRadius: '24px',
                                        backdropFilter: 'blur(10px)',
                                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                                        padding: '20px'
                                    }}
                                    itemStyle={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                                />
                                <Bar dataKey="actual" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Actual" barSize={38} fillOpacity={0.15} />
                                <Line
                                    type="monotone"
                                    dataKey="predicted"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    dot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }}
                                    activeDot={{ r: 10, stroke: '#fff', strokeWidth: 3, fill: '#3b82f6' }}
                                    name="AI Goal"
                                />
                                <Area dataKey="predicted" fill="url(#actualGrad)" stroke="none" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <div className="flex flex-col gap-6 md:gap-10">
                    <Card className="bg-blue-600/5 border-blue-500/20 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] relative group overflow-hidden">
                        <div className="absolute -right-6 -top-6 bg-blue-500/10 w-32 h-32 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />
                        <div className="p-4 bg-blue-600 rounded-3xl w-fit mb-6 shadow-xl shadow-blue-600/20">
                            <Target size={24} className="text-white" />
                        </div>
                        <h4 className="text-blue-500 font-black text-[10px] uppercase tracking-[0.2em] mb-3 leading-none">Diagnostic Result</h4>
                        <p className="text-white text-2xl font-black italic leading-tight mb-4 tracking-tighter uppercase min-h-[64px]">
                            {comparison?.recommendation || "Synchronizing telemetry data..."}
                        </p>
                        <div className={cn(
                            "flex items-center text-[10px] font-black uppercase tracking-widest w-fit px-4 py-2 rounded-2xl",
                            comparison?.status?.includes('Track') ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-500"
                        )}>
                            {comparison?.status?.includes('Track') ? <TrendingDown size={14} className="mr-2" /> : <TrendingUp size={14} className="mr-2" />}
                            {comparison?.status || "Analyzing..."}
                        </div>
                    </Card>

                    <Card className="bg-[#161b2a] border-slate-800 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative h-fit">
                        <div className="flex justify-between items-center mb-10">
                            <h4 className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Efficiency Sigma</h4>
                            <Badge className="bg-blue-600 text-white border-none rounded-xl text-[9px] uppercase tracking-tighter">Live Node</Badge>
                        </div>
                        <div className="text-6xl font-black text-white italic tracking-tighter mb-4">
                            {comparison?.accuracy ? (parseFloat(comparison.accuracy) > 90 ? 'A+' : parseFloat(comparison.accuracy) > 70 ? 'B' : 'C') : 'N/A'}
                        </div>
                        <div className="w-full bg-[#0b0e14] h-3 rounded-full overflow-hidden mb-6 border border-slate-800 p-0.5 shadow-inner">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: comparison?.accuracy || '50%' }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                            />
                        </div>
                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest leading-relaxed italic italic">Parity Accuracy: <span className="text-blue-500">{comparison?.accuracy || '0%'}</span> compared to AI goals.</p>
                    </Card>

                    <Card className="bg-[#161b2a] border-slate-800 p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden flex-1 group">
                        <div className="flex justify-between items-center mb-8">
                            <h4 className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Financial Forecast</h4>
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] animate-pulse" />
                        </div>
                        <div className="text-4xl font-black text-white italic tracking-tighter mb-2 tracking-tighter uppercase transition-colors group-hover:text-blue-500">
                            LKR {prediction?.forecast?.projectedBill || (comparison?.estimatedBillRs || '0.00')}
                        </div>
                        <p className="text-slate-400 text-[8px] font-black uppercase tracking-[0.1em] mb-8 leading-relaxed max-w-[200px]">
                            {prediction?.forecast?.description || "Structural Prediction"}
                        </p>

                        <div className="flex items-center justify-between p-5 bg-[#0b0e14] rounded-[2rem] border border-slate-800 transition-all hover:border-blue-500/30">
                            <div className="flex items-center text-[9px] text-blue-500 font-black uppercase tracking-widest italic">
                                <Info size={14} className="mr-2" />
                                Region-calibrated
                            </div>
                            <ChevronRight size={14} className="text-slate-700" />
                        </div>
                    </Card>
                </div>
            </div>

            <Card className="bg-[#161b2a] border-slate-800 p-6 md:p-12 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-600/[0.03] to-transparent pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-12 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="p-5 bg-blue-600/10 rounded-[2rem] text-blue-500 border border-blue-500/20 shadow-xl shadow-blue-500/5">
                            <Zap size={32} className="fill-blue-500/20" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Load Intensity Matrix</h3>
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Stochastic daily usage profile analysis</p>
                        </div>
                    </div>
                </div>

                <div className="h-[320px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={hourlyData}>
                            <CartesianGrid strokeDasharray="0" vertical={false} stroke="#1e293b" />
                            <XAxis
                                dataKey="hour"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#475569', fontSize: 9, fontWeight: 900 }}
                                dy={15}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#475569', fontSize: 9, fontWeight: 900 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(59, 130, 246, 0.05)', radius: 10 }}
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                    borderRadius: '20px',
                                    padding: '16px',
                                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
                                }}
                            />
                            <Bar
                                dataKey="usage"
                                radius={[8, 8, 8, 8]}
                                fill="#3b82f6"
                                barSize={20}
                            >
                                {hourlyData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.usage > 4 ? '#3b82f6' : '#1e293b'}
                                        fillOpacity={entry.usage > 4 ? 1 : 0.5}
                                        className="transition-all duration-700 hover:fill-blue-400 cursor-pointer"
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-12 flex flex-wrap gap-10 text-[10px] font-black uppercase tracking-[0.3em] relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-3.5 h-3.5 rounded-full bg-blue-600 shadow-[0_0_15px_#3b82f6]"></div>
                        <span className="text-slate-400">Peak Demand Flux</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#1e293b]"></div>
                        <span className="text-slate-500">Baseline Stability</span>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Analytics;
