import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen } from 'lucide-react';
import DifficultyBadge from '@/components/DifficultyBadge';
import CategoryBadge from '@/components/CategoryBadge';

export default function ArticleCard({ article, categoryName, featured = false }) {
  return (
    <Link to={`/article/${article.slug}`} className="group block">
      <article className={`bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-300 ${featured ? 'flex flex-col' : ''}`}>
        {article.featured_image && (
          <div className={`overflow-hidden bg-slate-100 ${featured ? 'h-56' : 'h-44'}`}>
            <img src={article.featured_image} alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {categoryName && <CategoryBadge name={categoryName} />}
            {article.difficulty && <DifficultyBadge level={article.difficulty} />}
          </div>
          <h3 className={`font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight ${featured ? 'text-xl' : 'text-base'} mb-2 line-clamp-2`}>
            {article.title}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2 mb-4">{article.summary}</p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            {article.reading_time && (
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{article.reading_time} min read</span>
            )}
            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />Article</span>
          </div>
        </div>
      </article>
    </Link>
  );
}