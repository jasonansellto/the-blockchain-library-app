import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, Search as SearchIcon, BookOpen, Library, BookMarked, FileText, GraduationCap } from 'lucide-react';
import ArticleCard from '@/components/cards/ArticleCard';
import GlossaryCard from '@/components/cards/GlossaryCard';
import BookCard from '@/components/cards/BookCard';
import ResearchCard from '@/components/cards/ResearchCard';
import LearningPathCard from '@/components/cards/LearningPathCard';

const tabs = [
  { key: 'all', label: 'All', icon: SearchIcon },
  { key: 'articles', label: 'Articles', icon: BookOpen },
  { key: 'glossary', label: 'Glossary', icon: Library },
  { key: 'books', label: 'Books', icon: BookMarked },
  { key: 'research', label: 'Research', icon: FileText },
  { key: 'paths', label: 'Learning Paths', icon: GraduationCap },
];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (q) performSearch(); }, [q]);

  const performSearch = async () => {
    setLoading(true);
    const lower = q.toLowerCase();
    const empty = { articles: [], glossary: [], books: [], research: [], paths: [] };
    try {
      const [articles, glossary, books, research, paths] = await Promise.all([
        base44.entities.Article.filter({ status: 'published' }, '-updated_date', 50),
        base44.entities.GlossaryTerm.list('title', 100),
        base44.entities.Book.list('-updated_date', 50),
        base44.entities.ResearchPaper.list('-updated_date', 50),
        base44.entities.LearningPath.list('-updated_date', 50),
      ]);
      const match = (text) => text && text.toLowerCase().includes(lower);
      setResults({
        articles: (articles.results || articles || []).filter(a => match(a.title) || match(a.summary) || a.tags?.some(t => match(t))).slice(0, 12),
        glossary: (glossary.results || glossary || []).filter(t => match(t.title) || match(t.definition)).slice(0, 12),
        books: (books.results || books || []).filter(b => match(b.title) || match(b.description)).slice(0, 8),
        research: (research.results || research || []).filter(r => match(r.title) || match(r.abstract)).slice(0, 8),
        paths: (paths.results || paths || []).filter(p => match(p.title) || match(p.description)).slice(0, 6),
      });
    } catch (e) { console.error(e); setResults(empty); } finally { setLoading(false); }
  };

  const total = Object.values(results).reduce((sum, arr) => sum + (arr?.length || 0), 0);

  return (
    <div>
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">Search Results</h1>
          <p className="text-slate-500">for <span className="font-semibold text-slate-700">"{q}"</span></p>
        </div>
      </div>
      <div className="container-tbl py-8">
        <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-1">
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