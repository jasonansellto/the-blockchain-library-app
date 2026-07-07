import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Layers, ArrowRight } from 'lucide-react';
import DifficultyBadge from '@/components/DifficultyBadge';

export default function LearningPathCard({ path }) {
  const lessonCount = Array.isArray(path.lessons) ? path.lessons.length : 0;
  return (
    <Link to={`/learn/${path.slug}`} className="group block">
      <div className="bg-white rounded-xl border border-slate-200 p-6 h-full hover:shadow-lg hover:border-blue-200 transition-all duration-300 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-60" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <DifficultyBadge level={path.difficulty} />
            {path.estimated_time && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5" />{path.estimated_time}
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-lg mb-2 tracking-tight">
            {path.title}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-2 mb-5">{path.description}</p>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm text-slate-600">
              <Layers className="w-4 h-4 text-blue-500" />{lessonCount} lessons
            </span>
            <span className="flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
              Start <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}