import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronRight, Clock, Layers, GraduationCap, Play } from 'lucide-react';
import DifficultyBadge from '@/components/DifficultyBadge';
import LessonCard from '@/components/learn/LessonCard';
import Seo from '@/components/Seo';
import { buildCourseSchema, buildBreadcrumbSchema } from '@/lib/seoSchemas';
import CitationBox from '@/components/CitationBox';
import GeoSummary from '@/components/GeoSummary';
import { pathEstimatedTime } from '@/lib/duration';

export default function LearningPathDetail() {
  const { slug } = useParams();
  const [path, setPath] = useState(null);
  const [articles, setArticles] = useState({});
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState({});
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();

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
      try {
        const isAuthed = await base44.auth.isAuthenticated();
        setAuthed(isAuthed);
        if (isAuthed) {
          const prog = await base44.entities.LearningProgress.filter({ learning_path_id: p.id }, '-updated_date', 1);
          const progArr = prog.results || prog || [];
          if (progArr.length) {
            const comp = {};
            (progArr[0].completed_lesson_orders || []).forEach(o => { comp[o] = true; });
            setCompleted(comp);
          }
        }
      } catch (e2) {}
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const toggleComplete = (order) => {
    setCompleted(prev => {
      const next = { ...prev, [order]: !prev[order] };
      saveProgress(next, order);
      return next;
    });
  };

  const saveProgress = async (comp, lastOrder) => {
    try {
      if (!path) return;
      const orders = Object.keys(comp).filter(k => comp[k]).map(Number);
      const existing = await base44.entities.LearningProgress.filter({ learning_path_id: path.id }, '-updated_date', 1);
      const exArr = existing.results || existing || [];
      if (exArr.length) {
        await base44.entities.LearningProgress.update(exArr[0].id, {
          completed_lesson_orders: orders, last_lesson_order: lastOrder, last_accessed: new Date().toISOString()
        });
      } else {
        await base44.entities.LearningProgress.create({
          learning_path_id: path.id, path_slug: path.slug, path_title: path.title,
          completed_lesson_orders: orders, last_lesson_order: lastOrder, last_accessed: new Date().toISOString()
        });
      }
    } catch (e) {}
  };

  const resumeToLesson = async () => {
    const sorted = (path.lessons || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    const firstIncomplete = sorted.find((lesson) => !completed[lesson.order]);
    const target = firstIncomplete || sorted[0];
    if (target?.article_id) {
      try {
        const art = await base44.entities.Article.get(target.article_id);
        if (art?.slug) navigate(`/article/${art.slug}?path=${path.slug}&lesson=${target.order ?? 1}`);
      } catch (e) {}
    }
  };

  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (!path) return <div className="container-tbl py-32 text-center"><h1 className="text-2xl font-bold text-slate-900 mb-3">Learning path not found</h1><Link to="/learn" className="text-blue-600 font-medium">Browse paths →</Link></div>;

  const sortedLessons = (path.lessons || []).sort((a, b) => (a.order || 0) - (b.order || 0));
  const totalLessons = sortedLessons.length;
  const doneCount = Object.values(completed).filter(Boolean).length;
  const progress = totalLessons ? Math.round((doneCount / totalLessons) * 100) : 0;
  const hasProgress = doneCount > 0;

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Learn', url: '/learn' },
    { name: path.title }
  ];
  const schemas = [
    buildCourseSchema(path, null),
    buildBreadcrumbSchema(breadcrumbItems)
  ];

  return (
    <div>
      <Seo title={path.title} description={path.description} image={path.cover_image} type="article" schemas={schemas} />
      <GeoSummary type="Learning Path" title={path.title} summary={path.description} keyConcepts={[path.difficulty, pathEstimatedTime(path)].filter(Boolean)} relatedLinks={[]} />
      {/* Hero with cover image */}
      <div className="relative border-b border-slate-100 overflow-hidden">
        {path.cover_image ? (
          <div className="absolute inset-0">
            <img src={path.cover_image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-blue-900/80" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-teal-500" />
        )}
        <div className="relative container-tbl py-10 sm:py-14">
          <nav className="flex items-center gap-1.5 text-sm text-white/60 mb-4">
            <Link to="/" className="hover:text-white">Home</Link><ChevronRight className="w-3.5 h-3.5" />
            <Link to="/learn" className="hover:text-white">Learn</Link><ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium truncate">{path.title}</span>
          </nav>
          <div className="flex items-center gap-2 mb-4">
            <DifficultyBadge level={path.difficulty} />
            {pathEstimatedTime(path) && <span className="flex items-center gap-1 text-sm text-white/70"><Clock className="w-4 h-4" />{pathEstimatedTime(path)}</span>}
            <span className="flex items-center gap-1 text-sm text-white/70"><Layers className="w-4 h-4" />{totalLessons} lessons</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">{path.title}</h1>
          <p className="text-base sm:text-lg text-white/80 max-w-2xl mb-6">{path.description}</p>
          <div className="max-w-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/70">Your progress</span>
              <span className="text-sm font-bold text-white">{progress}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-teal-400 to-blue-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          {totalLessons > 0 && progress < 100 && (
            <button onClick={resumeToLesson}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors">
              <Play className="w-4 h-4 fill-slate-900" /> {hasProgress ? 'Resume Learning' : 'Start Learning'}
            </button>
          )}
        </div>
      </div>

      <div className="container-tbl py-10 max-w-3xl">
        <h2 className="text-xl font-bold text-slate-900 mb-5">Lessons</h2>
        <div>
          {sortedLessons.map((lesson, i) => (
            <LessonCard
              key={i}
              lesson={lesson}
              index={i}
              total={totalLessons}
              article={lesson.article_id ? articles[lesson.article_id] : null}
              isDone={!!completed[lesson.order ?? i]}
              authed={authed}
              pathSlug={path.slug}
              onToggle={toggleComplete}
            />
          ))}
        </div>

        {progress === 100 && (
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 text-white text-center">
            <GraduationCap className="w-10 h-10 mx-auto mb-3" />
            <h3 className="text-xl font-bold mb-1">Path Complete!</h3>
            <p className="text-sm text-white/90">You've finished all lessons in this learning path.</p>
          </div>
        )}

        <CitationBox
          type="learning-path"
          title={path.title}
          date={path.last_reviewed}
          url={`${window.location.origin}/learn/${path.slug}`}
        />
      </div>
    </div>
  );
}