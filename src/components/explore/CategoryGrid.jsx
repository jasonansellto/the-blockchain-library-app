import React, { useMemo } from 'react';
import { getExampleConcepts } from '@/lib/knowledgeEngine';

export default function CategoryGrid({ categories, categoryCounts, searchIndex, onCategoryClick }) {
  const sorted = useMemo(() => {
    return categories
      .map(c => ({ ...c, count: categoryCounts[c.id] || 0 }))
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [categories, categoryCounts]);

  if (sorted.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sorted.map(c => {
        const examples = getExampleConcepts(searchIndex, c.id, 3);
        return (
          <div key={c.id} onClick={() => onCategoryClick(c.id)} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onCategoryClick(c.id)}
            className="group p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-900 group-hover:text-blue-600">{c.name}</h4>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{c.count}</span>
            </div>
            {c.description && <p className="text-xs text-slate-500 line-clamp-2 mb-3">{c.description}</p>}
            {examples.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {examples.map(ex => (
                  <span key={ex.uid} className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded">{ex.title}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}