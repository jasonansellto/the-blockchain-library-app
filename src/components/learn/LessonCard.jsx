import React, { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Clock } from 'lucide-react';

const LessonCard = forwardRef(({ lesson, index, total, article, isDone, authed, pathSlug, onToggle }, ref) => {
  const navigate = useNavigate();
  const order = lesson.order ?? index + 1;
  const isLast = index === total - 1;
  const lessonLink = article ? `/article/${article.slug}?path=${pathSlug}&lesson=${order}` : null;

  const handleClick = () => {
    if (lessonLink) navigate(lessonLink);
  };

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

      {/* Card */}
      <div className="flex-1 min-w-0 pb-3">
        <div onClick={handleClick}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${lessonLink ? 'cursor-pointer hover:shadow-sm' : ''} ${isDone ? 'bg-teal-50 border-teal-200' : 'bg-white border-slate-200 hover:border-blue-200'}`}>
          <SafeImage src={article?.featured_image}
            frameClassName="shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-slate-100"
            className="w-full h-full object-cover" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold text-slate-400">Lesson {order}</span>
              {lesson.duration && <span className="flex items-center gap-0.5 text-xs text-slate-400"><Clock className="w-3 h-3" />{lesson.duration}</span>}
              {isDone && <span className="text-xs font-medium text-teal-600">Completed</span>}
            </div>
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">{lesson.title || article?.title}</h3>
            {article?.summary && <p className="text-xs text-slate-400 line-clamp-2 mt-1">{article.summary}</p>}
          </div>
          {lessonLink && <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />}
        </div>
      </div>
    </div>
  );
});

LessonCard.displayName = 'LessonCard';
export default LessonCard;