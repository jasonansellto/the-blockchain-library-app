import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronRight, Clock, Layers, CheckCircle2, Lock, ArrowRight, GraduationCap } from 'lucide-react';
import DifficultyBadge from '@/components/DifficultyBadge';

export default function LearningPathDetail() {
  const { slug } = useParams();
  const [path, setPath] = useState(null);
  const [articles, setArticles] = useState({});
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState({});

  useEffect(() => { fetchPath(); }, [slug]);

  const fetchPath = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.LearningPath.filter({ slug }, '-updated_date', 1);
      const paths = res.results || res || [];
      if (!paths.length) { setPath(null); return; }
      const p = paths[0];
      setPath(p);
      const lessonArticles = {};
      await Promise.all((p.lessons || []).map(async (lesson) => {
        if (lesson.article_id) {
          try { lessonArticles[lesson.article_id] = await base44.entities.Article.get(lesson.article_id); } catch (e) {}
        }
      }));
      setArticles(lessonArticles);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const toggleComplete = (order) => {
    setCompleted(prev => ({ ...prev, [order]: !prev[order] }));
  };

  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (!path) return <div className="container-tbl py-32 text-center"><h1 className="text-2xl font-bold text-slate-900 mb-3">Learning path not found</h1><Link to="/learn" className="text-blue-600 font-medium">Browse paths →</Link></div>;

  const totalLessons = (path.lessons || []).length;
  const doneCount = Object.values(completed).filter(Boolean).length;
  const progress = totalLessons ? Math.round((doneCount / totalLessons) * 100) : 0;

  return (
    <div>
      <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="container-tbl py-12">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-4">
            <Link to="/" className="hover:text-blue-600">Home</Link><ChevronRight className="w-3.5 h-3.5" />
            <Link to="/learn" className="hover:text-blue-600">Learn</Link><ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium truncate">{path.title}</span>
          </nav>
          <div className="flex items-center gap-2 mb-4">
            <DifficultyBadge level={path.difficulty} />
            {path.estimated_time && <span className="flex items-center gap-1 text-sm text-slate-500"><Clock className="w-4 h-4" />{path.estimated_time}</span>}
            <span className="flex items-center gap-1 text-sm text-slate-500"><Layers className="w-4 h-4" />{totalLessons} lessons</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">{path.title}</h1>
          <p className="text-lg text-slate-500 max-w-2xl mb-6">{path.description}</p>
          <div className="max-w-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Your progress</span>
              <span className="text-sm font-bold text-blue-600">{progress}%</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-teal-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="container-tbl py-10 max-w-3xl">
        <h2 className="text-xl font-bold text-slate-900 mb-5">Lessons</h2>
        <div className="space-y-3">
          {(path.lessons || []).sort((a, b) => (a.order || 0) - (b.order || 0)).map((lesson, i) => {
            const isDone = completed[lesson.order ?? i];
            const art = lesson.article_id ? articles[lesson.article_id] : null;
            return (
              <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isDone ? 'bg-teal-50 border-teal-200' : 'bg-white border-slate-200 hover:border-blue-200'}`}>
                <button onClick={() => toggleComplete(lesson.order ?? i)} className="shrink-0">
                  {isDone ? <CheckCircle2 className="w-6 h-6 text-teal-600" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-300 hover:border-blue-500 transition-colors" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-400">Lesson {lesson.order ?? i + 1}</span>
                    {lesson.duration && <span className="text-xs text-slate-400">· {lesson.duration}</span>}
                  </div>
                  {art ? (
                    <Link to={`/article/${art.slug}`} className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">{lesson.title || art.title}</Link>
                  ) : (
                    <p className="font-semibold text-slate-900">{lesson.title}</p>
                  )}
                  {art?.summary && <p className="text-sm text-slate-400 line-clamp-1 mt-0.5">{art.summary}</p>}
                </div>
                {art && <Link to={`/article/${art.slug}`} className="shrink-0 p-2 text-slate-400 hover:text-blue-600"><ArrowRight className="w-5 h-5" /></Link>}
              </div>
            );
          })}
        </div>

        {progress === 100 && (
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-white text-center">
            <GraduationCap className="w-10 h-10 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-1">Path Complete!</h3>
            <p className="text-sm text-white/90">You've finished all lessons in this learning path.</p>
          </div>
        )}
      </div>
    </div>
  );
}