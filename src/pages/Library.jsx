import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, Filter, BookOpen, ChevronDown } from 'lucide-react';
import ArticleCard from '@/components/cards/ArticleCard';
import DifficultyBadge from '@/components/DifficultyBadge';
import Seo from '@/components/Seo';
import { buildCollectionPageSchema, buildBreadcrumbSchema } from '@/lib/seoSchemas';

export default function Library() {
  const [searchParams, setSearchParams] = useSearchParams();
  const PAGE_SIZE = 20;
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('-published_date');
  const [filteredCount, setFilteredCount] = useState(null);
  const [categoriesReady, setCategoriesReady] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { if (categoriesReady) fetchArticles(); }, [category, difficulty, sort, categoriesReady]);

  const fetchCategories = async () => {
    try {
      const [catRes, artRes] = await Promise.all([
        base44.entities.Category.list('-updated_date', 100),
        base44.entities.Article.filter({ status: 'published' }, '-published_date', 200)
      ]);
      const catArr = catRes.results || catRes || [];
      const artArr = artRes.results || artRes || [];
      const articleCatIds = new Set(artArr.map(a => a.category_id).filter(Boolean));
      const catsWithArticles = catArr.filter(c => articleCatIds.has(c.id));
      setCategories(catsWithArticles);
      const urlCat = searchParams.get('category');
      if (urlCat) {
        const matched = catsWithArticles.find(c => c.slug === urlCat || c.id === urlCat);
        if (matched) {
          setCategory(matched.id);
        } else {
          setCategory('');
          setSearchParams({});
        }
      }
    } catch (e) {}
    setCategoriesReady(true);
  };

  const buildFilter = () => {
    const filter = { status: 'published' };
    if (category) {
      const matched = categories.find(c => c.slug === category || c.id === category);
      filter.category_id = matched ? matched.id : category;
    }
    if (difficulty) filter.difficulty = difficulty;
    return filter;
  };

  const fetchArticles = async () => {
    setLoading(true);
    const filter = buildFilter();
    try {
      const res = await base44.entities.Article.filter(filter, sort, PAGE_SIZE, 0);
      const arr = res.results || res || [];
      setArticles(arr);
      setHasMore(arr.length === PAGE_SIZE);
    } catch (e) { console.error(e); } finally { setLoading(false); }

    try {
      const countsRes = await base44.functions.invoke('getCounts', { article_filter: filter });
      setFilteredCount((countsRes.data || countsRes || {}).filtered_articles ?? null);
    } catch (e) { console.error(e); }
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const res = await base44.entities.Article.filter(buildFilter(), sort, PAGE_SIZE, articles.length);
      const arr = res.results || res || [];
      setArticles(prev => [...prev, ...arr]);
      setHasMore(arr.length === PAGE_SIZE);
    } catch (e) { console.error(e); } finally { setLoadingMore(false); }
  };

  const catName = (id) => categories.find(c => c.id === id)?.name;
  const updateCategory = (val) => { setCategory(val); setSearchParams(val ? { category: val } : {}); };

  const schemas = [
    buildCollectionPageSchema('Article Library', 'Thousands of expertly written articles covering blockchain, cryptocurrency, Web3, AI, and decentralized technology.', '/library'),
    buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Library', url: '/library' }])
  ];

  return (
    <div>
      <Seo title="Article Library" description="Thousands of expertly written articles covering blockchain, cryptocurrency, Web3, AI, and decentralized technology — all interconnected through our knowledge graph." schemas={schemas} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-12">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <span>Home</span><span>/</span><span className="text-slate-700 font-medium">Library</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">Article Library</h1>
          <p className="text-slate-500 max-w-2xl">Thousands of expertly written articles covering blockchain, cryptocurrency, Web3, AI, and decentralized technology — all interconnected through our knowledge graph.</p>
        </div>
      </div>

      <div className="container-tbl py-10">
        <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 px-4 py-2.5 mb-4 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg">
          <Filter className="w-4 h-4" /> Filters {showFilters ? '(Hide)' : '(Show)'}
        </button>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <aside className={`lg:w-64 shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-4"><Filter className="w-4 h-4 text-blue-600" />Filters</h3>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Category</label>
                  <select value={category} onChange={(e) => updateCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
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
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Sort by</label>
                  <select value={sort} onChange={(e) => setSort(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="-published_date">Newest first</option>
                    <option value="published_date">Oldest first</option>
                    <option value="-views">Most viewed</option>
                    <option value="title">Alphabetical</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Article grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-slate-500">
                {loading ? 'Loading...' : (filteredCount != null ? `${filteredCount} articles` : `${articles.length} articles`)}
              </p>
            </div>
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
            ) : articles.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-400">No articles found. Try adjusting your filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {articles.map(a => <ArticleCard key={a.id} article={a} categoryName={catName(a.category_id)} />)}
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