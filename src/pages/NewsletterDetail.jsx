import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import MarkdownContent from '@/components/MarkdownContent';
import { ChevronRight, Calendar, Tag, ArrowLeft } from 'lucide-react';
import NewsletterSignup from '@/components/NewsletterSignup';

export default function NewsletterDetail() {
  const { slug } = useParams();
  const [edition, setEdition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEdition(); }, [slug]);

  const fetchEdition = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.NewsletterEdition.filter({ slug }, '-updated_date', 1);
      const arr = res.results || res || [];
      setEdition(arr[0] || null);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (!edition) return (
    <div className="container-tbl py-32 text-center">
      <h1 className="text-2xl font-bold text-slate-900 mb-3">Newsletter edition not found</h1>
      <Link to="/newsletter" className="text-blue-600 font-medium">Browse all editions →</Link>
    </div>
  );

  return (
    <div>
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-3">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/newsletter" className="hover:text-blue-600">Newsletter</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium truncate">{edition.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-tbl py-10 max-w-3xl">
        <Link to="/newsletter" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All editions
        </Link>

        <div className="flex items-center gap-3 mb-4 text-sm text-slate-400">
          {edition.issue_number && <span className="font-semibold text-blue-600">Issue #{edition.issue_number}</span>}
          {edition.published_date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(edition.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4 leading-[1.15]">{edition.title}</h1>
        <p className="text-lg text-slate-500 leading-relaxed mb-6">{edition.summary}</p>

        {edition.tags?.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap mb-8 pb-6 border-b border-slate-100">
            {edition.tags.map(t => (
              <span key={t} className="inline-flex items-center gap-1 text-xs text-slate-400">
                <Tag className="w-3.5 h-3.5" />{t}
              </span>
            ))}
          </div>
        )}

        {edition.cover_image && (
          <div className="mb-8 rounded-xl overflow-hidden bg-slate-100">
            <img src={edition.cover_image} alt={edition.title} className="w-full h-auto" />
          </div>
        )}

        <div className="prose-tbl">
          <MarkdownContent>{edition.body || ''}</MarkdownContent>
        </div>
      </div>

      <NewsletterSignup variant="section" />
    </div>
  );
}