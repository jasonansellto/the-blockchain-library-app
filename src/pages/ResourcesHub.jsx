import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, Wrench, Code2, Newspaper, Library, Mail, Sparkles } from 'lucide-react';
import Seo from '@/components/Seo';

const SECTIONS = [
  { icon: Wrench, name: 'Blockchain Tools', desc: 'Calculators, converters, and interactive utilities for blockchain practitioners and learners.', link: '/tools', linkLabel: 'Explore tools' },
  { icon: Code2, name: 'Developer Hub', desc: 'Code examples, an RPC directory, SDK references, and API documentation for building on-chain.', link: '/developers', linkLabel: 'Open developer hub' },
  { icon: Library, name: 'Open Access Libraries', desc: 'A curated directory of free knowledge archives alongside authoritative blockchain documentation.', link: '/resources/open-access', linkLabel: 'Browse libraries' },
  { icon: Newspaper, name: 'News & Insights', desc: 'Educational analysis and explainers on developments in blockchain, crypto, and Web3.', link: '/news', linkLabel: 'Read the latest' },
  { icon: Mail, name: 'Newsletter', desc: 'Weekly editions synthesizing the most important blockchain developments into lasting context.', link: '/newsletter', linkLabel: 'View archive' },
  { icon: Sparkles, name: 'AI Assistant', desc: 'Ask questions and get expert, sourced answers across blockchain, Web3, and DeFi.', link: '/ai-assistant', linkLabel: 'Ask a question' },
];

export default function ResourcesHub() {
  const description = 'Every resource The Blockchain Library offers — interactive tools, developer documentation, open-access libraries, news analysis, the weekly newsletter, and an AI assistant.';
  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
        { '@type': 'ListItem', position: 2, name: 'Resources', item: '/resources' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Resources',
      description,
      hasPart: SECTIONS.map((s) => ({ '@type': 'WebPage', name: s.name, url: s.link })),
    },
  ];

  return (
    <div>
      <Seo title="Resources" description={description} type="website" schemas={schemas} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-12">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-3 flex-wrap">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">Resources</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">Resources</h1>
          <p className="text-slate-500 max-w-2xl">{description}</p>
        </div>
      </div>

      <div className="container-tbl py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTIONS.map((s) => (
            <Link key={s.name} to={s.link} className="p-6 bg-white border border-slate-200 rounded-xl flex flex-col card-premium hover:border-blue-200 group">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <s.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 tracking-tight mb-2 text-lg">{s.name}</h3>
              <p className="text-sm text-slate-500 mb-5 flex-1">{s.desc}</p>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all self-start">
                {s.linkLabel} <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}