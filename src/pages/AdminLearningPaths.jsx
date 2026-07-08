import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, Pencil, Trash2, Layers } from 'lucide-react';
import PathDrawer from '@/components/admin/PathDrawer';
import DifficultyBadge from '@/components/DifficultyBadge';

export default function AdminLearningPaths() {
  const [paths, setPaths] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPath, setEditingPath] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        base44.entities.LearningPath.list('-updated_date', 100),
        base44.entities.Category.list('-updated_date', 100),
      ]);
      setPaths(pRes.results || pRes || []);
      setCategories(cRes.results || cRes || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const catName = (id) => categories.find(c => c.id === id)?.name || '—';
  const lessonCount = (p) => Array.isArray(p.lessons) ? p.lessons.length : 0;

  const openNew = () => { setEditingPath(null); setDrawerOpen(true); };
  const openEdit = (path) => { setEditingPath(path); setDrawerOpen(true); };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try { await base44.entities.LearningPath.delete(deleteTarget.id); } catch (e) { console.error(e); }
    setDeleteTarget(null);
    fetchData();
  };

  return (
    <div className="container-tbl py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Learning Paths Admin</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage structured learning journeys.</p>
        </div>
        <button onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> New Path
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
      ) : paths.length === 0 ? (
        <div className="text-center py-20 text-slate-400">No learning paths yet. Create your first one.</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-3 font-semibold text-slate-600">Title</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Difficulty</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Category</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Lessons</th>
                <th className="px-4 py-3 font-semibold text-slate-600">Featured</th>
                <th className="px-4 py-3 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paths.map(p => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(p)} className="font-medium text-slate-900 hover:text-blue-600 text-left">
                      {p.title}
                    </button>
                    <span className="block text-xs text-slate-400 font-mono">{p.slug}</span>
                  </td>
                  <td className="px-4 py-3"><DifficultyBadge level={p.difficulty || 'beginner'} /></td>
                  <td className="px-4 py-3 text-slate-600">{catName(p.category_id)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />{lessonCount(p)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{p.is_featured ? <span className="text-amber-600 font-bold">★</span> : <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(p)} className="p-1.5 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PathDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} path={editingPath} categories={categories} onSave={fetchData} />

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 animate-fade-in-fast" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-fade-in">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete this path?</h3>
            <p className="text-sm text-slate-500 mb-5">"{deleteTarget.title}" will be permanently removed. This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}