import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, RefreshCw, TrendingUp, Target, BookOpen, Library, AlertCircle, Sparkles, Clock, AlertTriangle, Mail } from 'lucide-react';
import Seo from '@/components/Seo';

export default function AdminSeoDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [faqGenRunning, setFaqGenRunning] = useState(false);
  const [faqGenResult, setFaqGenResult] = useState(null);
  const [newsGenRunning, setNewsGenRunning] = useState(false);
  const [newsGenResult, setNewsGenResult] = useState(null);

  useEffect(() => { fetchCache(); }, []);

  const fetchCache = async () => {
    try {
      const res = await base44.entities.SiteAnalyticsCache.filter({ cache_key: 'content_health' }, '-updated_date', 1);
      const arr = res.results || res || [];
      if (arr.length > 0) setData(arr[0].data);
    } catch (e) {}
    setLoading(false);
  };

  const recalculate = async () => {
    setRecalculating(true);
    try {
      const res = await base44.functions.invoke('calculateContentHealth', { action: 'calculate' });
      const result = res.data || res;
      if (result.success) setData(result);
    } catch (e) { console.error(e); }
    setRecalculating(false);
  };

  const generateFaqs = async () => {
    setFaqGenRunning(true);
    try {
      const res = await base44.functions.invoke('generateArticleFaqs', { limit: 5 });
      setFaqGenResult(res.data || res);
    } catch (e) {
      setFaqGenResult({ error: e.message });
    }
    setFaqGenRunning(false);
  };

  const generateNewsletter = async () => {
    setNewsGenRunning(true);
    try {
      const res = await base44.functions.invoke('generateNewsletterEdition', {});
      setNewsGenResult(res.data || res);
    } catch (e) {
      setNewsGenResult({ error: e.message });
    }
    setNewsGenRunning(false);
  };

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  return (
    <div>
      <Seo title="SEO Dashboard" robots="noindex, nofollow" />
      <div className="container-tbl py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SEO & Content Health Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">Monitor content quality, GEO readiness, and topic cluster coverage</p>
          </div>
          <button onClick={recalculate} disabled={recalculating}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60">
            {recalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {recalculating ? 'Recalculating...' : 'Recalculate'}
          </button>
        </div>

        <div className="flex gap-2 mb-6 text-sm">
          <a href="/admin/content" className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">Content</a>
          <a href="/admin/seo" className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium">SEO Dashboard</a>
          <a href="/admin/learning-paths" className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">Learning Paths</a>
          <a href="/admin/revisions" className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">Revisions</a>
        </div>

        {!data ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No cached analytics data yet.</p>
            <p className="text-sm text-slate-400">Click "Recalculate" to generate content health scores and topic cluster coverage.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <StatCard icon={BookOpen} label="Total Articles" value={data.total_articles || 0} color="text-blue-600" />
              <StatCard icon={TrendingUp} label="Avg Health Score" value={`${data.avg_health_score || 0}/100`} color="text-teal-600" />
              <StatCard icon={Target} label="Avg GEO Score" value={`${data.avg_geo_score || 0}/100`} color="text-purple-600" />
              <StatCard icon={Library} label="Topic Clusters" value={data.topic_clusters?.length || 0} color="text-amber-600" />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Health Score Distribution</h2>
              <div className="grid grid-cols-4 gap-4">
                <HealthBucket label="Excellent (80+)" count={data.health_buckets?.excellent || 0} total={data.total_articles || 1} color="bg-emerald-500" />
                <HealthBucket label="Good (60-79)" count={data.health_buckets?.good || 0} total={data.total_articles || 1} color="bg-blue-500" />
                <HealthBucket label="Fair (40-59)" count={data.health_buckets?.fair || 0} total={data.total_articles || 1} color="bg-amber-500" />
                <HealthBucket label="Poor (<40)" count={data.health_buckets?.poor || 0} total={data.total_articles || 1} color="bg-rose-500" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Topic Cluster Coverage</h2>
              <div className="space-y-3">
                {(data.topic_clusters || []).map(cluster => (
                  <div key={cluster.id} className="flex items-center gap-4">
                    <div className="w-40 shrink-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{cluster.name}</p>
                      <p className="text-xs text-slate-400">{cluster.articles} articles · {cluster.glossary} terms</p>
                    </div>
                    <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${cluster.coverage >= 80 ? 'bg-emerald-500' : cluster.coverage >= 50 ? 'bg-blue-500' : cluster.coverage >= 30 ? 'bg-amber-500' : 'bg-rose-400'}`} style={{ width: `${cluster.coverage}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 w-12 text-right">{cluster.coverage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Content Tools */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">AI Content Tools</h2>
                  <p className="text-sm text-slate-400 mt-1">Auto-generate FAQ sections for articles missing them (improves FAQPage schema & rich snippets)</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={generateFaqs} disabled={faqGenRunning}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-60">
                    {faqGenRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {faqGenRunning ? 'Generating...' : 'Generate FAQs'}
                  </button>
                  <button onClick={generateNewsletter} disabled={newsGenRunning}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-60">
                    {newsGenRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    {newsGenRunning ? 'Generating...' : 'Generate Newsletter'}
                  </button>
                </div>
              </div>
              {faqGenResult && !faqGenResult.error && (
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                  <p className="text-sm text-slate-700 mb-2">
                    Processed <strong>{faqGenResult.processed}</strong> of <strong>{faqGenResult.totalWithoutFaqs}</strong> articles without FAQs.
                  </p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {faqGenResult.results?.map(r => (
                      <div key={r.id} className="flex items-center gap-2 text-xs">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${r.status === 'success' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                        <span className="text-slate-600 truncate flex-1">{r.title}</span>
                        <span className="text-slate-400 shrink-0">{r.count} FAQs{r.status === 'error' ? ` · ${r.error}` : ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {faqGenResult?.error && (
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-4 text-sm text-rose-700">{faqGenResult.error}</div>
              )}
              {newsGenResult && !newsGenResult.error && (
                <div className="bg-teal-50 border border-teal-100 rounded-lg p-4 mt-3">
                  <p className="text-sm text-slate-700">
                    Newsletter edition <strong>{newsGenResult.edition?.title}</strong> (Issue #{newsGenResult.edition?.issue_number}) created successfully.{' '}
                    <a href={`/newsletter/${newsGenResult.edition?.slug}`} className="text-teal-600 font-medium hover:underline">View edition →</a>
                  </p>
                </div>
              )}
              {newsGenResult?.error && (
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-4 text-sm text-rose-700 mt-3">{newsGenResult.error}</div>
              )}
            </div>

            {/* Content Freshness */}
            {data.stale_articles?.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h2 className="text-lg font-bold text-slate-900">Content Freshness</h2>
                </div>
                <p className="text-sm text-slate-400 mb-4">{data.stale_count} articles need review (last reviewed &gt; 6 months ago or never reviewed)</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.stale_articles.map(a => (
                    <div key={a.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-50/50 border border-amber-100">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                      <a href={`/article/${a.slug}`} target="_blank" className="text-sm font-medium text-slate-700 hover:text-blue-600 truncate flex-1">{a.title}</a>
                      <span className="text-xs text-slate-400 shrink-0">
                        {a.days_since_review === null ? 'Never reviewed' : `${a.days_since_review} days ago`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-slate-400 mt-4 text-right">
              Last calculated: {data.calculated_at ? new Date(data.calculated_at).toLocaleString() : 'N/A'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <Icon className={`w-6 h-6 mb-2 ${color}`} />
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-400 font-medium mt-1">{label}</div>
    </div>
  );
}

function HealthBucket({ label, count, total, color }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="text-center">
      <div className={`h-2 rounded-full ${color} mb-2`} style={{ width: `${pct}%`, margin: '0 auto' }} />
      <div className="text-xl font-bold text-slate-900">{count}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}