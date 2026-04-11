import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { cn } from '../ui';

const TipFilters = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  categories,
  showBookmarkedOnly,
  onToggleBookmarked,
  showImplementedOnly,
  onToggleImplemented,
  sortBy,
  onSortByChange,
}) => {
  return (
    <div className="rounded-[2rem] border border-slate-800 bg-[#161b2a] p-5 md:p-6 shadow-2xl">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-3 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-500">
          <SlidersHorizontal size={18} />
        </div>
        <div>
          <h3 className="text-white font-black tracking-tight">Filter Tips</h3>
          <p className="text-slate-500 text-sm font-bold">Search and narrow down recommendations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <div className="xl:col-span-2 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by title, category or description"
            className="w-full bg-[#0b0e14] border border-slate-800 text-white rounded-2xl py-3.5 pl-12 pr-4 font-bold text-sm focus:outline-none focus:border-blue-500/40"
          />
        </div>

        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl px-4 py-3.5 font-bold text-sm focus:outline-none focus:border-blue-500/40"
        >
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="bg-[#0b0e14] border border-slate-800 text-white rounded-2xl px-4 py-3.5 font-bold text-sm focus:outline-none focus:border-blue-500/40"
        >
          <option value="relevance">Sort by relevance</option>
          <option value="savings">Sort by savings</option>
          <option value="title">Sort by title</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-5">
        <button
          type="button"
          onClick={() => onToggleBookmarked(!showBookmarkedOnly)}
          className={cn(
            'px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border',
            showBookmarkedOnly
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-[#0b0e14] text-slate-400 border-slate-800 hover:text-white'
          )}
        >
          Bookmarked only
        </button>
        <button
          type="button"
          onClick={() => onToggleImplemented(!showImplementedOnly)}
          className={cn(
            'px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border',
            showImplementedOnly
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-[#0b0e14] text-slate-400 border-slate-800 hover:text-white'
          )}
        >
          Implemented only
        </button>
      </div>
    </div>
  );
};

export default TipFilters;
