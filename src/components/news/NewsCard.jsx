import React from 'react';
import { ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function NewsCard({ item }) {
  const timeAgo = item.pubDate
    ? formatDistanceToNow(new Date(item.pubDate), { addSuffix: true })
    : '';

  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="group block">
      <article className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-slate-300 transition-all duration-300 h-full flex flex-col">
        <span className="inline-flex items-center self-start px-2 py-0.5 rounded text-xs font-medium text-slate-500 bg-slate-100 mb-3 line-clamp-1">
          {item.source || 'Source'}
        </span>
        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base mb-3 line-clamp-2 flex-1 tracking-tight">
          {item.title}
        </h3>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs text-slate-400">{timeAgo}</span>
          <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
        </div>
      </article>
    </a>
  );
}