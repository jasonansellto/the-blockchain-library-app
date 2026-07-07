import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, Mail, ChevronRight, Calendar, Tag } from 'lucide-react';

export default function Newsletter() {
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEditions(); }, []);

  const fetchEditions = async () => {
    try {
      const res = await base44.entities.NewsletterEdition.list('-published_date', 50);
      setEditions(res.results || res || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="container-tbl py-12">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-3">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">Newsletter</span>
          </nav>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Newsletter Archive</h1>
          </div>
          <p className="text-slate-500 max-w-2xl">Read past editions of The Blockchain Library newsletter — weekly insights, analysis, and curated updates from the world of blockchain and Web3.</p>
        </div>
      </div>

      <div className="container-tbl py-12 max-w-4xl">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
        ) : editions.length === 0 ? (
          <div className="text-center py-20">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400">No newsletter editions published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {editions.map((ed, i) => (
              <Link key={ed.id} to={`/newsletter/${ed.slug}`}
                className="group flex flex-col sm:flex-row gap-5 p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-200 hover:shadow-md transition-all">
                {ed.cover_image && (
                  <div className="sm:w-40 h-32 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                    <img src={ed.cover_image} alt={ed.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 text-xs text-slate-400">
                    {ed.issue_number && <span className="font-semibold text-blue-600">Issue #{ed.issue_number}</span>}
                    {ed.published_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(ed.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1.5 tracking-tight">{ed.title}</h2>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">{ed.summary}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {ed.tags?.slice(0, 3).map(t => (
                        <span key={t} className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Tag className="w-3 h-3" />{t}
                        </span>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 inline-flex items-center gap-1 shrink-0 ml-3">
                      Read <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}