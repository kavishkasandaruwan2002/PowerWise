import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Zap,
  ArrowRight, Play, CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui';
import { Component as InteractiveGlobe } from '../components/ui/interactive-globe';

const Landing = () => {
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);

    return (
        <div className="relative bg-[#0b0e14] overflow-hidden selection:bg-blue-600/30">
            {/* Parallax Blobs */}
            <motion.div style={{ y: y1 }} className="absolute top-[10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none z-0" />
            <motion.div style={{ y: y2 }} className="absolute top-[40%] left-[-5%] w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none z-0" />

            {/* Primary Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 px-6 z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center lg:text-left"
                    >
                        <motion.div
                            className="inline-flex items-center space-x-2 px-6 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 mb-8 shadow-2xl"
                        >
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] italic">Grid Intelligence Node v3.0</span>
                        </motion.div>
                        
                        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black text-white tracking-tighter leading-[0.8] mb-10 italic uppercase">
                            Master Your <br />
                            <span className="text-blue-600">Grid.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-slate-500 font-bold italic leading-relaxed mb-12 max-w-xl mx-auto lg:mx-0">
                            The world&apos;s most advanced energy monitoring ecosystem. Experience real-time grid telemetry and AI-driven efficiency at global scale.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                            <Button 
                                onClick={() => navigate('/register')}
                                className="px-12 py-8 bg-blue-600 hover:bg-blue-500 text-white font-black text-lg h-20 w-full sm:w-auto shadow-2xl shadow-blue-600/20 rounded-[1.5rem] uppercase tracking-widest border-none transition-all group"
                            >
                                Sign Up Now
                                <ArrowRight size={22} className="ml-4 group-hover:translate-x-2 transition-transform" />
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/login')}
                                className="px-12 py-8 text-slate-400 hover:text-white font-black text-lg h-20 w-full sm:w-auto border border-slate-800 bg-[#161b2a]/50 rounded-[1.5rem] uppercase tracking-widest transition-all"
                            >
                                Sign In
                            </Button>
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="relative hidden lg:flex items-center justify-center h-[650px]"
                    >
                        <div className="absolute inset-0 bg-blue-600/5 blur-[150px] rounded-full" />
                        <InteractiveGlobe size={680} className="relative z-10" />
                        
                        {/* Floating Stats */}
                        <motion.div 
                            animate={{ y: [0, -15, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute top-10 right-0 bg-[#161b2a]/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-blue-500/20 shadow-2xl z-20"
                        >
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Global Load</p>
                            <p className="text-3xl font-black text-white italic tracking-tighter">8.42 TW</p>
                        </motion.div>

                        <motion.div 
                            animate={{ y: [0, 15, 0] }}
                            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                            className="absolute bottom-20 left-0 bg-[#161b2a]/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-blue-500/20 shadow-2xl z-20"
                        >
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Synchronized</p>
                            <p className="text-3xl font-black text-white italic tracking-tighter">14,209 Nodes</p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Showcase Section */}
            <section className="py-40 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#161b2a] rounded-[4rem] border border-slate-800 p-8 md:p-16 lg:p-24 flex flex-col lg:flex-row gap-20 items-center shadow-2xl relative overflow-hidden"
                    >
                        <div className="flex-1 space-y-12 relative z-10">
                            <motion.div 
                                className="inline-flex items-center gap-3 rounded-full border border-blue-500/20 bg-blue-600/5 px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 italic"
                            >
                                <span className="size-2 rounded-full bg-blue-600 shadow-[0_0_8px_#3b82f6] animate-pulse" />
                                Sub-System Operational
                            </motion.div>

                            <h3 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] italic uppercase">
                                Global Smart <br/>
                                <span className="text-blue-600">Grid Hub.</span>
                            </h3>

                            <p className="text-slate-500 text-xl font-bold italic leading-relaxed max-w-xl">
                                Real-time geo-telemetry deployed across 150+ international nodes. Experience millisecond latency and elite efficiency management.
                            </p>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 py-10 border-y border-slate-800/50">
                                <div>
                                    <p className="text-4xl font-black text-white italic tracking-tighter">150+</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-1">Edge Clusters</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-white italic tracking-tighter">&lt;45ms</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-1">Data Jitter</p>
                                </div>
                                <div>
                                    <p className="text-4xl font-black text-white italic tracking-tighter">99.9%</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mt-1">SLA Uptime</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {[
                                    "Dynamic Node Recovery",
                                    "Neural Load Balancing",
                                    "Quantum Tunnel Encryption",
                                    "Real-time Geo-Telemetry"
                                ].map((f, i) => (
                                    <div key={i} className="flex items-center space-x-5 group cursor-default">
                                        <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <span className="text-white font-black text-xs uppercase tracking-widest">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="flex-1 relative w-full lg:w-auto h-[500px] lg:h-[700px] rounded-[3.5rem] overflow-hidden border border-slate-800 group shadow-2xl">
                            <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
                            <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" alt="Matrix" className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" />
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <motion.div 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.5)] cursor-pointer"
                                >
                                    <Play size={40} className="text-white fill-white ml-2" />
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-60 px-6 relative">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_70%)]" />
                 <div className="max-w-5xl mx-auto relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <h2 className="text-7xl md:text-[10rem] font-black text-white tracking-tighter leading-[0.8] mb-16 italic uppercase">
                            Redefine <br/>
                            <span className="text-blue-600">Efficiency.</span>
                        </h2>
                        <Button 
                            onClick={() => navigate('/register')}
                            className="px-20 py-10 bg-blue-600 hover:bg-blue-500 text-white font-black text-2xl h-28 rounded-[2.5rem] shadow-2xl shadow-blue-600/40 border-none transition-all hover:scale-105 active:scale-95 uppercase tracking-widest"
                        >
                            Establish Link
                        </Button>
                        <div className="mt-20 flex flex-wrap justify-center gap-10 text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">
                            <span>Open Hub Access</span>
                            <span>No Subscriptions</span>
                            <span>E2E Encryption</span>
                        </div>
                    </motion.div>
                 </div>
            </section>

            {/* Premium Footer */}
            <footer className="py-24 border-t border-slate-800/50 px-12 bg-[#020617] relative z-10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
                    <div className="md:col-span-2 space-y-10">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-blue-600 rounded-2xl">
                                <Zap className="text-white fill-white" size={32} />
                            </div>
                            <span className="text-4xl font-black text-white uppercase tracking-tighter italic">Power<span className="text-blue-600">Wise</span></span>
                        </div>
                        <p className="text-slate-600 max-w-sm font-bold text-lg italic leading-relaxed">
                            Pioneering global energy intelligence through advanced neural modeling and real-time edge telemetry.
                        </p>
                    </div>
                    {['Platform', 'Intelligence'].map((cat, i) => (
                        <div key={i}>
                            <h5 className="text-white font-black uppercase tracking-widest text-xs mb-10 italic">Core {cat}</h5>
                            <ul className="space-y-6 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Neural Hub</a></li>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Edge Nodes</a></li>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Grid Analytics</a></li>
                                <li><a href="#" className="hover:text-blue-500 transition-colors">Quantum Logic</a></li>
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="max-w-7xl mx-auto mt-32 pt-12 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black text-slate-700 uppercase tracking-widest">
                    <span>© 2026 PowerWise OS / Grid Intel Collective</span>
                    <div className="flex items-center space-x-12">
                        <a href="#" className="hover:text-white transition-colors">Security</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">SLA</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
