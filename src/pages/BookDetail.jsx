import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronRight, Star, ExternalLink, BookOpen, FileText, Calendar, BookMarked, User } from 'lucide-react';
import Seo from '@/components/Seo';
import { buildBookSchema, buildBreadcrumbSchema } from '@/lib/seoSchemas';
import CitationBox from '@/components/CitationBox';

export default function BookDetail() {
  const { slug } = useParams();
  const [book, setBook] = useState(null);
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBook(); }, [slug]);

  const fetchBook = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.Book.filter({ slug }, '-updated_date', 1);
      const books = res.results || res || [];
      if (!books.length) { setBook(null); return; }
      const b = books[0];
      setBook(b);
      if (b.author_ids?.length) {
        const aus = await Promise.all(b.author_ids.map(id => base44.entities.Author.get(id).catch(() => null)));
        setAuthors(aus.filter(Boolean));
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (!book) return <div className="container-tbl py-32 text-center"><h1 className="text-2xl font-bold text-slate-900 mb-3">Book not found</h1><Link to="/books" className="text-blue-600 font-medium">Browse books →</Link></div>;

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Books', url: '/books' },
    { name: book.title }
  ];
  const schemas = [
    buildBookSchema(book, authors),
    buildBreadcrumbSchema(breadcrumbItems)
  ];

  return (
    <div>
      <Seo title={book.title} description={book.description || book.subtitle} image={book.cover} type="book" schemas={schemas} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-3">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 flex-wrap">
            <Link to="/" className="hover:text-blue-600">Home</Link><ChevronRight className="w-3.5 h-3.5" />
            <Link to="/books" className="hover:text-blue-600">Books</Link><ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium truncate">{book.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-tbl py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl">
          {/* Cover */}
          <div className="md:col-span-1">
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 shadow-lg">
              {book.cover ? <img src={book.cover} alt={book.title} className="w-full h-full object-cover" /> : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200"><BookMarked className="w-16 h-16 text-slate-300" /></div>
              )}
            </div>
            <div className="mt-4 space-y-2">
              {book.amazon_link && (
                <a href={book.amazon_link} target="_blank" rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  <ExternalLink className="w-4 h-4" /> Buy Paperback
                </a>
              )}
              {book.amazon_kindle_link && (
                <a href={book.amazon_kindle_link} target="_blank" rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200">
                  <ExternalLink className="w-4 h-4" /> Buy Kindle
                </a>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2">
            {book.series && (
              <span className="inline-block text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full mb-3">{book.series}{book.reading_order ? ` · Book ${book.reading_order}` : ''}</span>
            )}
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">{book.title}</h1>
            {book.subtitle && <p className="text-lg text-slate-500 font-medium mb-4 italic">{book.subtitle}</p>}
            {book.rating > 0 && (
              <div className="flex items-center gap-1.5 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map(n => <Star key={n} className={`w-4 h-4 ${n <= Math.round(book.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}
                </div>
                <span className="text-sm text-slate-500 font-medium">{book.rating.toFixed(1)}</span>
              </div>
            )}
            <p className="text-slate-600 leading-relaxed mb-6">{book.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {authors.length > 0 && <InfoItem icon={User} label="Author" value={authors.map(a => a.name).join(', ')} />}
              {book.publisher && <InfoItem icon={BookMarked} label="Publisher" value={book.publisher} />}
              {book.publication_year && <InfoItem icon={Calendar} label="Published" value={book.publication_year} />}
              {book.pages && <InfoItem icon={BookOpen} label="Pages" value={book.pages} />}
              {book.isbn && <InfoItem icon={FileText} label="ISBN" value={book.isbn} />}
              {book.language && <InfoItem icon={BookOpen} label="Language" value={book.language} />}
            </div>

            {book.formats?.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Available Formats</p>
                <div className="flex flex-wrap gap-2">
                  {book.formats.map(f => <span key={f} className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-full">{f}</span>)}
                </div>
              </div>
            )}

            {book.tags?.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Topics</p>
                <div className="flex flex-wrap gap-2">
                  {book.tags.map(t => <span key={t} className="px-3 py-1 text-xs font-medium text-teal-700 bg-teal-50 rounded-full">{t}</span>)}
                </div>
              </div>
            )}

            {book.series && (
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 mb-6">
                <p className="text-sm text-slate-600">Part of the <span className="font-semibold text-blue-700">{book.series}</span> series{book.reading_order ? ` · Book ${book.reading_order}` : ''}</p>
              </div>
            )}

            {authors.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">About the Author{authors.length > 1 ? 's' : ''}</h3>
                <div className="space-y-3">
                  {authors.map(a => (
                    <Link key={a.id} to={`/authors/${a.slug}`} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-200 transition-all">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
                        {a.photo ? <img src={a.photo} alt={a.name} className="w-full h-full object-cover" /> : a.name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{a.name}</p>
                        {a.expertise_areas?.length > 0 && <p className="text-xs text-slate-400">{a.expertise_areas.join(', ')}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        {book.reviews?.length > 0 && (
          <div className="mt-12 max-w-3xl">
            <h2 className="text-xl font-bold text-slate-900 mb-5">Reviews</h2>
            <div className="space-y-4">
              {book.reviews.map((r, i) => (
                <div key={i} className="p-5 bg-white border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-slate-900 text-sm">{r.reviewer}</p>
                    {r.rating > 0 && <div className="flex">{[1,2,3,4,5].map(n => <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}</div>}
                  </div>
                  <p className="text-sm text-slate-600">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <CitationBox
          type="book"
          title={book.title}
          authors={authors.map(a => a.name)}
          date={book.publication_year ? `${book.publication_year}-01-01` : null}
          url={`${window.location.origin}/books/${book.slug}`}
          publisher={book.publisher}
          isbn={book.isbn}
        />
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1"><Icon className="w-3 h-3" />{label}</p>
      <p className="text-sm text-slate-700 font-medium">{value}</p>
    </div>
  );
}