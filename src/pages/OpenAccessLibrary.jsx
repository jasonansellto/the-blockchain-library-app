import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';
import Seo from '@/components/Seo';
import { openAccessResources, badgeStyles } from '@/lib/openAccessResources';

export default function OpenAccessLibrary() {
  const description = 'A curated directory of twelve free, publicly available knowledge archives — Open Library, Internet Archive, arXiv, Google Scholar, PubMed Central, and more — for finding open-access books and academic papers.';
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
      hasPart: openAccessResources.map((r) => ({ '@type': 'WebPage', name: r.name, url: `/resources/open-access/${r.slug}` })),
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
            A curated directory of free, publicly available knowledge archives for finding books, papers, and primary sources.
            Click any library to read a full overview, then visit the source directly.
          </p>
        </div>
      </div>

      <div className="container-tbl py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {openAccessResources.map((r) => (
            <Link key={r.slug} to={`/resources/open-access/${r.slug}`}
              className="p-6 bg-white border border-slate-200 rounded-xl flex flex-col card-premium hover:border-blue-200 group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl leading-none" aria-hidden="true">{r.emoji}</span>
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
      </div>
    </div>
  );
}