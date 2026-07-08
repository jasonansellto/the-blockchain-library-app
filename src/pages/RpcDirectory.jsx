import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, ChevronRight, Search, Copy, Check, Star, Shield } from 'lucide-react';
import Seo from '@/components/Seo';
import { buildBreadcrumbSchema } from '@/lib/seoSchemas';

export default function RpcDirectory() {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const filter = {};
        if (category) filter.category = category;
        const res = await base44.entities.RpcEndpoint.filter(filter, 'is_recommended', 100, 0);
        setEndpoints(res.results || res || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [category]);

  const handleCopy = (ep, id) => {
    navigator.clipboard.writeText(ep.endpoint_url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = endpoints.filter(e =>
    !search || e.network?.toLowerCase().includes(search.toLowerCase()) || e.provider?.toLowerCase().includes(search.toLowerCase())
  );

  const schemas = [buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Developer Hub', url: '/developers' }, { name: 'RPC Directory', url: '/developers/rpc' }])];

  return (
    <div>
      <Seo title="RPC Directory" description="A curated directory of public RPC endpoints for every major blockchain network — Ethereum, Polygon, Arbitrum, Optimism, Solana, and more." schemas={schemas} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-10">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-3 flex-wrap">
            <Link to="/" className="hover:text-blue-600">Home</Link><ChevronRight className="w-3.5 h-3.5" />
            <Link to="/developers" className="hover:text-blue-600">Developer Hub</Link><ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">RPC Directory</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">RPC Directory</h1>
          <p className="text-slate-500 max-w-2xl">A curated directory of public RPC endpoints for every major blockchain network. Click to copy.</p>
        </div>
      </div>

      <div className="container-tbl py-10">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400">No endpoints found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Network</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Provider</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Chain ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Endpoint</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(ep => (
                    <tr key={ep.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 text-sm">{ep.network}</span>
                          {ep.is_recommended && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                        </div>
                        <span className="text-xs text-slate-400 capitalize">{ep.category}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <div className="flex items-center gap-1.5">
                          {ep.provider}
                          {ep.auth_required && <Shield className="w-3 h-3 text-amber-500" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 font-mono hidden md:table-cell">{ep.chain_id || '—'}</td>
                      <td className="px-4 py-3 text-sm font-mono text-slate-600 max-w-xs">
                        <span className="truncate block">{ep.endpoint_url}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleCopy(ep, ep.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                          {copiedId === ep.id ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}