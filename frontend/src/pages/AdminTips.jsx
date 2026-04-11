import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Settings2, X } from 'lucide-react';
import { Button } from '../components/ui';
import AdminTipForm from '../components/tips/AdminTipForm';
import AdminTipTable from '../components/tips/AdminTipTable';
import { listAdminTips, createAdminTip, updateAdminTip, deactivateAdminTip } from '../services/tipsService';

const AdminTips = () => {
  const [tips, setTips] = useState([]);
  const [selectedTip, setSelectedTip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyAction, setBusyAction] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState({ q: '', category: 'all', isActive: 'all' });

  const fetchTips = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {
        q: filters.q,
        category: filters.category !== 'all' ? filters.category : undefined,
        isActive: filters.isActive !== 'all' ? filters.isActive : undefined,
        limit: 100,
      };
      const res = await listAdminTips(params);
      setTips(res?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tip library.');
    } finally {
      setLoading(false);
    }
  }, [filters.q, filters.category, filters.isActive]);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  const categoryOptions = useMemo(() => Array.from(new Set(tips.map((tip) => tip.category).filter(Boolean))), [tips]);

  const closeModal = () => {
    setModalOpen(false);
    setSelectedTip(null);
  };

  const handleOpenCreate = () => {
    setSelectedTip(null);
    setModalOpen(true);
  };

  const handleEdit = (tip) => {
    setSelectedTip(tip);
    setModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    try {
      setSubmitting(true);
      setError('');
      setMessage('');

      if (selectedTip?._id) {
        await updateAdminTip(selectedTip._id, payload);
        setMessage('Energy tip updated successfully.');
      } else {
        await createAdminTip(payload);
        setMessage('Energy tip created successfully.');
      }

      closeModal();
      await fetchTips();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save tip.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (tipId) => {
    try {
      setBusyAction(`${tipId}-deactivate`);
      setError('');
      setMessage('');
      await deactivateAdminTip(tipId);
      setMessage('Energy tip deactivated successfully.');
      if (selectedTip?._id === tipId) closeModal();
      await fetchTips();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to deactivate tip.');
    } finally {
      setBusyAction('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] p-8 pb-24">
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-5">
          <Settings2 size={14} />
          Admin Tip Management
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
              Tip <span className="text-blue-500">Management</span>
            </h1>
            <p className="text-slate-500 font-bold mt-3">Create, update and deactivate recommendations in the tip library.</p>
          </div>
          <Button
            type="button"
            onClick={handleOpenCreate}
            className="!rounded-2xl !text-[10px] !uppercase !tracking-[0.18em] bg-blue-600 hover:bg-blue-500 text-white border-none"
          >
            <Plus size={16} className="mr-2" />
            Create Tip
          </Button>
        </div>
      </header>

      <div className="space-y-6">
        <div className="rounded-[2rem] border border-slate-800 bg-[#161b2a] p-6 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <input
              value={filters.q}
              onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
              placeholder="Search title or description"
              className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl px-4 py-3.5 font-bold text-sm focus:outline-none focus:border-blue-500/40"
            />
            <select
              value={filters.category}
              onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
              className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl px-4 py-3.5 font-bold text-sm focus:outline-none focus:border-blue-500/40"
            >
              <option value="all">All categories</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select
              value={filters.isActive}
              onChange={(e) => setFilters((prev) => ({ ...prev, isActive: e.target.value }))}
              className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl px-4 py-3.5 font-bold text-sm focus:outline-none focus:border-blue-500/40"
            >
              <option value="all">All statuses</option>
              <option value="true">Active only</option>
              <option value="false">Inactive only</option>
            </select>
          </div>
        </div>

        {message && <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400 font-bold">{message}</div>}
        {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 font-bold">{error}</div>}

        {loading ? (
          <div className="rounded-[2rem] border border-slate-800 bg-[#161b2a] p-10 animate-pulse h-64" />
        ) : (
          <AdminTipTable
            tips={tips}
            onEdit={handleEdit}
            onDeactivate={handleDeactivate}
            busyAction={busyAction}
          />
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm p-4 md:p-8 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="max-w-5xl mx-auto mt-4 md:mt-8"
            >
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-3 rounded-2xl bg-[#161b2a] border border-slate-800 text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <AdminTipForm
                key={selectedTip?._id || selectedTip?.id || 'new'}
                selectedTip={selectedTip}
                onSubmit={handleSubmit}
                onCancel={closeModal}
                submitting={submitting}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminTips;
