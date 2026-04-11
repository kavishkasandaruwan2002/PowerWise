import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ShieldCheck, UserPlus, ArrowRight } from 'lucide-react';

export const AuthSwitch = ({ activeTab = 'login', onSwitch }) => {
  const [current, setCurrent] = useState(activeTab);

  const toggle = (mode) => {
    setCurrent(mode);
    if (onSwitch) onSwitch(mode);
  };

  return (
    <div className="flex flex-col items-center gap-10 p-12 bg-[#161b2a] border border-slate-800 rounded-[3rem] shadow-2xl relative overflow-hidden group max-w-md w-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl rounded-full" />
      
      <div className="text-center relative z-10">
        <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Auth <span className="text-blue-500">Controller</span></h1>
        <p className="text-slate-600 font-bold text-[10px] uppercase tracking-widest italic">System Access Protocols</p>
      </div>

      <div className="relative bg-[#0b0e14] p-2 rounded-[2rem] border border-slate-800 flex w-full shadow-inner z-10">
        <motion.div
           className="absolute top-2 bottom-2 left-2 bg-blue-600 rounded-[1.5rem] shadow-lg shadow-blue-600/20"
           animate={{
              x: current === 'login' ? 0 : '100%',
              width: 'calc(50% - 8px)'
           }}
           transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
        
        <button 
           onClick={() => toggle('login')}
           className={cn(
             "relative flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors duration-500",
             current === 'login' ? "text-white" : "text-slate-500 hover:text-slate-300"
           )}
        >
           <ShieldCheck size={14} />
           Login
        </button>
        
        <button 
           onClick={() => toggle('register')}
           className={cn(
             "relative flex-1 py-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors duration-500",
             current === 'register' ? "text-white" : "text-slate-500 hover:text-slate-300"
           )}
        >
           <UserPlus size={14} />
           Register
        </button>
      </div>

      <motion.div 
         key={current}
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: 1, y: 0 }}
         className="text-center relative z-10"
      >
         <h2 className="text-white text-lg font-bold italic mb-4">
            {current === 'login' ? "Initiate Terminal Session" : "Node Onboarding Required"}
         </h2>
         <button className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/10 transition-all">
            Continue to protocol <ArrowRight size={14} />
         </button>
      </motion.div>

      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-blue-600/[0.03] blur-[80px] rounded-full" />
    </div>
  );
};

export default AuthSwitch;
