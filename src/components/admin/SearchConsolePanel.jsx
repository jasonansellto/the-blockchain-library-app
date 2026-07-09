import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Loader2, AlertCircle, RefreshCw, MousePointerClick, Eye,
  TrendingUp, MapPin, Search as SearchIcon, Link2, FileText, Trash2, Plus
} from 'lucide-react';

const RANGE_OPTIONS = [
  { label: '7 days', days: 7 },
  { label: '28 days', days: 28 },
  { label: '90 days', days: 90 }
];

function fmtNum(n) {
  return Number(n || 0).toLocaleString('en-US');
}
function fmtPct(ctr) {
  return `${(Number(ctr || 0) * 100).toFixed(1)}%`;
}
function fmtPos(p) {
  return Number(p || 0).toFixed(1);
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function truncatePath(url) {
  try {
    const u = new URL(url);
    const path = u.pathname === '/' ? u.hostname : u.pathname;
    return path.length > 48 ? path.slice(0, 47) + '…' : path;
  } catch (_e) {
    return url && url.length > 48 ? url.slice(0, 47) + '…' : url;
  }
}

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        <Icon className={`w-4 h-4 ${accent || ''}`} />
        <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

function Table({ headers, rows, renderRow }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {headers.map((h) => (
              <th key={h} className="text-left font-semibold text-slate-500 py-2.5 pr-4 first:pl-0 last:pr-0 uppercase text-xs tracking-wide">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => renderRow(r, i))}
        </tbody>
      </table>
    </div>
  );
}

export default function SearchConsolePanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [days, setDays] = useState(28);
  const [siteUrl, setSiteUrl] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [newSitemap, setNewSitemap] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingPath, setDeletingPath] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);

  const fetchData = useCallback(async (selectedDays, selectedSite) => {
    setLoading(!data);
    setRefreshing(!!data);
    setError(null);
    try {
      const res = await base44.functions.invoke('searchConsoleData', {
        days: selectedDays,
        siteUrl: selectedSite || undefined
      });
      const d = res.data || res;
      if (d.error) throw new Error(d.error);
      setData(d);
      setSiteUrl(d.siteUrl);
    } catch (e) {
      setError(e.message || 'Failed to load Search Console data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [data]);

  useEffect(() => { fetchData(days, siteUrl); /* eslint-disable-next-line */ }, []);

  const handleRefresh = () => fetchData(days, siteUrl);

  const submitSitemap = async () => {
    const feedpath = newSitemap.trim();
    if (!feedpath) return;
    setSubmitting(true); setActionMsg(null);
    try {
      const res = await base44.functions.invoke('searchConsoleData', { action: 'submit-sitemap', feedpath, siteUrl });
      const d = res.data || res;
      if (d.error) throw new Error(d.error);
      setActionMsg({ type: 'success', text: `Sitemap submitted: ${feedpath}` });
      setNewSitemap('');
      await fetchData(days, siteUrl);
    } catch (e) {
      setActionMsg({ type: 'error', text: e.message || 'Submit failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSitemap = async (feedpath) => {
    setDeletingPath(feedpath); setActionMsg(null);
    try {
      const res = await base44.functions.invoke('searchConsoleData', { action: 'delete-sitemap', feedpath, siteUrl });
      const d = res.data || res;
      if (d.error) throw new Error(d.error);
      setActionMsg({ type: 'success', text: `Sitemap removed: ${feedpath}` });
      await fetchData(days, siteUrl);
    } catch (e) {
      setActionMsg({ type: 'error', text: e.message || 'Delete failed' });
    } finally {
      setDeletingPath(null);
    }
  };
  const handleDays = (d) => { setDays(d); fetchData(d, siteUrl); };
  const handleSite = (s) => { setSiteUrl(s); fetchData(days, s); };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center">
            <SearchIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">Google Search Console</h3>
            <p className="text-xs text-slate-400">Live search-performance analytics from Google</p>
          </div>
        </div>
        <button onClick={handleRefresh} disabled={refreshing || loading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        {data?.sites?.length > 1 && (
          <select value={siteUrl} onChange={(e) => handleSite(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            {data.sites.map((s) => <option key={s.siteUrl} value={s.siteUrl}>{s.siteUrl}</option>)}
          </select>
        )}
        <div className="flex items-center gap-1.5">
          {RANGE_OPTIONS.map((r) => (
            <button key={r.days} onClick={() => handleDays(r.days)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${days === r.days ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}>
              {r.label}
            </button>
          ))}
        </div>
        {data?.dateRange && (
          <span className="text-xs text-slate-400 ml-auto">{data.dateRange.startDate} → {data.dateRange.endDate}</span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="w-10 h-10 text-rose-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium mb-1">Couldn't load Search Console data</p>
          <p className="text-sm text-slate-400 mb-5 max-w-md mx-auto">{error}</p>
          <button onClick={handleRefresh} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" /> Try again
          </button>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={MousePointerClick} label="Clicks" value={fmtNum(data.totals.clicks)} accent="text-blue-500" />
            <StatCard icon={Eye} label="Impressions" value={fmtNum(data.totals.impressions)} accent="text-teal-500" />
            <StatCard icon={TrendingUp} label="Avg. CTR" value={fmtPct(data.totals.ctr)} accent="text-emerald-500" />
            <StatCard icon={MapPin} label="Avg. Position" value={fmtPos(data.totals.position)} accent="text-violet-500" />
          </div>

          {/* Top queries + pages */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-slate-50/60 rounded-xl border border-slate-200 p-5">
              <h4 className="text-sm font-bold text-slate-900 mb-3">Top Queries</h4>
              {data.topQueries.length ? (
                <Table
                  headers={['Query', 'Clicks', 'Impr.', 'CTR', 'Pos.']}
                  rows={data.topQueries}
                  renderRow={(q) => (
                    <tr key={q.query} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-4 text-slate-700 font-medium max-w-[160px] truncate">{q.query}</td>
                      <td className="py-2 pr-4 text-slate-600">{fmtNum(q.clicks)}</td>
                      <td className="py-2 pr-4 text-slate-600">{fmtNum(q.impressions)}</td>
                      <td className="py-2 pr-4 text-slate-600">{fmtPct(q.ctr)}</td>
                      <td className="py-2 text-slate-600">{fmtPos(q.position)}</td>
                    </tr>
                  )}
                />
              ) : <p className="text-sm text-slate-400 py-4">No query data for this range.</p>}
            </div>

            <div className="bg-slate-50/60 rounded-xl border border-slate-200 p-5">
              <h4 className="text-sm font-bold text-slate-900 mb-3">Top Pages</h4>
              {data.topPages.length ? (
                <Table
                  headers={['Page', 'Clicks', 'Impr.', 'CTR', 'Pos.']}
                  rows={data.topPages}
                  renderRow={(p) => (
                    <tr key={p.page} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-4 text-slate-700 font-medium max-w-[180px] truncate" title={p.page}>{truncatePath(p.page)}</td>
                      <td className="py-2 pr-4 text-slate-600">{fmtNum(p.clicks)}</td>
                      <td className="py-2 pr-4 text-slate-600">{fmtNum(p.impressions)}</td>
                      <td className="py-2 pr-4 text-slate-600">{fmtPct(p.ctr)}</td>
                      <td className="py-2 text-slate-600">{fmtPos(p.position)}</td>
                    </tr>
                  )}
                />
              ) : <p className="text-sm text-slate-400 py-4">No page data for this range.</p>}
            </div>
          </div>

          {/* Indexing health summary */}
          <div className="flex items-center gap-4 flex-wrap text-sm bg-slate-50 rounded-lg border border-slate-200 px-4 py-2.5">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Indexing health</span>
            <span className="font-semibold text-slate-900">{fmtNum(data.sitemaps.reduce((a, s) => a + (s.discoveredPages || 0), 0))} discovered pages</span>
            <span className="font-semibold text-slate-900">{data.sitemaps.length} sitemap{data.sitemaps.length === 1 ? '' : 's'}</span>
            {data.sitemaps.filter((s) => s.isErrors || s.errors > 0).length > 0 && (
              <span className="font-semibold text-rose-600">{data.sitemaps.filter((s) => s.isErrors || s.errors > 0).length} with errors</span>
            )}
          </div>

          {/* Add a new sitemap */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Add a new sitemap</h4>
            <form onSubmit={(e) => { e.preventDefault(); submitSitemap(); }} className="flex items-center gap-2">
              <input type="url" value={newSitemap} onChange={(e) => setNewSitemap(e.target.value)}
                placeholder="Enter sitemap URL (e.g. https://www.theblockchainlibrary.com/sitemap.xml)"
                className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
              <button type="submit" disabled={submitting || !newSitemap.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold tracking-wide text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} SUBMIT
              </button>
            </form>
            <div className="mt-3 flex items-center gap-2 text-xs flex-wrap">
              <span className="text-slate-400">Comprehensive (all content):</span>
              <code className="text-slate-600 bg-slate-50 px-2 py-0.5 rounded">https://theblockchainlibrary.com/functions/generateSitemap?type=index</code>
              <button type="button" onClick={() => setNewSitemap('https://theblockchainlibrary.com/functions/generateSitemap?type=index')}
                className="text-blue-600 font-medium hover:underline">Use this</button>
            </div>
            {actionMsg && (
              <div className={`mt-3 text-xs px-3 py-2 rounded-lg ${actionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                {actionMsg.text}
              </div>
            )}
          </div>

          {/* Submitted sitemaps */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-slate-700">Submitted sitemaps</h4>
              <span className="text-xs text-slate-400">{data.sitemaps.length} sitemap{data.sitemaps.length === 1 ? '' : 's'}</span>
            </div>
            {data.sitemaps.length ? (
              <Table
                headers={['Sitemap', 'Type', 'Submitted', 'Last read', 'Status', 'Pages', 'Videos', '']}
                rows={data.sitemaps}
                renderRow={(s) => {
                  const hasErr = s.isErrors || s.errors > 0;
                  const status = hasErr ? "Couldn't fetch" : (s.isPending ? 'Pending' : (s.warnings > 0 ? 'Warnings' : 'Success'));
                  const statusColor = hasErr ? 'text-rose-600' : (s.isPending ? 'text-amber-600' : (s.warnings > 0 ? 'text-amber-600' : 'text-emerald-600'));
                  const statusBg = hasErr ? 'bg-rose-50' : (s.isPending ? 'bg-amber-50' : (s.warnings > 0 ? 'bg-amber-50' : 'bg-emerald-50'));
                  return (
                    <tr key={s.path} className="border-b border-slate-100 last:border-0">
                      <td className="py-2.5 pr-4 text-slate-700 font-medium max-w-[280px] truncate" title={s.path}>
                        <span className="inline-flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-slate-400" />{s.path}</span>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600 text-xs">{s.isSitemapsIndex ? 'Sitemap index' : 'Sitemap'}</td>
                      <td className="py-2.5 pr-4 text-slate-600 text-xs">{fmtDate(s.lastSubmitted)}</td>
                      <td className="py-2.5 pr-4 text-slate-600 text-xs">{fmtDate(s.lastDownloaded)}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusBg} ${statusColor}`}>{status}</span>
                      </td>
                      <td className="py-2.5 pr-4 text-slate-600 text-xs">{s.discoveredPages || 0}</td>
                      <td className="py-2.5 pr-4 text-slate-600 text-xs">{s.discoveredVideos || 0}</td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => deleteSitemap(s.path)} disabled={deletingPath === s.path}
                          className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-50">
                          {deletingPath === s.path ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  );
                }}
              />
            ) : <p className="text-sm text-slate-400 py-2">No sitemaps submitted yet.</p>}
          </div>
        </div>
      ) : null}
    </div>
  );
}