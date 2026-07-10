import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Sparkles, BookMarked, BookOpen, ShoppingBag } from 'lucide-react';

export default function MasteringCryptoSeries() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.Book.filter({ series: 'Mastering Crypto' }, 'reading_order', 20);
        setBooks(res.results || res || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, []);

  if (loading || books.length === 0) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-slate-50 to-teal-50/40 p-6 sm:p-10">
      <div className="absolute -top-24 -right-16 w-72 h-72 bg-blue-200/30 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-16 w-72 h-72 bg-teal-200/25 blur-3xl rounded-full pointer-events-none" />
      <div className="relative">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> The Mastering Crypto Series
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
              From your first Bitcoin to mastering Web3 &amp; DeFi
            </h2>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
              A five-part beginner-friendly series that takes you from blockchain basics to seed-phrase security, Web3, and decentralized finance — built for readers who want to truly understand crypto, not just trade it.
            </p>
          </div>
          <div className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 shrink-0">
            <BookMarked className="w-4 h-4" /> {books.length}-book series
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {books.map((b, i) => (
            <div key={b.id} className="group flex flex-col">
              <Link to={`/books/${b.slug}`} className="block relative mb-3">
                <div className="absolute -top-2 -left-2 z-10 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-md ring-2 ring-white">
                  {b.reading_order || i + 1}
                </div>
                <div className="aspect-[2/3] rounded-lg overflow-hidden bg-slate-100 ring-1 ring-slate-200 group-hover:ring-blue-300 transition-all shadow-sm group-hover:shadow-md">
                  {b.cover ? (
                    <img src={b.cover} alt={b.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><BookMarked className="w-8 h-8" /></div>
                  )}
                </div>
              </Link>
              <Link to={`/books/${b.slug}`} className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                {b.title}
              </Link>
              <p className="text-xs text-slate-400 line-clamp-2 mb-3">{b.subtitle}</p>
              <div className="mt-auto flex flex-col gap-1.5">
                {b.amazon_kindle_link && (
                  <a href={b.amazon_kindle_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                    <BookOpen className="w-3.5 h-3.5" /> Kindle
                  </a>
                )}
                {b.amazon_link && (
                  <a href={b.amazon_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors">
                    <ShoppingBag className="w-3.5 h-3.5" /> Paperback
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}