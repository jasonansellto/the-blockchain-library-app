import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, Quote } from 'lucide-react';

export default function ResearchCard({ paper }) {
  return (
    <Link to={`/research/${paper.slug}`} className="group block">
      <div className="bg-white rounded-xl border border-slate-200 p-5 h-full hover:shadow-md hover:border-blue-200 transition-all duration-300">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-blue-700 bg-blue-50 capitalize">
            <FileText className="w-3 h-3" />{paper.research_type || 'paper'}
          </span>
        </div>
        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-base mb-2 line-clamp-2 tracking-tight">
          {paper.title}
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          {Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors}
        </p>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4">{paper.abstract}</p>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          {paper.publication && <span>{paper.publication}</span>}
          {paper.citations_count > 0 && (
            <span className="flex items-center gap-1"><Quote className="w-3.5 h-3.5" />{paper.citations_count} citations</span>
          )}
          {paper.downloads > 0 && (
            <span className="flex items-center gap-1"><Download className="w-3.5 h-3.5" />{paper.downloads}</span>
          )}
        </div>
      </div>
    </Link>
  );
}