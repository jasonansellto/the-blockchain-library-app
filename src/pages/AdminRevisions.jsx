import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, History } from 'lucide-react';
import Seo from '@/components/Seo';

export default function AdminRevisions() {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchRevisions(); }, []);

  const fetchRevisions = async () => {
    try {
      const res = await base44.entities.ContentRevision.list('-created_date', 100);
      setRevisions(res.results || res || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const filtered = filter ? revisions.filter(r => r.entity_type === filter) : revisions;
  const entityTypes = [...new Set(revisions.map(r => r.entity_type))].filter(Boolean);

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  return (
    <div>
      <Seo title="Content Revisions" robots="noindex, nofollow" />
      <div className="container-tbl py-10">
        <div className="flex items-center gap-3 mb-2">
          <History className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Content Revision History</h1>
        </div>
        <p className="text-slate-500 text-sm mb-8">Browse version history and changed fields across all content entities</p>

        {entityTypes.length > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            <button onClick={() => setFilter('')} className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${!filter ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>All ({revisions.length})</button>
            {entityTypes.map(t => (
              <button key={t} onClick={() => setFilter(t)} className={`px-3 py-1.5 text-sm rounded-lg transition-colors capitalize ${filter === t ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{t} ({revisions.filter(r => r.entity_type === t).length})</button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <History className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400">No revision records found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(r => (
              <div key={r.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">{r.entity_type}</span>
                      {r.internal_id && <span className="text-xs font-mono text-slate-400">{r.internal_id}</span>}
                    </div>
                    {r.editor_note && <p className="text-sm text-slate-700 mb-2">{r.editor_note}</p>}
                    {r.changed_fields && Object.keys(r.changed_fields).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {Object.keys(r.changed_fields).map(f => (
                          <span key={f} className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-mono">{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{r.created_date ? new Date(r.created_date).toLocaleDateString() : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}