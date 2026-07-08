import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, RefreshCw, ChevronRight, AlertCircle, Newspaper } from 'lucide-react';
import NewsCard from '@/components/news/NewsCard';
import Seo from '@/components/Seo';
import { buildBreadcrumbSchema } from '@/lib/seoSchemas';

export default function News() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('fetchNews', { t: Date.now() });
      const data = res.data || res;
      if (data.error) throw new Error(data.error);
      setItems(data.items || []);
      setLastUpdated(data.fetchedAt || new Date().toISOString());
    } catch (e) {
      setError(e.message || 'Failed to load news');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNews(); }, [fetchNews]);

  const schemas = [buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'News', url: '/news' }])];

  return (
    <div>
      <Seo title="Blockchain & Crypto News" description="Live headlines from across the blockchain and cryptocurrency industry, powered by Google News. Stay current with real-time updates." schemas={schemas} />
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
          <p className="text-slate-500 max-w-2xl">Live headlines from across the blockchain and cryptocurrency industry, powered by Google News.</p>
        </div>
      </div>

      <div className="container-tbl py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">
            {loading ? 'Loading latest headlines…' : `${items.length} stories`}
            {lastUpdated && !loading && (
              <span className="text-slate-400 ml-2">· Updated just now</span>
            )}
          </p>
          <button onClick={fetchNews} disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
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
            <button onClick={fetchNews}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400">No headlines available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, i) => <NewsCard key={i} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
}