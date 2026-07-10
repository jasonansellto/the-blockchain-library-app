import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ExternalLink, ArrowLeft, Check, Target } from 'lucide-react';
import Seo from '@/components/Seo';
import { openAccessResources, blockchainResources, badgeStyles } from '@/lib/openAccessResources';

export default function OpenAccessResourceDetail() {
  const { slug } = useParams();
  const resource = openAccessResources.find((r) => r.slug === slug) || blockchainResources.find((r) => r.slug === slug);

  if (!resource) {
    return (
      <div className="container-tbl py-32 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Resource not found</h1>
        <p className="text-slate-500 mb-6">We couldn't find that open-access library.</p>
        <Link to="/resources/open-access" className="inline-flex items-center gap-1 text-blue-600 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Open Access Libraries
        </Link>
      </div>
    );
  }

  const { name, type, emoji, url, tagline, description, highlights, bestFor } = resource;

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
        { '@type': 'ListItem', position: 2, name: 'Resources', item: '/tools' },
        { '@type': 'ListItem', position: 3, name: 'Open Access Libraries', item: '/resources/open-access' },
        { '@type': 'ListItem', position: 4, name },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name,
      description: tagline,
      isPartOf: { '@type': 'WebSite', name: 'The Blockchain Library' },
      mainEntity: { '@type': 'WebSite', name, url },
    },
  ];

  return (
    <div>
      <Seo title={name} description={tagline} type="article" schemas={schemas} />

      {/* Hero */}
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-12">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-4 flex-wrap">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/tools" className="hover:text-blue-600">Resources</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/resources/open-access" className="hover:text-blue-600">Open Access Libraries</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium truncate">{name}</span>
          </nav>
          <div className="flex items-start gap-4">
            <span className="text-5xl leading-none" aria-hidden="true">{emoji}</span>
            <div className="flex-1 min-w-0">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset uppercase tracking-wide ${badgeStyles[type]} mb-3`}>{type}</span>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">{name}</h1>
              <p className="text-slate-500 max-w-2xl text-lg">{tagline}</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              Visit {name} <ExternalLink className="w-4 h-4" />
            </a>
            <Link to="/resources/open-access"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" /> All libraries
            </Link>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container-tbl py-10 max-w-3xl">
        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Overview</h2>
          <p className="text-[17px] leading-[1.75] text-slate-600">{description}</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">What you'll find</h2>
          <ul className="space-y-3">
            {highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center"><Check className="w-3.5 h-3.5" /></span>
                <span className="text-slate-600">{h}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">Best for</h2>
          <ul className="space-y-3">
            {bestFor.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><Target className="w-3.5 h-3.5" /></span>
                <span className="text-slate-600">{b}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Ready to explore {name}?</h3>
            <p className="text-sm text-slate-600">Opens {name} in a new tab — no account or payment required.</p>
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap">
            Visit {name} <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}