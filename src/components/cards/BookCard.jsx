import React from 'react';
import { Link } from 'react-router-dom';
import { Star, BookMarked, Sparkles } from 'lucide-react';

export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book.slug}`} className="group block">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden card-premium hover:border-blue-200 h-full flex flex-col">
        <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
          {book.publication_year && book.publication_year >= new Date().getFullYear() && (
            <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 text-[10px] font-semibold text-white bg-blue-600 px-2 py-0.5 rounded-full shadow-sm">
              <Sparkles className="w-3 h-3" /> New
            </span>
          )}
          {book.cover ? (
            <img src={book.cover} alt={book.title} loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <BookMarked className="w-12 h-12 text-slate-300" />
            </div>
          )}
        </div>
        <div className="p-4 flex-1 flex flex-col">
          {book.series && (
            <span className="inline-block text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mb-1.5 self-start">{book.series}</span>
          )}
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-sm mb-1 line-clamp-2">
            {book.title}
          </h3>
          {book.subtitle && <p className="text-xs text-slate-500 mb-2 line-clamp-2">{book.subtitle}</p>}
          <div className="flex items-center gap-2 mt-auto">
            {book.rating > 0 && (
              <div className="flex items-center gap-1 text-xs text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="font-medium text-slate-600">{book.rating.toFixed(1)}</span>
              </div>
            )}
            <span className="text-xs text-slate-400">{book.language === 'French' ? 'FR' : 'EN'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}