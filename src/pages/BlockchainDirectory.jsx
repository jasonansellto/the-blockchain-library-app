import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search, Star, ShieldCheck, Sparkles, ArrowRight, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Seo from '@/components/Seo';
import BlockchainDirectoryCard from '@/components/cards/BlockchainDirectoryCard';

const CATEGORIES = ['Layer 1', 'Layer 2', 'Developer Documentation', 'Standards', 'Research Labs', 'AI + Blockchain', 'Security', 'Analytics', 'Explorers', 'Wallets', 'Infrastructure', 'DeFi Protocols'];

const favicon = (url) => {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`; }
  catch { return ''; }
};

function Stars({ rating }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`w-4 h-4 ${n <= (rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
      ))}
    </span>
  );
}

export default function BlockchainDirectory() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCats, setActiveCats] = useState(new Set());
  const [officialOnly, setOfficialOnly] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.BlockchainResource.list('-updated_date', 200);
        setResources(res.results || res || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const toggleCat = (c) => setActiveCats((prev) => {
    const n = new Set(prev);
    n.has(c) ? n.delete(c) : n.add(c);
    return n;
  });
  const clearFilters = () => { setActiveCats(new Set()); setOfficialOnly(false); setSearch(''); };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return resources.filter((r) => {
      if (officialOnly && !r.is_official) return false;
      if (activeCats.size && !activeCats.has(r.category)) return false;
      if (q) {
        const hay = `${r.name} ${r.tagline || ''} ${r.description || ''} ${(r.tags || []).join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [resources, search, activeCats, officialOnly]);

  const stats = useMemo(() => {
    const byCat = (c) => resources.filter((r) => r.category === c).length;
    return {
      total: resources.length,
      categories: new Set(resources.map((r) => r.category)).size,
      devDocs: byCat('Developer Documentation'),
      research: byCat('Research Labs'),
      standards: byCat('Standards'),
      tools: byCat('Security') + byCat('Analytics') + byCat('Infrastructure') + byCat('Wallets'),
    };
  }, [resources]);

  const featured = useMemo(() => resources.find((r) => r.is_featured) || null, [resources]);

  const description = 'The largest curated Web3 resource directory — 100+ sites across protocols, developer tools, standards, research labs, security, analytics, explorers, and AI. Search, filter, and follow the links into our connected knowledge graph.';
  const schemas = [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
        { '@type': 'ListItem', position: 2, name: 'Resources', item: '/resources' },
        { '@type': 'ListItem', position: 3, name: 'Blockchain Resource Directory', item: '/resources/blockchain' },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Blockchain Resource Directory', description,
      hasPart: resources.slice(0, 50).map((r) => ({ '@type': 'WebPage', name: r.name, url: `/resources/blockchain/${r.slug}` })),
    },
  ];

  return (
    <div>
      <Seo title="Blockchain Resource Directory" description={description} type="website" schemas={schemas} />

      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-12">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-3 flex-wrap">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/resources" className="hover:text-blue-600">Resources</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">Blockchain Resource Directory</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">Blockchain Resource Directory</h1>
          <p className="text-slate-500 max-w-2xl mb-6">{description}</p>
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search resources — Ethereum, wallet, security, AI..."
              className="w-full pl-12 pr-4 py-3 text-base bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div className="container-tbl py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {[
            { label: 'Total Resources', value: stats.total },
            { label: 'Categories', value: stats.categories },
            { label: 'Developer Docs', value: stats.devDocs },
            { label: 'Research Labs', value: stats.research },
            { label: 'Standards', value: stats.standards },
            { label: 'Tools & Security', value: stats.tools },
          ].map((s) => (
            <div key={s.label} className="p-4 bg-white border border-slate-200 rounded-lg text-center">
              <div className="text-2xl font-bold text-slate-900 tracking-tight">{loading ? '—' : s.value}</div>
              <div className="text-xs text-slate-400 font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Featured */}
        {featured && !search && !activeCats.size && !officialOnly && (
          <Link to={`/resources/blockchain/${featured.slug}`} className="block mb-10 p-6 sm:p-8 bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-100 rounded-2xl card-premium group">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <span className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                <img src={favicon(featured.url)} alt={`${featured.name} logo`} className="w-8 h-8 object-contain" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Featured Resource</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2 group-hover:text-blue-600 transition-colors">{featured.name}</h2>
                <p className="text-slate-600 mb-3 max-w-2xl">{featured.featured_note || featured.tagline}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <Stars rating={featured.editorial_rating || 0} />
                  {featured.editorial_label && <span className="text-sm text-slate-500">{featured.editorial_label}</span>}
                  {featured.is_official && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-blue-600 text-white"><ShieldCheck className="w-3 h-3" /> Official</span>}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform hidden sm:block" />
            </div>
          </Link>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {CATEGORIES.map((c) => {
            const count = resources.filter((r) => r.category === c).length;
            if (!count && !loading) return null;
            const active = activeCats.has(c);
            return (
              <button key={c} onClick={() => toggleCat(c)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}>
                {c} <span className={`text-xs ${active ? 'text-blue-100' : 'text-slate-400'}`}>{count}</span>
              </button>
            );
          })}
          <button onClick={() => setOfficialOnly((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${officialOnly ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
            <ShieldCheck className="w-3.5 h-3.5" /> Official only
          </button>
          {(activeCats.size || officialOnly || search) && (
            <button onClick={clearFilters} className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}
        </div>

        <div className="text-sm text-slate-400 mb-5">{loading ? 'Loading…' : `${filtered.length} resource${filtered.length === 1 ? '' : 's'}`}</div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => <div key={i} className="h-56 bg-white border border-slate-200 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((r) => <BlockchainDirectoryCard key={r.id} resource={r} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500 mb-3">No resources match your filters.</p>
            <button onClick={clearFilters} className="text-blue-600 font-semibold">Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
}