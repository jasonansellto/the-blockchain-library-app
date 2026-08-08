import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, AlertCircle, RefreshCw, Download, GitBranch, FileJson, FileSpreadsheet, ChevronRight, Stethoscope, ShieldCheck, Archive } from 'lucide-react';
import Seo from '@/components/Seo';
import CoverageDashboard from '@/components/admin/coverage/CoverageDashboard';
import CoverageObjectList from '@/components/admin/coverage/CoverageObjectList';
import CoverageMatrix from '@/components/admin/coverage/CoverageMatrix';
import CategoryCoverage from '@/components/admin/coverage/CategoryCoverage';
import PriorityQueue from '@/components/admin/coverage/PriorityQueue';
import DataQuality from '@/components/admin/coverage/DataQuality';
import ReleaseComparison from '@/components/admin/coverage/ReleaseComparison';
import EditorialTaskPanel from '@/components/admin/coverage/EditorialTaskPanel';
import DiagnosticsTab from '@/components/admin/coverage/DiagnosticsTab';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'objects', label: 'Objects' },
  { id: 'matrix', label: 'Matrix' },
  { id: 'categories', label: 'Categories' },
  { id: 'priority', label: 'Priority Queue' },
  { id: 'quality', label: 'Data Quality' },
  { id: 'comparison', label: 'Release Impact' },
  { id: 'tasks', label: 'Editorial Tasks' },
  { id: 'diagnostics', label: 'Diagnostics' },
];

export default function CoverageIntelligence() {
  const [coverage, setCoverage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [validating, setValidating] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  // Read tab from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && TABS.find((t) => t.id === tab)) setActiveTab(tab);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('calculateCoverage', {});
      setCoverage(res.data?.coverage || res.coverage);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (coverage) base44.analytics.track({ eventName: 'coverage_dashboard_viewed', properties: { tab: activeTab } });
  }, [activeTab, coverage]);

  const recalculate = async () => {
    setRecalculating(true);
    try {
      const res = await base44.functions.invoke('calculateCoverage', { recalculate: true });
      setCoverage(res.data?.coverage || res.coverage);
    } catch (e) { setError(e.message); }
    setRecalculating(false);
  };

  const validate = async () => {
    setValidating(true);
    try {
      const res = await base44.functions.invoke('calculateCoverage', { validate: true });
      setCoverage(res.data?.coverage || res.coverage);
      setActiveTab('diagnostics');
    } catch (e) { setError(e.message); }
    setValidating(false);
  };

  const archiveInvalidTasks = async () => {
    setArchiving(true);
    try {
      // Mark all open tasks from pre-v2.3.1 builds as "review" (not delete)
      const tasks = await base44.entities.EditorialTask.list('-created_date', 200);
      const taskArr = tasks.results || tasks || [];
      const oldTasks = taskArr.filter((t) => t.status === 'open' && t.build_id && t.build_id !== coverage?.buildId);
      for (const t of oldTasks) {
        await base44.entities.EditorialTask.update(t.id, { status: 'review' });
      }
      setShowArchiveConfirm(false);
    } catch (e) { setError(e.message); }
    setArchiving(false);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({
      version: coverage.version,
      coverageEngineVersion: coverage.coverageEngineVersion,
      scoringSchemaVersion: coverage.scoringSchemaVersion,
      buildId: coverage.buildId,
      generatedAt: coverage.generatedAt,
      summary: coverage.summary,
      objects: coverage.objects.map(o => ({
        canonicalUid: o.canonicalUid, title: o.title, type: o.type,
        category: o.category?.name, categoryId: o.categoryId,
        coverageScore: o.coverageScore, priorityScore: o.priorityScore,
        relationshipScore: o.scores.relationships, metadataScore: o.scores.metadata,
        seoScore: o.scores.seo, referenceScore: o.scores.references,
        researchScore: o.scores.research, learningScore: o.scores.learning,
        developerScore: o.scores.developer,
        resolvedResources: o.resolvedResources,
        missingResources: o.missingResources,
        recommendations: o.recommendations,
        whyThisScore: o.whyThisScore,
      })),
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `coverage-intelligence-${coverage.buildId}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const headers = ['canonicalUid', 'title', 'type', 'category', 'coverageScore', 'priorityScore', 'relationshipScore', 'metadataScore', 'seoScore', 'referenceScore', 'researchScore', 'learningScore', 'developerScore', 'missingResources', 'recommendations'];
    const rows = coverage.objects.map(o => [
      o.canonicalUid, o.title, o.type, o.category?.name || '',
      o.coverageScore, o.priorityScore, o.scores.relationships, o.scores.metadata,
      o.scores.seo, o.scores.references, o.scores.research, o.scores.learning, o.scores.developer,
      o.missingResources.join('; '), o.recommendations.join('; '),
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `coverage-intelligence-${coverage.buildId}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportDiagnostics = () => {
    const blob = new Blob([JSON.stringify({
      buildId: coverage.buildId,
      coverageEngineVersion: coverage.coverageEngineVersion,
      scoringSchemaVersion: coverage.scoringSchemaVersion,
      resolutionVersion: coverage.resolutionVersion,
      resolutionSummary: coverage.diagnostics,
      mappingWarnings: coverage.diagnostics?.mappingWarnings,
      objectDiagnostics: coverage.objects?.map(o => o.diagnostics),
      health: coverage.health,
      anomalies: coverage.anomalies,
    }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `coverage-diagnostics-${coverage.buildId}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
        <p className="text-sm text-slate-500">Calculating coverage intelligence…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-32">
        <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 mb-2">Error: {error}</p>
        <button onClick={load} className="text-sm text-blue-600 hover:underline">Retry</button>
      </div>
    );
  }

  if (!coverage) return null;

  const s = coverage.summary;
  const health = coverage.health || {};

  return (
    <div className="min-h-full bg-slate-50">
      <Seo title="Coverage Intelligence" robots="noindex, nofollow" />

      <div className="border-b border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container-tbl py-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <GitBranch className="w-5 h-5 text-cyan-400" />
                <h1 className="text-2xl font-bold tracking-tight">Coverage Intelligence</h1>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">v{coverage.coverageEngineVersion}</span>
              </div>
              <p className="text-slate-300 text-sm">Knowledge Release {coverage.releaseVersion || '—'} · Build {coverage.buildId}</p>
              {coverage.baselineReset && (
                <p className="text-xs text-amber-400 mt-1">⚠ Scoring Baseline Reset — v2.3.1 resolution engine</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={validate} disabled={validating}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg disabled:opacity-60">
                {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Stethoscope className="w-4 h-4" />} Validate
              </button>
              <button onClick={exportJSON} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg">
                <FileJson className="w-4 h-4" /> JSON
              </button>
              <button onClick={exportCSV} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg">
                <FileSpreadsheet className="w-4 h-4" /> CSV
              </button>
              <button onClick={recalculate} disabled={recalculating}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-60">
                {recalculating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Recalculate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase">Canonical Objects</p>
              <p className="text-xl font-bold text-white">{(s.totalCanonicalObjects || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase">Coverage Eligible</p>
              <p className="text-xl font-bold text-white">{(s.totalObjects || 0).toLocaleString()}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase">Graph Edges</p>
              <p className="text-xl font-bold text-white">{s.totalEdges.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase">Global Coverage <span className="text-slate-500 normal-case">(eligible)</span></p>
              <p className="text-xl font-bold text-cyan-400">{s.globalScore}/100</p>
            </div>
          </div>

          {/* Health indicators */}
          <div className="flex items-center gap-3 mt-4 flex-wrap">
            <span className="text-xs text-slate-400">Health:</span>
            {Object.entries(health).map(([key, status]) => (
              <span key={key} className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                status === 'healthy' ? 'bg-emerald-500/20 text-emerald-300' :
                status === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())}: {status}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container-tbl py-6">
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === t.id ? 'bg-slate-900 text-white' : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-50'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && <CoverageDashboard coverage={coverage} />}
        {activeTab === 'objects' && <CoverageObjectList coverage={coverage} />}
        {activeTab === 'matrix' && <CoverageMatrix coverage={coverage} />}
        {activeTab === 'categories' && <CategoryCoverage coverage={coverage} />}
        {activeTab === 'priority' && <PriorityQueue coverage={coverage} />}
        {activeTab === 'quality' && <DataQuality coverage={coverage} />}
        {activeTab === 'comparison' && <ReleaseComparison coverage={coverage} />}
        {activeTab === 'tasks' && (
          <div>
            <div className="mb-4 flex justify-end">
              {showArchiveConfirm ? (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700">Archive all open tasks from pre-v2.3.1 builds?</p>
                  <button onClick={archiveInvalidTasks} disabled={archiving}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg disabled:opacity-50">
                    {archiving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />} Confirm Archive
                  </button>
                  <button onClick={() => setShowArchiveConfirm(false)} className="text-sm text-slate-500 hover:text-slate-700">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setShowArchiveConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg">
                  <Archive className="w-4 h-4" /> Archive Invalid Coverage Tasks
                </button>
              )}
            </div>
            <EditorialTaskPanel coverage={coverage} />
          </div>
        )}
        {activeTab === 'diagnostics' && <DiagnosticsTab coverage={coverage} onExportDiagnostics={exportDiagnostics} />}
      </div>
    </div>
  );
}