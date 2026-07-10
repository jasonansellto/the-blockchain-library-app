import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, Library, Boxes } from 'lucide-react';
import Seo from '@/components/Seo';
import { openAccessResources, blockchainResources, badgeStyles } from '@/lib/openAccessResources';
import BlockchainResourceCard from '@/components/cards/BlockchainResourceCard';

const BLOCKCHAIN_CATEGORIES = ['Blockchain Foundations', 'DeFi Protocols', 'Developer Docs'];
const CATEGORY_DESCRIPTIONS = {
  'Blockchain Foundations': 'Protocol overviews and learning hubs for the major networks.',
  'DeFi Protocols': 'Canonical documentation for leading decentralized finance protocols.',
  'Developer Docs': 'Tooling, libraries, and frameworks for building on-chain.',
};

export default function OpenAccessLibrary() {
  const [tab, setTab] = useState('blockchain');

  const description = 'A curated directory of free, publicly available knowledge archives — alongside a hand-picked set of blockchain documentation, protocol, and developer hubs — for finding open-access books, papers, and authoritative Web3 references.';
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
        { '@type': 'ListItem', position: 2, name: 'Resources', item: '/tools' },
        { '@type': 'ListItem', position: 3, name: 'Open Access Libraries' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Open Access Libraries',
      description,
      hasPart: [
        ...openAccessResources.map((r) => ({ '@type': 'WebPage', name: r.name, url: `/resources/open-access/${r.slug}` })),
        ...blockchainResources.map((r) => ({ '@type': 'WebPage', name: r.name, url: r.url })),
      ],
    },
  ];

  return (
    <div>
      <Seo title="Open Access Libraries" description={description} type="website" schemas={schemas} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-12">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-3 flex-wrap">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/tools" className="hover:text-blue-600">Resources</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">Open Access Libraries</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">Open Access Libraries</h1>
          <p className="text-slate-500 max-w-2xl">
            A curated directory of free, publicly available knowledge archives — alongside authoritative blockchain documentation and developer hubs. Browse general libraries or jump straight to Web3 resources.
          </p>
        </div>
      </div>

      <div className="container-tbl py-10">
        {/* Tab switcher */}
        <div className="flex items-center gap-1 sm:gap-2 mb-8 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setTab('blockchain')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${tab === 'blockchain' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Boxes className="w-4 h-4" /> Blockchain Resources
            <span className="ml-1 text-xs font-normal text-slate-400">{blockchainResources.length}</span>
          </button>
          <button
            onClick={() => setTab('general')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${tab === 'general' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            <Library className="w-4 h-4" /> General Libraries
            <span className="ml-1 text-xs font-normal text-slate-400">{openAccessResources.length}</span>
          </button>
        </div>

        {tab === 'general' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {openAccessResources.map((r) => (
              <Link key={r.slug} to={`/resources/open-access/${r.slug}`}
                className="p-6 bg-white border border-slate-200 rounded-xl flex flex-col card-premium hover:border-blue-200 group">
                <div className="flex items-start justify-between mb-3">
                  <span className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={`https://www.google.com/s2/favicons?domain=${new URL(r.url).hostname}&sz=128`} alt={`${r.name} logo`} loading="lazy" className="w-6 h-6 object-contain" />
                </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset uppercase tracking-wide ${badgeStyles[r.type]}`}>{r.type}</span>
                </div>
                <h3 className="font-bold text-slate-900 tracking-tight mb-2 text-lg">{r.name}</h3>
                <p className="text-sm text-slate-500 mb-5 flex-1">{r.tagline}</p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all self-start">
                  Learn more <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {BLOCKCHAIN_CATEGORIES.map((category) => {
              const items = blockchainResources.filter((r) => r.type === category);
              if (!items.length) return null;
              return (
                <section key={category}>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">{category}</h2>
                  <p className="text-sm text-slate-400 mb-5">{CATEGORY_DESCRIPTIONS[category]}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((r) => <BlockchainResourceCard key={r.slug} resource={r} />)}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}