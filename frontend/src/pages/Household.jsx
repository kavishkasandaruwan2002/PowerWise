import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, MapPin, DollarSign, Users, Settings,
  Save, ShieldCheck, Info, Compass, ChevronRight,
  Map, Globe, Navigation, Search, CheckCircle2, XCircle,
  AlertTriangle
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import { cn } from '../components/ui';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Household = () => {
    const { checkAuth } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        location: { latitude: 6.9271, longitude: 79.8612 },
        houseType: 'apartment',
        occupants: 1
    });

    const [budgets, setBudgets] = useState([]);
    const [budgetForm, setBudgetForm] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        targetAmount: '',
        notes: ''
    });
    const [budgetFeedback, setBudgetFeedback] = useState({ type: '', message: '' });

    useEffect(() => {
        if (profile && profile._id !== 'new') {
            fetchBudgets();
        }
    }, [profile?._id]);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/households/my');
            const household = res.data.household;

            if (!household) {
                setProfile({ _id: 'new', name: 'Global Command HQ' });
                return;
            }

            setProfile(household);
            setFormData({
                name: household.name || '',
                address: household.location?.city || '',
                location: {
                    latitude: household.location?.latitude || 6.9271,
                    longitude: household.location?.longitude || 79.8612
                },
                houseType: household.householdType || 'apartment',
                occupants: household.householdSize || 1
            });
        } catch (err) {
            console.error('Error fetching profile:', err);
            setProfile({ _id: 'new', name: 'Global Command HQ' });
        } finally {
            setLoading(false);
        }
    };

    const fetchBudgets = async () => {
        try {
            const res = await api.get(`/households/${profile._id}/budgets`);
            setBudgets(res.data.budgets || []);
        } catch (err) {
            console.error('Error fetching budgets:', err);
        }
    };

    const handleSaveBudget = async (e) => {
        e.preventDefault();
        setBudgetFeedback({ type: '', message: '' });
        try {
            await api.post(`/households/${profile._id}/budgets`, {
                month: parseInt(budgetForm.month),
                year: parseInt(budgetForm.year),
                targetAmount: parseFloat(budgetForm.targetAmount),
                notes: budgetForm.notes
            });
            setBudgetFeedback({ type: 'success', message: 'Budget synchronized.' });
            fetchBudgets();
            setTimeout(() => setBudgetFeedback({ type: '', message: '' }), 3000);
        } catch (err) {
            setBudgetFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to sync budget.' });
            setTimeout(() => setBudgetFeedback({ type: '', message: '' }), 3000);
        }
    };
    
    const handleDeleteBudget = async (id) => {
        try {
            await api.delete(`/households/${profile._id}/budgets/${id}`);
            fetchBudgets();
        } catch (err) {
            console.error('Failed to delete budget', err);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setFeedback({ type: '', message: '' });

        try {
            if (profile && profile._id !== 'new') {
                // Update existing household
                const res = await api.put(`/households/${profile._id}`, {
                    name: formData.name,
                    householdSize: formData.occupants,
                    householdType: formData.houseType,
                    location: {
                        ...formData.location,
                        city: formData.address
                    }
                });
                setProfile(res.data.household);
                setFeedback({ type: 'success', message: 'Household synchronized successfully.' });
            } else {
                // Create new household
                const res = await api.post('/households', {
                    name: formData.name,
                    householdSize: formData.occupants,
                    householdType: formData.houseType,
                    location: {
                        ...formData.location,
                        city: formData.address
                    },
                    incomeBracket: 'middle'
                });
                setProfile(res.data.household);
                await checkAuth();
                setFeedback({ type: 'success', message: 'Household created successfully.' });
            }
            // Refresh form data from backend response
            fetchProfile();
            
            // Auto-clear feedback after 3 seconds
            setTimeout(() => {
                setFeedback({ type: '', message: '' });
            }, 3000);
        } catch (err) {
            console.error('Save failed:', err);
            setFeedback({
                type: 'error',
                message: err.response?.data?.message || 'Synchronization failed.'
            });
            
            setTimeout(() => {
                setFeedback({ type: '', message: '' });
            }, 3000);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0e14] p-8 pb-32">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic">
                            Household <span className="text-blue-500">Node</span>
                        </h1>
                        {profile?._id === 'new' && (
                            <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl text-[9px] px-4 py-2 uppercase tracking-widest">
                                New Registration Required
                            </Badge>
                        )}
                    </div>
                    <p className="text-slate-500 font-bold tracking-tight italic">
                        {profile?._id === 'new'
                            ? 'Initialize your household node configuration.'
                            : 'Regional geolocation and node configuration.'}
                    </p>
                </motion.div>

                {profile && profile._id !== 'new' && (
                    <div className="flex items-center gap-4">
                        <Badge className="bg-blue-500/10 text-blue-500 border-none rounded-2xl text-[9px] px-4 py-2 uppercase tracking-widest italic">
                            Node ID: {profile._id?.substring(0, 8)}...
                        </Badge>
                        <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl text-[9px] px-4 py-2 uppercase tracking-widest">
                            {profile.householdType}
                        </Badge>
                    </div>
                )}
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
                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Occupant Count</label>
                            <input
                                type="number"
                                min="1"
                                max="20"
                                className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic"
                                value={formData.occupants}
                                onChange={e => setFormData({...formData, occupants: parseInt(e.target.value) || 1})}
                            />
                        </div>
                        <div className="flex flex-col gap-3">
                            <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Structure Type</label>
                            <select
                                className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic"
                                value={formData.houseType}
                                onChange={e => setFormData({...formData, houseType: e.target.value})}
                            >
                                <option value="apartment">Apartment Complex</option>
                                <option value="house">Bungalow / Detached</option>
                                <option value="rural_home">Rural / Farm Home</option>
                                <option value="boarding_house">Boarding / Shared House</option>
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

                        <div className="md:col-span-2 flex justify-end pt-8">
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="h-16 px-12 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 border-none flex items-center gap-4 transition-all"
                            >
                                {isSaving ? "Synchronizing..." : (profile?._id === 'new' ? "Add Household" : "Update Household")}
                                <Save size={16} />
                            </Button>
                        </div>
                    </form>

                    {/* Feedback Messages */}
                    <AnimatePresence>
                        {feedback.message && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className={`mt-8 p-6 rounded-[2rem] border text-[10px] font-black uppercase tracking-widest text-center shadow-2xl ${
                                    feedback.type === 'success'
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                        : 'bg-red-500/10 border-red-500/20 text-red-500'
                                }`}
                            >
                                {feedback.type === 'success' ? (
                                    <CheckCircle2 className="mx-auto mb-3" size={24} />
                                ) : (
                                    <AlertTriangle className="mx-auto mb-3" size={24} />
                                )}
                                {feedback.message}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </div>

            {profile && profile._id !== 'new' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 max-w-7xl mx-auto mt-10">
                    <Card className="lg:col-span-1 bg-[#161b2a] border border-slate-800 rounded-[3rem] p-10 overflow-hidden relative shadow-2xl h-fit">
                        <div className="p-6 bg-emerald-600 rounded-[1.5rem] w-fit mb-8 shadow-xl shadow-emerald-600/20">
                            <DollarSign size={32} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-4">Set Budget</h3>
                        <p className="text-slate-500 text-sm font-bold tracking-tight italic mb-8 leading-relaxed">
                            Define your monthly limit. The AI will monitor your consumption against this threshold.
                        </p>
                        
                        <form onSubmit={handleSaveBudget} className="space-y-6 relative z-10">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Month</label>
                                    <input 
                                        type="number" min="1" max="12" required
                                        className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-emerald-500/50 transition-all font-bold text-sm italic"
                                        value={budgetForm.month}
                                        onChange={e => setBudgetForm({...budgetForm, month: e.target.value})}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Year</label>
                                    <input 
                                        type="number" min="2020" max="2050" required
                                        className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-emerald-500/50 transition-all font-bold text-sm italic"
                                        value={budgetForm.year}
                                        onChange={e => setBudgetForm({...budgetForm, year: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Target Amount (LKR)</label>
                                <input 
                                    type="number" min="0" required
                                    className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-emerald-500/50 transition-all font-bold text-sm italic"
                                    value={budgetForm.targetAmount}
                                    placeholder="5000"
                                    onChange={e => setBudgetForm({...budgetForm, targetAmount: e.target.value})}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-emerald-600/20 border-none transition-all"
                            >
                                Synchronize Budget
                            </Button>
                            {budgetFeedback.message && (
                                <div className={`p-4 rounded-2xl border text-[9px] font-black uppercase tracking-widest text-center ${
                                    budgetFeedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                                }`}>
                                    {budgetFeedback.message}
                                </div>
                            )}
                        </form>
                    </Card>

                    <Card className="lg:col-span-2 bg-[#161b2a] border border-slate-800 rounded-[3rem] p-12 overflow-hidden relative shadow-2xl h-full flex flex-col">
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8">Historical Budgets</h3>
                        <div className="space-y-4 overflow-y-auto pr-4 max-h-[400px] custom-scrollbar">
                            {budgets.length === 0 ? (
                                <div className="p-8 border border-slate-800 border-dashed rounded-[2rem] text-center">
                                    <p className="text-slate-500 text-sm font-bold italic">No targets defined in telemetry.</p>
                                </div>
                            ) : budgets.map(budget => (
                                <div key={budget._id} className="flex items-center justify-between p-6 bg-[#0b0e14] rounded-[2rem] border border-slate-800 transition-all hover:border-slate-700">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center text-emerald-500">
                                            <span className="text-[10px] font-black uppercase tracking-widest">{new Date(budget.year, budget.month - 1).toLocaleString('default', { month: 'short' })}</span>
                                            <span className="font-bold text-sm">{budget.year}</span>
                                        </div>
                                        <div>
                                            <div className="text-2xl font-black text-white tracking-tighter italic">LKR {budget.targetAmount}</div>
                                            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Confirmed Target</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteBudget(budget._id)}
                                        className="p-4 bg-red-500/10 text-red-500 rounded-[1.2rem] hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                        <XCircle size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Household;
