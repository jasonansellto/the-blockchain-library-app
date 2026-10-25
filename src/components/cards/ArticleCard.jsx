import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BookOpen, Lock } from 'lucide-react';
import DifficultyBadge from '@/components/DifficultyBadge';
import CategoryBadge from '@/components/CategoryBadge';
import SafeImage from '@/components/SafeImage';

export default function ArticleCard({ article, categoryName, featured = false }) {
  return (
    <Link to={`/article/${article.slug}`} className="group block">
      <article className={`bg-white rounded-xl border border-slate-200 overflow-hidden card-premium hover:border-blue-200 ${featured ? 'flex flex-col' : ''}`}>
        <SafeImage src={article.featured_image} alt={article.title}
          frameClassName={`overflow-hidden bg-slate-100 ${featured ? 'h-56' : 'h-44'}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {categoryName && <CategoryBadge name={categoryName} />}
            {article.difficulty && <DifficultyBadge level={article.difficulty} />}
            {article.access_level === 'premium' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                <Lock className="w-3 h-3" /> Premium
              </span>
            )}
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