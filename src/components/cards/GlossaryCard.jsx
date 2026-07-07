import React from 'react';
import { Link } from 'react-router-dom';
import DifficultyBadge from '@/components/DifficultyBadge';

export default function GlossaryCard({ term }) {
  return (
    <Link to={`/glossary/${term.slug}`} className="group block">
      <div className="bg-white rounded-xl border border-slate-200 p-5 h-full hover:shadow-md hover:border-teal-200 transition-all duration-300">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors tracking-tight">
            {term.title}
          </h3>
          {term.difficulty && <DifficultyBadge level={term.difficulty} />}
        </div>
        <p className="text-sm text-slate-500 line-clamp-3">{term.definition}</p>
      </div>
    </Link>
  );
}