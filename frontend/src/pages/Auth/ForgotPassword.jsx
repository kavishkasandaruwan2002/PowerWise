import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const AnimatedBlob = ({ color, position, delay = "" }) => (
  <div className={`absolute ${position} w-72 h-72 ${color} rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob ${delay}`} />
);

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [devLink, setDevLink] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setDevLink('');
        try {
            const res = await api.post('/auth/forgotpassword', { email });
            if (res.data.devLink) {
                setDevLink(res.data.devLink);
            }
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] p-6 relative overflow-hidden">
                <AnimatedBlob color="bg-blue-600" position="top-0 -left-10" />
                <div className="max-w-md w-full bg-[#161b2a]/50 backdrop-blur-xl border border-slate-800 p-12 rounded-[2.5rem] text-center relative z-10 shadow-2xl">
                    <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
                        <CheckCircle2 size={40} className="text-blue-500" />
                    </div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">
                        {devLink ? "Protocol Link Generated" : "Email Sent."}
                    </h2>
                    <p className="text-slate-500 font-bold italic mb-6 leading-relaxed">
                        {devLink 
                            ? "Email service is offline. Use the bypass link below to proceed with recovery." 
                            : `If an account exists for ${email}, you will receive a password reset link shortly.`
                        }
                    </p>

                    {devLink && (
                        <div className="mb-10 p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl">
                            <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest mb-2">Development Bypass Link</p>
                            <a 
                                href={devLink} 
                                className="text-xs font-bold text-white break-all hover:text-blue-400 transition-colors underline decoration-blue-500/50 underline-offset-4"
                            >
                                {devLink}
                            </a>
                        </div>
                    )}

                    <Link to="/login" className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                        Return to Login <ArrowRight size={14} />
                    </Link>
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
                            <Zap size={12} className="fill-blue-500" /> Security Protocol
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                            Reset <br/><span className="text-blue-600">Access.</span>
                        </h1>
                        <p className="text-slate-500 text-xs font-bold italic uppercase tracking-widest">
                            Lost your node credentials? Enter your email to recover uplink.
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

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    placeholder="user@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-[#0b0e14] border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-bold text-sm"
                                />
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
                                <>Send Reset Link <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>

                    <Link to="/login" className="block text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] hover:text-white transition-colors">
                         Back to Login
                    </Link>
                </div>
            </div>

            <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#020617] items-center justify-center p-20">
                <AnimatedBlob color="bg-blue-600" position="top-0 -left-10" />
                <AnimatedBlob color="bg-purple-600" position="-bottom-10 right-0" delay="animation-delay-2000" />
                
                <div className="relative z-10 text-center max-w-lg">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-6 bg-blue-600/10 text-blue-500 rounded-[3rem] border border-blue-500/20 w-fit mx-auto mb-10 shadow-2xl"
                    >
                        <ShieldCheck size={56} strokeWidth={1} />
                    </motion.div>
                    <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter mb-6 leading-none">
                        Secure <br/><span className="text-blue-600">Recovery.</span>
                    </h2>
                    <p className="text-slate-500 text-xl font-bold italic leading-relaxed">
                        Our advanced authentication layer ensures your energy data remains protected during credential recovery.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
