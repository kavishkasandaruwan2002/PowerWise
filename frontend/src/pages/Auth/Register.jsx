import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  User, Mail, Lock, UserPlus, 
  Zap, CheckCircle2, ArrowRight,
  ShieldCheck, Activity
} from 'lucide-react';

// --- Internal Helper Components (Matching Login for Consistency) ---

const AnimatedBlob = ({ color, position, delay = "" }) => (
  <div className={`absolute ${position} w-72 h-72 ${color} rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob ${delay}`} />
);

const InputField = ({ id, type, label, placeholder, value, onChange, icon: Icon, required = false }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
        <Icon size={18} />
      </div>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full h-14 pl-12 pr-4 rounded-2xl bg-[#0b0e14] border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-bold text-sm"
      />
    </div>
  </div>
);

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        incomeBracket: 'middle',
        adminKey: ''
    });
    const [isAdmin, setIsAdmin] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        try {
            const submitData = {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                incomeBracket: formData.incomeBracket
            };
            
            if (isAdmin) {
                if (!formData.adminKey) {
                    setLoading(false);
                    return setError('Admin Override Key is required');
                }
                submitData.adminKey = formData.adminKey;
            }

            await register(submitData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try a different email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row w-full bg-[#0b0e14] overflow-hidden">
            {/* Left Side - Hero (Premium) */}
            <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#020617] items-center justify-center p-20 border-r border-slate-900">
                <AnimatedBlob color="bg-cyan-600" position="top-0 -left-10" />
                <AnimatedBlob color="bg-blue-600" position="-bottom-10 right-0" delay="animation-delay-2000" />
                
                <div className="relative z-10 text-center max-w-lg">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="p-6 bg-blue-600/10 text-blue-500 rounded-[3rem] border border-blue-500/20 w-fit mx-auto mb-10 shadow-2xl"
                    >
                        <Activity size={56} strokeWidth={1} />
                    </motion.div>
                    <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter mb-6 leading-none">
                        Join the <br/><span className="text-blue-600">Grid.</span>
                    </h2>
                    <p className="text-slate-500 text-xl font-bold italic leading-relaxed mb-12">
                        Enlist your household into the world's most advanced energy intelligence network. Start monitoring your grid in seconds.
                    </p>

                    <div className="space-y-6 text-left max-w-sm mx-auto">
                        {[
                            "Real-time Neural Telemetry",
                            "AI-Powered Bill Predictions",
                            "Quantum Tunnel Encryption"
                        ].map((text, i) => (
                            <motion.div 
                                key={i}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5 + i * 0.1 }}
                                className="flex items-center gap-4 text-slate-400"
                            >
                                <div className="w-6 h-6 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-500">
                                    <CheckCircle2 size={14} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">{text}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative z-10 overflow-y-auto">
                <div className="w-full max-w-md space-y-8">
                    <header className="space-y-3">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-[0.3em] italic"
                        >
                            <UserPlus size={12} className="fill-blue-500" /> New Node Enlistment
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                            Establish <br/><span className="text-blue-600">Profile.</span>
                        </h1>
                    </header>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                id="name"
                                type="text"
                                label="Operator Name"
                                placeholder="Kasun Perera"
                                value={formData.name}
                                onChange={handleChange}
                                icon={User}
                                required
                            />
                            <InputField
                                id="email"
                                type="email"
                                label="Uplink Ident"
                                placeholder="operator@grid.net"
                                value={formData.email}
                                onChange={handleChange}
                                icon={Mail}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                id="password"
                                type="password"
                                label="Secure Key"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                icon={Lock}
                                required
                            />
                            <InputField
                                id="confirmPassword"
                                type="password"
                                label="Re-Verify Key"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                icon={Lock}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                             <label className="text-[10px] lowercase font-black tracking-[0.2em] text-slate-500 ml-1 uppercase">Income Tier</label>
                             <div className="grid grid-cols-3 gap-3">
                                 {['low', 'middle', 'high'].map((bracket) => (
                                     <button
                                         key={bracket}
                                         type="button"
                                         onClick={() => setFormData({ ...formData, incomeBracket: bracket })}
                                         className={`h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                             formData.incomeBracket === bracket 
                                                 ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" 
                                                 : "bg-slate-900/30 border-slate-800 text-slate-500 hover:border-slate-700"
                                         }`}
                                     >
                                         {bracket}
                                     </button>
                                 ))}
                             </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4 cursor-pointer" onClick={() => setIsAdmin(!isAdmin)}>
                            <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${isAdmin ? 'bg-blue-600 border-blue-600' : 'bg-[#0b0e14] border-slate-700'}`}>
                                {isAdmin && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Register as System Admin</span>
                        </div>

                        {isAdmin && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                                <InputField
                                    id="adminKey"
                                    type="password"
                                    label="Admin Override Key"
                                    placeholder="Enter access code"
                                    value={formData.adminKey}
                                    onChange={handleChange}
                                    icon={ShieldCheck}
                                />
                            </motion.div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 mt-4 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Initialize Link <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-[10px] font-black text-slate-600 uppercase tracking-widest pt-4">
                        Already Synchronized?{' '}
                        <Link to="/login" className="text-blue-600 hover:text-blue-400 transition-colors ml-2 underline decoration-2 underline-offset-4">
                            Access Terminal
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
