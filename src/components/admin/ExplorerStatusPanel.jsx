import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { RefreshCw, GitBranch, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

export default function ExplorerStatusPanel() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('syncKnowledgeRelease', {});
      setStatus(res.data || res);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const res = await base44.functions.invoke('syncKnowledgeRelease', { refresh: true });
      setStatus(res.data || res);
    } catch (e) { console.error(e); }
    setRefreshing(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-blue-600 animate-spin" /></div>;

  const m = status?.manifest;
  const cached = status?.cached;
  const display = m || cached;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-slate-900">Explorer Status</h3>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60">
          {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh Knowledge Release
        </button>
      </div>

      {display ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatusCard label="Platform Version" value={display.platformVersion || '—'} />
          <StatusCard label="Knowledge Release" value={display.knowledgeReleaseVersion || display.releaseVersion || '—'} />
          <StatusCard label="Compiler Version" value={display.compilerVersion || '—'} />
          <StatusCard label="Build ID" value={display.buildId || '—'} mono />
          <StatusCard label="Canonical Objects" value={display.totals?.canonicalObjects?.toLocaleString() || '—'} />
          <StatusCard label="Graph Edges" value={display.totals?.edges?.toLocaleString() || '—'} />
          <StatusCard label="Search Records" value={display.totals?.searchableObjects?.toLocaleString() || '—'} />
          <StatusCard label="Failed Relationships" value={display.quality?.unresolvedRelationships?.toLocaleString() || '—'} alert={(display.quality?.unresolvedRelationships || 0) > 0} />
          <StatusCard label="Missing Concepts" value={display.quality?.uniqueMissingConcepts?.toLocaleString() || '—'} alert={(display.quality?.uniqueMissingConcepts || 0) > 0} />
          <StatusCard label="Last Synced" value={status?.lastSynced ? new Date(status.lastSynced).toLocaleString() : 'Never'} />
        </div>
      ) : (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <p className="text-sm text-amber-700">Unable to fetch GitHub release. Check the repository URL.</p>
        </div>
      )}

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <p className="text-xs text-slate-600">Refreshing does not modify source content. It only reads the GitHub Knowledge Engine manifest.</p>
      </div>
    </div>
  );
}

function StatusCard({ label, value, mono, alert }) {
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-lg">
      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`font-semibold ${alert ? 'text-amber-600' : 'text-slate-900'} ${mono ? 'font-mono text-sm' : ''}`}>{value}</p>
    </div>
  );
}