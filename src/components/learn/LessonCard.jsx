import React, { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ChevronDown, BookOpen, Clock, Check } from 'lucide-react';

const LessonCard = forwardRef(({ lesson, index, total, article, isDone, authed, isExpanded, onExpand, onToggle, onCompleteAndNext }, ref) => {
  const navigate = useNavigate();
  const order = lesson.order ?? index + 1;
  const lessonLink = article ? `/article/${article.slug}` : null;
  const isLast = index === total - 1;

  return (
    <div ref={ref} className="relative flex items-stretch gap-2 sm:gap-3">
      {/* Circle column with connecting line */}
      <div className="relative shrink-0 flex flex-col items-center self-stretch">
        {index !== 0 && <div className="w-px flex-1 bg-slate-200" />}
        <div className="shrink-0 py-1.5">
          {authed ? (
            <button onClick={(e) => { e.stopPropagation(); onToggle(order); }} className="shrink-0" aria-label="Toggle complete">
              {isDone ? <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-teal-600" /> : <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-slate-300 hover:border-blue-500 bg-white transition-colors" />}
            </button>
          ) : (
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400">{index + 1}</div>
          )}
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-200" />}
      </div>

      {/* Card + expanded content */}
      <div className="flex-1 min-w-0 pb-3">
        <div onClick={() => lessonLink && onExpand(index)}
          className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${lessonLink ? 'cursor-pointer' : ''} ${isDone ? 'bg-teal-50 border-teal-200' : 'bg-white border-slate-200 hover:border-blue-200'} ${isExpanded ? 'ring-2 ring-blue-300 border-blue-300' : ''}`}>
          {article?.featured_image && (
            <div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-slate-100">
              <img src={article.featured_image} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold text-slate-400">Lesson {order}</span>
              {lesson.duration && <span className="flex items-center gap-0.5 text-xs text-slate-400"><Clock className="w-3 h-3" />{lesson.duration}</span>}
              {isDone && <span className="text-xs font-medium text-teal-600">Completed</span>}
            </div>
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">{lesson.title || article?.title}</h3>
            {!isExpanded && article?.summary && <p className="text-xs text-slate-400 line-clamp-2 mt-1">{article.summary}</p>}
          </div>
          {lessonLink && (
            <div className="shrink-0 mt-1">
              {isExpanded ? <ChevronDown className="w-5 h-5 text-blue-500 rotate-180 transition-transform" /> : <ChevronDown className="w-5 h-5 text-slate-400 transition-transform" />}
            </div>
          )}
        </div>

        {/* Expanded lesson content */}
        {isExpanded && lessonLink && (
          <div className="mt-2 p-4 bg-white border border-blue-200 rounded-xl animate-fade-in-fast">
            {article?.summary && <p className="text-sm text-slate-600 leading-relaxed mb-4">{article.summary}</p>}
            {article?.key_takeaways?.length > 0 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Key Takeaways</h4>
                <ul className="space-y-1.5">
                  {article.key_takeaways.slice(0, 4).map((kt, j) => (
                    <li key={j} className="text-sm text-slate-600 flex items-start gap-2">
                      <Check className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" /><span>{kt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={() => navigate(lessonLink)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                <BookOpen className="w-4 h-4" /> Read Full Article
              </button>
              {authed && !isLast && (
                <button onClick={() => onCompleteAndNext(order, index)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  Complete &amp; Continue <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {authed && isLast && (
                <button onClick={() => !isDone && onToggle(order)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors">
                  <Check className="w-4 h-4" /> Mark Complete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

LessonCard.displayName = 'LessonCard';
export default LessonCard;