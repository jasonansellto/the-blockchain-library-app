import React from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ArrowRight } from 'lucide-react';
import NewsCard from '@/components/news/NewsCard';

export default function LatestNewsWidget({ items, loading }) {
  return (
    <section>
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <Newspaper className="w-5 h-5 text-blue-600" />
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Latest News</h2>
          </div>
          <p className="text-slate-500 text-sm sm:text-base">Real-time headlines from across the blockchain industry</p>
        </div>
        <Link to="/news" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 shrink-0 ml-4">
          See all news <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
              <div className="h-4 w-20 bg-slate-100 rounded mb-3" />
              <div className="h-4 w-full bg-slate-100 rounded mb-2" />
              <div className="h-4 w-3/4 bg-slate-100 rounded mb-4" />
              <div className="h-3 w-24 bg-slate-50 rounded" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? null : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.slice(0, 6).map((item, i) => <NewsCard key={i} item={item} />)}
        </div>
      )}

      <Link to="/news" className="sm:hidden inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 mt-4">
        See all news <ArrowRight className="w-4 h-4" />
      </Link>
    </section>
  );
}