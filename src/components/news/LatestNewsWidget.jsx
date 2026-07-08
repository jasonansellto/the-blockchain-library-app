import React from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, ArrowRight, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
              <div className="h-3 w-20 bg-slate-100 rounded shrink-0" />
              <div className="h-4 flex-1 bg-slate-100 rounded" />
              <div className="h-3 w-16 bg-slate-50 rounded shrink-0" />
            </div>
          ))
        ) : items.length === 0 ? null : (
          items.slice(0, 5).map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
              <span className="inline-flex items-center shrink-0 px-2 py-0.5 rounded text-xs font-medium text-slate-500 bg-slate-100 max-w-[8rem] truncate">
                {item.source || 'Source'}
              </span>
              <span className="flex-1 text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {item.title}
              </span>
              <span className="text-xs text-slate-400 shrink-0 hidden sm:block">
                {item.pubDate ? formatDistanceToNow(new Date(item.pubDate), { addSuffix: true }) : ''}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors shrink-0" />
            </a>
          ))
        )}
      </div>

      <Link to="/news" className="sm:hidden inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 mt-4">
        See all news <ArrowRight className="w-4 h-4" />
      </Link>
    </section>
  );
}