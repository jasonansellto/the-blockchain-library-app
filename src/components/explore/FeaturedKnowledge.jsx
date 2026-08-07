import React, { useState, useEffect } from 'react';
import { Link2, Sparkles } from 'lucide-react';
import { getFeaturedKnowledge, getTypeMeta } from '@/lib/knowledgeEngine';

export default function FeaturedKnowledge({ searchIndex, related, onObjectClick }) {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    if (searchIndex && related) setFeatured(getFeaturedKnowledge(searchIndex, related, 6));
  }, [searchIndex, related]);

  if (featured.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {featured.map(item => {
        const meta = getTypeMeta(item.obj.type);
        return (
          <div key={item.obj.id} onClick={() => onObjectClick(item.obj.id)} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onObjectClick(item.obj.id)}
            className="group p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: meta.color }}>{meta.label}</span>
              <span className="text-xs text-slate-400 ml-auto flex items-center gap-1"><Sparkles className="w-3 h-3" />{item.quality}/100</span>
            </div>
            <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 mb-1">{item.obj.title}</h4>
            {item.obj.summary && <p className="text-sm text-slate-500 line-clamp-2 mb-3">{item.obj.summary}</p>}
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1"><Link2 className="w-3 h-3" />{item.relCount} connections</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}