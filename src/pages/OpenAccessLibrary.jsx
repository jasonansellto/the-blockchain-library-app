import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ExternalLink } from 'lucide-react';
import Seo from '@/components/Seo';

// Category badge colours (Books = teal, Research = blue, Archive = amber,
// Academic = purple, …) styled to match the site's DifficultyBadge.
const badgeStyles = {
  Books: 'bg-teal-50 text-teal-700 ring-teal-600/20',
  Archive: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Research: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Academic: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  Medical: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  Journals: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  Global: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  Preservation: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'Primary Sources': 'bg-orange-50 text-orange-700 ring-orange-600/20',
  Culture: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-600/20',
};

const resources = [
  { name: 'Open Library', type: 'Books', emoji: '📚', url: 'https://openlibrary.org', description: 'An open, editable catalog of every book ever published, from the team behind the Internet Archive. Offers free digital lending of millions of titles plus detailed bibliographic metadata. A starting point for finding both readable ebooks and reference data.' },
  { name: 'Internet Archive', type: 'Archive', emoji: '🏛️', url: 'https://archive.org', description: 'A vast non-profit digital library preserving web pages, books, audio, video, software, and images. Home to the Wayback Machine and millions of freely downloadable texts. Essential for historical research and accessing out-of-print material.' },
  { name: 'Project Gutenberg', type: 'Books', emoji: '📖', url: 'https://www.gutenberg.org', description: 'The oldest digital library, offering over 70,000 free public-domain ebooks in EPUB and plain-text formats. Focused on classic literature and out-of-copyright works. No fees, no registration — download and keep.' },
  { name: 'arXiv', type: 'Research', emoji: '🔬', url: 'https://arxiv.org', description: 'A preprint repository for physics, mathematics, computer science, and quantitative finance research. Most papers are freely downloadable as PDFs before peer review. The standard venue for cryptography and distributed-systems research dissemination.' },
  { name: 'Google Scholar', type: 'Academic', emoji: '🎓', url: 'https://scholar.google.com', description: 'A broad academic search engine indexing peer-reviewed papers, theses, books, and patents across disciplines. Useful for finding citations, related work, and PDFs when available. Covers blockchain and cryptography literature across publishers.' },
  { name: 'Semantic Scholar', type: 'Academic', emoji: '🤖', url: 'https://www.semanticscholar.org', description: 'An AI-powered research tool from the Allen Institute that summarizes papers and highlights key influences. Indexes over 200 million publications with citation graphs and TLDRs. Particularly strong for navigating dense technical literature quickly.' },
  { name: 'PubMed Central', type: 'Medical', emoji: '🏥', url: 'https://www.ncbi.nlm.nih.gov/pmc', description: 'A free archive of biomedical and life-sciences journal articles from the U.S. National Institutes of Health. Contains millions of full-text, peer-reviewed papers. Useful for research intersecting health, biotech, and applied cryptography.' },
  { name: 'DOAJ', type: 'Journals', emoji: '📰', url: 'https://doaj.org', description: 'The Directory of Open Access Journals indexes high-quality, peer-reviewed journals that are free to read. Covers every academic discipline with millions of articles. A trusted filter for finding legitimate open-access publishing venues.' },
  { name: 'WorldCat', type: 'Global', emoji: '🌍', url: 'https://www.worldcat.org', description: "The world's largest bibliographic database, cataloging holdings from tens of thousands of libraries worldwide. Find which library holds a physical or digital title near you. Ideal for locating hard-to-find books and academic materials." },
  { name: 'HathiTrust', type: 'Preservation', emoji: '🛡️', url: 'https://www.hathitrust.org', description: 'A collaborative repository of millions of digitized books and journals from research libraries. Combines the Google Books mass-digitization corpus with member contributions. Strong for preservation access and full-text search across academic holdings.' },
  { name: 'Library of Congress', type: 'Primary Sources', emoji: '📜', url: 'https://www.loc.gov', description: 'The largest library in the world and the U.S. national research institution. Offers extensive digital collections of primary sources, manuscripts, maps, and legal documents. A primary reference for historical and legislative blockchain research.' },
  { name: 'Europeana', type: 'Culture', emoji: '🎨', url: 'https://www.europeana.eu', description: 'An aggregator of digitized cultural heritage from European museums, galleries, libraries, and archives. Provides free access to artworks, books, films, and music. Useful for research tracing technology through cultural and historical artifacts.' },
];

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
      hasPart: resources.map((r) => ({ '@type': 'WebPage', name: r.name, url: r.url })),
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
            These trusted repositories complement The Blockchain Library's own collection with millions of openly accessible works.
          </p>
        </div>
      </div>

      <div className="container-tbl py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((r) => (
            <div key={r.name} className="p-6 bg-white border border-slate-200 rounded-xl flex flex-col card-premium hover:border-blue-200">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl leading-none" aria-hidden="true">{r.emoji}</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset uppercase tracking-wide ${badgeStyles[r.type]}`}>{r.type}</span>
              </div>
              <h3 className="font-bold text-slate-900 tracking-tight mb-2 text-lg">{r.name}</h3>
              <p className="text-sm text-slate-500 mb-5 flex-1">{r.description}</p>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:gap-2 transition-all self-start">
                Visit <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}