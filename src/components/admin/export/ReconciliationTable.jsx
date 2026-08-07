import React from 'react';
import { AlertTriangle, CheckCircle, ArrowRight, Sparkles, Activity, Link2 } from 'lucide-react';

const METRICS = [
  { key: 'exportCount', label: 'Export', type: 'neutral' },
  { key: 'mappedCount', label: 'Mapped', type: 'good' },
  { key: 'missingIds', label: 'Missing IDs', type: 'bad' },
  { key: 'duplicateIds', label: 'Dup IDs', type: 'bad' },
  { key: 'duplicateSlugs', label: 'Dup Slugs', type: 'bad' },
  { key: 'missingMetadata', label: 'Missing Meta', type: 'bad' },
  { key: 'missingSEO', label: 'Missing SEO', type: 'bad' },
  { key: 'missingCanonicalUrls', label: 'No Canonical', type: 'bad' },
  { key: 'uncategorizedRecords', label: 'Uncategorized', type: 'bad' },
  { key: 'missingTags', label: 'No Tags', type: 'bad' },
  { key: 'invalidReferences', label: 'Bad Refs', type: 'bad' },
  { key: 'avgQualityScore', label: 'Quality', type: 'score' },
];

export default function ReconciliationTable({ recon }) {
  const { reconciliation, mapping, relationshipCount } = recon;
  const { contentTypes, totalBrokenRelationships } = reconciliation;

  const totalRecords = Object.values(contentTypes).reduce((a, c) => a + c.exportCount, 0);
  const totalMapped = Object.values(contentTypes).reduce((a, c) => a + c.mappedCount, 0);
  const typeCount = Object.keys(contentTypes).length;
  const avgQuality = typeCount ? Math.round(Object.values(contentTypes).reduce((a, c) => a + c.avgQualityScore, 0) / typeCount) : 0;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Records" value={totalRecords} icon={Activity} />
        <StatCard label="Mapped to KE" value={totalMapped} icon={CheckCircle} color="green" />
        <StatCard label="Relationships" value={relationshipCount} icon={Link2} color="blue" />
        <StatCard label="Broken Relations" value={totalBrokenRelationships} icon={AlertTriangle} color={totalBrokenRelationships > 0 ? 'red' : 'green'} />
      </div>

      {/* Mapping suggestions */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-blue-600" /> Knowledge Engine Mapping</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mapping.map(m => (
            <div key={m.sourceType} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{m.sourceLabel}</p>
                <p className="text-xs text-slate-400">{m.recordCount} records</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
              <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded whitespace-nowrap">{m.targetObject}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-type reconciliation table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Reconciliation Report</h3>
          <p className="text-sm text-slate-500">Per-content-type analysis against Knowledge Engine requirements</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left font-semibold text-slate-700 p-3 sticky left-0 bg-slate-50 z-10 min-w-[140px]">Content Type</th>
                {METRICS.map(m => <th key={m.key} className="text-center font-semibold text-slate-700 p-3 whitespace-nowrap">{m.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {Object.entries(contentTypes).map(([key, c]) => (
                <tr key={key} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-900 sticky left-0 bg-white z-10">{c.label}</td>
                  {METRICS.map(m => (
                    <td key={m.key} className="p-3 text-center"><MetricCell value={c[m.key]} type={m.type} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quality score distribution */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-slate-900">Average Quality Score</h3>
          <span className="text-2xl font-bold text-slate-900">{avgQuality}<span className="text-sm text-slate-400 font-normal">/100</span></span>
        </div>
        <p className="text-sm text-slate-500 mb-4">Weighted by metadata, relationships, SEO, references, categorization &amp; tags</p>
        <div className="space-y-3">
          {Object.entries(contentTypes).map(([key, c]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm text-slate-600 w-32 truncate shrink-0">{c.label}</span>
              <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${c.avgQualityScore >= 70 ? 'bg-green-500' : c.avgQualityScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${c.avgQualityScore}%` }} />
              </div>
              <span className="text-sm font-semibold text-slate-900 w-10 text-right shrink-0">{c.avgQualityScore}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color = 'slate' }) {
  const colors = {
    slate: 'bg-slate-100 text-slate-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
  };
  return (
    <div className="p-4 bg-white border border-slate-200 rounded-xl">
      <div className={`w-8 h-8 rounded-lg ${colors[color]} flex items-center justify-center mb-2`}><Icon className="w-4 h-4" /></div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

function MetricCell({ value, type }) {
  if (type === 'score') {
    const color = value >= 70 ? 'text-green-600' : value >= 40 ? 'text-amber-600' : 'text-red-600';
    return <span className={`font-semibold ${color}`}>{value}</span>;
  }
  if (type === 'good') return <span className="text-slate-700">{value}</span>;
  if (type === 'neutral') return <span className="text-slate-700 font-medium">{value}</span>;
  return value > 0 ? <span className="font-semibold text-red-600">{value}</span> : <span className="text-green-500">✓</span>;
}