import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Eye } from 'lucide-react';
import DifficultyBadge from '@/components/DifficultyBadge';

const langColors = {
  solidity: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  vyper: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  rust: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  javascript: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  typescript: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  python: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
};

export default function SnippetCard({ snippet }) {
  const langCls = langColors[snippet.language] || langColors.solidity;
  return (
    <Link to={`/developers/snippets/${snippet.slug}`} className="group block">
      <article className="bg-white rounded-xl border border-slate-200 hover:shadow-lg hover:border-blue-200 transition-all duration-300 h-full flex flex-col">
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ring-1 ring-inset capitalize ${langCls}`}>
              {snippet.language}
            </span>
            {snippet.chain && snippet.chain !== 'none' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200 capitalize">
                {snippet.chain}
              </span>
            )}
            <DifficultyBadge level={snippet.difficulty} />
          </div>
          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight text-base mb-2 line-clamp-2">
            {snippet.title}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{snippet.description}</p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1 capitalize"><Code2 className="w-3.5 h-3.5" />{snippet.category}</span>
            {snippet.views > 0 && (
              <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{snippet.views}</span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}