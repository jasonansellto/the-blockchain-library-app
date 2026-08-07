import React from 'react';
import { Link2 } from 'lucide-react';
import { getTypeMeta } from '@/lib/knowledgeEngine';

export default function SearchResultCard({ result, categoryName, onOpen }) {
  const meta = getTypeMeta(result.type);
  return (
    <div onClick={() => onOpen(result.id)} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(result.id)}
      className="group p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: meta.color }}>{meta.label}</span>
        {categoryName && <span className="text-xs text-slate-400">{categoryName}</span>}
        <span className="text-xs text-slate-400 ml-auto flex items-center gap-1"><Link2 className="w-3 h-3" />{result._relCount} connections</span>
      </div>
      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 mb-1">{result.title}</h3>
      {result.summary && <p className="text-sm text-slate-500 line-clamp-2 mb-2">{result.summary}</p>}
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <code className="font-mono">{result.id}</code>
        {result.tags?.length > 0 && <span className="line-clamp-1">#{result.tags.slice(0, 3).join(' #')}</span>}
      </div>
    </div>
  );
}