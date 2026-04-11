import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Plus, Trash2, Edit3,
  Tv, Wind, Coffee,
  Info, Search, ShieldCheck,
  MapPin
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import api from '../services/api';
import { cn } from '../components/ui';

const Appliances = () => {
  const [appliances, setAppliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAppliance, setEditingAppliance] = useState(null);
  const [newAppliance, setNewAppliance] = useState({
    name: '',
    category: 'Other',
    wattage: '',
    dailyUsageHours: 4,
    efficiencyRating: 'Standard',
    room: 'Kitchen'
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAppliances();
  }, []);

  const fetchAppliances = async () => {
    try {
      const res = await api.get('/appliances');
      setAppliances(res.data.data || []);
    } catch (err) {
      console.error('Error fetching appliances:', err);
      // Mock fallback for demo
      setAppliances([
        { _id: '1', name: 'Samsung Smart AC', category: 'Cooling', wattage: 1200, isActive: true, efficiencyRating: 'EnergySaving', room: 'Living Room', dailyUsageHours: 8 },
        { _id: '2', name: 'LG Refrigerator', category: 'Other', wattage: 150, isActive: true, efficiencyRating: 'EnergySaving', room: 'Kitchen', dailyUsageHours: 24 },
        { _id: '3', name: 'Workstation PC', category: 'Entertainment', wattage: 450, isActive: false, efficiencyRating: 'Standard', room: 'Office', dailyUsageHours: 12 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/appliances', {
        ...newAppliance,
        wattage: Number(newAppliance.wattage),
        dailyUsageHours: Number(newAppliance.dailyUsageHours)
      });
      setAppliances([res.data.data, ...appliances]);
      setIsAdding(false);
      setNewAppliance({ name: '', category: 'Other', wattage: '', dailyUsageHours: 4, efficiencyRating: 'Standard', room: 'Kitchen' });
    } catch (err) {
      console.error('Error adding appliance:', err.response?.data || err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/appliances/${editingAppliance._id}`, {
        ...editingAppliance,
        wattage: Number(editingAppliance.wattage),
        dailyUsageHours: Number(editingAppliance.dailyUsageHours)
      });
      setAppliances(appliances.map(app => app._id === editingAppliance._id ? res.data.data : app));
      setIsEditing(false);
      setEditingAppliance(null);
    } catch (err) {
      console.error('Error updating appliance:', err);
    }
  };

  const toggleStatus = async (id, currentState) => {
    try {
      await api.put(`/appliances/${id}`, { isActive: !currentState });
      setAppliances(prev => prev.map(app =>
        app._id === id ? { ...app, isActive: !currentState } : app
      ));
    } catch (err) {
      console.error('Failed to toggle:', err);
    }
  };

  const deleteAppliance = async (id) => {
    try {
      await api.delete(`/appliances/${id}`);
      setAppliances(appliances.filter(app => app._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const filteredAppliances = appliances.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.room && app.room.toLowerCase().includes(searchQuery.toLowerCase())) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0b0e14] p-8 pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic">Device <span className="text-blue-500">Fleet</span></h1>
          <p className="text-slate-500 font-bold tracking-tight">Managing {appliances.length} synchronized endpoints across your home.</p>
        </motion.div>

        <div className="flex items-center space-x-4">
          <div className="relative group w-80">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-500" />
            <input
              type="text"
              placeholder="Locate device..."
              className="w-full bg-[#161b2a] border border-slate-800 text-white rounded-2xl py-4 pl-14 pr-6 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 shadow-2xl transition-all font-bold text-xs uppercase tracking-widest placeholder:text-slate-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-500 text-white font-black px-8 h-[52px] rounded-2xl text-[10px] uppercase tracking-widest flex items-center shadow-lg shadow-blue-500/10 transition-all border-none">
            <Plus size={18} className="mr-3" />
            New Device
          </Button>
        </div>
      </header>

      <AnimatePresence>
        {(isAdding || isEditing) && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#0b0e14]/60"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="w-full max-w-4xl"
            >
              <Card className="bg-[#161b2a] border-blue-500/30 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8">
                  <Badge variant="info" className="bg-blue-500 text-white uppercase tracking-tighter text-[9px]">{isEditing ? 'Configuration Edit' : 'New Module V1.0'}</Badge>
                </div>
                <div className="flex items-center space-x-4 mb-10">
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                    {isEditing ? <Edit3 size={24} /> : <ShieldCheck size={24} />}
                  </div>
                  <h3 className="text-2xl font-black text-white italic tracking-tight">
                    {isEditing ? `Reconfiguring ${editingAppliance.name}` : 'Appliance Integration'}
                  </h3>
                </div>

                <form onSubmit={isEditing ? handleUpdate : handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Device Name</label>
                    <input
                      className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic"
                      placeholder="e.g. Smart Coffee"
                      value={isEditing ? editingAppliance.name : newAppliance.name}
                      onChange={e => isEditing ? setEditingAppliance({ ...editingAppliance, name: e.target.value }) : setNewAppliance({ ...newAppliance, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                    <select
                      className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic"
                      value={isEditing ? editingAppliance.category : newAppliance.category}
                      onChange={e => isEditing ? setEditingAppliance({ ...editingAppliance, category: e.target.value }) : setNewAppliance({ ...newAppliance, category: e.target.value })}
                    >
                      <option value="Cooling">Cooling / AC</option>
                      <option value="Lighting">Lighting / Ambience</option>
                      <option value="Cooking">Cooking / Thermal</option>
                      <option value="Entertainment">Entertainment / Rig</option>
                      <option value="Standby">Standby / Low Draw</option>
                      <option value="Other">Standard Facility</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Room Assignment</label>
                    <input
                      className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic"
                      placeholder="e.g. Master Suite"
                      value={isEditing ? editingAppliance.room : newAppliance.room}
                      onChange={e => isEditing ? setEditingAppliance({ ...editingAppliance, room: e.target.value }) : setNewAppliance({ ...newAppliance, room: e.target.value })}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Peak Wattage</label>
                    <input
                      type="number"
                      className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic font-mono"
                      placeholder="Watts"
                      value={isEditing ? editingAppliance.wattage : newAppliance.wattage}
                      onChange={e => isEditing ? setEditingAppliance({ ...editingAppliance, wattage: e.target.value }) : setNewAppliance({ ...newAppliance, wattage: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Daily Usage (Hours)</label>
                    <input
                      type="number"
                      max="24"
                      className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic font-mono"
                      placeholder="e.g. 8"
                      value={isEditing ? editingAppliance.dailyUsageHours : newAppliance.dailyUsageHours}
                      onChange={e => isEditing ? setEditingAppliance({ ...editingAppliance, dailyUsageHours: e.target.value }) : setNewAppliance({ ...newAppliance, dailyUsageHours: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Efficiency Rating</label>
                    <select
                      className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic"
                      value={isEditing ? editingAppliance.efficiencyRating : newAppliance.efficiencyRating}
                      onChange={e => isEditing ? setEditingAppliance({ ...editingAppliance, efficiencyRating: e.target.value }) : setNewAppliance({ ...newAppliance, efficiencyRating: e.target.value })}
                    >
                      <option value="Old">Legacy / Low Efficiency</option>
                      <option value="Standard">Standard Model</option>
                      <option value="EnergySaving">Energy Star / Green</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 lg:col-span-3 flex items-end gap-5 pt-6">
                    <Button type="submit" className="flex-1 h-16 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl shadow-blue-600/20 border-none">
                      {isEditing ? 'Commit Overwrite' : 'Link to Grid'}
                    </Button>
                    <Button type="button" onClick={() => { setIsAdding(false); setIsEditing(false); }} variant="ghost" className="h-16 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-800 text-slate-500 hover:text-white">Cancel</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-72 bg-[#161b2a] rounded-[3rem] animate-pulse border border-slate-900" />
          ))
        ) : filteredAppliances.map((app, i) => (
          <motion.div
            key={app._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-[#161b2a] p-10 rounded-[3rem] border border-slate-800 relative transition-all hover:scale-[1.02] shadow-2xl group overflow-hidden h-full flex flex-col justify-between">
              <div className="flex items-start justify-between mb-10 relative z-10 transition-transform group-hover:translate-y-[-5px]">
                <div className={cn(
                  "p-5 rounded-3xl transition-all duration-500 shadow-xl",
                  app.isActive
                    ? "bg-blue-600 text-white shadow-blue-500/20 rotate-[-5deg]"
                    : "bg-[#0b0e14] border border-slate-800 text-slate-500"
                )}>
                  {app.category === 'Cooling' ? <Wind size={32} /> :
                    app.category === 'Entertainment' ? <Tv size={32} /> :
                      app.category === 'Cooking' ? <Coffee size={32} /> :
                        <Zap size={32} fill={app.isActive ? "currentColor" : "none"} />}
                </div>
                <Badge variant={app.isActive ? "success" : "neutral"} className={cn(
                  "font-black text-[9px] px-3 py-1 uppercase tracking-widest",
                  app.isActive ? "bg-emerald-500/10 text-emerald-500 border-none" : "bg-slate-950 text-slate-500 border border-slate-800"
                )}>
                  {app.isActive ? "Online" : "Hibernating"}
                </Badge>
              </div>

              <div className="mb-10 relative z-10">
                <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2 group-hover:text-blue-500 transition-colors uppercase">{app.name}</h3>
                <div className="flex flex-wrap items-center gap-4 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><MapPin size={12} className="text-blue-500" /> {app.room || 'Station'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                  <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-blue-500" /> {app.wattage}W</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                  <span className="flex items-center gap-1.5"><Info size={12} className="text-blue-500" /> {app.dailyUsageHours}H / Day</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-slate-800/50 relative z-10">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleStatus(app._id, app.isActive)}
                    className={cn(
                      "w-12 h-7 rounded-full transition-all relative p-1.5 shadow-inner",
                      app.isActive ? "bg-blue-600" : "bg-slate-950 border border-slate-800"
                    )}
                  >
                    <motion.div
                      animate={{ x: app.isActive ? 20 : 0 }}
                      className="w-4 h-4 rounded-full bg-white shadow-xl"
                    />
                  </button>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none italic">Power Link</span>
                </div>

                <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                  <Button
                    onClick={() => { setEditingAppliance(app); setIsEditing(true); }}
                    variant="ghost"
                    className="p-0 h-10 w-10 rounded-xl bg-[#0b0e14] border border-slate-800 text-slate-400 hover:text-white transition-all shadow-xl"
                  >
                    <Edit3 size={16} />
                  </Button>
                  <Button onClick={() => deleteAppliance(app._id)} variant="ghost" className="p-0 h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-blue-600/5 blur-[50px] rounded-full group-hover:bg-blue-600/10 transition-all duration-700" />
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredAppliances.length === 0 && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center">
          <div className="w-24 h-24 bg-[#161b2a] border border-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Search size={40} className="text-slate-700" />
          </div>
          <h4 className="text-xl font-black text-slate-500 italic uppercase">Node Not Found</h4>
          <p className="text-slate-600 font-bold mt-2">Zero devices matching your scan criteria.</p>
        </motion.div>
      )}
    </div>
  );
};

export default Appliances;
