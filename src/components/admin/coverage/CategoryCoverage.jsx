import React from 'react';

export default function CategoryCoverage({ coverage }) {
  const categories = coverage.categories || [];

  if (categories.length === 0) {
    return <div className="text-center py-20 text-slate-400">No category data available.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {categories.map(cat => (
        <div key={cat.id} className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900">{cat.name}</h3>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{cat.coverage}</p>
              <p className="text-xs text-slate-400">coverage score</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
            <div><p className="text-xs text-slate-400">Objects</p><p className="font-semibold text-slate-700">{cat.objects}</p></div>
            <div><p className="text-xs text-slate-400">Relationships</p><p className="font-semibold text-slate-700">{cat.relationships}</p></div>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full mb-4">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${cat.coverage}%` }} />
          </div>
          {cat.strongest?.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-semibold text-emerald-600 uppercase mb-1">Strongest</p>
              <div className="flex flex-wrap gap-1">
                {cat.strongest.map(s => <span key={s} className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{s}</span>)}
              </div>
            </div>
          )}
          {cat.weakest?.length > 0 && (
            <div className="mb-2">
              <p className="text-xs font-semibold text-orange-500 uppercase mb-1">Weakest</p>
              <div className="flex flex-wrap gap-1">
                {cat.weakest.map(w => <span key={w} className="text-xs text-orange-700 bg-orange-50 px-2 py-0.5 rounded">{w}</span>)}
              </div>
            </div>
          )}
          {Object.keys(cat.missingResources || {}).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Missing Resources</p>
              <div className="flex flex-wrap gap-1">
                {Object.entries(cat.missingResources).map(([k, v]) => (
                  <span key={k} className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{v} {k}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}