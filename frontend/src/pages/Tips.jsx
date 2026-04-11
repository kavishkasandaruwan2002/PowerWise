import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, RefreshCcw } from 'lucide-react';
import TipsTabs from '../components/tips/TipsTabs';
import TipFilters from '../components/tips/TipFilters';
import RecommendationTipCard from '../components/tips/RecommendationTipCard';
import MyTipCard from '../components/tips/MyTipCard';
import {
  bookmarkTip,
  dismissTip,
  feedbackTip,
  getAllTips,
  getInteractions,
  getRecommendations,
  implementTip,
  unbookmarkTip,
} from '../services/tipsService';
import { Button } from '../components/ui';

const Tips = () => {
  const [activeTab, setActiveTab] = useState('recommended');
  const [recommendations, setRecommendations] = useState([]);
  const [allTips, setAllTips] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [loadingInteractions, setLoadingInteractions] = useState(true);
  const [loadingAllTips, setLoadingAllTips] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [showImplementedOnly, setShowImplementedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  const fetchRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      setError('');
      const res = await getRecommendations({ limit: 12 });
      setRecommendations(res?.data?.recommendations || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load personalized tips.');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const fetchAllTips = async () => {
  try {
    setLoadingAllTips(true);
    setError('');

    const res = await getAllTips();

    const normalizedTips = (res?.data || []).map((item) => ({
      ...item,
      explanation: 'All active tips available for your account. Dismissed tips are hidden.',
      relevanceScore: 0,
      estimatedSavings: {
        kwhMonthly: item?.interaction?.savingsSnapshot?.kwhMonthly ?? 0,
        lkrMonthly: item?.interaction?.savingsSnapshot?.lkrMonthly ?? null,
      },
      baseline: {
        kwhMonthly: item?.interaction?.savingsSnapshot?.baselineKwhMonthly ?? null,
        billLkr: item?.interaction?.savingsSnapshot?.baselineBillLkr ?? null,
      },
    }));

    setAllTips(normalizedTips);
  } catch (err) {
    setError(err.response?.data?.message || 'Failed to load all active tips.');
  } finally {
    setLoadingAllTips(false);
  }
  };

  const fetchInteractions = async () => {
    try {
      setLoadingInteractions(true);
      const res = await getInteractions();
      setInteractions(res?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your tip interactions.');
    } finally {
      setLoadingInteractions(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
    fetchAllTips();
    fetchInteractions();
  }, []);

  const categoryOptions = useMemo(() => {
    let source = [];

    if (activeTab === 'recommended') {
      source = recommendations.map((item) => item?.tip?.category);
    } else if (activeTab === 'all-tips') {
      source = allTips.map((item) => item?.tip?.category);
    } else {
      source = interactions.map((item) =>
        typeof item?.tipId === 'object' ? item.tipId?.category : null
      );
    }

    return Array.from(new Set(source.filter(Boolean)));
  }, [activeTab, recommendations, allTips, interactions]);

  const filteredRecommendations = useMemo(() => {
    const term = search.trim().toLowerCase();
    let items = [...recommendations];

    if (term) {
      items = items.filter((item) => {
        const title = item?.tip?.title?.toLowerCase() || '';
        const description = item?.tip?.description?.toLowerCase() || '';
        const cat = item?.tip?.category?.toLowerCase() || '';
        const explanation = item?.explanation?.toLowerCase() || '';
        return title.includes(term) || description.includes(term) || cat.includes(term) || explanation.includes(term);
      });
    }

    if (category !== 'all') {
      items = items.filter((item) => item?.tip?.category === category);
    }

    if (showBookmarkedOnly) {
      items = items.filter((item) => !!item?.interaction?.bookmarked);
    }

    if (showImplementedOnly) {
      items = items.filter((item) => !!item?.interaction?.implemented);
    }

    items.sort((a, b) => {
      if (sortBy === 'savings') {
        return (b?.estimatedSavings?.kwhMonthly || 0) - (a?.estimatedSavings?.kwhMonthly || 0);
      }
      if (sortBy === 'title') {
        return String(a?.tip?.title || '').localeCompare(String(b?.tip?.title || ''));
      }
      return (b?.relevanceScore || 0) - (a?.relevanceScore || 0);
    });

    return items;
  }, [recommendations, search, category, showBookmarkedOnly, showImplementedOnly, sortBy]);


  const filteredAllTips = useMemo(() => {
    const term = search.trim().toLowerCase();
    let items = [...allTips];

    if (term) {
      items = items.filter((item) => {
        const title = item?.tip?.title?.toLowerCase() || '';
        const description = item?.tip?.description?.toLowerCase() || '';
        const cat = item?.tip?.category?.toLowerCase() || '';
        const feedback = item?.interaction?.feedback?.toLowerCase?.() || '';
        return (
          title.includes(term) ||
          description.includes(term) ||
          cat.includes(term) ||
          feedback.includes(term)
        );
      });
    }

    if (category !== 'all') {
      items = items.filter((item) => item?.tip?.category === category);
    }

    if (showBookmarkedOnly) {
      items = items.filter((item) => !!item?.interaction?.bookmarked);
    }

    if (showImplementedOnly) {
      items = items.filter((item) => !!item?.interaction?.implemented);
    }

    items.sort((a, b) => {
      if (sortBy === 'savings') {
        return (b?.estimatedSavings?.kwhMonthly || 0) - (a?.estimatedSavings?.kwhMonthly || 0);
      }
      if (sortBy === 'title') {
        return String(a?.tip?.title || '').localeCompare(String(b?.tip?.title || ''));
      }
      return String(a?.tip?.title || '').localeCompare(String(b?.tip?.title || ''));
    });

    return items;
  }, [allTips, search, category, showBookmarkedOnly, showImplementedOnly, sortBy]);

  const filteredInteractions = useMemo(() => {
    const term = search.trim().toLowerCase();
    let items = [...interactions];

    if (term) {
      items = items.filter((item) => {
        const tip = typeof item?.tipId === 'object' ? item.tipId : {};
        const title = tip?.title?.toLowerCase() || '';
        const description = tip?.description?.toLowerCase() || '';
        const cat = tip?.category?.toLowerCase() || '';
        const feedback = item?.feedback?.rating?.toLowerCase() || '';
        return title.includes(term) || description.includes(term) || cat.includes(term) || feedback.includes(term);
      });
    }

    if (category !== 'all') {
      items = items.filter((item) => {
        const tip = typeof item?.tipId === 'object' ? item.tipId : {};
        return tip?.category === category;
      });
    }

    if (showBookmarkedOnly) {
      items = items.filter((item) => !!item?.bookmarked);
    }

    if (showImplementedOnly) {
      items = items.filter((item) => !!item?.implemented);
    }

    items.sort((a, b) => {
      const aDate = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
      const bDate = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
      return bDate - aDate;
    });

    return items;
  }, [interactions, search, category, showBookmarkedOnly, showImplementedOnly]);

  const refreshAll = async () => {
    setMessage('');
    await Promise.all([fetchRecommendations(), fetchAllTips(), fetchInteractions()]);
  };

  const handleBookmarkToggle = async (item) => {
    const tipId = item?.tip?._id;
    if (!tipId) return;

    try {
      setBusyAction(`${tipId}-bookmark`);
      setMessage('');
      if (item?.interaction?.bookmarked) {
        await unbookmarkTip(tipId);
        setMessage('Tip removed from bookmarks.');
      } else {
        await bookmarkTip(tipId);
        setMessage('Tip bookmarked successfully.');
      }
      await refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update bookmark state.');
    } finally {
      setBusyAction('');
    }
  };

  const handleImplement = async (tipId) => {
    try {
      setBusyAction(`${tipId}-implement`);
      setMessage('');
      await implementTip(tipId);
      setMessage('Tip marked as implemented.');
      await refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark tip as implemented.');
    } finally {
      setBusyAction('');
    }
  };

  const handleFeedback = async (tipId, payload) => {
    try {
      setBusyAction(`${tipId}-feedback`);
      setMessage('');
      await feedbackTip(tipId, payload);
      setMessage('Feedback saved successfully.');
      await refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save feedback.');
    } finally {
      setBusyAction('');
    }
  };

  const handleDismiss = async (tipId) => {
    try {
      setBusyAction(`${tipId}-dismiss`);
      setMessage('');
      await dismissTip(tipId, { days: 14 });
      setMessage('Tip dismissed for 14 days.');
      await refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to dismiss tip.');
    } finally {
      setBusyAction('');
    }
  };

  const handleUnbookmarkFromMyTips = async (tipId) => {
    try {
      setBusyAction(`${tipId}-unbookmark`);
      setMessage('');
      await unbookmarkTip(tipId);
      setMessage('Tip removed from bookmarks.');
      await refreshAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove bookmark.');
    } finally {
      setBusyAction('');
    }
  };

  const isLoading =
    activeTab === 'recommended'
      ? loadingRecommendations
      : activeTab === 'all-tips'
        ? loadingAllTips
        : loadingInteractions;

  const items =
    activeTab === 'recommended'
      ? filteredRecommendations
      : activeTab === 'all-tips'
        ? filteredAllTips
        : filteredInteractions;

  return (
    <div className="min-h-screen bg-[#0b0e14] p-8 pb-24">
      <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-12">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase italic">
            Energy <span className="text-blue-500">Tips</span>
          </h1>
          <p className="text-slate-500 font-bold tracking-tight max-w-2xl">
            Personalized recommendations based on your household usage, appliances, weather, and past interactions.
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-4">
          <TipsTabs activeTab={activeTab} onChange={setActiveTab} />
          <Button onClick={refreshAll} className="!rounded-2xl !text-[10px] !uppercase !tracking-[0.18em] bg-[#161b2a] hover:bg-slate-900 text-white border border-slate-800">
            <RefreshCcw size={14} className="mr-2" /> Refresh
          </Button>
        </div>
      </header>

      <div className="space-y-6">
        <TipFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          categories={categoryOptions}
          showBookmarkedOnly={showBookmarkedOnly}
          onToggleBookmarked={setShowBookmarkedOnly}
          showImplementedOnly={showImplementedOnly}
          onToggleImplemented={setShowImplementedOnly}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />

        {message && <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400 font-bold">{message}</div>}
        {error && <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 font-bold">{error}</div>}

        {isLoading ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-72 bg-[#161b2a] rounded-[2.5rem] animate-pulse border border-slate-900" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-24 text-center rounded-[2rem] border border-slate-800 bg-[#161b2a] shadow-2xl">
            <div className="w-20 h-20 bg-[#0b0e14] border border-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Lightbulb size={36} className="text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">
              {activeTab === 'recommended'
                ? 'No recommendations found'
                : activeTab === 'all-tips'
                  ? 'No active tips found'
                  : 'No interacted tips yet'}
            </h3>
            <p className="text-slate-500 font-bold max-w-xl mx-auto">
              {activeTab === 'recommended'
                ? 'Update your household location and appliance list to unlock better personalized recommendations.'
                : activeTab === 'all-tips'
                  ? 'There are no active tips available for your account right now. Dismissed tips are hidden automatically.'
                  : 'Bookmark, implement, dismiss or leave feedback on recommendations to see them in your personal tip history.'}
            </p>
          </div>
       ) : activeTab === 'my-tips' ? (
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
            {items.map((item) => (
              <MyTipCard
                key={item?._id}
                item={item}
                onUnbookmark={handleUnbookmarkFromMyTips}
                onImplement={handleImplement}
                onRefresh={refreshAll}
                busyAction={busyAction}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-8">
            {items.map((item) => (
              <RecommendationTipCard
                key={item?.tip?._id}
                item={item}
                onBookmarkToggle={handleBookmarkToggle}
                onImplement={handleImplement}
                onFeedback={handleFeedback}
                onDismiss={handleDismiss}
                busyAction={busyAction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tips;
