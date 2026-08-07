import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, AlertCircle, RefreshCw, Download, GitBranch, FileJson, FileSpreadsheet, ChevronRight } from 'lucide-react';
import Seo from '@/components/Seo';
import CoverageDashboard from '@/components/admin/coverage/CoverageDashboard';
import CoverageObjectList from '@/components/admin/coverage/CoverageObjectList';
import CoverageMatrix from '@/components/admin/coverage/CoverageMatrix';
import CategoryCoverage from '@/components/admin/coverage/CategoryCoverage';
import PriorityQueue from '@/components/admin/coverage/PriorityQueue';
import DataQuality from '@/components/admin/coverage/DataQuality';
import ReleaseComparison from '@/components/admin/coverage/ReleaseComparison';
import EditorialTaskPanel from '@/components/admin/coverage/EditorialTaskPanel';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'objects', label: 'Objects' },
  { id: 'matrix', label: 'Matrix' },
  { id: 'categories', label: 'Categories' },
  { id: 'priority', label: 'Priority Queue' },
  { id: 'quality', label: 'Data Quality' },
  { id: 'comparison', label: 'Release Impact' },
  { id: 'tasks', label: 'Editorial Tasks' },
];

export default function CoverageIntelligence() {
  const [coverage, setCoverage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

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

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({
      version: coverage.version,
      buildId: coverage.buildId,
      generatedAt: coverage.generatedAt,
      summary: coverage.summary,
      objects: coverage.objects.map(o => ({
        canonicalUid: o.canonicalUid, title: o.title, type: o.type, category: o.categoryId,
        coverageScore: o.coverageScore, priorityScore: o.priorityScore,
        relationshipScore: o.scores.relationships, metadataScore: o.scores.metadata,
        seoScore: o.scores.seo, referenceScore: o.scores.references,
        researchScore: o.scores.research, learningScore: o.scores.learning,
        developerScore: o.scores.developer, missingResources: o.missingResources,
        recommendations: o.recommendations,
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
      o.canonicalUid, o.title, o.type, o.categoryId || '',
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
              </div>
              <p className="text-slate-300 text-sm">Knowledge Engine v{coverage.releaseVersion} · Build {coverage.buildId}</p>
            </div>
            <div className="flex items-center gap-2">
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
              <p className="text-xl font-bold text-white">{s.totalObjects.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase">Graph Edges</p>
              <p className="text-xl font-bold text-white">{s.totalEdges.toLocaleString()}</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase">Global Coverage</p>
              <p className="text-xl font-bold text-cyan-400">{s.globalScore}/100</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-xs text-slate-400 uppercase">High Priority Gaps</p>
              <p className="text-xl font-bold text-orange-400">{s.topCards.highPriorityGaps}</p>
            </div>
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
        {activeTab === 'tasks' && <EditorialTaskPanel coverage={coverage} />}
      </div>
    </div>
  );
}