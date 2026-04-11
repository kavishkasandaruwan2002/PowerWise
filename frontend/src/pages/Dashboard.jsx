import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  Zap,
  Banknote,
  Activity,
  Leaf,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Calendar,
  ChevronRight,
  Share2,
  Download,
  Bell,
  Settings,
  History,
  Info,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Power,
  Menu,
  BarChart3,
} from "lucide-react";
import { Card, Button, Badge } from "../components/ui";
import { cn } from "../components/ui";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [tips, setTips] = useState([]);
  const [appliances, setAppliances] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const endpoints = [
        api.get("/readings").catch(() => null),
        api.get("/readings/compare").catch(() => null),
        api.get("/appliances").catch(() => null),
        api.get("/v1/alerts").catch(() => null),
      ];

      const hasHousehold = !!user?.household;
      if (hasHousehold) {
        const householdId = user.household._id || user.household;
        endpoints.push(api.post(`/v1/predictions/${householdId}/forecast`).catch(() => null));
        endpoints.push(api.get("/v1/tips/recommendations").catch(() => null));
      }

      const results = await Promise.all(endpoints);
      let readingsRes,
        compareRes,
        appliancesRes,
        alertsRes,
        predictionRes,
        tipsRes;

      if (hasHousehold) {
        [
          readingsRes,
          compareRes,
          appliancesRes,
          alertsRes,
          predictionRes,
          tipsRes,
        ] = results;
      } else {
        [readingsRes, compareRes, appliancesRes, alertsRes] = results;
      }

      if (readingsRes?.data?.data && readingsRes.data.data.length > 0) {
        setData(
          readingsRes.data.data
            .slice(0, 7)
            .map((r) => ({
              name: new Date(r.readingDate).toLocaleDateString("en-US", {
                weekday: "short",
              }),
              consumption: r.consumption || r.readingValue,
            }))
            .reverse(),
        );
      }

      if (compareRes) setSummary(compareRes.data.data);
      if (appliancesRes) setAppliances(appliancesRes.data.data || []);
      if (alertsRes) setAlerts((alertsRes.data.data || []).slice(0, 3));
      if (tipsRes)
        setTips((tipsRes.data.data?.recommendations || []).slice(0, 2));
      if (predictionRes) setPrediction(predictionRes.data.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const distributionData = [
    { name: "AC", value: 400, color: "#3b82f6", max: 500 },
    { name: "Fridge", value: 300, color: "#10b981", max: 500 },
    { name: "Lighting", value: 200, color: "#f59e0b", max: 500 },
    { name: "Electronics", value: 150, color: "#8b5cf6", max: 500 },
    { name: "Other", value: 100, color: "#64748b", max: 500 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e14] p-12 space-y-12 animate-pulse">
        <div className="h-20 w-1/4 bg-slate-900 rounded-2xl" />
        <div className="grid grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 bg-slate-900 rounded-3xl" />
          ))}
        </div>
        <div className="h-[400px] bg-slate-900 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] p-4 md:p-8 pb-32 overflow-x-hidden">
      {/* Dashboard Topbar */}
      <header className="flex items-center justify-between mb-8 md:mb-12">
        <button className="p-2 text-slate-500 hover:text-white transition-colors">
          <Menu size={24} />
        </button>
        <div className="flex items-center space-x-6">
          <button className="relative p-2 text-slate-500 hover:text-white transition-colors">
            <Bell size={24} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">
                {user?.name || "User Profile"}
              </p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                {user?.role === "admin" ? "System Admin" : "Regular User"}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-black border-4 border-slate-900 shadow-xl overflow-hidden ring-4 ring-blue-500/10">
              {user?.name?.[0] || "U"}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">
            Household Overview
          </h1>
          <p className="text-slate-500 font-bold tracking-tight">
            Monitoring your energy pulse in real-time.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate("/readings")}
            className="bg-[#3b82f6] hover:bg-blue-600 text-white font-black px-8 py-3 rounded-2xl text-xs uppercase tracking-widest flex items-center shadow-lg shadow-blue-500/10 transition-all border-none"
          >
            <Activity size={18} className="mr-3" />
            Log Reading
          </Button>
          <Button
            onClick={() => navigate("/appliances")}
            className="bg-[#161b2a] border border-slate-800 px-6 py-3 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all"
          >
            <Zap size={14} className="mr-2 inline" />
            Manage Appliances
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-8 md:mb-12">
        {/* Live Usage */}
        <div className="bg-[#161b2a] p-6 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-800 relative transition-all hover:scale-[1.02] cursor-pointer shadow-2xl group overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl shadow-inner">
              <Zap size={28} />
            </div>
            <div className="flex items-center text-red-400 bg-red-400/5 px-3 py-1.5 rounded-full border border-red-400/10 text-[10px] font-black tracking-widest uppercase">
              <ArrowUpRight size={14} className="mr-1" />
              +12%
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3">
              Live Usage
            </p>
            <h3 className="text-4xl font-black text-white tracking-tighter">
              {summary?.actual ? `${summary.actual} kW` : "2.4 kW"}
            </h3>
          </div>
          <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-500/5 blur-[40px] rounded-full group-hover:bg-blue-500/10 transition-all" />
        </div>

        {/* Monthly Bill */}
        <div className="bg-[#161b2a] p-6 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-800 relative transition-all hover:scale-[1.02] cursor-pointer shadow-2xl group overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl shadow-inner">
              <Banknote size={28} />
            </div>
            <div className="flex items-center text-emerald-400 bg-emerald-400/5 px-3 py-1.5 rounded-full border border-emerald-400/10 text-[10px] font-black tracking-widest uppercase">
              <ArrowDownRight size={14} className="mr-1" />
              -3.2%
            </div>
          </div>
          <div
            className="relative z-10 w-full"
            onClick={() =>
              prediction?.forecast?.breakdown && setShowBreakdown(true)
            }
          >
            <div className="flex justify-between items-start mb-3">
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                {prediction ? "AI Projected Bill" : "Est. Monthly Bill"}
              </p>
              {prediction?.budgetComparison &&
                prediction.budgetComparison.monthlyBudget > 0 && (
                  <Badge
                    variant="outline"
                    className={
                      prediction.budgetComparison.willExceed
                        ? "text-red-500 border-red-500/20 bg-red-500/10"
                        : "text-emerald-500 border-emerald-500/20 bg-emerald-500/10"
                    }
                  >
                    {prediction.budgetComparison.percentageOfBudget}%
                  </Badge>
                )}
            </div>
            <h3 className="text-4xl font-black text-white tracking-tighter transition-colors group-hover:text-emerald-400 mb-4">
              {prediction?.forecast?.projectedBill
                ? `Rs.${prediction.forecast.projectedBill}`
                : summary?.estimatedBillRs
                  ? `Rs.${summary.estimatedBillRs}`
                  : "Rs. 142.50"}
            </h3>

            {/* Visual Budget Progress Bar */}
            {prediction?.budgetComparison &&
              prediction.budgetComparison.monthlyBudget > 0 && (
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-500">
                    <span>Cur: Rs.{prediction.current.bill?.toFixed(0)}</span>
                    <span>
                      Lim: Rs.{prediction.budgetComparison.monthlyBudget}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(100, (prediction.current.bill / prediction.budgetComparison.monthlyBudget) * 100)}%`,
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]",
                        prediction.current.bill >
                          prediction.budgetComparison.monthlyBudget
                          ? "bg-red-500 shadow-red-500/50"
                          : prediction.current.bill >
                              prediction.budgetComparison.monthlyBudget * 0.8
                            ? "bg-amber-500 shadow-amber-500/50"
                            : "bg-emerald-500 shadow-emerald-500/50",
                      )}
                    />
                  </div>
                </div>
              )}

            {prediction?.forecast?.breakdown && (
              <button className="mt-4 text-[9px] text-slate-500 uppercase tracking-widest font-black block group-hover:text-white transition-colors flex items-center">
                View AI Breakdown <ChevronRight size={12} className="ml-1" />
              </button>
            )}
          </div>
          <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-emerald-500/5 blur-[40px] rounded-full group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
        </div>

        {/* Active Devices */}
        <div className="bg-[#161b2a] p-6 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-800 relative transition-all hover:scale-[1.02] cursor-pointer shadow-2xl group overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="p-4 bg-slate-800 text-slate-100 rounded-2xl shadow-inner">
              <Activity size={28} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3">
              Active Appliances
            </p>
            <h3 className="text-4xl font-black text-white tracking-tighter">
              {appliances.length || "12"}
            </h3>
          </div>
        </div>

        {/* Efficiency */}
        <div className="bg-[#161b2a] p-6 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-800 relative transition-all hover:scale-[1.02] cursor-pointer shadow-2xl group overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl shadow-inner">
              <TrendingUp size={28} />
            </div>
            <div className="flex items-center text-red-400 bg-red-400/5 px-3 py-1.5 rounded-full border border-red-400/10 text-[10px] font-black tracking-widest uppercase">
              <ArrowUpRight size={14} className="mr-1" />
              +5
            </div>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3">
              Efficiency Score
            </p>
            <h3 className="text-4xl font-black text-white tracking-tighter">
              88/100
            </h3>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-8">
        <div className="lg:col-span-3 bg-[#161b2a] p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center space-x-3">
              <BarChart3 className="text-blue-500" size={24} />
              <h4 className="text-xl font-bold text-white tracking-tight italic">
                Regional Consumption History
              </h4>
            </div>
            <div className="flex items-center bg-slate-900/80 p-2 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
              {["Week", "Month", "Year"].map((t) => (
                <button
                  key={t}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all",
                    t === "Week"
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20"
                      : "text-slate-500 hover:text-slate-300",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full">
            {data && data.length > 0 ? (
              <ResponsiveContainer width="100%" height={400} minWidth={0}>
                <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#1e293b"
                  opacity={0.2}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#475569", fontSize: 11, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#475569", fontSize: 11, fontWeight: 700 }}
                />
                <Tooltip
                  cursor={{ stroke: "#3b82f6", strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: "#0b0e14",
                    border: "1px solid #1e293b",
                    borderRadius: "24px",
                    padding: "20px",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="consumption"
                  stroke="#3b82f6"
                  strokeWidth={6}
                  fillOpacity={1}
                  fill="url(#colorBlue)"
                  animationDuration={2500}
                  animationEasing="ease-in-out"
                />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center py-24 border-2 border-dashed border-slate-800/50 rounded-[2rem]">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center">
                  <Activity size={14} className="mr-2 opacity-50" />
                  No consumption data for this period
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Side Distribution */}
        <div className="bg-[#161b2a] p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-slate-800 shadow-2xl flex flex-col h-full transform transition-all hover:translate-y-[-5px]">
          <div className="flex items-center space-x-3 mb-10">
            <Zap className="text-emerald-500" size={24} />
            <h4 className="text-xl font-bold text-white tracking-tight italic">
              Energy Distribution
            </h4>
          </div>

          <div className="space-y-8 flex-1">
            {distributionData.map((item) => (
              <div key={item.name} className="space-y-4 group">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-slate-300 group-hover:text-white transition-colors">
                    {item.name}
                  </span>
                  <span className="text-xs font-black text-white">
                    {item.value} kWh
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / item.max) * 100}%` }}
                    transition={{ duration: 2, ease: "easeOut" }}
                    className="h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800/50">
            <Button
              onClick={() => navigate("/appliances")}
              variant="ghost"
              className="w-full text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center p-0 h-auto"
            >
              View Detals <ChevronRight size={14} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showBreakdown && prediction?.forecast?.breakdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowBreakdown(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#161b2a] border border-slate-800 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 max-w-lg w-full shadow-2xl relative overflow-hidden mx-4 md:mx-0"
            >
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 blur-[50px] rounded-full pointer-events-none" />
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                    AI Breakdown
                  </h3>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
                    CEB Block Simulation Data
                  </p>
                </div>
                <button
                  onClick={() => setShowBreakdown(false)}
                  className="p-3 text-slate-500 hover:text-white bg-slate-900 rounded-2xl hover:bg-red-500 hover:text-white transition-colors shadow-inner"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center p-5 bg-[#0b0e14] rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    Energy Charge
                  </span>
                  <span className="text-sm font-black text-white italic tracking-tighter">
                    Rs. {prediction.forecast.breakdown.energyCharge?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-5 bg-[#0b0e14] rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    Fixed Charge
                  </span>
                  <span className="text-sm font-black text-white italic tracking-tighter">
                    Rs. {prediction.forecast.breakdown.fixedCharge?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-5 bg-[#0b0e14] rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    Additional
                  </span>
                  <span className="text-sm font-black text-amber-500 italic tracking-tighter">
                    Rs.{" "}
                    {prediction.forecast.breakdown.additionalCharges?.toFixed(
                      2,
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center p-5 bg-[#0b0e14] rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                    Taxes & VAT
                  </span>
                  <span className="text-sm font-black text-amber-500 italic tracking-tighter">
                    Rs.{" "}
                    {(
                      prediction.forecast.breakdown.taxes +
                      prediction.forecast.breakdown.VAT
                    )?.toFixed(2)}
                  </span>
                </div>

                <div className="mt-10 pt-8 border-t border-slate-800 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] block mb-2">
                      Total Prediction
                    </span>
                    <span className="text-5xl font-black text-blue-500 tracking-tighter italic leading-none">
                      Rs. {prediction.forecast.projectedBill?.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-3">
                  <div className="px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[9px] uppercase tracking-widest font-black inline-flex items-center shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <ShieldCheck size={12} className="mr-2" />
                    Confidence Level: {prediction.forecast.confidence}%
                  </div>
                  {prediction.forecast.description && (
                    <div className="text-[10px] text-slate-400 font-bold italic tracking-wide text-center bg-slate-900/50 px-4 py-2 rounded-xl">
                      <Lightbulb
                        size={12}
                        className="inline mr-1 mb-0.5 text-amber-400"
                      />
                      {prediction.forecast.description}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
