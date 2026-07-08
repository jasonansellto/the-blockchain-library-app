import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, FileText, Search } from 'lucide-react';
import ResearchCard from '@/components/cards/ResearchCard';
import Seo from '@/components/Seo';
import { buildCollectionPageSchema, buildBreadcrumbSchema } from '@/lib/seoSchemas';

export default function Research() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');

  useEffect(() => { fetchPapers(); }, []);

  const fetchPapers = async () => {
    try {
      const res = await base44.entities.ResearchPaper.list('-updated_date', 100);
      setPapers(res.results || res || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const filtered = papers.filter(p => {
    if (query && !p.title.toLowerCase().includes(query.toLowerCase()) && !(p.abstract || '').toLowerCase().includes(query.toLowerCase())) return false;
    if (type && p.research_type !== type) return false;
    return true;
  });

  const schemas = [
    buildCollectionPageSchema('Research Database', 'Academic papers, whitepapers, and industry reports on blockchain and decentralized technology.', '/research', papers.slice(0, 10).map(p => ({ name: p.title, url: `/research/${p.slug}` }))),
    buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Research', url: '/research' }])
  ];

  return (
    <div>
      <Seo title="Blockchain Research Database" description="Academic papers, whitepapers, and industry reports — with abstracts, citations, BibTeX exports, and links to related articles and glossary terms." schemas={schemas} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-12">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3"><span>Home</span><span>/</span><span className="text-slate-700 font-medium">Research</span></div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">Research Database</h1>
          <p className="text-slate-500 max-w-2xl">Academic papers, whitepapers, and industry reports — with abstracts, citations, BibTeX exports, and links to related articles and glossary terms.</p>
        </div>
      </div>
      <div className="container-tbl py-10">
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
            <p className="text-sm text-slate-500 mb-6">{filtered.length} papers</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(p => <ResearchCard key={p.id} paper={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}