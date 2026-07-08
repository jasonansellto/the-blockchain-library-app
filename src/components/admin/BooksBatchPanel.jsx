import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Library, CheckCircle2, AlertCircle, BookMarked, Link2 } from 'lucide-react';

const TOTAL_BATCHES = 5;
const BATCH_SIZE = 5;

export default function BooksBatchPanel() {
  const [existing, setExisting] = useState(0);
  const [running, setRunning] = useState(null);
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);
  const [fixing, setFixing] = useState(false);
  const [fixResult, setFixResult] = useState(null);

  useEffect(() => { checkExisting(); }, []);

  const checkExisting = async () => {
    try {
      const res = await base44.entities.Book.list('-updated_date', 1);
      const arr = res.results || res || [];
      setExisting(arr.length);
    } catch (e) { console.error(e); }
  };

  const runBatch = async (b) => {
    setRunning(b);
    setError(null);
    try {
      const res = await base44.functions.invoke('generateBooksBatch', { batch: b });
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

  const fixLinks = async () => {
    setFixing(true);
    setFixResult(null);
    setError(null);
    try {
      const res = await base44.functions.invoke('generateBooksBatch', { action: 'fix-affiliate-links' });
      setFixResult(res.data || res);
      await checkExisting();
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Affiliate fix failed');
    }
    setFixing(false);
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
            <Library className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Book Library Generator</h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            AI-curates top Bitcoin &amp; Crypto books from Amazon bestsellers (tag <code className="text-xs bg-slate-100 px-1 rounded">whemusliv-20</code>).
            Runs in {TOTAL_BATCHES} batches of {BATCH_SIZE} (~{TOTAL_BATCHES * BATCH_SIZE} books). Uses web-search-enabled LLM for real ASINs &amp; ratings.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={fixLinks} disabled={fixing || running !== null}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-60">
            {fixing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
            {fixing ? 'Fixing...' : 'Fix Affiliate Links'}
          </button>
          <button onClick={runAll} disabled={running !== null || fixing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60">
            {running !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : <Library className="w-4 h-4" />}
            {running !== null ? `Generating batch ${running}...` : 'Generate All Batches'}
          </button>
        </div>
      </div>

      {fixResult && (
        <div className="mb-4 flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          Affiliate links updated on <strong>{fixResult.updated}</strong> of <strong>{fixResult.total}</strong> books — all Amazon links now use <code className="text-xs bg-white px-1 rounded">tag=whemusliv-20</code>.
        </div>
      )}

      <div className="flex items-center gap-3 mb-4 text-sm">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">
          <BookMarked className="w-3.5 h-3.5" /> {existing} in database
        </span>
        <span className="text-slate-400">/ {TOTAL_BATCHES * BATCH_SIZE} target books</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Array.from({ length: TOTAL_BATCHES }, (_, i) => i + 1).map((b) => {
          const state = batchState(b);
          const r = results[b];
          return (
            <div key={b} className={`rounded-lg border p-4 ${state === 'done' ? 'border-emerald-200 bg-emerald-50/40' : state === 'running' ? 'border-blue-300 bg-blue-50/40' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">Batch {b}</span>
                {state === 'done' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {state === 'running' && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
              </div>
              <p className="text-xs text-slate-400 mb-3">
                {state === 'done' ? `${r.created} created${r.skipped ? ` · ${r.skipped} skipped` : ''}` :
                 state === 'running' ? 'Curating from Amazon...' :
                 `Books ${(b - 1) * BATCH_SIZE + 1}–${b * BATCH_SIZE}`}
              </p>
              <button onClick={() => runBatch(b)} disabled={running !== null || fixing}
                className="w-full px-3 py-1.5 text-xs font-semibold rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                {state === 'done' ? 'Re-run' : `Generate Batch ${b}`}
              </button>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 bg-rose-50 border border-rose-100 rounded-lg p-3 text-sm text-rose-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />{error}
        </div>
      )}

      {Object.values(results).some((r) => r.books?.length) && (
        <div className="mt-4 space-y-1.5 max-h-56 overflow-y-auto">
          {Object.entries(results).filter(([, r]) => r.books?.length).map(([b, r]) => (
            <div key={b}>
              <p className="text-xs font-semibold text-slate-500 mb-1">Batch {b} — {r.created} created</p>
              {r.books.map((bk, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${bk.amazon === 'tagged' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                  <span className="text-slate-600 truncate flex-1">{bk.title}</span>
                  {bk.author && <span className="text-slate-400 shrink-0 truncate max-w-[120px]">{bk.author}</span>}
                  <span className="text-slate-400 shrink-0 font-mono">{bk.internal_id}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}