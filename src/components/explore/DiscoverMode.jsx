import React, { useMemo } from 'react';
import { getCategoryCounts, getTypeCounts } from '@/lib/knowledgeEngine';
import CategoryGrid from './CategoryGrid';
import ResourceTypeGrid from './ResourceTypeGrid';
import FeaturedKnowledge from './FeaturedKnowledge';

export default function DiscoverMode({ manifest, searchIndex, related, categories, onObjectClick, onTypeFilter, onCategoryFilter, devMode, researchMode }) {
  const typeCounts = useMemo(() => getTypeCounts(manifest), [manifest]);
  const categoryCounts = useMemo(() => getCategoryCounts(searchIndex), [searchIndex]);

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">Discover Blockchain Knowledge</h2>
        <p className="text-slate-500">Explore major knowledge areas across the blockchain ecosystem.</p>
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Explore by Resource Type</h3>
        <ResourceTypeGrid typeCounts={typeCounts} onTypeClick={onTypeFilter} />
      </div>

      {categories.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4">Browse by Category</h3>
          <CategoryGrid categories={categories} categoryCounts={categoryCounts}
            searchIndex={searchIndex} onCategoryClick={onCategoryFilter} />
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Featured Knowledge</h3>
        <FeaturedKnowledge searchIndex={searchIndex} related={related} onObjectClick={onObjectClick} />
      </div>

      {devMode && (
        <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
          <p className="text-sm text-cyan-700">
            <strong>Developer View</strong> — Code Examples, RPC, APIs, Smart Contracts, Architecture, Developer Resources, and Technical Research are emphasized.
          </p>
        </div>
      )}
      {researchMode && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-sm text-emerald-700">
            <strong>Research View</strong> — Research papers, DOIs, authors, publication dates, citations, related concepts, books, and technical references are emphasized.
          </p>
        </div>
      )}
    </div>
  );
}