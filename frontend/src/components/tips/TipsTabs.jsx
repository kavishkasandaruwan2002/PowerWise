import React from 'react';
import { cn } from '../ui';

const tabs = [
  { id: 'recommended', label: 'Recommended Tips' },
  { id: 'my-tips', label: 'My Tips' },
];

const TipsTabs = ({ activeTab, onChange }) => {
  return (
    <div className="inline-flex bg-[#161b2a] border border-slate-800 rounded-2xl p-1.5 shadow-2xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-6 py-3 rounded-[1rem] text-[10px] font-black uppercase tracking-[0.24em] transition-all',
            activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-200'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TipsTabs;
