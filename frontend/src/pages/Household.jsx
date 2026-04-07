import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, MapPin, DollarSign, Users, Settings, 
  Save, ShieldCheck, Info, Compass, ChevronRight, 
  Map, Globe, Navigation, Search, CheckCircle2, XCircle
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import { cn } from '../components/ui';
import api from '../services/api';

const Household = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        location: { latitude: 0, longitude: 0 },
        houseType: 'Apartment',
        occupants: 1
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/households/my');
            const household = res.data.household;
            setProfile(household);
            setFormData({
                name: household.name || '',
                address: household.location?.city || '',
                location: household.location || { latitude: 0, longitude: 0 },
                houseType: household.householdType || 'Apartment',
                occupants: household.householdSize || 1
            });
        } catch (err) {
            console.error('Error fetching profile:', err);
            // Default blank for new users
            setProfile({ _id: 'new', name: 'Global Command HQ' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (profile && profile._id !== 'new') {
                await api.put(`/households/${profile._id}`, {
                    name: formData.name,
                    householdSize: formData.occupants,
                    householdType: formData.houseType,
                    location: formData.location
                });
                setProfile(prev => ({ ...prev, ...formData }));
            } else {
                // Handle creation if needed
                const res = await api.post('/households', {
                    name: formData.name,
                    householdSize: formData.occupants,
                    householdType: formData.houseType,
                    location: formData.location
                });
                setProfile(res.data.household);
            }
        } catch (err) {
            console.error('Update failed:', err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0e14] p-8 pb-32">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic">Household <span className="text-blue-500">Node</span></h1>
                    <p className="text-slate-500 font-bold tracking-tight italic">Regional geolocation and node configuration.</p>
                </motion.div>
                
                <div className="flex items-center gap-4">
                    <Badge variant="info" className="bg-blue-500/10 text-blue-500 border-none rounded-2xl text-[9px] px-4 py-2 uppercase tracking-widest italic">
                        Node ID: {profile?._id?.substring(0, 8)}...
                    </Badge>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
                {/* Visual Location Card */}
                <Card className="lg:col-span-1 bg-[#161b2a] border border-slate-800 rounded-[3rem] p-10 overflow-hidden relative shadow-2xl h-fit">
                    <div className="p-6 bg-blue-600 rounded-[1.5rem] w-fit mb-8 shadow-xl shadow-blue-600/20">
                        <Map size={32} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">Geolocation</h3>
                    <p className="text-slate-500 text-sm font-bold tracking-tight italic mb-10 leading-relaxed">
                        Regional coordinates are used to calibrate AI forecasting models based on local temperature and solar flux.
                    </p>
                    
                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between p-5 bg-[#0b0e14] rounded-[2rem] border border-slate-800">
                             <div className="flex flex-col gap-1">
                                <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Longitude</span>
                                <span className="text-white font-black italic tracking-tighter">{formData.location.longitude}° E</span>
                             </div>
                             <Compass size={24} className="text-blue-500 opacity-30" />
                        </div>
                        <div className="flex items-center justify-between p-5 bg-[#0b0e14] rounded-[2rem] border border-slate-800">
                             <div className="flex flex-col gap-1">
                                <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Latitude</span>
                                <span className="text-white font-black italic tracking-tighter">{formData.location.latitude}° N</span>
                             </div>
                             <Navigation size={24} className="text-blue-500 opacity-30" />
                        </div>
                    </div>

                    {/* Decorative Map Grid */}
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
                </Card>

                {/* Settings Form */}
                <Card className="lg:col-span-2 bg-[#161b2a] border border-slate-800 rounded-[3rem] p-12 overflow-hidden relative shadow-2xl h-full flex flex-col">
                    <div className="flex items-center justify-between mb-12 relative z-10">
                         <div className="flex items-center gap-4">
                            <div className="p-4 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-[1.5rem] shadow-xl">
                                <Settings size={28} />
                            </div>
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Core Constraints</h3>
                         </div>
                    </div>

                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                        <div className="flex flex-col gap-3">
                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Household Alias</label>
                            <input 
                                className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic"
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                placeholder="Main Command HQ"
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Structure Type</label>
                            <select 
                                className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic"
                                value={formData.houseType}
                                onChange={e => setFormData({...formData, houseType: e.target.value})}
                            >
                                <option value="Apartment">Apartment Complex</option>
                                <option value="Bungalow">Bungalow / Detached</option>
                                <option value="Office">Industrial Node</option>
                                <option value="Other">Standard Facility</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-3 md:col-span-2">
                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Coordinate Mapping (lat, lon)</label>
                            <div className="grid grid-cols-2 gap-6">
                                <input 
                                    className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic"
                                    type="number"
                                    step="0.0001"
                                    value={formData.location.latitude}
                                    onChange={e => setFormData({...formData, location: {...formData.location, latitude: parseFloat(e.target.value)}})}
                                />
                                <input 
                                    className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic"
                                    type="number"
                                    step="0.0001"
                                    value={formData.location.longitude}
                                    onChange={e => setFormData({...formData, location: {...formData.location, longitude: parseFloat(e.target.value)}})}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 md:col-span-2">
                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Physical Address</label>
                            <textarea 
                                className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 h-32 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic resize-none"
                                value={formData.address}
                                onChange={e => setFormData({...formData, address: e.target.value})}
                                placeholder="Enter structural coordinates..."
                            />
                        </div>

                        <div className="md:col-span-2 flex justify-end pt-12">
                            <Button 
                                type="submit"
                                disabled={isSaving}
                                className="h-16 px-12 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 border-none flex items-center gap-4 transition-all"
                            >
                                {isSaving ? "Synchronizing..." : "Commit Changes"}
                                <Save size={16} />
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Household;
