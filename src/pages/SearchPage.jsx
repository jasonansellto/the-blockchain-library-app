import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, Search as SearchIcon, BookOpen, Library, BookMarked, FileText, GraduationCap, User, ChevronRight } from 'lucide-react';
import ArticleCard from '@/components/cards/ArticleCard';
import GlossaryCard from '@/components/cards/GlossaryCard';
import BookCard from '@/components/cards/BookCard';
import ResearchCard from '@/components/cards/ResearchCard';
import LearningPathCard from '@/components/cards/LearningPathCard';
import Seo from '@/components/Seo';
import { buildBreadcrumbSchema } from '@/lib/seoSchemas';

const tabs = [
  { key: 'all', label: 'All', icon: SearchIcon },
  { key: 'articles', label: 'Articles', icon: BookOpen },
  { key: 'glossary', label: 'Glossary', icon: Library },
  { key: 'books', label: 'Books', icon: BookMarked },
  { key: 'research', label: 'Research', icon: FileText },
  { key: 'authors', label: 'Authors', icon: User },
  { key: 'paths', label: 'Learning Paths', icon: GraduationCap },
];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState('all');
  const [difficulty, setDifficulty] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (q) performSearch(); }, [q, difficulty]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('searchContent', { query: q, difficulty });
      const data = res.data || res || {};
      setResults(data.results || {});
    } catch (e) {
      console.error(e);
      setResults({});
    } finally { setLoading(false); }
  };

  const total = Object.values(results).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  const schemas = [buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Search', url: '/search' }])];

  return (
    <div>
      <Seo title={`Search: ${q}`} description={`Search results for "${q}" across articles, glossary terms, books, research papers, and learning paths.`} schemas={schemas} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-3">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400">
            <Link to="/" className="hover:text-blue-600">Home</Link><ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">Search</span>
          </nav>
        </div>
        <div className="container-tbl pb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">Search Results</h1>
          <p className="text-slate-500">for <span className="font-semibold text-slate-700">"{q}"</span></p>
        </div>
      </div>
      <div className="container-tbl py-8">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 flex-1">
            {tabs.map(tab => {
              const count = tab.key === 'all' ? total : (results[tab.key]?.length || 0);
              return (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <tab.icon className="w-4 h-4" />{tab.label}<span className={`text-xs px-1.5 rounded ${activeTab === tab.key ? 'bg-white/20' : 'bg-slate-100'}`}>{count}</span>
                </button>
              );
            })}
          </div>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
        ) : total === 0 ? (
          <div className="text-center py-20">
            <SearchIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No results found for "{q}".</p>
            <Link to="/library" className="text-blue-600 font-medium hover:underline">Browse the library instead →</Link>
          </div>
        ) : (
          <div className="space-y-12">
            {(activeTab === 'all' || activeTab === 'articles') && results.articles?.length > 0 && (
              <ResultSection title="Articles" count={results.articles.length} showAll={activeTab !== 'all'} link="/library">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.articles.slice(0, activeTab === 'all' ? 6 : 12).map(a => <ArticleCard key={a.id} article={a} />)}
                </div>
              </ResultSection>
            )}
            {(activeTab === 'all' || activeTab === 'glossary') && results.glossary?.length > 0 && (
              <ResultSection title="Glossary Terms" count={results.glossary.length} showAll={activeTab !== 'all'} link="/glossary">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {results.glossary.slice(0, activeTab === 'all' ? 6 : 12).map(t => <GlossaryCard key={t.id} term={t} />)}
                </div>
              </ResultSection>
            )}
            {(activeTab === 'all' || activeTab === 'books') && results.books?.length > 0 && (
              <ResultSection title="Books" count={results.books.length} showAll={activeTab !== 'all'} link="/books">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {results.books.slice(0, activeTab === 'all' ? 5 : 8).map(b => <BookCard key={b.id} book={b} />)}
                </div>
              </ResultSection>
            )}
            {(activeTab === 'all' || activeTab === 'research') && results.research?.length > 0 && (
              <ResultSection title="Research" count={results.research.length} showAll={activeTab !== 'all'} link="/research">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.research.slice(0, activeTab === 'all' ? 3 : 8).map(r => <ResearchCard key={r.id} paper={r} />)}
                </div>
              </ResultSection>
            )}
            {(activeTab === 'all' || activeTab === 'authors') && results.authors?.length > 0 && (
              <ResultSection title="Authors" count={results.authors.length} showAll={activeTab !== 'all'} link="/authors">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.authors.slice(0, activeTab === 'all' ? 4 : 12).map(a => (
                    <Link key={a.id} to={`/authors/${a.slug}`} className="group text-center p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-200 transition-all">
                      <div className="w-16 h-16 rounded-full mx-auto mb-3 overflow-hidden bg-slate-100">
                        {a.photo ? <img src={a.photo} alt={a.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-400">{a.name?.[0]}</div>}
                      </div>
                      <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">{a.name}</p>
                      {a.expertise_areas?.[0] && <p className="text-xs text-slate-400 mt-1">{a.expertise_areas[0]}</p>}
                    </Link>
                  ))}
                </div>
              </ResultSection>
            )}
            {(activeTab === 'all' || activeTab === 'paths') && results.paths?.length > 0 && (
              <ResultSection title="Learning Paths" count={results.paths.length} showAll={activeTab !== 'all'} link="/learn">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.paths.slice(0, activeTab === 'all' ? 3 : 6).map(p => <LearningPathCard key={p.id} path={p} />)}
                </div>
              </ResultSection>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ResultSection({ title, count, children, showAll, link }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-slate-900">{title} <span className="text-slate-400 font-normal">({count})</span></h2>
        {!showAll && <Link to={link} className="text-sm font-semibold text-blue-600 hover:underline">View all →</Link>}
      </div>
      {children}
    </section>
  );
}