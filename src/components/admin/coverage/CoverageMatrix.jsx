import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

const COLUMNS = [
  { key: 'definition', label: 'Def' },
  { key: 'article', label: 'Art' },
  { key: 'book', label: 'Book' },
  { key: 'research', label: 'Res' },
  { key: 'tutorial', label: 'Tut' },
  { key: 'quiz', label: 'Quiz' },
  { key: 'learningPath', label: 'LP' },
  { key: 'codeSnippet', label: 'Code' },
  { key: 'developerResource', label: 'Dev' },
  { key: 'references', label: 'Refs' },
  { key: 'seo', label: 'SEO' },
  { key: 'relationships', label: 'Rel' },
];

export default function CoverageMatrix({ coverage }) {
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('priority');

  const rows = useMemo(() => {
    let results = coverage.objects;
    if (query) {
      const q = query.toLowerCase();
      results = results.filter(o => o.title.toLowerCase().includes(q));
    }
    const sorted = [...results];
    if (sortBy === 'priority') sorted.sort((a, b) => b.priorityScore - a.priorityScore);
    else if (sortBy === 'coverage') sorted.sort((a, b) => a.coverageScore - b.coverageScore);
    else if (sortBy === 'alpha') sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted.slice(0, 200);
  }, [coverage.objects, query, sortBy]);

  const getSymbol = (obj, col) => {
    if (col.key === 'relationships') {
      if (obj.centrality.degree >= 10) return { symbol: '✓', color: 'text-emerald-600' };
      if (obj.centrality.degree >= 3) return { symbol: '○', color: 'text-amber-500' };
      return { symbol: '—', color: 'text-slate-300' };
    }
    if (col.key === 'references' || col.key === 'seo') {
      const score = obj.scores[col.key === 'references' ? 'references' : 'seo'];
      if (score >= 70) return { symbol: '✓', color: 'text-emerald-600' };
      if (score >= 30) return { symbol: '○', color: 'text-amber-500' };
      return { symbol: '—', color: 'text-slate-300' };
    }
    const has = obj.resources[col.key];
    return has ? { symbol: '✓', color: 'text-emerald-600' } : { symbol: '—', color: 'text-slate-300' };
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search concepts…" className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg">
          <option value="priority">Sort by Priority</option>
          <option value="coverage">Sort by Coverage (Lowest)</option>
          <option value="alpha">Sort Alphabetically</option>
        </select>
        <span className="text-sm text-slate-400">{rows.length} rows</span>
      </div>

      <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
        <table className="text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left p-2 font-semibold text-slate-700 sticky left-0 bg-slate-50 z-10 min-w-[160px]">Concept</th>
              <th className="p-2 font-semibold text-slate-600 text-center min-w-[50px]">Cov</th>
              <th className="p-2 font-semibold text-slate-600 text-center min-w-[50px]">Pri</th>
              {COLUMNS.map(c => <th key={c.key} className="p-2 font-semibold text-slate-600 text-center min-w-[50px]">{c.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(obj => (
              <tr key={obj.canonicalUid} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-2 font-medium text-slate-900 sticky left-0 bg-white z-10 truncate max-w-[160px]">{obj.title}</td>
                <td className="p-2 text-center font-semibold text-slate-700">{obj.coverageScore}</td>
                <td className="p-2 text-center font-semibold text-orange-500">{obj.priorityScore}</td>
                {COLUMNS.map(c => {
                  const { symbol, color } = getSymbol(obj, c);
                  return <td key={c.key} className={`p-2 text-center ${color} text-base`}>{symbol}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="text-emerald-600 font-bold">✓</span> Complete</span>
        <span className="flex items-center gap-1"><span className="text-amber-500 font-bold">○</span> Partial</span>
        <span className="flex items-center gap-1"><span className="text-slate-300 font-bold">—</span> Missing</span>
      </div>
    </div>
  );
}