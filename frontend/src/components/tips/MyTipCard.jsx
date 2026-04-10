import React from 'react';
import { Bookmark, CheckCircle2, CalendarClock, DollarSign, TrendingDown, MessageSquareText } from 'lucide-react';
import { Badge, Button, Card } from '../ui';

const formatDate = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return '—';
  }
};

const MyTipCard = ({ item, onUnbookmark, onImplement, onRefresh, busyAction }) => {
  const tip = typeof item?.tipId === 'object' ? item.tipId : null;
  const tipId = tip?._id || item?.tipId;

  return (
    <Card className="bg-[#161b2a] border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl h-full flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="info">{tip?.category || 'Tip'}</Badge>
            {item?.bookmarked && <Badge variant="info">Bookmarked</Badge>}
            {item?.implemented && <Badge variant="info" className="bg-emerald-500/10 text-emerald-400">Implemented</Badge>}
          </div>
          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">
            {tip?.title || 'Unavailable tip'}
          </h3>
          <p className="text-slate-400 text-sm font-bold mt-3 leading-relaxed">
            {tip?.description || 'This tip record exists in your interaction history.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-slate-800 bg-[#0b0e14] p-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mb-2">Feedback</p>
          <div className="flex items-center gap-2 text-white font-black">
            <MessageSquareText size={16} className="text-blue-500" />
            {item?.feedback?.rating || 'No feedback yet'}
          </div>
          {item?.feedback?.comment && (
            <p className="text-slate-500 text-sm font-bold mt-2">{item.feedback.comment}</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0b0e14] p-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mb-2">Timeline</p>
          <div className="space-y-2 text-sm font-bold text-slate-300">
            <p>Implemented: {formatDate(item?.implementedAt)}</p>
            <p>Dismissed until: {formatDate(item?.dismissedUntil)}</p>
          </div>
        </div>
      </div>

      {item?.savingsSnapshot && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-slate-800 bg-[#0b0e14] p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mb-2">Saved estimate</p>
            <div className="flex items-center gap-2 text-emerald-400 font-black">
              <TrendingDown size={16} /> {Number(item.savingsSnapshot.kwhMonthly || 0).toFixed(2)} kWh/month
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-[#0b0e14] p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mb-2">Bill estimate</p>
            <div className="flex items-center gap-2 text-blue-400 font-black">
              <DollarSign size={16} />
              {item.savingsSnapshot.lkrMonthly != null ? `LKR ${Number(item.savingsSnapshot.lkrMonthly).toFixed(2)}` : 'LKR unavailable'}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mt-auto">
        {item?.bookmarked && (
          <Button
            onClick={() => onUnbookmark(tipId)}
            disabled={busyAction === `${tipId}-unbookmark`}
            className="bg-[#0b0e14] hover:bg-slate-900 text-white border border-slate-800 font-black px-5 h-11 rounded-2xl text-[10px] uppercase tracking-[0.18em]"
          >
            <Bookmark size={14} className="mr-2 fill-current" /> Remove Bookmark
          </Button>
        )}

        {!item?.implemented && (
          <Button
            onClick={() => onImplement(tipId)}
            disabled={busyAction === `${tipId}-implement`}
            className="bg-blue-600 hover:bg-blue-500 text-white font-black px-5 h-11 rounded-2xl text-[10px] uppercase tracking-[0.18em]"
          >
            <CheckCircle2 size={14} className="mr-2" /> Mark Implemented
          </Button>
        )}

        <Button
          onClick={onRefresh}
          className="bg-[#0b0e14] hover:bg-slate-900 text-white border border-slate-800 font-black px-5 h-11 rounded-2xl text-[10px] uppercase tracking-[0.18em]"
        >
          <CalendarClock size={14} className="mr-2" /> Refresh List
        </Button>
      </div>
    </Card>
  );
};

export default MyTipCard;
