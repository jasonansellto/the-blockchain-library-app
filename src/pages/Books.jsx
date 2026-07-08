import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, BookMarked, Search } from 'lucide-react';
import BookCard from '@/components/cards/BookCard';
import Seo from '@/components/Seo';
import { buildCollectionPageSchema, buildBreadcrumbSchema } from '@/lib/seoSchemas';

const SERIES_TABS = [
  { key: 'all', label: 'All Books' },
  { key: 'featured', label: 'Featured Titles' },
  { key: 'Mastering Crypto', label: 'Mastering Crypto Series' },
  { key: 'Protocol Zero', label: 'Protocol Zero Series' },
  { key: 'The Adventures of The Crypto Kid & Lucy', label: "Kids & Educational" },
  { key: 'french', label: 'French Titles' },
];

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    try {
      const res = await base44.entities.Book.list('-updated_date', 100);
      setBooks(res.results || res || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const filtered = books.filter(b => {
    if (activeTab === 'featured' && !b.is_featured) return false;
    if (activeTab === 'french' && b.language !== 'French') return false;
    if (['Mastering Crypto', 'Protocol Zero', 'The Adventures of The Crypto Kid & Lucy'].includes(activeTab) && b.series !== activeTab) return false;
    if (!query) return true;
    return b.title.toLowerCase().includes(query.toLowerCase()) || (b.subtitle || '').toLowerCase().includes(query.toLowerCase()) || (b.publisher || '').toLowerCase().includes(query.toLowerCase());
  });

  // All Books view (no search): pin featured titles first, then rest by rating desc.
  const displayBooks = (activeTab === 'all' && !query)
    ? [...filtered.filter(b => b.is_featured)].sort((a, b) => b.rating - a.rating).concat([...filtered.filter(b => !b.is_featured)].sort((a, b) => b.rating - a.rating))
    : filtered;

  const schemas = [
    buildCollectionPageSchema('Blockchain & Crypto Book Library', 'A curated reading list of the best books on blockchain, crypto, and Web3.', '/books', books.slice(0, 10).map(b => ({ name: b.title, url: `/books/${b.slug}` }))),
    buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Books', url: '/books' }])
  ];

  return (
    <div>
      <Seo title="Blockchain & Crypto Book Library" description="A curated reading list of the best books on blockchain, crypto, and Web3 — handpicked from Amazon bestsellers and expert recommendations." schemas={schemas} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-12">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3"><span>Home</span><span>/</span><span className="text-slate-700 font-medium">Books</span></div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">Blockchain &amp; Crypto Book Library</h1>
          <p className="text-slate-500 max-w-2xl">A curated reading list of the best books on blockchain, crypto, and Web3 — handpicked from Amazon bestsellers and expert recommendations.</p>
        </div>
      </div>
      <div className="container-tbl py-10">
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search books..."
            className="w-full pl-12 pr-4 py-3 text-base bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          {SERIES_TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.key ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-200 hover:text-blue-600'}`}>
              {tab.label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
        ) : displayBooks.length === 0 ? (
          <div className="text-center py-20"><BookMarked className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-400">No books found.</p></div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-6">{displayBooks.length} book{displayBooks.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {displayBooks.map(b => <BookCard key={b.id} book={b} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}