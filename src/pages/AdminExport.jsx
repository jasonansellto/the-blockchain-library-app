import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Download, Database, RefreshCw, Loader2, FileJson, AlertTriangle, ArrowLeft, Activity, GitBranch, ShieldCheck } from 'lucide-react';
import Seo from '@/components/Seo';
import { EXPORT_CONTENT_TYPES } from '@/lib/exportConfig';
import ExportCard from '@/components/admin/export/ExportCard';
import ReconciliationTable from '@/components/admin/export/ReconciliationTable';
import ExplorerStatusPanel from '@/components/admin/ExplorerStatusPanel';

function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function AdminExport() {
  const [tab, setTab] = useState('export');
  const [meta, setMeta] = useState({});
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [exporting, setExporting] = useState(null);
  const [recon, setRecon] = useState(null);
  const [reconLoading, setReconLoading] = useState(false);
  const [masterProgress, setMasterProgress] = useState(null);

  const loadMeta = useCallback(async () => {
    setLoadingMeta(true);
    const results = {};
    await Promise.all(EXPORT_CONTENT_TYPES.map(async (ct) => {
      try {
        const res = await base44.functions.invoke('exportContent', { type: ct.key, metaOnly: true });
        results[ct.key] = res.data || res;
      } catch (e) {
        results[ct.key] = { error: true, count: 0 };
      }
    }));
    setMeta(results);
    setLoadingMeta(false);
  }, []);

  useEffect(() => { loadMeta(); }, [loadMeta]);

  const exportType = async (ct) => {
    setExporting(ct.key);
    try {
      const res = await base44.functions.invoke('exportContent', { type: ct.key });
      const data = res.data || res;
      downloadJSON(ct.file, data.records || []);
    } catch (e) {
      console.error(e);
    }
    setExporting(null);
  };

  const exportEverything = async () => {
    setExporting('all');
    setMasterProgress({ current: 0, total: EXPORT_CONTENT_TYPES.length + 1 });
    const manifest = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      schemaVersion: '1.0',
      contentTypes: {},
      checksums: {},
      recordCounts: {},
    };
    let done = 0;
    for (const ct of EXPORT_CONTENT_TYPES) {
      try {
        const res = await base44.functions.invoke('exportContent', { type: ct.key });
        const data = res.data || res;
        const records = data.records || [];
        downloadJSON(ct.file, records);
        manifest.contentTypes[ct.key] = { label: ct.label, file: ct.file, count: data.count, lastUpdated: data.lastUpdated };
        manifest.recordCounts[ct.key] = data.count;
        manifest.checksums[ct.file] = await sha256(JSON.stringify(records));
      } catch (e) { console.error(e); }
      done++;
      setMasterProgress({ current: done, total: EXPORT_CONTENT_TYPES.length + 1 });
      await new Promise(r => setTimeout(r, 350));
    }
    try {
      const res = await base44.functions.invoke('exportContent', { type: 'relationships' });
      const data = res.data || res;
      const records = data.records || [];
      downloadJSON('relationships.json', records);
      manifest.contentTypes.relationships = { file: 'relationships.json', count: data.count };
      manifest.recordCounts.relationships = data.count;
      manifest.checksums['relationships.json'] = await sha256(JSON.stringify(records));
    } catch (e) { console.error(e); }
    downloadJSON('manifest.json', manifest);
    setMasterProgress(null);
    setExporting(null);
  };

  const loadReconciliation = async () => {
    setReconLoading(true);
    try {
      const res = await base44.functions.invoke('exportReconciliation', {});
      setRecon(res.data || res);
    } catch (e) { console.error(e); }
    setReconLoading(false);
  };

  useEffect(() => {
    if (tab === 'reconciliation' && !recon && !reconLoading) loadReconciliation();
     
  }, [tab]);

  const totalRecords = Object.values(meta).reduce((a, m) => a + (m?.count || 0), 0);

  return (
    <div className="min-h-full bg-slate-50">
      <Seo title="Content Export Center" description="Admin content export and Knowledge Engine reconciliation tools." robots="noindex, nofollow" />

      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container-tbl py-8">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-4">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Content Export Center</h1>
              <p className="text-sm text-slate-500">Knowledge Engine synchronization — read-only export &amp; reconciliation</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-6 border-b border-slate-200 -mb-px">
            {[
              { id: 'export', label: 'Export', icon: Download },
              { id: 'reconciliation', label: 'Reconciliation', icon: Activity },
              { id: 'explorer', label: 'Explorer Status', icon: GitBranch },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container-tbl py-8">
        {tab === 'export' && (
          <div>
            {/* Summary + master export */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-5 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{loadingMeta ? '…' : totalRecords}</p>
                  <p className="text-xs text-slate-400">Total records across {EXPORT_CONTENT_TYPES.length} content types</p>
                </div>
                <button onClick={loadMeta} disabled={loadingMeta}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50">
                  <RefreshCw className={`w-4 h-4 ${loadingMeta ? 'animate-spin' : ''}`} />
                </button>
                {masterProgress && (
                  <span className="text-sm text-slate-500">
                    Exporting… {masterProgress.current}/{masterProgress.total}
                  </span>
                )}
              </div>
              <button onClick={exportEverything} disabled={!!exporting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-60">
                {exporting === 'all' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileJson className="w-4 h-4" />}
                {exporting === 'all' ? 'Exporting everything…' : 'Export Everything'}
              </button>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {EXPORT_CONTENT_TYPES.map(ct => (
                <ExportCard key={ct.key} ct={ct} meta={meta[ct.key]} exporting={exporting === ct.key} onExport={exportType} />
              ))}
            </div>

            {/* Relationships card */}
            <div className="mt-6 p-5 bg-slate-900 text-white rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GitBranch className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold">Relationships Graph</h3>
                  <p className="text-sm text-slate-400">All internal relationships across content types → relationships.json</p>
                </div>
              </div>
              <button onClick={() => exportType({ key: 'relationships', file: 'relationships.json' })} disabled={exporting === 'relationships'}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-60">
                {exporting === 'relationships' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export
              </button>
            </div>

            <div className="mt-6 flex items-start gap-2 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700">
                This tool is <strong>read-only</strong>. It exports existing content as structured JSON for synchronization with the
                GitHub Knowledge Engine. No content is modified, summarized, or regenerated. Every available field is preserved.
              </p>
            </div>
          </div>
        )}

        {tab === 'reconciliation' && (
          <div>
            {reconLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                <p className="text-sm text-slate-500">Analyzing all content against Knowledge Engine requirements…</p>
              </div>
            ) : recon ? (
              <ReconciliationTable recon={recon} />
            ) : (
              <div className="text-center py-20">
                <AlertTriangle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400 mb-4">No reconciliation data loaded.</p>
                <button onClick={loadReconciliation} className="text-sm text-blue-600 hover:underline">Load reconciliation</button>
              </div>
            )}
          </div>
        )}

        {tab === 'explorer' && <ExplorerStatusPanel />}
      </div>
    </div>
  );
}