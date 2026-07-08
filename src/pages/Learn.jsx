import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, GraduationCap, Filter, Search } from 'lucide-react';
import LearningPathCard from '@/components/cards/LearningPathCard';
import Seo from '@/components/Seo';
import { buildCollectionPageSchema, buildBreadcrumbSchema } from '@/lib/seoSchemas';
import { pathTotalMinutes, parseDurationToMinutes } from '@/lib/duration';

const bucketTime = (path) => {
  let totalMin = pathTotalMinutes(path);
  if (!totalMin) totalMin = parseDurationToMinutes(path?.estimated_time);
  if (!totalMin) return null;
  if (totalMin <= 60) return 'short';
  if (totalMin <= 180) return 'medium';
  return 'long';
};

export default function Learn() {
  const [paths, setPaths] = useState([]);
  const [categories, setCategories] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [diffFilter, setDiffFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([
        base44.entities.LearningPath.list('-updated_date', 100),
        base44.entities.Category.list('-updated_date', 100),
      ]);
      const pArr = pRes.results || pRes || [];
      const cArr = cRes.results || cRes || [];
      setPaths(pArr);
      setCategories(cArr);
      try {
        const authed = await base44.auth.isAuthenticated();
        if (authed) {
          const progRes = await base44.entities.LearningProgress.list('-updated_date', 100);
          const progArr = progRes.results || progRes || [];
          const map = {};
          progArr.forEach(pr => {
            const matched = pArr.find(pp => pp.id === pr.learning_path_id);
            if (matched) {
              const total = (matched.lessons || []).length;
              const done = (pr.completed_lesson_orders || []).length;
              map[pr.learning_path_id] = total ? Math.round((done / total) * 100) : 0;
            }
          });
          setProgressMap(map);
        }
      } catch (e) {}
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const filtered = paths.filter(p => {
    if (search) {
      const q = search.toLowerCase();
      if (!(p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))) return false;
    }
    if (catFilter && p.category_id !== catFilter) return false;
    if (diffFilter && p.difficulty !== diffFilter) return false;
    if (timeFilter && bucketTime(p) !== timeFilter) return false;
    return true;
  });

  const catName = (id) => categories.find(c => c.id === id)?.name;

  const schemas = [
    buildCollectionPageSchema('Learning Paths', 'Structured, step-by-step learning journeys for blockchain, crypto, and Web3.', '/learn', paths.slice(0, 10).map(p => ({ name: p.title, url: `/learn/${p.slug}` }))),
    buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Learn', url: '/learn' }])
  ];

  return (
    <div>
      <Seo title="Learning Paths" description="Structured, step-by-step learning journeys that take you from fundamentals to mastery. Track your progress and earn certificates as you complete each path." schemas={schemas} />
      <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="container-tbl py-14">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3"><span>Home</span><span>/</span><span className="text-slate-700 font-medium">Learn</span></div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">Learning Paths</h1>
          <p className="text-slate-500 max-w-2xl">Structured, step-by-step learning journeys that take you from fundamentals to mastery. Track your progress and earn certificates as you complete each path.</p>
        </div>
      </div>

      <div className="container-tbl py-10">
        <div className="relative mb-8 max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search learning paths..."
            className="w-full pl-12 pr-4 py-3 text-base bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 px-4 py-2.5 mb-4 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg">
          <Filter className="w-4 h-4" /> Filters {showFilters ? '(Hide)' : '(Show)'}
        </button>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className={`lg:w-64 shrink-0 space-y-6 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 mb-4"><Filter className="w-4 h-4 text-blue-600" />Filters</h3>
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Category</label>
                  <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">All categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Difficulty</label>
                  <div className="space-y-1.5">
                    {['', 'beginner', 'intermediate', 'advanced', 'expert'].map(d => (
                      <button key={d} onClick={() => setDiffFilter(d)}
                        className={`block w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors capitalize ${diffFilter === d ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                        {d || 'All levels'}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Estimated Time</label>
                  <div className="space-y-1.5">
                    {[
                      { val: '', label: 'Any length' },
                      { val: 'short', label: 'Short (≤ 1h)' },
                      { val: 'medium', label: 'Medium (1–3h)' },
                      { val: 'long', label: 'Long (3h+)' },
                    ].map(t => (
                      <button key={t.val} onClick={() => setTimeFilter(t.val)}
                        className={`block w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${timeFilter === t.val ? 'bg-blue-50 text-blue-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <p className="text-sm text-slate-500 mb-6">{loading ? 'Loading...' : `${filtered.length} paths`}</p>
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20"><GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-400">No learning paths match your filters.</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(p => <LearningPathCard key={p.id} path={p} categoryName={catName(p.category_id)} progress={progressMap[p.id] || 0} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}