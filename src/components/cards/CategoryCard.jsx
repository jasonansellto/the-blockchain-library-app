import React from 'react';
import { Link } from 'react-router-dom';

export default function CategoryCard({ category, articleCount }) {
  return (
    <Link to={`/topics/${category.slug}`}
      className="group block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 transition-all duration-300">
      <div className="flex items-start justify-between mb-2">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center text-lg">
          {category.icon || '📚'}
        </div>
        {articleCount !== undefined && (
          <span className="text-xs text-slate-400 font-medium">{articleCount} articles</span>
        )}
      </div>
      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight mb-1">
        {category.name}
      </h3>
      {category.description && (
        <p className="text-sm text-slate-500 line-clamp-2">{category.description}</p>
      )}
    </Link>
  );
}