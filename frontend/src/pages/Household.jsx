import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Settings,
  Save,
  Compass,
  Map,
  Navigation,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Pencil,
  X,
} from "lucide-react";
import { Card, Button, Badge } from "../components/ui";
import { cn } from "../components/ui";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Household = () => {
  const { checkAuth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [_loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    location: { latitude: 6.9271, longitude: 79.8612 },
    houseType: "apartment",
    occupants: 1,
  });

  const [budgets, setBudgets] = useState([]);
  const [budgetForm, setBudgetForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    targetAmount: "",
    percentageThreshold: 80,
    billThreshold: "",
    notes: "",
  });
  const [budgetFeedback, setBudgetFeedback] = useState({ type: "", message: "" });

  // null = create mode, budget object = edit mode
  const [editingBudget, setEditingBudget] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get("/households/my");
      const household = res.data.household;
      if (!household) {
        setProfile({ _id: "new", name: "Global Command HQ" });
        return;
      }
      setProfile(household);
      setFormData({
        name: household.name || "",
        address: household.location?.city || "",
        location: {
          latitude: household.location?.latitude || 6.9271,
          longitude: household.location?.longitude || 79.8612,
        },
        houseType: household.householdType || "apartment",
        occupants: household.householdSize || 1,
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      setProfile({ _id: "new", name: "Global Command HQ" });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBudgets = useCallback(async () => {
    try {
      if (!profile?._id || profile._id === "new") return;
      const res = await api.get(`/v1/budgets?householdId=${profile._id}`);
      const sortedBudgets = (res.data.data || []).sort(
        (a, b) => new Date(b.startDate) - new Date(a.startDate)
      );
      setBudgets(sortedBudgets);
    } catch (err) {
      console.error("Error fetching budgets:", err.response?.data || err.message);
    }
  }, [profile?._id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile && profile._id !== "new") {
      fetchBudgets();
    }
  }, [profile, fetchBudgets]);

  // Populate form with budget data and enter edit mode
  const handleEditBudget = (budget) => {
    const startDate = new Date(budget.startDate || budget.createdAt || new Date());
    setEditingBudget(budget);
    setBudgetForm({
      month: startDate.getMonth() + 1,
      year: startDate.getFullYear(),
      targetAmount: budget.monthlyLimit || budget.targetAmount || "",
      percentageThreshold: budget.alertThresholds?.percentageOfBudget || 80,
      billThreshold: budget.alertThresholds?.billAmount || "",
      notes: budget.notes || "",
    });
    document.getElementById("budget-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingBudget(null);
    setBudgetForm({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      targetAmount: "",
      percentageThreshold: 80,
      billThreshold: "",
      notes: "",
    });
    setBudgetFeedback({ type: "", message: "" });
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setBudgetFeedback({ type: "", message: "" });

    const startDate = new Date(parseInt(budgetForm.year), parseInt(budgetForm.month) - 1, 1);
    const endDate = new Date(parseInt(budgetForm.year), parseInt(budgetForm.month), 0);

    const payload = {
      householdId: profile._id,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      monthlyLimit: Number(budgetForm.targetAmount),
      alertThresholds: {
        percentageOfBudget: Number(budgetForm.percentageThreshold) || 80,
        ...(budgetForm.billThreshold && { billAmount: Number(budgetForm.billThreshold) }),
      },
      notes: budgetForm.notes || "",
    };

    try {
      if (editingBudget) {
        // UPDATE
        await api.put(`/v1/budgets/${editingBudget._id}`, payload);
        setBudgetFeedback({ type: "success", message: "Budget updated successfully." });
        setEditingBudget(null);
      } else {
        // CREATE
        await api.post(`/v1/budgets`, payload);
        setBudgetFeedback({ type: "success", message: "Budget & Alert Engine synchronized." });
      }

      setBudgetForm({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        targetAmount: "",
        percentageThreshold: 80,
        billThreshold: "",
        notes: "",
      });
      fetchBudgets();
      setTimeout(() => setBudgetFeedback({ type: "", message: "" }), 3000);
    } catch (err) {
      console.log("STATUS:", err.response?.status);
      console.log("BACKEND ERROR:", JSON.stringify(err.response?.data, null, 2));
      setBudgetFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to sync budget.",
      });
      setTimeout(() => setBudgetFeedback({ type: "", message: "" }), 3000);
    }
  };

  const handleDeleteBudget = async (id) => {
    try {
      await api.delete(`/v1/budgets/${id}`);
      if (editingBudget?._id === id) handleCancelEdit();
      fetchBudgets();
    } catch (err) {
      console.error("Failed to delete budget", err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback({ type: "", message: "" });
    try {
      if (profile && profile._id !== "new") {
        const res = await api.put(`/households/${profile._id}`, {
          name: formData.name,
          householdSize: formData.occupants,
          householdType: formData.houseType,
          location: { ...formData.location, city: formData.address },
        });
        setProfile(res.data.household);
        setFeedback({ type: "success", message: "Household synchronized successfully." });
      } else {
        const res = await api.post("/households", {
          name: formData.name,
          householdSize: formData.occupants,
          householdType: formData.houseType,
          location: { ...formData.location, city: formData.address },
          incomeBracket: "middle",
        });
        setProfile(res.data.household);
        await checkAuth();
        setFeedback({ type: "success", message: "Household created successfully." });
      }
      fetchProfile();
      setTimeout(() => setFeedback({ type: "", message: "" }), 3000);
    } catch (err) {
      console.error("Save failed:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Synchronization failed.",
      });
      setTimeout(() => setFeedback({ type: "", message: "" }), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] p-4 md:p-8 pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 mb-10 md:mb-16">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic">
              Household <span className="text-blue-500">Node</span>
            </h1>
            {profile?._id === "new" && (
              <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-2xl text-[9px] px-4 py-2 uppercase tracking-widest">
                New Registration Required
              </Badge>
            )}
          </div>
          <p className="text-slate-500 font-bold tracking-tight italic">
            {profile?._id === "new"
              ? "Initialize your household node configuration."
              : "Regional geolocation and node configuration."}
          </p>
        </motion.div>

        {profile && profile._id !== "new" && (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 max-w-7xl mx-auto">
        {/* Geolocation Card */}
        <Card className="lg:col-span-1 bg-[#161b2a] border border-slate-800 rounded-[2rem] md:rounded-[3rem] p-6 lg:p-10 overflow-hidden relative shadow-2xl h-fit">
          <div className="p-6 bg-blue-600 rounded-[1.5rem] w-fit mb-6 md:mb-8 shadow-xl shadow-blue-600/20">
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
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
        </Card>

        {/* Settings Form */}
        <Card className="lg:col-span-2 bg-[#161b2a] border border-slate-800 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 overflow-hidden relative shadow-2xl h-full flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-12 relative z-10">
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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Main Command HQ"
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Occupant Count</label>
              <input
                type="number" min="1" max="20"
                className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic"
                value={formData.occupants}
                onChange={(e) => setFormData({ ...formData, occupants: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="flex flex-col gap-3">
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Structure Type</label>
              <select
                className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic"
                value={formData.houseType}
                onChange={(e) => setFormData({ ...formData, houseType: e.target.value })}
              >
                <option value="apartment">Apartment Complex</option>
                <option value="house">Bungalow / Detached</option>
                <option value="rural_home">Rural / Farm Home</option>
                <option value="boarding_house">Boarding / Shared House</option>
              </select>
            </div>
            <div className="flex flex-col gap-3 md:col-span-2">
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Coordinate Mapping (lat, lon)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <input
                  className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic"
                  type="number" step="0.0001"
                  value={formData.location.latitude}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location, latitude: parseFloat(e.target.value) } })}
                />
                <input
                  className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic"
                  type="number" step="0.0001"
                  value={formData.location.longitude}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location, longitude: parseFloat(e.target.value) } })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 md:col-span-2">
              <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Physical Address</label>
              <textarea
                className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 h-32 focus:outline-none focus:border-blue-500/50 transition-all font-bold text-sm italic resize-none"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter structural coordinates..."
              />
            </div>
            <div className="md:col-span-2 flex justify-end pt-8">
              <Button
                type="submit" disabled={isSaving}
                className="h-16 px-12 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-blue-600/20 border-none flex items-center gap-4 transition-all"
              >
                {isSaving ? "Synchronizing..." : profile?._id === "new" ? "Add Household" : "Update Household"}
                <Save size={16} />
              </Button>
            </div>
          </form>

          <AnimatePresence>
            {feedback.message && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className={`mt-8 p-6 rounded-[2rem] border text-[10px] font-black uppercase tracking-widest text-center shadow-2xl ${
                  feedback.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    : "bg-red-500/10 border-red-500/20 text-red-500"
                }`}
              >
                {feedback.type === "success"
                  ? <CheckCircle2 className="mx-auto mb-3" size={24} />
                  : <AlertTriangle className="mx-auto mb-3" size={24} />}
                {feedback.message}
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      {profile && profile._id !== "new" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10 max-w-7xl mx-auto mt-8 md:mt-10">

          {/* Budget Form — create or edit */}
          <Card id="budget-form" className="lg:col-span-1 bg-[#161b2a] border border-slate-800 rounded-[2rem] md:rounded-[3rem] p-6 lg:p-10 overflow-hidden relative shadow-2xl h-fit">
            <div className={`p-6 rounded-[1.5rem] w-fit mb-6 shadow-xl ${editingBudget ? "bg-amber-500 shadow-amber-500/20" : "bg-emerald-600 shadow-emerald-600/20"}`}>
              <DollarSign size={32} className="text-white" />
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                {editingBudget ? "Edit Budget" : "Set Budget"}
              </h3>
              {editingBudget && (
                <button
                  onClick={handleCancelEdit}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Edit mode banner */}
            {editingBudget && (
              <div className="mb-6 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[9px] text-amber-500 font-black uppercase tracking-widest">
                Editing: {new Date(editingBudget.startDate).toLocaleString("default", { month: "long", year: "numeric" })}
              </div>
            )}

            <p className="text-slate-500 text-sm font-bold tracking-tight italic mb-8 leading-relaxed">
              {editingBudget
                ? "Modify the selected budget entry and resynchronize."
                : "Define your monthly limit. The AI will monitor your consumption against this threshold."}
            </p>

            <form onSubmit={handleSaveBudget} className="space-y-6 relative z-10">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Month</label>
                  <input
                    type="number" min="1" max="12" required
                    className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-emerald-500/50 transition-all font-bold text-sm italic"
                    value={budgetForm.month}
                    onChange={(e) => setBudgetForm({ ...budgetForm, month: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Year</label>
                  <input
                    type="number" min="2020" max="2050" required
                    className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-emerald-500/50 transition-all font-bold text-sm italic"
                    value={budgetForm.year}
                    onChange={(e) => setBudgetForm({ ...budgetForm, year: e.target.value })}
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
                  onChange={(e) => setBudgetForm({ ...budgetForm, targetAmount: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Alert Usage %</label>
                  <input
                    type="number" min="1" max="100"
                    className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-emerald-500/50 transition-all font-bold text-sm italic"
                    value={budgetForm.percentageThreshold}
                    placeholder="80"
                    onChange={(e) => setBudgetForm({ ...budgetForm, percentageThreshold: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] ml-1">Alert Bill (LKR) [Opt]</label>
                  <input
                    type="number" min="0"
                    className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl p-4 focus:outline-none focus:border-emerald-500/50 transition-all font-bold text-sm italic"
                    value={budgetForm.billThreshold}
                    placeholder="Optional"
                    onChange={(e) => setBudgetForm({ ...budgetForm, billThreshold: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className={`flex-1 h-14 text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] border-none transition-all shadow-xl ${
                    editingBudget
                      ? "bg-amber-500 hover:bg-amber-400 shadow-amber-500/20"
                      : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                  }`}
                >
                  {editingBudget ? "Update Budget" : "Synchronize Budget"}
                </Button>
                {editingBudget && (
                  <Button
                    type="button"
                    onClick={handleCancelEdit}
                    className="h-14 px-6 bg-slate-800 hover:bg-slate-700 text-slate-400 font-black rounded-2xl text-[10px] uppercase tracking-widest border-none"
                  >
                    Cancel
                  </Button>
                )}
              </div>

              {budgetFeedback.message && (
                <div className={`p-4 rounded-2xl border text-[9px] font-black uppercase tracking-widest text-center ${
                  budgetFeedback.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    : "bg-red-500/10 border-red-500/20 text-red-500"
                }`}>
                  {budgetFeedback.message}
                </div>
              )}
            </form>
          </Card>

          {/* Budget List */}
          <Card className="lg:col-span-2 bg-[#161b2a] border border-slate-800 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 overflow-hidden relative shadow-2xl h-full flex flex-col">
            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8">Historical Budgets</h3>
            <div className="space-y-4 overflow-y-auto pr-4 max-h-[400px] custom-scrollbar">
              {budgets.length === 0 ? (
                <div className="p-8 border border-slate-800 border-dashed rounded-[2rem] text-center">
                  <p className="text-slate-500 text-sm font-bold italic">No targets defined in telemetry.</p>
                </div>
              ) : (
                budgets.map((budget) => {
                  const startDate = new Date(budget.startDate || budget.createdAt || new Date());
                  const isBudgetPlan = !!budget.monthlyLimit;
                  const bYear = isBudgetPlan ? startDate.getFullYear() : budget.year || 2024;
                  const bMonth = isBudgetPlan
                    ? startDate.toLocaleString("default", { month: "short" })
                    : new Date(bYear, (budget.month || 1) - 1).toLocaleString("default", { month: "short" });
                  const displayLimit = isBudgetPlan ? budget.monthlyLimit : budget.targetAmount;
                  const isBeingEdited = editingBudget?._id === budget._id;

                  return (
                    <div
                      key={budget._id}
                      className={cn(
                        "flex items-center justify-between p-6 bg-[#0b0e14] rounded-[2rem] border transition-all",
                        isBeingEdited
                          ? "border-amber-500/40 shadow-lg shadow-amber-500/10"
                          : "border-slate-800 hover:border-slate-700"
                      )}
                    >
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-16 h-16 rounded-[1.5rem] border flex flex-col items-center justify-center",
                          isBeingEdited
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                        )}>
                          <span className="text-[10px] font-black uppercase tracking-widest">{bMonth}</span>
                          <span className="font-bold text-sm">{bYear}</span>
                        </div>
                        <div>
                          <div className="text-2xl font-black text-white tracking-tighter italic">LKR {displayLimit}</div>
                          <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">
                            {isBudgetPlan && budget.alertThresholds?.percentageOfBudget
                              ? `Alerts @ ${budget.alertThresholds.percentageOfBudget}%`
                              : "Confirmed Target"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Edit button */}
                        <button
                          onClick={() => handleEditBudget(budget)}
                          className={cn(
                            "p-4 rounded-[1.2rem] transition-colors",
                            isBeingEdited
                              ? "bg-amber-500 text-white"
                              : "bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white"
                          )}
                        >
                          <Pencil size={18} />
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteBudget(budget._id)}
                          className="p-4 bg-red-500/10 text-red-500 rounded-[1.2rem] hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Household;
