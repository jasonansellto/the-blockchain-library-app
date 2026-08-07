import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookMarked } from 'lucide-react';
import Reveal from '@/components/animations/Reveal';
import StaggerGroup from '@/components/animations/StaggerGroup';
import BookCard from '@/components/cards/BookCard';
import { platformLinks } from '@/lib/platformLinks';

export default function BooksSection({ books }) {
  if (!books || books.length === 0) return null;
  return (
    <section className="border-b border-slate-100 bg-white">
      <div className="container-tbl py-16 sm:py-20">
        <Reveal>
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Books</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">Long-Form Knowledge, Connected</h2>
              <p className="text-lg text-slate-500 leading-relaxed">
                Go deeper with long-form resources. Each book is connected directly to the Knowledge Engine —
                linking concepts, research, and learning paths.
              </p>
            </div>
            <a href={platformLinks.booksCatalog} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
              Full book catalog <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </Reveal>
        <StaggerGroup className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {books.slice(0, 4).map((b) => <BookCard key={b.id} book={b} />)}
        </StaggerGroup>
        <div className="flex flex-wrap gap-3">
          <Link to="/books" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            <BookMarked className="w-4 h-4" /> Explore Books
          </Link>
          <a href={platformLinks.booksCatalog} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors sm:hidden">
            Full book catalog
          </a>
        </div>
      </div>
    </section>
  );
}