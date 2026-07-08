import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Save, Loader2 } from 'lucide-react';
import LessonEditor from './LessonEditor';
import ImageInput from './content/ImageInput';

const slugify = (str) =>
  str.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert'];

export default function PathDrawer({ open, onClose, path, categories, onSave }) {
  const [form, setForm] = useState({
    title: '', slug: '', description: '', difficulty: 'beginner',
    estimated_time: '', category_id: '', cover_image: '', is_featured: false
  });
  const [lessons, setLessons] = useState([]);
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);
  const isEdit = !!path;

  useEffect(() => {
    if (path) {
      setForm({
        title: path.title || '', slug: path.slug || '', description: path.description || '',
        difficulty: path.difficulty || 'beginner', estimated_time: path.estimated_time || '',
        category_id: path.category_id || '', cover_image: path.cover_image || '',
        is_featured: path.is_featured || false,
      });
      setLessons(path.lessons || []);
      setSlugEdited(true);
    } else {
      setForm({
        title: '', slug: '', description: '', difficulty: 'beginner',
        estimated_time: '', category_id: '', cover_image: '', is_featured: false
      });
      setLessons([]);
      setSlugEdited(false);
    }
  }, [path, open]);

  const updateField = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'title' && !slugEdited) next.slug = slugify(value);
      return next;
    });
  };

  const handleSave = async () => {
    if (!form.title || !form.slug) return;
    setSaving(true);
    try {
      const payload = { ...form, lessons: lessons.filter(l => l.title || l.article_id) };
      if (isEdit) {
        await base44.entities.LearningPath.update(path.id, payload);
      } else {
        await base44.entities.LearningPath.create(payload);
      }
      onSave();
      onClose();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 animate-fade-in-fast" onClick={onClose} />
      <div className="relative w-full max-w-xl h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <h2 className="text-lg font-bold text-slate-900">{isEdit ? 'Edit Path' : 'New Learning Path'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Title</label>
            <input type="text" value={form.title} onChange={(e) => updateField('title', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Slug</label>
            <input type="text" value={form.slug}
              onChange={(e) => { setSlugEdited(true); updateField('slug', e.target.value); }}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Description</label>
            <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} rows={3}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Difficulty</label>
              <select value={form.difficulty} onChange={(e) => updateField('difficulty', e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize">
                {DIFFICULTIES.map(d => <option key={d} value={d} className="capitalize">{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Estimated Time</label>
              <input type="text" value={form.estimated_time} onChange={(e) => updateField('estimated_time', e.target.value)} placeholder="e.g. 2 hours"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Category</label>
            <select value={form.category_id} onChange={(e) => updateField('category_id', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">No category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5 block">Cover Image</label>
            <ImageInput value={form.cover_image} onChange={(v) => updateField('cover_image', v)} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is_featured} onChange={(e) => updateField('is_featured', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-slate-700">Featured path</span>
          </label>

          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-3 mt-4">Manage Lessons</h3>
            <LessonEditor lessons={lessons} onChange={setLessons} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving || !form.title}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Path'}
          </button>
        </div>
      </div>
    </div>
  );
}