import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Code2, Network, BookOpen, Terminal, ArrowRight, ChevronRight, Loader2 } from 'lucide-react';
import Seo from '@/components/Seo';
import { buildBreadcrumbSchema } from '@/lib/seoSchemas';
import SnippetCard from '@/components/cards/SnippetCard';

const SECTIONS = [
  { icon: Code2, title: 'Code Snippets', desc: 'Annotated, copy-pasteable examples in Solidity, Vyper, Rust, and JavaScript.', link: '/developers/snippets', color: 'text-purple-600 bg-purple-50' },
  { icon: Network, title: 'RPC Directory', desc: 'Curated public RPC endpoints for every major blockchain network.', link: '/developers/rpc', color: 'text-blue-600 bg-blue-50' },
  { icon: BookOpen, title: 'SDK Reference', desc: 'Quick-start guides for ethers.js, viem, web3.js, and more.', link: '/developers/sdks', color: 'text-teal-600 bg-teal-50' },
  { icon: Terminal, title: 'REST API Docs', desc: 'Programmatic access to the Blockchain Library knowledge base.', link: '/developers/api', color: 'text-amber-600 bg-amber-50' },
];

export default function DeveloperHub() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.CodeSnippet.filter({ is_featured: true }, '-updated_date', 3, 0);
        setFeatured(res.results || res || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const schemas = [
    buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Developer Hub', url: '/developers' }])
  ];

  return (
    <div>
      <Seo title="Developer Hub" description="Resources, code examples, RPC endpoints, SDK references, and API documentation for blockchain developers building on decentralized protocols." schemas={schemas} />
      <div className="border-b border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="container-tbl py-16">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-4">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Developer Hub</span>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <Code2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Developer Hub</h1>
          </div>
          <p className="text-slate-300 max-w-2xl text-lg">Resources, code examples, and documentation for blockchain developers building on decentralized protocols.</p>
        </div>
      </div>

      <div className="container-tbl py-12">
        {/* Resource sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {SECTIONS.map((s) => (
            <Link key={s.title} to={s.link} className="group block">
              <div className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all duration-300 h-full">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                    <s.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight text-lg mb-1">{s.title}</h3>
                    <p className="text-sm text-slate-500 mb-3">{s.desc}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">
                      Explore <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Featured snippets */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Featured Code Snippets</h2>
          <Link to="/developers/snippets" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:gap-2 transition-all">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {featured.map(s => <SnippetCard key={s.id} snippet={s} />)}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
            <Code2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No snippets yet. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}