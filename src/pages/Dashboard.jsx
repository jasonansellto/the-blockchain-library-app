import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, BookMarked, GraduationCap, Clock, User, ChevronRight, ArrowRight, BookOpen, CheckCircle2, Circle, LogOut, Sparkles, Mail } from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [progress, setProgress] = useState([]);
  const [history, setHistory] = useState([]);
  const [bio, setBio] = useState('');
  const [savingBio, setSavingBio] = useState(false);
  const [bioSaved, setBioSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const u = await base44.auth.me();
      setUser(u);
      setBio(u.bio || '');
      const [bm, prog, hist] = await Promise.all([
        base44.entities.Bookmark.list('-updated_date', 20),
        base44.entities.LearningProgress.list('-updated_date', 20),
        base44.entities.ReadingHistory.list('-accessed_date', 5),
      ]);
      setBookmarks(bm.results || bm || []);
      setProgress(prog.results || prog || []);
      setHistory(hist.results || hist || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const saveBio = async () => {
    setSavingBio(true);
    try {
      await base44.auth.updateMe({ bio });
      setBioSaved(true);
      setTimeout(() => setBioSaved(false), 2000);
    } catch (e) { console.error(e); } finally { setSavingBio(false); }
  };

  const removeBookmark = async (id) => {
    try {
      await base44.entities.Bookmark.delete(id);
      setBookmarks(prev => prev.filter(b => b.id !== id));
    } catch (e) {}
  };

  const handleLogout = async () => {
    await base44.auth.logout('/');
  };

  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (!user) return null;

  const totalLessons = (p) => (p.total_lessons || 0);
  const completedCount = (p) => (p.completed_lesson_orders || []).length;

  return (
    <div>
      {/* Header */}
      <div className="border-b border-slate-100 bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="container-tbl py-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {user.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{user.full_name || 'Member'}</h1>
              <p className="text-sm text-slate-400">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 capitalize">{user.role || 'member'}</span>
                <span className="text-xs text-slate-500">Member since {new Date(user.created_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-b border-slate-100 bg-white">
        <div className="container-tbl py-6">
          <div className="grid grid-cols-3 gap-4">
            <Link to="/dashboard" onClick={() => setTab('bookmarks')} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-blue-50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><BookMarked className="w-5 h-5 text-blue-600" /></div>
              <div><div className="text-2xl font-bold text-slate-900">{bookmarks.length}</div><div className="text-xs text-slate-400">Bookmarks</div></div>
            </Link>
            <Link to="/learn" className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-teal-50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center"><GraduationCap className="w-5 h-5 text-teal-600" /></div>
              <div><div className="text-2xl font-bold text-slate-900">{progress.length}</div><div className="text-xs text-slate-400">Learning Paths</div></div>
            </Link>
            <Link to="/history" className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-purple-50 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><Clock className="w-5 h-5 text-purple-600" /></div>
              <div><div className="text-2xl font-bold text-slate-900">{history.length}</div><div className="text-xs text-slate-400">Recently Read</div></div>
            </Link>
          </div>
        </div>
      </div>

      <div className="container-tbl py-10">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 border-b border-slate-200">
          {[
            { id: 'overview', label: 'Overview', icon: BookOpen },
            { id: 'bookmarks', label: 'Bookmarks', icon: BookMarked },
            { id: 'paths', label: 'Learning Paths', icon: GraduationCap },
            { id: 'profile', label: 'Profile', icon: User },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {tab === 'overview' && (
          <div className="space-y-8">
            {/* Quick actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/ai-assistant" className="group p-5 bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-100 rounded-xl hover:shadow-md transition-all">
                <Sparkles className="w-7 h-7 text-blue-600 mb-3" />
                <h3 className="font-bold text-slate-900 mb-1">Ask AI Assistant</h3>
                <p className="text-sm text-slate-500">Get instant answers from our library</p>
              </Link>
              <Link to="/library" className="group p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-blue-200 transition-all">
                <BookOpen className="w-7 h-7 text-slate-600 mb-3" />
                <h3 className="font-bold text-slate-900 mb-1">Browse Library</h3>
                <p className="text-sm text-slate-500">Explore 600+ expert articles</p>
              </Link>
              <Link to="/learn" className="group p-5 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-teal-200 transition-all">
                <GraduationCap className="w-7 h-7 text-teal-600 mb-3" />
                <h3 className="font-bold text-slate-900 mb-1">Continue Learning</h3>
                <p className="text-sm text-slate-500">Pick up your learning paths</p>
              </Link>
            </div>

            {/* Recently read */}
            {history.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900">Continue Reading</h2>
                  <Link to="/history" className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {history.slice(0, 4).map(h => (
                    <Link key={h.id} to={`/article/${h.slug}`} className="group flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-200 transition-all">
                      {h.featured_image ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0"><img src={h.featured_image} alt="" className="w-full h-full object-cover" loading="lazy" /></div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><BookOpen className="w-5 h-5 text-slate-300" /></div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 line-clamp-1 transition-colors">{h.title}</p>
                        <p className="text-xs text-slate-400">{h.accessed_date ? new Date(h.accessed_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Active learning paths */}
            {progress.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4">Your Learning Paths</h2>
                <div className="space-y-3">
                  {progress.slice(0, 3).map(p => {
                    const done = (p.completed_lesson_orders || []).length;
                    return (
                      <Link key={p.id} to={`/learn/${p.path_slug}`} className="group flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-teal-200 transition-all">
                        <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center shrink-0"><GraduationCap className="w-5 h-5 text-teal-600" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">{p.path_title}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[200px]">
                              <div className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full" style={{ width: `${Math.min((done / Math.max(p.total_lessons || done, 1)) * 100, 100)}%` }} />
                            </div>
                            <span className="text-xs text-slate-400">{done} lessons done</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-600 shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {bookmarks.length === 0 && progress.length === 0 && history.length === 0 && (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-slate-700 mb-1">Welcome to your dashboard</h2>
                <p className="text-sm text-slate-400 mb-6">Start reading articles and bookmarking your favorites to see them here.</p>
                <Link to="/library" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  Browse the Library <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Bookmarks tab */}
        {tab === 'bookmarks' && (
          <div>
            {bookmarks.length === 0 ? (
              <div className="text-center py-16">
                <BookMarked className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-slate-700 mb-1">No bookmarks yet</h2>
                <p className="text-sm text-slate-400 mb-6">Click the bookmark icon on any article to save it here.</p>
                <Link to="/library" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  Browse articles <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookmarks.map(b => (
                  <div key={b.id} className="group flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-200 transition-all">
                    {b.featured_image ? (
                      <Link to={`/article/${b.slug}`} className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <img src={b.featured_image} alt="" className="w-full h-full object-cover" loading="lazy" />
                      </Link>
                    ) : (
                      <Link to={`/article/${b.slug}`} className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                        <BookOpen className="w-6 h-6 text-slate-300" />
                      </Link>
                    )}
                    <Link to={`/article/${b.slug}`} className="flex-1 min-w-0">
                      {b.category_name && <span className="text-xs text-blue-600 font-medium">{b.category_name}</span>}
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">{b.title}</h3>
                      {b.summary && <p className="text-sm text-slate-400 line-clamp-1 mt-1">{b.summary}</p>}
                    </Link>
                    <button onClick={() => removeBookmark(b.id)} className="p-2 text-slate-300 hover:text-red-500 rounded transition-colors shrink-0">
                      <BookMarked className="w-4 h-4" fill="currentColor" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Learning Paths tab */}
        {tab === 'paths' && (
          <div>
            {progress.length === 0 ? (
              <div className="text-center py-16">
                <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h2 className="text-lg font-semibold text-slate-700 mb-1">No learning paths started</h2>
                <p className="text-sm text-slate-400 mb-6">Start a learning path to track your progress here.</p>
                <Link to="/learn" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
                  Explore paths <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {progress.map(p => {
                  const done = (p.completed_lesson_orders || []).length;
                  const pct = Math.min((done / Math.max(p.total_lessons || done, 1)) * 100, 100);
                  return (
                    <Link key={p.id} to={`/learn/${p.path_slug}`} className="group block p-5 bg-white border border-slate-200 rounded-xl hover:border-teal-200 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{p.path_title}</h3>
                        <span className="text-sm font-bold text-teal-600">{Math.round(pct)}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{done} lessons completed</span>
                        {p.last_accessed && <span>Last visited {new Date(p.last_accessed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Profile tab */}
        {tab === 'profile' && (
          <div className="max-w-lg">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Full Name</label>
                <input type="text" value={user.full_name || ''} disabled
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Email</label>
                <input type="email" value={user.email || ''} disabled
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Role</label>
                <input type="text" value={(user.role || 'user').charAt(0).toUpperCase() + (user.role || 'user').slice(1)} disabled
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500 capitalize" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Bio / Interests</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4}
                  placeholder="Tell us about your blockchain interests and learning goals..."
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                <div className="flex items-center gap-3 mt-3">
                  <button onClick={saveBio} disabled={savingBio}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60">
                    {savingBio ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {savingBio ? 'Saving...' : 'Save bio'}
                  </button>
                  {bioSaved && <span className="text-sm text-teal-600 font-medium">Saved!</span>}
                </div>
              </div>
            </div>
            <button onClick={handleLogout} className="mt-4 sm:hidden inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-red-600 transition-colors">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}