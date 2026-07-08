import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, Code2, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import SnippetCard from '@/components/cards/SnippetCard';
import Seo from '@/components/Seo';
import { buildBreadcrumbSchema } from '@/lib/seoSchemas';

const LANGUAGES = ['solidity', 'vyper', 'rust', 'javascript', 'typescript', 'python'];
const CHAINS = ['ethereum', 'solana', 'polygon', 'arbitrum', 'optimism', 'base', 'avalanche'];

export default function CodeSnippets() {
  const PAGE_SIZE = 18;
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [language, setLanguage] = useState('');
  const [chain, setChain] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchSnippets(); }, [language, chain, difficulty]);

  const buildFilter = () => {
    const f = {};
    if (language) f.language = language;
    if (chain) f.chain = chain;
    if (difficulty) f.difficulty = difficulty;
    return f;
  };

  const fetchSnippets = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.CodeSnippet.filter(buildFilter(), '-updated_date', PAGE_SIZE, 0);
      const arr = res.results || res || [];
      setSnippets(arr);
      setHasMore(arr.length === PAGE_SIZE);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await base44.entities.CodeSnippet.filter(buildFilter(), '-updated_date', PAGE_SIZE, snippets.length);
      const arr = res.results || res || [];
      setSnippets(prev => [...prev, ...arr]);
      setHasMore(arr.length === PAGE_SIZE);
    } catch (e) { console.error(e); } finally { setLoadingMore(false); }
  };

  const schemas = [buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Developer Hub', url: '/developers' }, { name: 'Code Snippets', url: '/developers/snippets' }])];

  return (
    <div>
      <Seo title="Code Snippets" description="Annotated, copy-pasteable blockchain code examples in Solidity, Vyper, Rust, and JavaScript. Filter by language, chain, and difficulty." schemas={schemas} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-10">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-3 flex-wrap">
            <Link to="/" className="hover:text-blue-600">Home</Link><ChevronRight className="w-3.5 h-3.5" />
            <Link to="/developers" className="hover:text-blue-600">Developer Hub</Link><ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">Code Snippets</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">Code Snippets</h1>
          <p className="text-slate-500 max-w-2xl">Annotated, copy-pasteable blockchain code examples in Solidity, Vyper, Rust, and JavaScript.</p>
        </div>
      </div>

      <div className="container-tbl py-10">
        <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 px-4 py-2.5 mb-4 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg">
          <Filter className="w-4 h-4" /> Filters {showFilters ? '(Hide)' : '(Show)'}
        </button>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className={`lg:w-64 shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-4"><Filter className="w-4 h-4 text-blue-600" />Filters</h3>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Language</label>
                  <div className="space-y-1.5">
                    {['', ...LANGUAGES].map(l => (
                      <button key={l} onClick={() => setLanguage(l)}
                        className={`block w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors capitalize font-mono ${language === l ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                        {l || 'All languages'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Chain</label>
                  <div className="space-y-1.5">
                    {['', ...CHAINS].map(c => (
                      <button key={c} onClick={() => setChain(c)}
                        className={`block w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors capitalize ${chain === c ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                        {c || 'All chains'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Difficulty</label>
                  <div className="space-y-1.5">
                    {['', 'beginner', 'intermediate', 'advanced', 'expert'].map(d => (
                      <button key={d} onClick={() => setDifficulty(d)}
                        className={`block w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors capitalize ${difficulty === d ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                        {d || 'All levels'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <p className="text-sm text-slate-500 mb-6">{loading ? 'Loading...' : `${snippets.length} snippets`}</p>
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
            ) : snippets.length === 0 ? (
              <div className="text-center py-20">
                <Code2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400">No snippets found. Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {snippets.map(s => <SnippetCard key={s.id} snippet={s} />)}
                </div>
                {hasMore && (
                  <div className="flex justify-center mt-10">
                    <button onClick={loadMore} disabled={loadingMore}
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors disabled:opacity-60">
                      {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
                      {loadingMore ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}