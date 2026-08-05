import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, ChevronRight, Search, Star, Server, Network as NetworkIcon, X } from 'lucide-react';
import Seo from '@/components/Seo';
import { buildBreadcrumbSchema } from '@/lib/seoSchemas';
import RpcEndpointCard from '@/components/developers/RpcEndpointCard';
import FeaturedRpcBanner from '@/components/developers/FeaturedRpcBanner';

export default function RpcDirectory() {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [networkFilter, setNetworkFilter] = useState('');
  const [recommendedOnly, setRecommendedOnly] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.RpcEndpoint.filter({}, 'is_recommended', 200, 0);
        setEndpoints(res.results || res || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const handleCopy = (ep) => {
    navigator.clipboard.writeText(ep.endpoint_url);
    setCopiedId(ep.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const networks = useMemo(() =>
    [...new Set(endpoints.map(e => e.network))].sort(),
    [endpoints]
  );

  const filtered = useMemo(() => endpoints.filter(e => {
    if (category && e.category !== category) return false;
    if (networkFilter && e.network !== networkFilter) return false;
    if (recommendedOnly && !e.is_recommended) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!e.network?.toLowerCase().includes(q) && !e.provider?.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [endpoints, category, networkFilter, recommendedOnly, search]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(ep => {
      if (!map[ep.network]) {
        map[ep.network] = {
          network: ep.network, chainId: ep.chain_id, category: ep.category, endpoints: [],
          isFeatured: false, featuredNote: '', explorerUrl: '', nativeCurrency: ''
        };
      }
      map[ep.network].endpoints.push(ep);
      if (ep.is_featured) {
        map[ep.network].isFeatured = true;
        if (ep.featured_note) map[ep.network].featuredNote = ep.featured_note;
        if (ep.explorer_url) map[ep.network].explorerUrl = ep.explorer_url;
        if (ep.native_currency) map[ep.network].nativeCurrency = ep.native_currency;
      }
    });
    return Object.values(map).sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return a.network.localeCompare(b.network);
    });
  }, [filtered]);

  const featuredGroup = grouped.find(g => g.isFeatured);

  const hasActiveFilters = search || category || networkFilter || recommendedOnly;
  const clearFilters = () => { setSearch(''); setCategory(''); setNetworkFilter(''); setRecommendedOnly(false); };

  const schemas = [buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Developer Hub', url: '/developers' }, { name: 'RPC Directory', url: '/developers/rpc' }])];

  return (
    <div>
      <Seo title="RPC Directory — Public Blockchain RPC Endpoints" description="A curated directory of public RPC endpoints for every major blockchain network — Ethereum, Polygon, Arbitrum, Optimism, Base, Solana, and more. Copy and connect instantly." schemas={schemas} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-10">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-3 flex-wrap">
            <Link to="/" className="hover:text-blue-600">Home</Link><ChevronRight className="w-3.5 h-3.5" />
            <Link to="/developers" className="hover:text-blue-600">Developer Hub</Link><ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">RPC Directory</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">RPC Directory</h1>
          <p className="text-slate-500 max-w-2xl mb-5">Browse and search public RPC endpoints for every major blockchain network. Click any endpoint to copy it.</p>
          {!loading && (
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                <NetworkIcon className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-slate-600"><strong className="text-slate-900">{networks.length}</strong> networks</span>
              </div>
              <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                <Server className="w-4 h-4 text-teal-500" />
                <span className="text-sm text-slate-600"><strong className="text-slate-900">{endpoints.length}</strong> endpoints</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container-tbl py-10">
        {/* Search + category toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search networks or providers..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2">
            {['', 'mainnet', 'testnet'].map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors capitalize ${category === c ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                {c || 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Network chips + recommended toggle */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button onClick={() => setNetworkFilter('')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${!networkFilter ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            All networks
          </button>
          {networks.map(n => (
            <button key={n} onClick={() => setNetworkFilter(networkFilter === n ? '' : n)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${networkFilter === n ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              {n}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setRecommendedOnly(!recommendedOnly)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${recommendedOnly ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              <Star className="w-3 h-3" /> Recommended only
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="inline-flex items-center gap-1 px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 mb-2">No endpoints match your filters.</p>
            {hasActiveFilters && <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">Clear filters</button>}
          </div>
        ) : (
          <div className="space-y-10">
            {featuredGroup && (
              <FeaturedRpcBanner group={featuredGroup} copiedId={copiedId} onCopy={handleCopy} />
            )}
            {grouped.map(group => (
              <section key={group.network}>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">{group.network}</h3>
                    {group.chainId && <span className="text-xs text-slate-400 font-mono">Chain ID {group.chainId}</span>}
                  </div>
                  <span className="text-xs text-slate-400 capitalize bg-slate-100 px-2 py-0.5 rounded-full">{group.category}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.endpoints.map(ep => (
                    <RpcEndpointCard key={ep.id} endpoint={ep} copiedId={copiedId} onCopy={handleCopy} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}