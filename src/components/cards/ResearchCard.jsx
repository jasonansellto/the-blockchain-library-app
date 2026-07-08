import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, Quote, Sparkles } from 'lucide-react';
import DifficultyBadge from '@/components/DifficultyBadge';

const TYPE_LABELS = {
  paper: 'Paper',
  whitepaper: 'Whitepaper',
  standard: 'Standard',
  report: 'Report',
  preprint: 'Preprint',
  thesis: 'Thesis'
};

export default function ResearchCard({ paper }) {
  const isOriginal = paper.is_original_research;
  return (
    <Link to={`/research/${paper.slug}`} className="group block h-full">
      <div className={`rounded-xl border p-5 h-full hover:shadow-md transition-all duration-300 flex flex-col ${isOriginal ? 'border-teal-300 ring-1 ring-teal-200 bg-gradient-to-b from-teal-50/40 to-white' : 'border-slate-200 bg-white hover:border-blue-200'}`}>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-blue-700 bg-blue-50">
            <FileText className="w-3 h-3" />{TYPE_LABELS[paper.research_type] || 'Paper'}
          </span>
          {paper.difficulty && <DifficultyBadge level={paper.difficulty} />}
          {isOriginal && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold text-teal-700 bg-teal-50 ring-1 ring-inset ring-teal-600/20">
              <Sparkles className="w-3 h-3" />Original Research
            </span>
          )}
        </div>
        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-base mb-2 line-clamp-2 tracking-tight">
          {paper.title}
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          {Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors}
        </p>
        <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">{paper.abstract}</p>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {paper.publication && <span className="truncate">{paper.publication}</span>}
          {paper.citations_count > 0 && (
            <span className="flex items-center gap-1 shrink-0"><Quote className="w-3.5 h-3.5" />{paper.citations_count}</span>
          )}
          {paper.downloads > 0 && (
            <span className="flex items-center gap-1 shrink-0"><Download className="w-3.5 h-3.5" />{paper.downloads}</span>
          )}
        </div>
      </div>
    </Link>
  );
}