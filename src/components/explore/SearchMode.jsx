import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { searchObjects, getTypeMeta, TYPE_META } from '@/lib/knowledgeEngine';
import SearchResultCard from './SearchResultCard';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'alphabetical', label: 'Alphabetical' },
  { value: 'mostConnected', label: 'Most Connected' },
  { value: 'highestQuality', label: 'Highest Knowledge Quality' },
];

const FILTERABLE_TYPES = ['glossary', 'article', 'book', 'research', 'learning-path', 'resource', 'code-snippet', 'rpc'];

export default function SearchMode({ searchIndex, related, categories, query, filterType, filterCategory, searchParams, setSearchParams, onObjectClick }) {
  const [localQuery, setLocalQuery] = useState(query);
  const [sort, setSort] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: filterType || '',
    categoryId: filterCategory || '',
    tag: '',
    minRelationships: 0,
    hasResearch: false, hasBooks: false, hasDevResources: false, hasLearningPath: false,
  });

  useEffect(() => { setLocalQuery(query); }, [query]);
  useEffect(() => { setFilters(f => ({ ...f, type: filterType || '', categoryId: filterCategory || '' })); }, [filterType, filterCategory]);

  const updateUrl = (q) => {
    const params = new URLSearchParams(searchParams);
    if (q) params.set('q', q); else params.delete('q');
    setSearchParams(params, { replace: true });
  };

  const results = useMemo(() => searchObjects(searchIndex, related, localQuery, filters, sort), [searchIndex, related, localQuery, filters, sort]);
  const categoryName = (id) => categories.find(c => c.id === id)?.name;

  const activeFilterCount = (filters.type ? 1 : 0) + (filters.categoryId ? 1 : 0) +
    (filters.hasResearch ? 1 : 0) + (filters.hasBooks ? 1 : 0) + (filters.hasDevResources ? 1 : 0) +
    (filters.hasLearningPath ? 1 : 0) + (filters.minRelationships > 0 ? 1 : 0);

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input type="text" value={localQuery} onChange={(e) => { setLocalQuery(e.target.value); updateUrl(e.target.value); }}
          placeholder="Search concepts, definitions, books, research…"
          className="w-full pl-12 pr-12 py-3 text-base bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" autoFocus />
        {localQuery && (
          <button onClick={() => { setLocalQuery(''); updateUrl(''); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button onClick={() => setShowFilters(!showFilters)} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
          <SlidersHorizontal className="w-4 h-4" /> Filters {activeFilterCount > 0 && <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">{activeFilterCount}</span>}
        </button>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="text-sm text-slate-400">{results.length} results</span>
        {filters.type && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white rounded-full" style={{ backgroundColor: getTypeMeta(filters.type).color }}>
            {getTypeMeta(filters.type).label}
            <button onClick={() => setFilters(f => ({ ...f, type: '' }))}><X className="w-3 h-3" /></button>
          </span>
        )}
      </div>

      {showFilters && (
        <div className="mb-6 p-4 bg-white border border-slate-200 rounded-lg space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Resource Type</label>
            <div className="flex flex-wrap gap-2 mt-2">
              <button onClick={() => setFilters(f => ({ ...f, type: '' }))} className={`px-3 py-1 text-xs font-medium rounded-full ${!filters.type ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>All</button>
              {FILTERABLE_TYPES.map(t => {
                const m = TYPE_META[t];
                return <button key={t} onClick={() => setFilters(f => ({ ...f, type: t }))} className={`px-3 py-1 text-xs font-medium rounded-full ${filters.type === t ? 'text-white' : 'bg-slate-100 text-slate-600'}`} style={filters.type === t ? { backgroundColor: m.color } : {}}>{m.label}</button>;
              })}
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            {[['hasResearch', 'Has Research'], ['hasBooks', 'Has Books'], ['hasDevResources', 'Has Developer Resources'], ['hasLearningPath', 'Has Learning Path']].map(([key, label]) => (
              <label key={key} className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={filters[key]} onChange={e => setFilters(f => ({ ...f, [key]: e.target.checked }))} className="rounded" />
                {label}
              </label>
            ))}
          </div>
          <div>
            <label className="text-sm text-slate-600">Min relationships: <strong>{filters.minRelationships}</strong></label>
            <input type="range" min="0" max="20" value={filters.minRelationships} onChange={e => setFilters(f => ({ ...f, minRelationships: parseInt(e.target.value) }))} className="w-full mt-1" />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {results.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400">No results found. Try a different search term or filter.</p>
          </div>
        ) : (
          results.slice(0, 50).map(r => <SearchResultCard key={r.id} result={r} categoryName={categoryName(r.categoryId)} onOpen={onObjectClick} />)
        )}
      </div>
    </div>
  );
}