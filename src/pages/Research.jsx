import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, FileText, Search, Layers } from 'lucide-react';
import ResearchCard from '@/components/cards/ResearchCard';
import Seo from '@/components/Seo';
import { buildCollectionPageSchema, buildBreadcrumbSchema } from '@/lib/seoSchemas';

export default function Research() {
  const [papers, setPapers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [collection, setCollection] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => { fetchPapers(); fetchCategories(); }, []);
  useEffect(() => { setVisibleCount(12); }, [query, type, collection]);

  const fetchPapers = async () => {
    try {
      const res = await base44.entities.ResearchPaper.list('-updated_date', 200);
      const arr = res.results || res || [];
      setPapers(arr.filter((p) => p.status !== 'draft'));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await base44.entities.Category.list('sort_order', 200);
      setCategories(res.results || res || []);
    } catch (e) { console.error(e); }
  };

  const collectionCounts = {};
  papers.forEach((p) => { if (p.category_id) collectionCounts[p.category_id] = (collectionCounts[p.category_id] || 0) + 1; });
  const collections = Object.entries(collectionCounts)
    .map(([id, count]) => ({ id, name: (categories.find((c) => c.id === id) || {}).name || 'Collection', count }))
    .sort((a, b) => b.count - a.count);

  const filtered = papers.filter((p) => {
    if (query) {
      const q = query.toLowerCase();
      const hay = `${p.title} ${p.abstract || ''} ${(p.tags || []).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (type && p.research_type !== type) return false;
    if (collection && p.category_id !== collection) return false;
    return true;
  });

  // Pin the Deterministic Execution paper to the top (only when it matches the filter).
  const pinnedResearchSlug = 'deterministic-execution-fixed-cost-transaction-models';
  const pinnedPaper = filtered.find((p) => p.slug === pinnedResearchSlug);
  const ordered = pinnedPaper ? [pinnedPaper, ...filtered.filter((p) => p.slug !== pinnedResearchSlug)] : filtered;

  const schemas = [
    buildCollectionPageSchema('Blockchain Research Database', 'Academic papers, whitepapers, EIPs, and industry reports on blockchain and decentralized technology — each AI-annotated and cross-linked to glossary terms and articles.', '/research', filtered.slice(0, 10).map((p) => ({ name: p.title, url: `/research/${p.slug}` }))),
    buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Research', url: '/research' }])
  ];

  return (
    <div>
      <Seo title="Blockchain Research Database" description="Academic papers, whitepapers, EIPs, and industry reports — each AI-annotated with abstracts, key findings, citations, BibTeX exports, and links to related glossary terms and articles." schemas={schemas} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-12">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3"><span>Home</span><span>/</span><span className="text-slate-700 font-medium">Research</span></div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">Research Database</h1>
          <p className="text-slate-500 max-w-2xl">Academic papers, whitepapers, EIPs, and industry reports — each AI-annotated with abstracts, key findings, citations, BibTeX exports, and links to related glossary terms and articles.</p>
        </div>
      </div>

      <div className="container-tbl py-10">
        {/* Collections strip */}
        {collections.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              <Layers className="w-3.5 h-3.5" /> Collections
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
              <button onClick={() => setCollection('')}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!collection ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                All Collections
              </button>
              {collections.map((c) => (
                <button key={c.id} onClick={() => setCollection(collection === c.id ? '' : c.id)}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${collection === c.id ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {c.name} <span className={`ml-1 ${collection === c.id ? 'text-blue-100' : 'text-slate-400'}`}>{c.count}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search research papers..."
              className="w-full pl-12 pr-4 py-3 text-base bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="px-4 py-3 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All types</option>
            <option value="paper">Papers</option>
            <option value="whitepaper">Whitepapers</option>
            <option value="standard">Standards</option>
            <option value="thesis">Theses</option>
            <option value="report">Reports</option>
            <option value="preprint">Preprints</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20"><FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-400">No research papers found.</p></div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-6">{Math.min(visibleCount, ordered.length)} of {ordered.length} papers</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ordered.slice(0, visibleCount).map((p) => <ResearchCard key={p.id} paper={p} />)}
            </div>
            {ordered.length > visibleCount && (
              <div className="flex justify-center mt-8">
                <button onClick={() => setVisibleCount((c) => c + 12)} className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors shadow-sm">
                  Load more <span className="text-slate-400 font-normal">({ordered.length - visibleCount} remaining)</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}