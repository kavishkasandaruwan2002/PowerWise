import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../ui';

const CATEGORY_OPTIONS = ['Cooling', 'Lighting', 'Cooking', 'Standby', 'Entertainment', 'Other', 'General'];
const INCOME_OPTIONS = ['LOW', 'MID', 'HIGH', 'ALL'];
const WEATHER_OPTIONS = ['HOT', 'RAINY', 'NORMAL', 'ALL'];
const TIME_OPTIONS = ['DAY', 'NIGHT', 'PEAK', 'ALL'];
const EFFORT_OPTIONS = ['ZERO_COST', 'LOW_COST', 'INVESTMENT'];
const SAVINGS_TYPES = ['PERCENT_OF_CATEGORY', 'FIXED_KWH', 'REDUCE_HOURS', 'STANDBY_OFF'];

const toCsv = (arr = []) => arr.join(', ');
const fromCsv = (value = '') => value.split(',').map((item) => item.trim()).filter(Boolean);

const getInitialForm = () => ({
  title: '',
  description: '',
  category: 'General',
  requiredApplianceKeywords: '',
  requiredCategories: '',
  incomeTags: 'ALL',
  weatherTags: 'ALL',
  timeTags: 'ALL',
  effortLevel: 'ZERO_COST',
  savingsModelType: 'PERCENT_OF_CATEGORY',
  percent: 5,
  fixedKWhMonthly: '',
  reduceHoursPerDay: '',
  applianceKeyword: '',
  isActive: true,
});

const AdminTipForm = ({ selectedTip, onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState(getInitialForm());

  useEffect(() => {
    if (!selectedTip) {
      setForm(getInitialForm());
      return;
    }

    setForm({
      title: selectedTip.title || '',
      description: selectedTip.description || '',
      category: selectedTip.category || 'General',
      requiredApplianceKeywords: toCsv(selectedTip.requiredApplianceKeywords || []),
      requiredCategories: toCsv(selectedTip.requiredCategories || []),
      incomeTags: toCsv(selectedTip.incomeTags || ['ALL']),
      weatherTags: toCsv(selectedTip.weatherTags || ['ALL']),
      timeTags: toCsv(selectedTip.timeTags || ['ALL']),
      effortLevel: selectedTip.effortLevel || 'ZERO_COST',
      savingsModelType: selectedTip.savingsModel?.type || 'PERCENT_OF_CATEGORY',
      percent: selectedTip.savingsModel?.percent ?? 5,
      fixedKWhMonthly: selectedTip.savingsModel?.fixedKWhMonthly ?? '',
      reduceHoursPerDay: selectedTip.savingsModel?.reduceHoursPerDay ?? '',
      applianceKeyword: selectedTip.savingsModel?.applianceKeyword || '',
      isActive: selectedTip.isActive ?? true,
    });
  }, [selectedTip]);

  const titleLabel = useMemo(() => (selectedTip ? 'Edit Energy Tip' : 'Create Energy Tip'), [selectedTip]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      requiredApplianceKeywords: fromCsv(form.requiredApplianceKeywords),
      requiredCategories: fromCsv(form.requiredCategories),
      incomeTags: fromCsv(form.incomeTags),
      weatherTags: fromCsv(form.weatherTags),
      timeTags: fromCsv(form.timeTags),
      effortLevel: form.effortLevel,
      savingsModel: {
        type: form.savingsModelType,
      },
      isActive: !!form.isActive,
    };

    if (form.savingsModelType === 'PERCENT_OF_CATEGORY' || form.savingsModelType === 'STANDBY_OFF') {
      payload.savingsModel.percent = Number(form.percent || 0);
    }

    if (form.savingsModelType === 'FIXED_KWH') {
      payload.savingsModel.fixedKWhMonthly = Number(form.fixedKWhMonthly || 0);
    }

    if (form.savingsModelType === 'REDUCE_HOURS') {
      payload.savingsModel.reduceHoursPerDay = Number(form.reduceHoursPerDay || 0);
      if (form.applianceKeyword.trim()) payload.savingsModel.applianceKeyword = form.applianceKeyword.trim();
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-slate-800 bg-[#161b2a] p-6 md:p-8 shadow-2xl">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tighter">{titleLabel}</h2>
          <p className="text-slate-500 font-bold text-sm mt-1">Use this form to manage the admin tip library.</p>
        </div>
        {selectedTip && (
          <Button type="button" variant="secondary" onClick={onCancel} className="!rounded-2xl !text-[10px] !uppercase !tracking-[0.18em]">
            Clear Edit
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-[10px] text-slate-500 uppercase tracking-[0.22em] font-black mb-2">Title</label>
          <input value={form.title} onChange={(e) => handleChange('title', e.target.value)} required className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl px-4 py-3.5 font-bold text-sm focus:outline-none focus:border-blue-500/40" />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[10px] text-slate-500 uppercase tracking-[0.22em] font-black mb-2">Description</label>
          <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} required className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl px-4 py-3.5 h-28 font-bold text-sm focus:outline-none focus:border-blue-500/40 resize-none" />
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-[0.22em] font-black mb-2">Category</label>
          <select value={form.category} onChange={(e) => handleChange('category', e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl px-4 py-3.5 font-bold text-sm focus:outline-none focus:border-blue-500/40">
            {CATEGORY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-[0.22em] font-black mb-2">Effort Level</label>
          <select value={form.effortLevel} onChange={(e) => handleChange('effortLevel', e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl px-4 py-3.5 font-bold text-sm focus:outline-none focus:border-blue-500/40">
            {EFFORT_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-[0.22em] font-black mb-2">Required appliance keywords</label>
          <input value={form.requiredApplianceKeywords} onChange={(e) => handleChange('requiredApplianceKeywords', e.target.value)} placeholder="ac, fan, tv" className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl px-4 py-3.5 font-bold text-sm focus:outline-none focus:border-blue-500/40" />
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-[0.22em] font-black mb-2">Required categories</label>
          <input value={form.requiredCategories} onChange={(e) => handleChange('requiredCategories', e.target.value)} placeholder="Cooling, Standby" className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl px-4 py-3.5 font-bold text-sm focus:outline-none focus:border-blue-500/40" />
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-[0.22em] font-black mb-2">Income tags</label>
          <input value={form.incomeTags} onChange={(e) => handleChange('incomeTags', e.target.value)} placeholder={INCOME_OPTIONS.join(', ')} className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl px-4 py-3.5 font-bold text-sm focus:outline-none focus:border-blue-500/40" />
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-[0.22em] font-black mb-2">Weather tags</label>
          <input value={form.weatherTags} onChange={(e) => handleChange('weatherTags', e.target.value)} placeholder={WEATHER_OPTIONS.join(', ')} className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl px-4 py-3.5 font-bold text-sm focus:outline-none focus:border-blue-500/40" />
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-[0.22em] font-black mb-2">Time tags</label>
          <input value={form.timeTags} onChange={(e) => handleChange('timeTags', e.target.value)} placeholder={TIME_OPTIONS.join(', ')} className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl px-4 py-3.5 font-bold text-sm focus:outline-none focus:border-blue-500/40" />
        </div>

        <div>
          <label className="block text-[10px] text-slate-500 uppercase tracking-[0.22em] font-black mb-2">Savings model type</label>
          <select value={form.savingsModelType} onChange={(e) => handleChange('savingsModelType', e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl px-4 py-3.5 font-bold text-sm focus:outline-none focus:border-blue-500/40">
            {SAVINGS_TYPES.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>

        {(form.savingsModelType === 'PERCENT_OF_CATEGORY' || form.savingsModelType === 'STANDBY_OFF') && (
          <div>
            <label className="block text-[10px] text-slate-500 uppercase tracking-[0.22em] font-black mb-2">Percent</label>
            <input type="number" value={form.percent} onChange={(e) => handleChange('percent', e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl px-4 py-3.5 font-bold text-sm focus:outline-none focus:border-blue-500/40" />
          </div>
        )}

        {form.savingsModelType === 'FIXED_KWH' && (
          <div>
            <label className="block text-[10px] text-slate-500 uppercase tracking-[0.22em] font-black mb-2">Fixed kWh monthly</label>
            <input type="number" value={form.fixedKWhMonthly} onChange={(e) => handleChange('fixedKWhMonthly', e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl px-4 py-3.5 font-bold text-sm focus:outline-none focus:border-blue-500/40" />
          </div>
        )}

        {form.savingsModelType === 'REDUCE_HOURS' && (
          <>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-[0.22em] font-black mb-2">Reduce hours per day</label>
              <input type="number" value={form.reduceHoursPerDay} onChange={(e) => handleChange('reduceHoursPerDay', e.target.value)} className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl px-4 py-3.5 font-bold text-sm focus:outline-none focus:border-blue-500/40" />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 uppercase tracking-[0.22em] font-black mb-2">Appliance keyword</label>
              <input value={form.applianceKeyword} onChange={(e) => handleChange('applianceKeyword', e.target.value)} placeholder="fan" className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl px-4 py-3.5 font-bold text-sm focus:outline-none focus:border-blue-500/40" />
            </div>
          </>
        )}

        <label className="flex items-center gap-3 text-sm font-bold text-slate-300 mt-2">
          <input type="checkbox" checked={form.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} />
          Tip is active
        </label>
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        <Button type="submit" disabled={submitting} className="!rounded-2xl !text-[10px] !uppercase !tracking-[0.18em] bg-blue-600 hover:bg-blue-500 text-white border-none">
          {submitting ? 'Saving...' : selectedTip ? 'Update Tip' : 'Create Tip'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="!rounded-2xl !text-[10px] !uppercase !tracking-[0.18em]">
          Reset Form
        </Button>
      </div>
    </form>
  );
};

export default AdminTipForm;
