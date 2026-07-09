import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, FlaskConical, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

const TOTAL_BATCHES = 6;
const BATCH_SIZE = 5;

export default function ResearchBatchPanel() {
  const [existing, setExisting] = useState(0);
  const [running, setRunning] = useState(null);
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);

  const [discoverTopic, setDiscoverTopic] = useState('');
  const [discoverCount, setDiscoverCount] = useState(5);
  const [discovering, setDiscovering] = useState(false);
  const [discoverResult, setDiscoverResult] = useState(null);

  useEffect(() => { checkExisting(); }, []);

  const checkExisting = async () => {
    try {
      const res = await base44.entities.ResearchPaper.list('-updated_date', 1);
      const arr = res.results || res || [];
      setExisting(arr.length);
    } catch (e) { console.error(e); }
  };

  const runBatch = async (b) => {
    setRunning(b);
    setError(null);
    try {
      const res = await base44.functions.invoke('generateResearchBatch', { batch: b });
      const data = res.data || res;
      setResults((r) => ({ ...r, [b]: data }));
      if (data.created) await checkExisting();
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Generation failed');
    }
    setRunning(null);
  };

  const runAll = async () => {
    for (let b = 1; b <= TOTAL_BATCHES; b++) {
      await runBatch(b);
    }
  };

  const discover = async () => {
    setDiscovering(true); setDiscoverResult(null); setError(null);
    try {
      const res = await base44.functions.invoke('generateResearchBatch', {
        action: 'discover',
        topic: discoverTopic.trim() || 'blockchain and Web3',
        count: Number(discoverCount) || 5
      });
      setDiscoverResult(res.data || res);
      await checkExisting();
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Discovery failed');
    }
    setDiscovering(false);
  };

  const batchState = (b) => {
    if (running === b) return 'running';
    if (results[b]) return results[b].created > 0 ? 'done' : 'skipped';
    return 'idle';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
      <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-bold text-slate-900">Research Database Generator</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            AI-generates annotated research entries from a curated seed of 30 canonical papers, whitepapers &amp; standards — or discover new ones below.
            Runs in {TOTAL_BATCHES} batches of {BATCH_SIZE}. Each entry is cross-linked to related glossary terms &amp; articles.
          </p>
        </div>
        <button onClick={runAll} disabled={running !== null}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-60 shrink-0">
          {running !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
          {running !== null ? `Generating batch ${running}...` : 'Generate All Batches'}
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4 text-sm">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
          <FileText className="w-3.5 h-3.5" /> {existing} in database
        </span>
        <span className="text-slate-400">/ 30 seed papers</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((b) => {
          const state = batchState(b);
          const r = results[b];
          return (
            <div key={b} className={`rounded-lg border p-4 ${state === 'done' ? 'border-emerald-200 bg-emerald-50/40' : state === 'running' ? 'border-teal-300 bg-teal-50/40' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Batch {b}</span>
                {state === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {state === 'running' && <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />}
              </div>
              <p className="text-xs text-slate-400 mb-3">
                {state === 'done' ? `${r.created} created${r.skipped ? ` · ${r.skipped} skipped` : ''}` :
                 state === 'running' ? 'Generating annotations...' :
                 `Papers ${(b - 1) * BATCH_SIZE + 1}–${b * BATCH_SIZE}`}
              </p>
              <button onClick={() => runBatch(b)} disabled={running !== null}
                className="w-full px-3 py-1.5 text-xs font-semibold rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                {state === 'done' ? 'Re-run' : `Generate Batch ${b}`}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-lg border border-teal-200 p-4 bg-teal-50/40">
        <div className="flex items-center gap-2 mb-2">
          <FlaskConical className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold text-slate-900">Discover New Research</h3>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Fetches <strong>new</strong> papers, whitepapers &amp; EIPs beyond the seed set — a web-search-enabled LLM finds real, citable works not already in the library, then annotates &amp; cross-links each one.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input type="text" value={discoverTopic} onChange={(e) => setDiscoverTopic(e.target.value)} placeholder="Topic (optional): zero-knowledge proofs, rollups, DeFi, oracles…" disabled={discovering || running !== null}
            className="flex-1 px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60" />
          <select value={discoverCount} onChange={(e) => setDiscoverCount(Number(e.target.value))} disabled={discovering || running !== null}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60">
            {[3, 5, 8, 10].map((n) => <option key={n} value={n}>{n} papers</option>)}
          </select>
          <button onClick={discover} disabled={discovering || running !== null}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-60">
            {discovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
            {discovering ? 'Discovering...' : 'Discover'}
          </button>
        </div>
        {discoverResult && !discoverResult.error && (
          <div className="mt-3 bg-teal-50 border border-teal-100 rounded-lg p-3">
            <p className="text-sm text-teal-800 mb-2">
              Discovered &amp; annotated <strong>{discoverResult.created}</strong> new paper{discoverResult.created === 1 ? '' : 's'}{discoverResult.skipped ? ` · ${discoverResult.skipped} already in library` : ''}{discoverResult.topic ? ` for "${discoverResult.topic}"` : ''}.
            </p>
            {discoverResult.papers?.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {discoverResult.papers.map((p, i) => (
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
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-lg p-3 text-sm text-rose-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}
        </div>
      )}

      {Object.values(results).some((r) => r.papers?.length) && (
        <div className="mt-4 space-y-1.5 max-h-56 overflow-y-auto">
          {Object.entries(results).filter(([, r]) => r.papers?.length).map(([b, r]) => (
            <div key={b}>
              <p className="text-xs font-semibold text-slate-500 mb-1">Batch {b} — {r.created} created</p>
              {r.papers.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.related_glossary + p.related_articles > 0 ? 'bg-teal-500' : 'bg-slate-300'}`} />
                  <span className="text-slate-600 truncate flex-1">{p.title}</span>
                  <span className="text-slate-400 shrink-0 font-mono">{p.internal_id}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}