import React, { useState, useMemo } from 'react';
// CoverageObjectList: searchable list with per-object diagnostics
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { getCoverageLevelLabel } from './coverageUtils';

const SORT_OPTIONS = [
  { value: 'priority', label: 'Highest Priority' },
  { value: 'coverageAsc', label: 'Lowest Coverage' },
  { value: 'coverageDesc', label: 'Highest Coverage' },
  { value: 'connected', label: 'Most Connected' },
  { value: 'missing', label: 'Most Missing Resources' },
  { value: 'alpha', label: 'Alphabetical' },
];

const LEVEL_FILTERS = ['excellent', 'strong', 'needsImprovement', 'weak', 'sparse'];
const TYPE_FILTERS = ['glossary', 'topic', 'book', 'research', 'learning-path', 'resource', 'code-example', 'infrastructure'];

export default function CoverageObjectList({ coverage }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('priority');
  const [typeFilter, setTypeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [showDiagnostics, setShowDiagnostics] = useState(null);

  const filtered = useMemo(() => {
    let results = coverage.objects;
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(o => o.title.toLowerCase().includes(q) || o.canonicalUid.toLowerCase().includes(q));
    }
    if (typeFilter) results = results.filter(o => o.type === typeFilter || o.typeAlias === typeFilter);
    if (levelFilter) results = results.filter(o => o.coverageLevel === levelFilter);
    switch (sort) {
      case 'coverageAsc': results = [...results].sort((a, b) => a.coverageScore - b.coverageScore); break;
      case 'coverageDesc': results = [...results].sort((a, b) => b.coverageScore - a.coverageScore); break;
      case 'connected': results = [...results].sort((a, b) => b.centrality.degree - a.centrality.degree); break;
      case 'missing': results = [...results].sort((a, b) => b.missingResources.length - a.missingResources.length); break;
      case 'alpha': results = [...results].sort((a, b) => a.title.localeCompare(b.title)); break;
      default: results = [...results].sort((a, b) => b.priorityScore - a.priorityScore);
    }
    return results;
  }, [coverage.objects, query, sort, typeFilter, levelFilter]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search objects…" className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg">
          <option value="">All Types</option>
          {TYPE_FILTERS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg">
          <option value="">All Levels</option>
          {LEVEL_FILTERS.map(l => <option key={l} value={l}>{getCoverageLevelLabel(l)}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="text-sm text-slate-400">{filtered.length} objects</span>
      </div>

      <div className="space-y-2">
        {filtered.slice(0, 100).map(obj => (
          <div key={obj.canonicalUid} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div onClick={() => setExpanded(expanded === obj.canonicalUid ? null : obj.canonicalUid)}
              className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-slate-900 text-sm truncate">{obj.title}</span>
                  <span className="text-xs text-slate-400 shrink-0">{obj.type}</span>
                  {obj.category?.name && obj.category.name !== 'Uncategorized' && (
                    <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">{obj.category.name}</span>
                  )}
                </div>
                <code className="text-xs text-slate-400 font-mono">{obj.canonicalUid}</code>
              </div>
              <div className="flex items-center gap-4 text-sm shrink-0">
                <div className="text-center">
                  <p className="text-xs text-slate-400">Coverage</p>
                  <p className="font-bold text-slate-900">{obj.coverageScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400">Priority</p>
                  <p className="font-bold text-orange-500">{obj.priorityScore}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400">Links</p>
                  <p className="font-bold text-slate-700">{obj.centrality.degree}</p>
                </div>
                {expanded === obj.canonicalUid ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>
            {expanded === obj.canonicalUid && (
              <div className="border-t border-slate-100 p-4 bg-slate-50">
                {/* Resolved Resources */}
                {obj.resolvedResources && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Resolved Resources</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(obj.resolvedResources).filter(([k]) => k !== 'total').map(([k, v]) => (
                        <span key={k} className={`text-xs px-2 py-0.5 rounded ${v > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                          {k}: {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dimension Scores */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
                  {Object.entries(obj.scores).map(([key, val]) => (
                    <div key={key} className="text-center">
                      <p className="text-xs text-slate-400 capitalize">{key}</p>
                      <p className="text-sm font-semibold text-slate-700">{val}</p>
                      <div className="w-full h-1 bg-slate-200 rounded-full mt-1"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${val}%` }} /></div>
                    </div>
                  ))}
                </div>

                {/* Why this score */}
                {obj.whyThisScore && (
                  <div className="mb-3 p-2 bg-blue-50 rounded">
                    <p className="text-xs text-blue-700"><strong>Why this score:</strong> {obj.whyThisScore}</p>
                  </div>
                )}

                {obj.missingResources.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Missing Resources</p>
                    <div className="flex flex-wrap gap-1">
                      {obj.missingResources.map(m => <span key={m} className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">{m}</span>)}
                    </div>
                  </div>
                )}
                {obj.recommendations.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Recommendations</p>
                    <ul className="text-sm text-slate-600 space-y-0.5">
                      {obj.recommendations.map((r, i) => <li key={i} className="flex items-center gap-1.5"><span className="w-1 h-1 bg-blue-500 rounded-full" />{r}</li>)}
                    </ul>
                  </div>
                )}

                {/* Diagnostics toggle */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowDiagnostics(showDiagnostics === obj.canonicalUid ? null : obj.canonicalUid); }}
                  className="mt-3 text-xs font-medium text-blue-600 hover:underline"
                >
                  {showDiagnostics === obj.canonicalUid ? 'Hide Diagnostics' : 'View Diagnostics'}
                </button>
                {showDiagnostics === obj.canonicalUid && obj.diagnostics && (
                  <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-slate-400">Category Resolution:</span> <span className="text-slate-700">{obj.diagnostics.categoryResolution?.name}</span> <span className="text-slate-400">({obj.diagnostics.categoryResolution?.source})</span></div>
                      <div><span className="text-slate-400">Inbound:</span> <span className="text-slate-700">{obj.diagnostics.inboundRelationships}</span></div>
                      <div><span className="text-slate-400">Outbound:</span> <span className="text-slate-700">{obj.diagnostics.outboundRelationships}</span></div>
                      <div><span className="text-slate-400">Unique Rels:</span> <span className="text-slate-700">{obj.diagnostics.uniqueRelationships}</span></div>
                      <div><span className="text-slate-400">References:</span> <span className="text-slate-700">{obj.diagnostics.referencesDetected}</span></div>
                    </div>
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-slate-400 mb-1">Coverage Calculation:</p>
                      <p className="text-slate-700">Req Fulfillment: {obj.diagnostics.coverageCalculation?.requirementFulfillment} · Dim Avg: {obj.diagnostics.coverageCalculation?.dimensionAverage} → <strong>{obj.diagnostics.coverageCalculation?.final}</strong></p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-1">Priority Calculation:</p>
                      <p className="text-slate-700">Coverage Gap: {obj.diagnostics.priorityCalculation?.coverageGap} · Centrality: {obj.diagnostics.priorityCalculation?.centrality} · Resource Gap: {obj.diagnostics.priorityCalculation?.resourceGap} → <strong>{obj.diagnostics.priorityCalculation?.final}</strong></p>
                    </div>
                    {obj.references?.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-slate-400 mb-1">Detected References:</p>
                        {obj.references.slice(0, 5).map((ref, i) => (
                          <div key={i} className="text-slate-600 truncate">{ref.value} <span className="text-slate-400">({ref.type})</span></div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {filtered.length > 100 && <p className="text-center text-sm text-slate-400 py-4">Showing first 100 of {filtered.length.toLocaleString()} objects. Use filters to narrow down.</p>}
      </div>
    </div>
  );
}