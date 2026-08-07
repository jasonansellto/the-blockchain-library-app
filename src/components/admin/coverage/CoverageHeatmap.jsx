import React, { useMemo } from 'react';

const DIMENSIONS = [
  { key: 'metadata', label: 'Meta' },
  { key: 'relationships', label: 'Rel' },
  { key: 'seo', label: 'SEO' },
  { key: 'references', label: 'Refs' },
  { key: 'learning', label: 'Learn' },
  { key: 'developer', label: 'Dev' },
  { key: 'research', label: 'Res' },
];

function heatColor(score) {
  if (score >= 85) return 'bg-emerald-500 text-white';
  if (score >= 70) return 'bg-blue-500 text-white';
  if (score >= 50) return 'bg-amber-400 text-white';
  if (score >= 30) return 'bg-orange-400 text-white';
  return 'bg-red-400 text-white';
}

export default function CoverageHeatmap({ coverage }) {
  const categoryData = useMemo(() => {
    const byCat = {};
    for (const obj of coverage.objects) {
      const catId = obj.categoryId;
      if (!catId) continue;
      if (!byCat[catId]) byCat[catId] = { objects: [], name: catId };
      byCat[catId].objects.push(obj);
    }
    return Object.values(byCat).map(c => {
      const dims = {};
      for (const d of DIMENSIONS) {
        dims[d.key] = Math.round(c.objects.reduce((a, o) => a + (o.scores[d.key] || 0), 0) / c.objects.length);
      }
      return { ...c, dims, count: c.objects.length };
    }).sort((a, b) => b.count - a.count).slice(0, 15);
  }, [coverage.objects]);

  if (categoryData.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Knowledge Coverage Heatmap</h3>
      <div className="overflow-x-auto">
        <table className="text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left p-2 font-semibold text-slate-700 min-w-[160px]">Category</th>
              {DIMENSIONS.map(d => <th key={d.key} className="p-2 font-semibold text-slate-600 text-center min-w-[60px]">{d.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {categoryData.map(cat => (
              <tr key={cat.name} className="border-b border-slate-100">
                <td className="p-2 font-medium text-slate-900 truncate max-w-[160px]">{cat.name}</td>
                {DIMENSIONS.map(d => (
                  <td key={d.key} className={`p-2 text-center font-semibold ${heatColor(cat.dims[d.key])} rounded m-0.5`}>
                    {cat.dims[d.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}