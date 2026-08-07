import React from 'react';
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ExportCard({ ct, meta, exporting, onExport }) {
  const count = meta?.count;
  const lastUpdated = meta?.lastUpdated;
  const isLoading = count === undefined;
  const hasError = meta?.error;
  const ready = !isLoading && !hasError && count > 0;

  return (
    <div className="p-5 bg-white border border-slate-200 rounded-xl flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
          <ct.Icon className="w-5 h-5 text-slate-600" />
        </div>
        {hasError ? <AlertCircle className="w-4 h-4 text-red-400" /> : ready ? <CheckCircle className="w-4 h-4 text-green-400" /> : null}
      </div>
      <h3 className="font-bold text-slate-900 mb-2">{ct.label}</h3>
      <div className="text-sm text-slate-500 space-y-1 mb-4 flex-1">
        <p>Total records: {isLoading ? <span className="text-slate-300">…</span> : <strong className="text-slate-900">{count ?? 0}</strong>}</p>
        <p>Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</p>
        <p className="font-mono text-xs text-slate-400 truncate">{ct.file}</p>
      </div>
      <button onClick={() => onExport(ct)} disabled={exporting || isLoading || hasError || !count}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {exporting ? 'Exporting…' : 'Export JSON'}
      </button>
    </div>
  );
}