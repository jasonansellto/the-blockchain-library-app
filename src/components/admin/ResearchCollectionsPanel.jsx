import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, FlaskConical, Search, Sparkles, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { RESEARCH_COLLECTIONS } from '@/lib/researchCollections';

export default function ResearchCollectionsPanel() {
  const [counts, setCounts] = useState({});
  const [totalCurrent, setTotalCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchCounts = useCallback(async () => {
    setLoading(true);
    try {
      const [papersRes, catsRes] = await Promise.all([
        base44.entities.ResearchPaper.list('-updated_date', 1000),
        base44.entities.Category.list('-updated_date', 500)
      ]);
      const papers = papersRes.results || papersRes || [];
      const cats = catsRes.results || catsRes || [];
      const catIdToName = {};
      cats.forEach((c) => { catIdToName[c.id] = c.name; });
      const next = {};
      let total = 0;
      papers.forEach((p) => {
        const name = catIdToName[p.category_id] || 'Uncategorized';
        next[name] = (next[name] || 0) + 1;
        total++;
      });
      setCounts(next);
      setTotalCurrent(total);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const totalTarget = RESEARCH_COLLECTIONS.reduce((s, c) => s + (c.target || 0), 0);
  const overallPct = totalTarget > 0 ? Math.min(100, Math.round((totalCurrent / totalTarget) * 100)) : 0;
  const registryNames = new Set(RESEARCH_COLLECTIONS.map((c) => c.name));
  const otherCount = Object.entries(counts).filter(([name]) => !registryNames.has(name)).reduce((s, [, n]) => s + n, 0);

  const discoverCollection = async (col) => {
    const current = counts[col.name] || 0;
    const need = Math.min(10, Math.max(1, (col.target || 10) - current));
    setRunning(col.name); setError(null); setResult(null);
    try {
      const res = await base44.functions.invoke('generateResearchBatch', { action: 'discover', collection: col.name, count: need });
      setResult({ collection: col.name, ...(res.data || res) });
      await fetchCounts();
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Discovery failed');
    }
    setRunning(null);
  };

  const importPriority = async () => {
    setRunning('priority'); setError(null); setResult(null);
    try {
      const res = await base44.functions.invoke('generateResearchBatch', { action: 'import-priority', limit: 10 });
      setResult({ priority: true, ...(res.data || res) });
      await fetchCounts();
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Priority import failed');
    }
    setRunning(null);
  };

  const importBri = async () => {
    setRunning('bri'); setError(null); setResult(null);
    try {
      const res = await base44.functions.invoke('generateResearchBatch', { action: 'import-bri', limit: 15 });
      setResult({ bri: true, ...(res.data || res) });
      await fetchCounts();
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'BRI import failed');
    }
    setRunning(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-900">Research Collections</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            A curated research library spanning blockchain, cryptography, AI, distributed systems, finance, identity &amp; internet infrastructure. Discover real, citable papers per collection toward each target.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={importBri} disabled={running !== null}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-60">
            {running === 'bri' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
            {running === 'bri' ? 'Importing BRI…' : 'Import BRI Research'}
          </button>
          <button onClick={importPriority} disabled={running !== null}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60">
            {running === 'priority' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {running === 'priority' ? 'Importing priority…' : 'Import Priority Batch'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5 text-sm flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 font-medium">
          <TrendingUp className="w-3.5 h-3.5" /> {totalCurrent} archived
        </span>
        <span className="text-slate-400">/ {totalTarget} target across {RESEARCH_COLLECTIONS.length} collections</span>
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden min-w-[120px] max-w-xs">
          <div className="h-full bg-gradient-to-r from-teal-400 to-blue-500 rounded-full transition-all" style={{ width: `${overallPct}%` }} />
        </div>
        <span className="text-xs font-semibold text-slate-500">{overallPct}%</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-teal-600 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {RESEARCH_COLLECTIONS.map((col) => {
            const current = counts[col.name] || 0;
            const target = col.target || 0;
            const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
            const done = target > 0 && current >= target;
            const isRunning = running === col.name;
            const need = Math.min(10, Math.max(1, (target || 10) - current));
            return (
              <div key={col.name} className={`rounded-lg border p-4 ${done ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200'}`}>
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <span className="text-sm font-semibold text-slate-800 truncate">{col.name}</span>
                  {done ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> :
                    isRunning ? <Loader2 className="w-4 h-4 text-teal-600 animate-spin shrink-0" /> : null}
                </div>
                <p className="text-xs text-slate-400 mb-2 line-clamp-1">{col.description}</p>
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${done ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-teal-400'}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-medium text-slate-500 shrink-0">{current}/{target || '∞'}</span>
                </div>
                <button onClick={() => discoverCollection(col)} disabled={running !== null || done}
                  className="w-full px-3 py-1.5 text-xs font-semibold rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors inline-flex items-center justify-center gap-1.5">
                  <Search className="w-3.5 h-3.5" />
                  {done ? 'Target reached' : isRunning ? 'Discovering…' : `Discover ${need}`}
                </button>
              </div>
            );
          })}
          {otherCount > 0 && (
            <div className="rounded-lg border border-slate-200 border-dashed p-4 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-slate-500">Other (legacy)</span>
              </div>
              <p className="text-xs text-slate-400 mb-2">Papers in collections not listed above.</p>
              <div className="text-xs font-medium text-slate-500">{otherCount} archived</div>
            </div>
          )}
        </div>
      )}

      {result && !result.error && (
        <div className="mt-4 bg-teal-50 border border-teal-100 rounded-lg p-3 text-sm">
          <p className="text-teal-800 mb-1">
            {result.priority ? 'Priority import:' : result.bri ? 'Blockchain Research Institute:' : `Collection "${result.collection}":`}
            {' '}created <strong>{result.created}</strong>{result.skipped ? ` · ${result.skipped} already in library` : ''}
            {result.enriched != null ? ` · ${result.enriched} verified` : ''}
            {result.discovered != null ? ` · ${result.discovered} discovered` : ''}
            {result.remaining != null ? ` · ${result.remaining} remaining` : ''}.
          </p>
          {result.papers?.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto mt-2">
              {result.papers.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.related_glossary + p.related_articles > 0 ? 'bg-teal-500' : 'bg-slate-300'}`} />
                  <span className="text-slate-600 truncate flex-1">{p.title}</span>
                  <span className="text-slate-400 shrink-0 font-mono">{p.internal_id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {error && (
        <div className="mt-4 flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-lg p-3 text-sm text-rose-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}
        </div>
      )}
    </div>
  );
}