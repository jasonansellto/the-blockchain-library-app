import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Loader2, X } from 'lucide-react';

export default function ArticleSearchSelect({ value, initialTitle, onChange }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState(initialTitle || '');
  const containerRef = useRef(null);

  useEffect(() => {
    if (value && !selectedTitle) {
      base44.entities.Article.get(value)
        .then(a => setSelectedTitle(a?.title || ''))
        .catch(() => {});
    }
    if (!value) setSelectedTitle('');
  }, [value]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!query.trim()) { setResults([]); return; }
      setLoading(true);
      try {
        const res = await base44.entities.Article.filter(
          { title: { $regex: query.trim(), $options: 'i' }, status: 'published' },
          '-updated_date', 10, 0
        );
        setResults(res.results || res || []);
      } catch (e) { setResults([]); }
      setLoading(false);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectArticle = (article) => {
    onChange(article.id, article.title);
    setSelectedTitle(article.title);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const clearSelection = () => {
    onChange('', '');
    setSelectedTitle('');
  };

  return (
    <div ref={containerRef} className="relative">
      {selectedTitle ? (
        <div className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg">
          <span className="truncate text-slate-700">{selectedTitle}</span>
          <button onClick={clearSelection} className="shrink-0 text-slate-400 hover:text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Search article by title..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />}
        </div>
      )}
      {open && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {results.map(a => (
            <button key={a.id} onClick={() => selectArticle(a)}
              className="block w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 truncate">
              {a.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}