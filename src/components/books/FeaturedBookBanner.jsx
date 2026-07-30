import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ExternalLink } from 'lucide-react';

export default function FeaturedBookBanner({ book }) {
  if (!book) return null;
  const googleBooks = book.google_books_url || book.access_links?.google_books_url;
  return (
    <section className="mb-10 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-teal-50/60">
      <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-6 p-6 sm:p-8">
        <div className="mx-auto sm:mx-0 w-40 sm:w-[200px] shrink-0">
          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-slate-100 shadow-lg">
            {book.cover ? (
              <img src={book.cover} alt={`Cover of ${book.title}`} className="w-full h-full object-cover" />
            ) : null}
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <span className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-white bg-blue-600 px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" /> New Release
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-1">{book.title}</h2>
          {book.subtitle && <p className="text-sm sm:text-base text-slate-500 font-medium mb-3">{book.subtitle}</p>}
          {book.short_description && <p className="text-sm text-slate-600 leading-relaxed mb-5 max-w-2xl">{book.short_description}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <Link to={`/books/${book.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
              Explore the Book <ArrowRight className="w-4 h-4" />
            </Link>
            {googleBooks && (
              <a href={googleBooks} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors">
                Preview on Google Books <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}