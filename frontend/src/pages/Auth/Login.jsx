import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Eye, EyeOff, Mail, Lock, 
  ArrowRight, ShieldCheck, Zap,
  Search, CheckCircle2
} from 'lucide-react';

// --- Internal Helper Components (As requested in user template) ---

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

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

const PasswordField = ({ id, label, placeholder, value, onChange, showPassword, onTogglePassword, required = false }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-500 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
        <Lock size={18} />
      </div>
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full h-14 pl-12 pr-12 rounded-2xl bg-[#0b0e14] border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-bold text-sm"
      />
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

// --- Main Login Component ---

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row w-full bg-[#0b0e14] overflow-hidden">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative z-10">
        <div className="w-full max-w-sm space-y-8">
          <header className="space-y-3">
             <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-[0.3em] italic"
             >
                <Zap size={12} className="fill-blue-500" /> System Online
             </motion.div>
             <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                Welcome <br/><span className="text-blue-600">Back.</span>
             </h1>
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
              <InputField
                id="email"
                type="email"
                label="Email Address"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                required
              />

              <PasswordField
                id="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-800 bg-[#0b0e14] text-blue-600 focus:ring-blue-500/20" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300">Remember Me</span>
              </label>
              <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400">
                Forgot Password?
              </Link>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>Log In <ArrowRight size={16} /></>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-900"></div>
              </div>
              <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em]">
                <span className="bg-[#0b0e14] px-4 text-slate-600 font-black">Or continue with</span>
              </div>
            </div>

            <button
                type="button"
                className="w-full h-14 border border-slate-800 bg-slate-900/30 hover:bg-slate-900/50 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3"
            >
              <GoogleIcon /> Continue via Google
            </button>
          </form>

          <div className="pt-8 border-t border-slate-900">
            <p className="text-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-400 transition-colors ml-2 underline decoration-2 underline-offset-4">
                Sign Up
              </Link>
            </p>
            <p className="text-center text-[10px] font-black text-slate-600 uppercase tracking-widest mt-4">
              Administrator Profile?{' '}
              <Link to="/admin/register" className="text-purple-600 hover:text-purple-400 transition-colors ml-2 underline decoration-2 underline-offset-4">
                Register as Admin
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero (Premium) */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#020617] items-center justify-center p-20">
        {/* Animated Background Blobs */}
        <AnimatedBlob color="bg-blue-600" position="top-0 -left-10" />
        <AnimatedBlob color="bg-purple-600" position="-bottom-10 right-0" delay="animation-delay-2000" />
        <AnimatedBlob color="bg-cyan-600" position="top-1/2 left-1/4" delay="animation-delay-4000" />

        <div className="relative z-10 text-center max-w-lg">
           <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="p-6 bg-blue-600/10 text-blue-500 rounded-[3rem] border border-blue-500/20 w-fit mx-auto mb-10 shadow-2xl"
           >
              <ShieldCheck size={56} strokeWidth={1} />
           </motion.div>
           <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter mb-6 leading-none">
              Smart Energy <br/><span className="text-blue-600">Analytics.</span>
           </h2>
           <p className="text-slate-500 text-xl font-bold italic leading-relaxed mb-12">
              Manage your household energy usage with advanced tracking and AI-powered prediction models.
           </p>

           <div className="grid grid-cols-3 gap-8 pt-10 border-t border-slate-900">
              <div className="text-center">
                 <p className="text-3xl font-black text-white italic tracking-tighter">0%</p>
                 <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Data Leak</p>
              </div>
              <div className="text-center">
                 <p className="text-3xl font-black text-white italic tracking-tighter">4.2M</p>
                 <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Active Users</p>
              </div>
              <div className="text-center">
                 <p className="text-3xl font-black text-white italic tracking-tighter">AES-GCM</p>
                 <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Encryption</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
