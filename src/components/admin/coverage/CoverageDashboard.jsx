import React from 'react';
// CoverageDashboard — global score, dimension cards, coverage heatmap
import { TrendingUp, TrendingDown, AlertTriangle, FileSearch, Link2, BookOpen, GraduationCap, Code, Search as SearchIcon } from 'lucide-react';
import CoverageHeatmap from './CoverageHeatmap';

const LEVEL_COLORS = {
  excellent: 'bg-emerald-500', strong: 'bg-blue-500', needsImprovement: 'bg-amber-500',
  weak: 'bg-orange-500', sparse: 'bg-red-500',
};
const LEVEL_LABELS = { excellent: 'Excellent', strong: 'Strong', needsImprovement: 'Needs Improvement', weak: 'Weak', sparse: 'Sparse' };

export default function CoverageDashboard({ coverage }) {
  const s = coverage.summary;
  const cards = [
    { label: 'High Priority Gaps', value: s.topCards.highPriorityGaps, icon: AlertTriangle, color: 'text-orange-500' },
    { label: 'Missing Concepts', value: s.topCards.missingConcepts, icon: FileSearch, color: 'text-red-500' },
    { label: 'Unresolved Relationships', value: s.topCards.unresolvedRelationships, icon: Link2, color: 'text-amber-500' },
    { label: 'Missing SEO', value: s.topCards.missingSEO, icon: SearchIcon, color: 'text-purple-500' },
    { label: 'Missing Research', value: s.topCards.missingResearch, icon: GraduationCap, color: 'text-blue-500' },
    { label: 'Missing Tutorials', value: s.topCards.missingTutorials, icon: BookOpen, color: 'text-cyan-500' },
    { label: 'Missing Code Examples', value: s.topCards.missingCodeExamples, icon: Code, color: 'text-indigo-500' },
  ];

  const dimensions = [
    { key: 'metadata', label: 'Content Completeness', weight: '20%' },
    { key: 'relationships', label: 'Relationships', weight: '15%' },
    { key: 'seo', label: 'SEO', weight: '10%' },
    { key: 'references', label: 'References', weight: '10%' },
    { key: 'learning', label: 'Learning Resources', weight: '15%' },
    { key: 'developer', label: 'Developer Resources', weight: '10%' },
    { key: 'research', label: 'Research', weight: '10%' },
  ];

  return (
    <div className="space-y-6">
      {/* Global Score */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Overall Knowledge Coverage</h2>
            {s.scoreChange !== null && (
              <p className={`text-sm flex items-center gap-1 mt-1 ${s.scoreChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {s.scoreChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {s.scoreChange >= 0 ? '+' : ''}{s.scoreChange.toFixed(1)} since last release
              </p>
            )}
          </div>
          <div className="text-3xl font-bold text-slate-900">{s.globalScore}<span className="text-lg text-slate-400">/100</span></div>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all" style={{ width: `${s.globalScore}%` }} />
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {cards.map(c => (
          <div key={c.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <c.icon className={`w-5 h-5 ${c.color} mb-2`} />
            <p className="text-2xl font-bold text-slate-900">{c.value.toLocaleString()}</p>
            <p className="text-xs text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Dimension Scores */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Coverage Dimensions</h3>
        <div className="space-y-3">
          {dimensions.map(d => (
            <div key={d.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">{d.label} <span className="text-xs text-slate-400 ml-1">{d.weight}</span></span>
                <span className="text-sm font-semibold text-slate-900">{s.dimensionScores[d.key]}/100</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.dimensionScores[d.key]}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coverage Levels */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Coverage Level Distribution</h3>
        <div className="grid grid-cols-5 gap-3">
          {Object.entries(s.coverageLevels).map(([level, count]) => (
            <div key={level} className="text-center">
              <div className={`w-full h-2 ${LEVEL_COLORS[level]} rounded-full mb-2`} />
              <p className="text-xl font-bold text-slate-900">{count.toLocaleString()}</p>
              <p className="text-xs text-slate-500">{LEVEL_LABELS[level]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap */}
      <CoverageHeatmap coverage={coverage} />
    </div>
  );
}