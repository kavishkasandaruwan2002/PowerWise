    import React, { useState } from 'react';
    import { motion } from 'framer-motion';
    import { Lock, ArrowRight, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';
    import { useParams, useNavigate } from 'react-router-dom';
    import api from '../../services/api';

    const AnimatedBlob = ({ color, position, delay = "" }) => (
    <div className={`absolute ${position} w-72 h-72 ${color} rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob ${delay}`} />
    );

    const ResetPassword = () => {
        const { token } = useParams();
        const navigate = useNavigate();
        const [password, setPassword] = useState('');
        const [confirmPassword, setConfirmPassword] = useState('');
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState('');
        const [success, setSuccess] = useState(false);

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (password !== confirmPassword) {
                return setError('Passwords do not match');
            }
            
            setLoading(true);
            setError('');
            try {
                await api.put(`/auth/resetpassword/${token}`, { password });
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (err) {
                setError(err.response?.data?.message || 'Invalid or expired token. Please request a new link.');
            } finally {
                setLoading(false);
            }
        };

        if (success) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] p-6 relative overflow-hidden">
                    <AnimatedBlob color="bg-green-600" position="top-0 -left-10" />
                    <div className="max-w-md w-full bg-[#161b2a]/50 backdrop-blur-xl border border-slate-800 p-12 rounded-[2.5rem] text-center relative z-10 shadow-2xl">
                        <div className="w-20 h-20 bg-green-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-green-500/20">
                            <CheckCircle2 size={40} className="text-green-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Success.</h2>
                        <p className="text-slate-500 font-bold italic mb-10 leading-relaxed">
                            Your password has been reset successfully. Redirecting you to login...
                        </p>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 3 }}
                                className="h-full bg-green-500"
                            />
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen flex flex-col lg:flex-row w-full bg-[#0b0e14] overflow-hidden">
                <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative z-10">
                    <div className="w-full max-w-sm space-y-8">
                        <header className="space-y-3">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-[0.3em] italic"
                            >
                                <Zap size={12} className="fill-blue-500" /> Secure Point
                            </motion.div>
                            <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                                New <br/><span className="text-blue-600">Password.</span>
                            </h1>
                            <p className="text-slate-500 text-xs font-bold italic uppercase tracking-widest">
                                Update your credentials to restore node access.
                            </p>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center"
                                >
                                    {error}
                                </motion.div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 ml-1">New Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-[#0b0e14] border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-bold text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                            <Lock size={18} />
                                        </div>
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-[#0b0e14] border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-bold text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Reset Password <ArrowRight size={16} /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#020617] items-center justify-center p-20">
                    <AnimatedBlob color="bg-blue-600" position="top-0 -left-10" />
                    <AnimatedBlob color="bg-cyan-600" position="-bottom-10 right-0" delay="animation-delay-2000" />
                    
                    <div className="relative z-10 text-center max-w-lg">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="p-6 bg-blue-600/10 text-blue-500 rounded-[3rem] border border-blue-500/20 w-fit mx-auto mb-10 shadow-2xl"
                        >
                            <ShieldCheck size={56} strokeWidth={1} />
                        </motion.div>
                        <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter mb-6 leading-none">
                            Secure <br/><span className="text-blue-600">Update.</span>
                        </h2>
                        <p className="text-slate-500 text-xl font-bold italic leading-relaxed">
                            Establishing new secure protocols for your energy management profile.
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    export default ResetPassword;
