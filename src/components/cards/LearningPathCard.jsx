import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Layers, ArrowRight } from 'lucide-react';
import DifficultyBadge from '@/components/DifficultyBadge';

export default function LearningPathCard({ path, categoryName, progress = 0 }) {
  const lessonCount = Array.isArray(path.lessons) ? path.lessons.length : 0;
  const hasProgress = progress > 0;

  return (
    <Link to={`/learn/${path.slug}`} className="group block">
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden h-full hover:shadow-lg hover:border-blue-200 transition-all duration-300 flex flex-col">
        {path.cover_image && (
          <div className="overflow-hidden bg-slate-100">
            <img src={path.cover_image} alt={path.title}
              className="w-full h-auto group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          </div>
        )}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <DifficultyBadge level={path.difficulty} />
            {path.estimated_time && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />{path.estimated_time}
              </span>
            )}
            {categoryName && <span className="text-xs text-slate-400">{categoryName}</span>}
          </div>
          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-lg mb-2 tracking-tight line-clamp-2">
            {path.title}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{path.description}</p>
          {hasProgress && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-500">Progress</span>
                <span className="text-xs font-bold text-blue-600">{progress}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm text-slate-600">
              <Layers className="w-4 h-4 text-blue-500" />{lessonCount} lessons
            </span>
            <span className="flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
              {hasProgress ? 'Resume' : 'Start'} <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}