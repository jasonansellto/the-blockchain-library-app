import React from 'react';
import { Link } from 'react-router-dom';
import { Star, BookMarked } from 'lucide-react';

export default function BookCard({ book }) {
  return (
    <Link to={`/books/${book.slug}`} className="group block">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 h-full flex flex-col">
        <div className="aspect-[3/4] bg-slate-100 overflow-hidden">
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
          <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-sm mb-1 line-clamp-2">
            {book.title}
          </h3>
          <p className="text-xs text-slate-400 mb-2">{book.publisher || 'Unknown publisher'}</p>
          {book.rating > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-500 mt-auto">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-medium text-slate-600">{book.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}