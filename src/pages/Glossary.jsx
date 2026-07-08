import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Search, Library } from 'lucide-react';
import GlossaryCard from '@/components/cards/GlossaryCard';
import Seo from '@/components/Seo';
import { buildCollectionPageSchema, buildBreadcrumbSchema } from '@/lib/seoSchemas';

const ALPHABET = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export default function Glossary() {
  const [terms, setTerms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [subcategory, setSubcategory] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [termsRes, catsRes] = await Promise.all([
        base44.entities.GlossaryTerm.list('title', 500),
        base44.entities.Category.list('-updated_date', 50),
      ]);
      setTerms(termsRes.results || termsRes || []);
      setCategories(catsRes.results || catsRes || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const subcategories = useMemo(() => {
    const set = new Set(terms.map(t => t.subcategory).filter(Boolean));
    return Array.from(set).sort();
  }, [terms]);

  const filtered = useMemo(() => {
    return terms.filter(t => {
      if (query && !t.title.toLowerCase().includes(query.toLowerCase()) && !t.definition.toLowerCase().includes(query.toLowerCase())) return false;
      if (difficulty && t.difficulty !== difficulty) return false;
      if (subcategory && t.subcategory !== subcategory) return false;
      if (activeLetter) {
        const first = t.title[0]?.toUpperCase() || '';
        if (activeLetter === '#') return !/[A-Z]/.test(first);
        if (first !== activeLetter) return false;
      }
      return true;
    });
  }, [terms, query, activeLetter, difficulty, subcategory]);

  const schemas = [
    buildCollectionPageSchema('Blockchain Glossary', 'Clear, precise definitions for every blockchain, crypto, and Web3 term.', '/glossary'),
    buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Glossary', url: '/glossary' }])
  ];

  return (
    <div>
      <Seo title="Blockchain Glossary" description="Clear, precise definitions for every blockchain, crypto, and Web3 term — linked to articles, books, and research for deeper learning." schemas={schemas} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-12">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3"><span>Home</span><span>/</span><span className="text-slate-700 font-medium">Glossary</span></div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">Blockchain Glossary</h1>
          <p className="text-slate-500 max-w-2xl">Clear, precise definitions for every blockchain, crypto, and Web3 term — linked to articles, books, and research for deeper learning.</p>
        </div>
      </div>

      <div className="container-tbl py-10">
        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search glossary terms..."
              className="w-full pl-12 pr-4 py-3 text-base bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}
            className="px-4 py-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All categories</option>
            {subcategories.map(sc => <option key={sc} value={sc}>{sc}</option>)}
          </select>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
            className="px-4 py-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Alphabet nav */}
        <div className="flex flex-wrap gap-1 mb-8 pb-6 border-b border-slate-100">
          <button onClick={() => setActiveLetter('')}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${!activeLetter ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
            All
          </button>
          {ALPHABET.map(letter => (
            <button key={letter} onClick={() => setActiveLetter(letter === activeLetter ? '' : letter)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${activeLetter === letter ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
              {letter}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Library className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400">No glossary terms found. Try a different search or letter.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-6">{filtered.length} terms</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(t => <GlossaryCard key={t.id} term={t} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}