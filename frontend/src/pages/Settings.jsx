import React, { useState } from 'react';
import { motion, AnimatePresence  } from 'framer-motion';
import { 
  User, Mail, Lock, Shield, 
  Save, LogOut, Bell, Eye,
  CheckCircle2, AlertTriangle, Key,
  ChevronRight, ArrowLeft
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { cn } from '../components/ui';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const { user, logout, checkAuth } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [profile, setProfile] = useState({
        name: user?.name || '',
        email: user?.email || '',
        incomeBracket: user?.incomeBracket || 'middle'
    });

    React.useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || '',
                email: user.email || '',
                incomeBracket: user.incomeBracket || 'middle'
            });
        }
    }, [user]);
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        setError('');
        try {
            await api.put('/auth/me', profile);
            await checkAuth(); // Refresh global user state
            setSuccess('Profile synchronized successfully.');
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return setError('Confirmation entropy mismatch.');
        }
        setLoading(true);
        setSuccess('');
        setError('');
        try {
            await api.put('/auth/update-password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            setSuccess('Cipher key updated successfully.');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Password update failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0e14] p-8 pb-32">
            <header className="flex items-center gap-6 mb-16">
                <button 
                  onClick={() => navigate(-1)}
                  className="p-4 bg-[#161b2a] border border-slate-800 rounded-2xl text-slate-500 hover:text-white transition-all shadow-xl"
                >
                    <ArrowLeft size={20} />
                </button>
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic">Control <span className="text-blue-500">Registry</span></h1>
                    <p className="text-slate-500 font-bold tracking-tight italic">Adjusting operator credentials and system preferences.</p>
                </motion.div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-7xl">
                {/* Profile Section */}
                <div className="lg:col-span-2 space-y-12">
                    <Card className="bg-[#161b2a] border border-slate-800 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/[0.03] blur-[80px] rounded-full" />
                        
                        <div className="flex items-center gap-4 mb-12">
                            <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl">
                                <User size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Operator Ident</h3>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Designation</label>
                                    <input 
                                        type="text"
                                        className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic"
                                        value={profile.name}
                                        onChange={e => setProfile({...profile, name: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Comm Channel (Email)</label>
                                    <input 
                                        type="email"
                                        className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic"
                                        value={profile.email}
                                        onChange={e => setProfile({...profile, email: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Economic Stratum</label>
                                    <select 
                                        className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-[10px] uppercase tracking-widest"
                                        value={profile.incomeBracket}
                                        onChange={e => setProfile({...profile, incomeBracket: e.target.value})}
                                    >
                                        <option value="low">Low Income Sector</option>
                                        <option value="middle">Middle Income Sector</option>
                                        <option value="high">High Income Sector</option>
                                    </select>
                                </div>
                            </div>
                            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white font-black px-12 h-14 rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 border-none transition-all">
                                Update Registry
                            </Button>
                        </form>
                    </Card>

                    <Card className="bg-[#161b2a] border border-slate-800 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-12">
                            <div className="p-4 bg-purple-500/10 text-purple-500 rounded-2xl">
                                <Key size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Cipher Security</h3>
                        </div>

                        <form onSubmit={handlePasswordUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Current Cipher</label>
                                <input 
                                    type="password"
                                    className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4"
                                    value={passwords.currentPassword}
                                    onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Hash</label>
                                <input 
                                    type="password"
                                    className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4"
                                    value={passwords.newPassword}
                                    onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Entropy</label>
                                <input 
                                    type="password"
                                    className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4"
                                    value={passwords.confirmPassword}
                                    onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                                />
                            </div>
                            <div className="md:col-span-2 pt-4">
                                <Button type="submit" disabled={loading} className="bg-[#0b0e14] border border-slate-800 hover:border-purple-500/50 text-purple-500 font-black px-12 h-14 rounded-2xl text-[10px] uppercase tracking-[0.3em] transition-all">
                                    Re-key Cipher
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <Card className="bg-blue-600/5 border border-blue-500/20 rounded-[3rem] p-10 relative overflow-hidden group">
                        <Shield className="text-blue-500 mb-6 group-hover:scale-110 transition-transform" size={48} strokeWidth={1} />
                        <h4 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4">Security Protocol</h4>
                        <p className="text-slate-500 text-xs font-bold italic leading-relaxed mb-8">Your account is secured with AES-256 bank-grade encryption at the metadata tier. No plaintext passwords are stored in the grid records.</p>
                        <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle2 size={14} /> Active Protection
                        </div>
                    </Card>

                    <Card className="bg-[#161b2a] border border-slate-800 rounded-[3rem] p-10">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8">System Actions</h4>
                        <div className="space-y-4">
                            <button className="flex items-center justify-between w-full p-6 bg-[#0b0e14] border border-slate-800 rounded-[2rem] group hover:border-blue-500/30 transition-all">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white">Export Audit Log</span>
                                <ChevronRight size={16} className="text-slate-700" />
                            </button>
                            <button 
                                onClick={logout}
                                className="flex items-center justify-between w-full p-6 bg-red-500/5 border border-red-500/10 rounded-[2rem] group hover:bg-red-500 hover:border-red-500 transition-all"
                            >
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest group-hover:text-white">Terminate Session</span>
                                <LogOut size={16} className="text-red-500 group-hover:text-white" />
                            </button>
                        </div>
                    </Card>

                    <AnimatePresence>
                        {(success || error) && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className={cn(
                                    "p-6 rounded-[2rem] border text-[10px] font-black uppercase tracking-widest text-center shadow-2xl",
                                    success ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                                )}
                            >
                                {success ? <CheckCircle2 className="mx-auto mb-3" /> : <AlertTriangle className="mx-auto mb-3" />}
                                {success || error}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Settings;
