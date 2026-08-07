import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function ReleaseComparison({ coverage }) {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.CoverageSnapshot.list('-created_date', 10);
        setSnapshots(res.results || res || []);
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const current = coverage.summary;
  const previous = snapshots.find(s => s.build_id !== coverage.buildId);

  if (loading) return <div className="text-center py-12 text-slate-400">Loading snapshots…</div>;

  const metrics = [
    { label: 'Global Coverage', current: current.globalScore, previous: previous?.global_score, suffix: '/100' },
    { label: 'Canonical Objects', current: current.totalObjects, previous: previous?.total_objects },
    { label: 'Graph Edges', current: current.totalEdges, previous: previous?.total_edges },
    { label: 'High Priority Gaps', current: current.topCards.highPriorityGaps, previous: previous?.high_priority_gaps, invert: true },
    { label: 'Missing Concepts', current: current.topCards.missingConcepts, previous: previous?.missing_concepts_count, invert: true },
    { label: 'Unresolved Relationships', current: current.topCards.unresolvedRelationships, previous: previous?.unresolved_relationships_count, invert: true },
    { label: 'Research Coverage', current: current.dimensionScores.research, previous: previous?.research_coverage, suffix: '/100' },
    { label: 'Learning Coverage', current: current.dimensionScores.learning, previous: previous?.learning_coverage, suffix: '/100' },
    { label: 'Developer Coverage', current: current.dimensionScores.developer, previous: previous?.developer_coverage, suffix: '/100' },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">Release Impact</h2>
        <p className="text-sm text-slate-500">Coverage changes between Knowledge Engine releases.</p>
      </div>

      {previous ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map(m => {
            const change = m.previous != null ? m.current - m.previous : null;
            const isPositive = change !== null && (m.invert ? change < 0 : change > 0);
            const isNegative = change !== null && (m.invert ? change > 0 : change < 0);
            return (
              <div key={m.label} className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="text-xs text-slate-400 uppercase mb-1">{m.label}</p>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-slate-900">{m.current}{m.suffix || ''}</p>
                  {change !== null && change !== 0 && (
                    <span className={`text-sm font-semibold flex items-center gap-0.5 mb-1 ${isPositive ? 'text-emerald-600' : isNegative ? 'text-red-500' : 'text-slate-400'}`}>
                      {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : isNegative ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                      {change > 0 ? '+' : ''}{change.toFixed(1)}
                    </span>
                  )}
                </div>
                {m.previous != null && <p className="text-xs text-slate-400 mt-1">Previous: {m.previous}{m.suffix || ''}</p>}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <p className="text-slate-500 mb-2">No previous release snapshot available.</p>
          <p className="text-sm text-slate-400">Historical snapshots are stored automatically when coverage is recalculated across different Knowledge Engine builds.</p>
        </div>
      )}

      {snapshots.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase mb-3">Snapshot History</h3>
          <div className="bg-white border border-slate-200 rounded-lg overflow-x-auto">
            <table className="text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-3 font-semibold text-slate-700">Build ID</th>
                  <th className="text-left p-3 font-semibold text-slate-700">Release</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Coverage</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Objects</th>
                  <th className="text-right p-3 font-semibold text-slate-700">Gaps</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map(s => (
                  <tr key={s.id} className="border-b border-slate-100">
                    <td className="p-3 font-mono text-xs text-slate-600">{s.build_id}</td>
                    <td className="p-3 text-slate-600">{s.release_version || '—'}</td>
                    <td className="p-3 text-right font-semibold text-slate-900">{s.global_score}/100</td>
                    <td className="p-3 text-right text-slate-600">{s.total_objects?.toLocaleString()}</td>
                    <td className="p-3 text-right text-orange-500">{s.high_priority_gaps}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}