import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, RefreshCw, ChevronRight, AlertCircle, Newspaper, Search, X } from 'lucide-react';
import NewsCard from '@/components/news/NewsCard';
import Seo from '@/components/Seo';
import { buildBreadcrumbSchema } from '@/lib/seoSchemas';
import { useAuth } from '@/lib/AuthContext';

const SOURCES = ['CoinDesk', 'Cointelegraph', 'Bitcoinist', 'NewsBTC', 'CryptoSlate'];
const TAGS = ['Bitcoin', 'Markets', 'DeFi', 'Altcoins', 'Blockchain', 'Regulation', 'Mining', 'Trading', 'NFT', 'Web3'];
const PAGE_SIZE = 30;

export default function News() {
  const { user } = useAuth();
  const isAdmin = user && ['admin', 'editor'].includes(user.role);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [selectedSources, setSelectedSources] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState('');
  const loadedIds = useRef(new Set());

  const fetchPage = useCallback(async (cursor, append) => {
    if (!append) setLoading(true);
    else setLoadingMore(true);
    setError(null);
    try {
      const q = {};
      if (search) q.title = { $regex: search, $options: 'i' };
      if (selectedSources.length) q.source = { $in: selectedSources };
      if (selectedTag) q.tags = selectedTag;
      const dq = {};
      if (startDate) dq.$gte = new Date(startDate + 'T00:00:00').toISOString();
      if (endDate) dq.$lte = new Date(endDate + 'T23:59:59').toISOString();
      if (cursor) dq.$lt = cursor;
      if (Object.keys(dq).length) q.pubDate = dq;

      const res = await base44.entities.NewsItem.filter(q, '-pubDate', PAGE_SIZE);
      const arr = res.results || res || [];
      if (append) {
        const fresh = arr.filter((a) => !loadedIds.current.has(a.id));
        fresh.forEach((a) => loadedIds.current.add(a.id));
        setItems((prev) => [...prev, ...fresh]);
        setHasMore(fresh.length === PAGE_SIZE);
      } else {
        loadedIds.current = new Set(arr.map((a) => a.id));
        setItems(arr);
        setHasMore(arr.length === PAGE_SIZE);
      }
    } catch (e) {
      setError(e.message || 'Failed to load news');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, selectedSources, selectedTag, startDate, endDate]);

  useEffect(() => { fetchPage(null, false); }, [fetchPage]);

  const loadMore = () => {
    const last = items[items.length - 1];
    fetchPage(last?.pubDate || null, true);
  };

  const toggleSource = (s) => {
    setSelectedSources((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const clearFilters = () => {
    setSearch(''); setSearchInput(''); setSelectedSources([]);
    setSelectedTag(''); setStartDate(''); setEndDate('');
  };

  const hasFilters = search || selectedSources.length || selectedTag || startDate || endDate;

  const refresh = async () => {
    setRefreshing(true); setRefreshMsg('');
    try {
      const res = await base44.functions.invoke('archiveNews', {});
      const data = res.data || res;
      if (data.error) throw new Error(data.error);
      const inserted = data.inserted ?? 0;
      setRefreshMsg(`Archived ${inserted} new stor${inserted === 1 ? 'y' : 'ies'}.`);
      loadedIds.current = new Set();
      await fetchPage(null, false);
    } catch (e) {
      setRefreshMsg('Refresh failed: ' + (e.message || 'unknown error'));
    } finally {
      setRefreshing(false);
    }
  };

  const schemas = [buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'News', url: '/news' }])];

  return (
    <div>
      <Seo title="Blockchain & Crypto News" description="Browse the full archive of blockchain and cryptocurrency headlines — searchable and filterable by source, topic, and date." schemas={schemas} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-10">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-3 flex-wrap">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">News</span>
          </nav>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Blockchain & Crypto News</h1>
          </div>
          <p className="text-slate-500 max-w-2xl">A persistent, searchable archive of headlines from across the blockchain and cryptocurrency industry. Filter by source, topic, or date.</p>
        </div>
      </div>

      <div className="container-tbl py-10">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 space-y-5">
          <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput.trim()); }} className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search headlines…"
              className="w-full pl-12 pr-4 py-3 text-base bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
          </form>

          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Sources</p>
            <div className="flex flex-wrap gap-2">
              {SOURCES.map((s) => (
                <button key={s} onClick={() => toggleSource(s)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${selectedSources.includes(s) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Topics</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <button key={t} onClick={() => setSelectedTag(selectedTag === t ? '' : t)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${selectedTag === t ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-500 border-slate-200 hover:border-teal-300'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Date range</p>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">From</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">To</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-xs text-slate-500 hover:text-slate-700 underline">Clear dates</button>
            )}
            {hasFilters && (
              <button onClick={clearFilters} className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
                <X className="w-3.5 h-3.5" /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* Count + refresh */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            {loading ? 'Loading…' : `${items.length} stor${items.length === 1 ? 'y' : 'ies'}${hasMore ? ' · showing latest' : ''}`}
            {refreshMsg && <span className="text-blue-600 ml-2">· {refreshMsg}</span>}
          </p>
          {isAdmin && (
            <button onClick={refresh} disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh now
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                <div className="h-4 w-20 bg-slate-100 rounded mb-3" />
                <div className="h-4 w-full bg-slate-100 rounded mb-2" />
                <div className="h-4 w-3/4 bg-slate-100 rounded mb-4" />
                <div className="h-3 w-24 bg-slate-50 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-rose-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium mb-1">Couldn't load news</p>
            <p className="text-sm text-slate-400 mb-6">{error}</p>
            <button onClick={() => fetchPage(null, false)}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium mb-1">{hasFilters ? 'No stories match your filters' : 'No stories archived yet'}</p>
            <p className="text-sm text-slate-400 mb-6">
              {hasFilters ? 'Try adjusting or clearing your filters.' : isAdmin ? 'Run a refresh to pull the latest headlines.' : 'Check back soon — new headlines are imported every few hours.'}
            </p>
            {hasFilters ? (
              <button onClick={clearFilters} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">Clear filters</button>
            ) : isAdmin ? (
              <button onClick={refresh} disabled={refreshing} className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Import now
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => <NewsCard key={item.id} item={item} />)}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button onClick={loadMore} disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">
                  {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />} Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}