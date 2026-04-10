import React, { useState } from 'react';
import { Lightbulb, TrendingDown, DollarSign, Bookmark, CheckCircle2, ThumbsUp, ThumbsDown, MinusCircle, Clock3 } from 'lucide-react';
import { Badge, Button, Card, cn } from '../ui';

const formatEffort = (effortLevel) => {
  switch (effortLevel) {
    case 'ZERO_COST':
      return 'Zero Cost';
    case 'LOW_COST':
      return 'Low Cost';
    case 'INVESTMENT':
      return 'Investment';
    default:
      return 'Unknown';
  }
};

const RecommendationTipCard = ({ item, onBookmarkToggle, onImplement, onFeedback, onDismiss, busyAction }) => {
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const tipId = item?.tip?._id;
  const isBookmarked = !!item?.interaction?.bookmarked;
  const isImplemented = !!item?.interaction?.implemented;

  return (
    <Card className="bg-[#161b2a] border border-slate-800 rounded-[2.5rem] p-8 md:p-10 overflow-hidden relative shadow-2xl h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 mb-7 relative z-10">
        <div className="flex items-start gap-4">
          <div className="p-4 bg-blue-600/10 text-blue-500 rounded-[1.5rem] border border-blue-500/20 shadow-xl shadow-blue-500/5">
            <Lightbulb size={26} className="fill-blue-500/10" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="info" className="bg-blue-500/10 text-blue-500 border-none rounded-xl text-[8px] px-3 py-1 uppercase tracking-widest">
                {item?.tip?.category}
              </Badge>
              <Badge variant="neutral" className="rounded-xl text-[8px] px-3 py-1 uppercase tracking-widest">
                {formatEffort(item?.tip?.effortLevel)}
              </Badge>
              {isImplemented && (
                <Badge variant="info" className="bg-emerald-500/10 text-emerald-400 border-none rounded-xl text-[8px] px-3 py-1 uppercase tracking-widest">
                  Implemented
                </Badge>
              )}
            </div>
            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">
              {item?.tip?.title}
            </h3>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="flex items-center gap-2 text-emerald-400 font-black text-sm italic">
            <TrendingDown size={16} />
            {Number(item?.estimatedSavings?.kwhMonthly || 0).toFixed(2)} kWh/month
          </div>
          <div className="flex items-center gap-2 text-blue-400 font-black text-sm italic">
            <DollarSign size={16} />
            {item?.estimatedSavings?.lkrMonthly != null ? `LKR ${Number(item.estimatedSavings.lkrMonthly).toFixed(2)}` : 'LKR unavailable'}
          </div>
          <span className="text-[10px] text-slate-600 uppercase font-black tracking-widest">Relevance {Math.round(item?.relevanceScore || 0)}%</span>
        </div>
      </div>

      <p className="text-slate-400 text-sm font-bold tracking-tight mb-6 leading-relaxed relative z-10">
        {item?.tip?.description}
      </p>

      <div className="rounded-[2rem] border border-slate-800 bg-[#0b0e14] p-5 mb-6 relative z-10">
        <p className="text-[10px] text-slate-500 uppercase tracking-[0.25em] font-black mb-3">Why this is recommended</p>
        <p className="text-sm text-slate-300 font-bold leading-relaxed">{item?.explanation || 'Recommendation based on your household usage profile.'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 relative z-10">
        <div className="rounded-2xl border border-slate-800 bg-[#0b0e14] p-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mb-2">Estimated baseline</p>
          <p className="text-white font-black tracking-tight">{Number(item?.baseline?.kwhMonthly || 0).toFixed(2)} kWh/month</p>
          <p className="text-slate-500 text-xs font-bold mt-1">
            {item?.baseline?.billLkr != null ? `Approx. LKR ${Number(item.baseline.billLkr).toFixed(2)}` : 'Bill estimate unavailable'}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-[#0b0e14] p-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mb-2">Current interaction</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant={isBookmarked ? 'info' : 'neutral'}>{isBookmarked ? 'Bookmarked' : 'Not bookmarked'}</Badge>
            <Badge variant={isImplemented ? 'info' : 'neutral'}>{isImplemented ? 'Implemented' : 'Not implemented'}</Badge>
            <Badge variant="neutral">{item?.interaction?.feedback || 'No feedback'}</Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-auto relative z-10">
        <Button
          onClick={() => onBookmarkToggle(item)}
          disabled={busyAction === `${tipId}-bookmark`}
          className="bg-[#0b0e14] hover:bg-slate-900 text-white border border-slate-800 font-black px-5 h-12 rounded-2xl text-[10px] uppercase tracking-[0.18em] shadow-none"
        >
          <Bookmark size={14} className={cn('mr-2', isBookmarked && 'fill-current')} />
          {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
        </Button>

        <Button
          onClick={() => onImplement(tipId)}
          disabled={busyAction === `${tipId}-implement` || isImplemented}
          className="bg-blue-600 hover:bg-blue-500 text-white font-black px-5 h-12 rounded-2xl text-[10px] uppercase tracking-[0.18em] shadow-xl shadow-blue-600/20 border-none"
        >
          <CheckCircle2 size={14} className="mr-2" />
          {isImplemented ? 'Implemented' : 'Mark Implemented'}
        </Button>

        <Button
          onClick={() => onDismiss(tipId)}
          disabled={busyAction === `${tipId}-dismiss`}
          className="bg-[#0b0e14] hover:bg-slate-900 text-white border border-slate-800 font-black px-5 h-12 rounded-2xl text-[10px] uppercase tracking-[0.18em] shadow-none"
        >
          <Clock3 size={14} className="mr-2" />
          Dismiss 14 Days
        </Button>
      </div>

      <div className="mt-5 relative z-10">
        <button
          type="button"
          onClick={() => setShowFeedback((prev) => !prev)}
          className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-slate-300"
        >
          {showFeedback ? 'Hide feedback controls' : 'Give feedback'}
        </button>

        {showFeedback && (
          <div className="mt-4 rounded-[2rem] border border-slate-800 bg-[#0b0e14] p-5">
            <textarea
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              placeholder="Optional comment"
              className="w-full bg-transparent border border-slate-800 text-white rounded-2xl p-4 h-24 focus:outline-none focus:border-blue-500/40 font-bold text-sm resize-none"
            />
            <div className="flex flex-wrap gap-3 mt-4">
              <Button
                onClick={() => onFeedback(tipId, { rating: 'HELPFUL', comment: feedbackComment })}
                disabled={busyAction === `${tipId}-feedback`}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-5 h-11 rounded-2xl text-[10px] uppercase tracking-[0.16em]"
              >
                <ThumbsUp size={14} className="mr-2" /> Helpful
              </Button>
              <Button
                onClick={() => onFeedback(tipId, { rating: 'NEUTRAL', comment: feedbackComment })}
                disabled={busyAction === `${tipId}-feedback`}
                className="bg-amber-500 hover:bg-amber-400 text-black font-black px-5 h-11 rounded-2xl text-[10px] uppercase tracking-[0.16em]"
              >
                <MinusCircle size={14} className="mr-2" /> Neutral
              </Button>
              <Button
                onClick={() => onFeedback(tipId, { rating: 'NOT_HELPFUL', comment: feedbackComment })}
                disabled={busyAction === `${tipId}-feedback`}
                className="bg-red-600 hover:bg-red-500 text-white font-black px-5 h-11 rounded-2xl text-[10px] uppercase tracking-[0.16em]"
              >
                <ThumbsDown size={14} className="mr-2" /> Not Helpful
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/[0.02] blur-[80px] rounded-full" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-emerald-600/[0.02] blur-[80px] rounded-full" />
    </Card>
  );
};

export default RecommendationTipCard;
