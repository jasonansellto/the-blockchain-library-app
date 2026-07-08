import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Search, ArrowLeft, Save, Trash2, Plus, Sparkles, ExternalLink } from 'lucide-react';

const TYPE_OPTIONS = [
  { value: 'paper', label: 'Paper' },
  { value: 'whitepaper', label: 'Whitepaper' },
  { value: 'standard', label: 'Standard' },
  { value: 'report', label: 'Report' },
  { value: 'preprint', label: 'Preprint' },
  { value: 'thesis', label: 'Thesis' },
];
const DIFF_OPTIONS = ['beginner', 'intermediate', 'advanced', 'expert'];
const STATUS_OPTIONS = [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'archived', label: 'Archived' }];

function slugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function blankForm() {
  return {
    title: '', slug: '', authors: '', abstract: '', key_findings: '', tags: '',
    difficulty: 'intermediate', research_type: 'paper', is_original_research: false,
    status: 'draft', category_id: '', pdf_url: '', doi: '', publication: '',
    publication_date: '', citations_count: 0, downloads: 0,
    related_glossary: '', related_articles: ''
  };
}
function fromPaper(p) {
  return {
    title: p.title || '', slug: p.slug || '', authors: (p.authors || []).join(', '),
    abstract: p.abstract || '', key_findings: (p.key_findings || []).join('\n'),
    tags: (p.tags || []).join(', '), difficulty: p.difficulty || 'intermediate',
    research_type: p.research_type || 'paper', is_original_research: !!p.is_original_research,
    status: p.status || 'published', category_id: p.category_id || '', pdf_url: p.pdf_url || '',
    doi: p.doi || '', publication: p.publication || '', publication_date: (p.publication_date || '').slice(0, 10),
    citations_count: p.citations_count || 0, downloads: p.downloads || 0,
    related_glossary: (p.related_glossary || []).join(', '), related_articles: (p.related_articles || []).join(', ')
  };
}

const inputCls = "w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "block text-xs font-semibold text-slate-600 mb-1";

export default function ResearchManager({ categories = [] }) {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  useEffect(() => { fetchPapers(); }, []);

  const fetchPapers = async () => {
    try {
      const res = await base44.entities.ResearchPaper.list('-updated_date', 200);
      setPapers(res.results || res || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openEdit = (p) => { setEditing(p); setForm(p ? fromPaper(p) : blankForm()); setConfirmDel(false); };

  const save = async () => {
    setSaving(true);
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      authors: form.authors.split(',').map((s) => s.trim()).filter(Boolean),
      abstract: form.abstract,
      key_findings: form.key_findings.split('\n').map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      difficulty: form.difficulty,
      research_type: form.research_type,
      is_original_research: form.is_original_research,
      status: form.status,
      category_id: form.category_id || null,
      pdf_url: form.pdf_url || null,
      doi: form.doi || null,
      publication: form.publication,
      publication_date: form.publication_date || null,
      citations_count: Number(form.citations_count) || 0,
      downloads: Number(form.downloads) || 0,
      related_glossary: form.related_glossary.split(',').map((s) => s.trim()).filter(Boolean),
      related_articles: form.related_articles.split(',').map((s) => s.trim()).filter(Boolean),
      seo_title: `${form.title} — Research Annotation | The Blockchain Library`,
      seo_description: (form.abstract || form.title).slice(0, 160),
    };
    try {
      if (editing && editing.id) {
        await base44.entities.ResearchPaper.update(editing.id, payload);
      } else {
        await base44.entities.ResearchPaper.create(payload);
      }
      await fetchPapers();
      setEditing(null);
      setForm(null);
    } catch (e) {
      alert(e.response?.data?.error || e.message || 'Save failed');
    }
    setSaving(false);
  };

  const remove = async () => {
    if (!editing?.id) return;
    setSaving(true);
    try {
      await base44.entities.ResearchPaper.delete(editing.id);
      await fetchPapers();
      setEditing(null);
      setForm(null);
    } catch (e) { alert(e.response?.data?.error || e.message || 'Delete failed'); }
    setSaving(false);
  };

  const filtered = papers.filter((p) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return p.title.toLowerCase().includes(q) || (p.abstract || '').toLowerCase().includes(q) || (p.tags || []).join(' ').toLowerCase().includes(q);
  });
  const catName = (id) => (categories.find((c) => c.id === id) || {}).name;

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-7 h-7 text-blue-600 animate-spin" /></div>;

  if (editing && form) {
    return (
      <div className="max-w-3xl">
        <button onClick={() => { setEditing(null); setForm(null); }}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to list
        </button>
        <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
          <h2 className="text-lg font-bold text-slate-900">{editing.id ? 'Edit Paper' : 'New Paper'}</h2>
          <div className="flex items-center gap-2">
            {editing.id && (confirmDel ? (
              <>
                <button onClick={() => setConfirmDel(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-md">Cancel</button>
                <button onClick={remove} disabled={saving} className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 rounded-md hover:bg-rose-700">Confirm Delete</button>
              </>
            ) : (
              <button onClick={() => setConfirmDel(true)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-md hover:bg-rose-100"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
            ))}
            <button onClick={save} disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>Title</label>
            <input className={inputCls} value={form.title} onChange={(e) => { set('title', e.target.value); if (!editing.id) set('slug', slugify(e.target.value)); }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Slug</label><input className={inputCls} value={form.slug} onChange={(e) => set('slug', e.target.value)} /></div>
            <div><label className={labelCls}>Authors (comma-separated)</label><input className={inputCls} value={form.authors} onChange={(e) => set('authors', e.target.value)} /></div>
          </div>
          <div>
            <label className={labelCls}>Abstract / Annotation</label>
            <textarea rows={6} className={inputCls} value={form.abstract} onChange={(e) => set('abstract', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Key Findings (one per line)</label>
            <textarea rows={5} className={inputCls} value={form.key_findings} onChange={(e) => set('key_findings', e.target.value)} />
          </div>
          <div><label className={labelCls}>Tags (comma-separated)</label><input className={inputCls} value={form.tags} onChange={(e) => set('tags', e.target.value)} /></div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><label className={labelCls}>Difficulty</label><select className={inputCls} value={form.difficulty} onChange={(e) => set('difficulty', e.target.value)}>{DIFF_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}</select></div>
            <div><label className={labelCls}>Type</label><select className={inputCls} value={form.research_type} onChange={(e) => set('research_type', e.target.value)}>{TYPE_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            <div><label className={labelCls}>Status</label><select className={inputCls} value={form.status} onChange={(e) => set('status', e.target.value)}>{STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
            <div><label className={labelCls}>Collection</label><select className={inputCls} value={form.category_id} onChange={(e) => set('category_id', e.target.value)}><option value="">—</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>PDF URL</label><input className={inputCls} value={form.pdf_url} onChange={(e) => set('pdf_url', e.target.value)} /></div>
            <div><label className={labelCls}>DOI</label><input className={inputCls} value={form.doi} onChange={(e) => set('doi', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><label className={labelCls}>Publication</label><input className={inputCls} value={form.publication} onChange={(e) => set('publication', e.target.value)} /></div>
            <div><label className={labelCls}>Publication Date</label><input type="date" className={inputCls} value={form.publication_date} onChange={(e) => set('publication_date', e.target.value)} /></div>
            <div><label className={labelCls}>Citations</label><input type="number" className={inputCls} value={form.citations_count} onChange={(e) => set('citations_count', e.target.value)} /></div>
            <div><label className={labelCls}>Downloads</label><input type="number" className={inputCls} value={form.downloads} onChange={(e) => set('downloads', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Related Glossary (slugs, comma)</label><input className={inputCls} value={form.related_glossary} onChange={(e) => set('related_glossary', e.target.value)} /></div>
            <div><label className={labelCls}>Related Articles (slugs, comma)</label><input className={inputCls} value={form.related_articles} onChange={(e) => set('related_articles', e.target.value)} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.is_original_research} onChange={(e) => set('is_original_research', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
            <Sparkles className="w-4 h-4 text-teal-600" /> Mark as Original Research (site-owner paper)
          </label>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search papers..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button onClick={() => openEdit(null)} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
          <Plus className="w-4 h-4" /> New Paper
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm">No papers found.</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <button key={p.id} onClick={() => openEdit(p)}
              className={`w-full text-left flex items-center gap-3 p-3 rounded-lg border transition-colors ${p.is_original_research ? 'border-teal-200 bg-teal-50/30 hover:bg-teal-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-900 truncate">{p.title}</span>
                  {p.is_original_research && <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold text-teal-700 bg-teal-100"><Sparkles className="w-2.5 h-2.5" />Original</span>}
                  {p.status === 'draft' && <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-amber-700 bg-amber-100">Draft</span>}
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {(p.authors || []).join(', ')}{p.publication ? ` · ${p.publication}` : ''}{catName(p.category_id) ? ` · ${catName(p.category_id)}` : ''}
                </p>
              </div>
              {p.pdf_url && <ExternalLink className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
              <span className="text-xs font-mono text-slate-400 shrink-0">{p.internal_id || ''}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}