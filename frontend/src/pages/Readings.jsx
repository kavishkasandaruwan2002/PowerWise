import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Plus, Trash2, Calendar,
  Zap, Save, Info, History, ShieldCheck,
  TrendingDown, TrendingUp, BarChart3
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import api from '../services/api';
import { cn } from '../components/ui';

const Readings = () => {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState(null);
  const [newReading, setNewReading] = useState({
    readingValue: '',
    readingDate: new Date().toISOString().split('T')[0],
    readingType: 'actual',
    notes: ''
  });

  useEffect(() => {
    fetchReadings();
  }, []);

  const fetchReadings = async () => {
    try {
      const res = await api.get('/readings');
      setReadings(res.data.data || []);
    } catch (err) {
      console.error('Error fetching readings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const res = await api.post('/readings', {
        ...newReading,
        readingValue: Number(newReading.readingValue)
      });
      setReadings([res.data.data, ...readings]);
      setIsAdding(false);
      setNewReading({
        readingValue: '',
        readingDate: new Date().toISOString().split('T')[0],
        readingType: 'actual',
        notes: ''
      });
    } catch (err) {
      console.error('Error adding reading:', err);
      const msg = err.response?.data?.error || err.message;
      setError(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const deleteReading = async (id) => {
    if (!id) return;
    try {
      setError(null);
      await api.delete(`/readings/${id}`);
      setReadings(readings.filter(r => (r._id || r.id) !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      const msg = err.response?.data?.error || err.message;
      setError(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] p-8 pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic">Meter <span className="text-blue-500">Telemetry</span></h1>
          <p className="text-slate-500 font-bold tracking-tight italic">Synchronizing physical consumption with digital twin datasets.</p>
        </motion.div>

        <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 h-[52px] rounded-2xl text-[10px] uppercase tracking-widest flex items-center shadow-lg shadow-blue-500/10 border-none transition-all">
          <Plus size={18} className="mr-3" />
          Submit Reading
        </Button>
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-12"
          >
            <Card className="bg-[#161b2a] border border-blue-500/30 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="flex items-center space-x-4 mb-10">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                  <Activity size={24} />
                </div>
                <h3 className="text-2xl font-black text-white italic tracking-tight uppercase">Upload Data Point</h3>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {error && (
                  <div className="md:col-span-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                     <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>
                  </div>
                )}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Reading (kWh)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-black text-sm italic font-mono"
                    placeholder="0.00"
                    value={newReading.readingValue}
                    onChange={e => setNewReading({ ...newReading, readingValue: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Submission Date</label>
                  <input
                    type="date"
                    className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-xs uppercase tracking-widest"
                    value={newReading.readingDate}
                    onChange={e => setNewReading({ ...newReading, readingDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Evidence / Notes</label>
                  <input
                    className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic"
                    placeholder="Optional metadata..."
                    value={newReading.notes}
                    onChange={e => setNewReading({ ...newReading, notes: e.target.value })}
                  />
                </div>
                <div className="md:col-span-3 flex justify-end gap-4 pt-4">
                  <Button type="button" onClick={() => setIsAdding(false)} variant="ghost" className="h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-white">Abort</Button>
                  <Button type="submit" className="h-14 px-12 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 border-none">Commit Byte</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <History size={18} className="text-blue-500" />
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Temporal Log History</h3>
        </div>

        {readings.length === 0 && !loading ? (
          <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-[3rem]">
            <BarChart3 size={48} className="mx-auto text-slate-800 mb-4" />
            <p className="text-slate-600 font-black uppercase text-[10px] tracking-widest">No spectral data synchronized yet.</p>
          </div>
        ) : readings.map((r, i) => (
          <motion.div
            key={r._id || r.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="bg-[#161b2a] border border-slate-800 p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-xl">
               <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-[#0b0e14] rounded-2xl flex items-center justify-center text-blue-500 border border-slate-800 group-hover:scale-110 transition-transform shadow-inner">
                     <Zap size={24} fill="currentColor" fillOpacity={0.1} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white italic tracking-tighter uppercase">{r.readingValue} <span className="text-slate-600 text-[10px] not-italic ml-2 tracking-widest">kWh</span></h4>
                    <div className="flex items-center gap-3 mt-1">
                       <Calendar size={12} className="text-blue-500" />
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{new Date(r.readingDate).toLocaleDateString()}</span>
                    </div>
                  </div>
               </div>

               <div className="flex items-center gap-12">
                  <div className="hidden md:flex flex-col items-end">
                     <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1 italic">Consumption Shift</span>
                     <div className="flex items-center gap-2">
                        {r.consumption > 0 ? <TrendingUp size={14} className="text-red-500" /> : <TrendingDown size={14} className="text-emerald-500" />}
                        <span className="text-white font-black italic tracking-tighter uppercase">{r.consumption || 0} kWh</span>
                     </div>
                  </div>
                  
                  <Button 
                    onClick={() => deleteReading(r._id || r.id)}
                    variant="ghost" 
                    className="w-12 h-12 rounded-2xl bg-red-500/5 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all p-0"
                  >
                     <Trash2 size={18} />
                  </Button>
               </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Readings;
