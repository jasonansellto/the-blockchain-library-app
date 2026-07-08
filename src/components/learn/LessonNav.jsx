import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, ArrowRight, GraduationCap, Loader2, ChevronLeft } from 'lucide-react';

export default function LessonNav({ pathSlug, currentOrder }) {
  const navigate = useNavigate();
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completedOrders, setCompletedOrders] = useState([]);

  useEffect(() => {
    if (!pathSlug) return;
    (async () => {
      try {
        const res = await base44.entities.LearningPath.filter({ slug: pathSlug }, '-updated_date', 1);
        const arr = res.results || res || [];
        if (arr.length) {
          setPath(arr[0]);
          const authed = await base44.auth.isAuthenticated();
          if (authed) {
            const prog = await base44.entities.LearningProgress.filter({ learning_path_id: arr[0].id }, '-updated_date', 1);
            const progArr = prog.results || prog || [];
            if (progArr.length) setCompletedOrders(progArr[0].completed_lesson_orders || []);
          }
        }
      } catch (e) {}
      setLoading(false);
    })();
  }, [pathSlug]);

  if (loading || !path) return null;

  const lessons = (path.lessons || []).sort((a, b) => (a.order || 0) - (b.order || 0));
  const currentIdx = lessons.findIndex(l => (l.order ?? 0) === Number(currentOrder));
  if (currentIdx === -1) return null;

  const current = lessons[currentIdx];
  const next = lessons[currentIdx + 1];
  const isLast = currentIdx === lessons.length - 1;
  const doneCount = completedOrders.length;
  const progress = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;
  const currentOrderNum = Number(currentOrder);
  const alreadyCompleted = completedOrders.includes(currentOrderNum);

  const handleCompleteAndNext = async () => {
    setCompleting(true);
    try {
      let orders = completedOrders;
      if (!orders.includes(currentOrderNum)) {
        orders = [...orders, currentOrderNum];
        setCompletedOrders(orders);
        const existing = await base44.entities.LearningProgress.filter({ learning_path_id: path.id }, '-updated_date', 1);
        const exArr = existing.results || existing || [];
        if (exArr.length) {
          await base44.entities.LearningProgress.update(exArr[0].id, {
            completed_lesson_orders: orders, last_lesson_order: currentOrderNum, last_accessed: new Date().toISOString()
          });
        } else {
          await base44.entities.LearningProgress.create({
            learning_path_id: path.id, path_slug: path.slug, path_title: path.title,
            completed_lesson_orders: orders, last_lesson_order: currentOrderNum, last_accessed: new Date().toISOString()
          });
        }
      }

      if (next?.article_id) {
        const nextArticle = await base44.entities.Article.get(next.article_id);
        if (nextArticle?.slug) {
          navigate(`/article/${nextArticle.slug}?path=${path.slug}&lesson=${next.order ?? currentIdx + 2}`);
          window.scrollTo(0, 0);
          return;
        }
      }
      navigate(`/learn/${path.slug}`);
    } catch (e) { console.error(e); }
    setCompleting(false);
  };

  return (
    <div className="mt-12 rounded-xl overflow-hidden border border-blue-200">
      <div className="bg-gradient-to-br from-blue-600 to-teal-600 p-5 text-white">
        <Link to={`/learn/${path.slug}`} className="flex items-center gap-2 text-sm text-white/80 hover:text-white font-medium mb-2">
          <GraduationCap className="w-4 h-4" /> {path.title}
        </Link>
        <div className="flex items-center justify-between mb-3">
          <p className="text-lg font-bold">Lesson {current.order ?? currentIdx + 1} of {lessons.length}</p>
          {alreadyCompleted && <span className="text-xs font-semibold text-teal-200 bg-white/10 px-2 py-0.5 rounded-full">Completed</span>}
        </div>
        <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <div className="bg-white p-5 flex flex-col sm:flex-row gap-2">
        <button onClick={handleCompleteAndNext} disabled={completing}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60">
          {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : isLast ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          {completing ? 'Saving...' : isLast ? 'Complete & Finish Path' : alreadyCompleted ? 'Continue to Next Lesson' : 'Complete & Continue'}
        </button>
        <Link to={`/learn/${path.slug}`}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Path
        </Link>
      </div>
    </div>
  );
}