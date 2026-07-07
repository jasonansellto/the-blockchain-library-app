import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronRight, BookOpen, BookMarked, FileText, ExternalLink, Lightbulb } from 'lucide-react';
import DifficultyBadge from '@/components/DifficultyBadge';

export default function GlossaryDetail() {
  const { slug } = useParams();
  const [term, setTerm] = useState(null);
  const [relatedTerms, setRelatedTerms] = useState([]);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchTerm(); }, [slug]);

  const fetchTerm = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.GlossaryTerm.filter({ slug }, '-updated_date', 1);
      const terms = res.results || res || [];
      if (!terms.length) { setTerm(null); return; }
      const t = terms[0];
      setTerm(t);
      if (t.related_terms?.length) {
        try {
          const rels = await Promise.all(t.related_terms.slice(0, 5).map(id => base44.entities.GlossaryTerm.get(id).catch(() => null)));
          setRelatedTerms(rels.filter(Boolean));
        } catch (e) {}
      }
      if (t.related_articles?.length) {
        try {
          const arts = await Promise.all(t.related_articles.slice(0, 3).map(id => base44.entities.Article.get(id).catch(() => null)));
          setRelatedArticles(arts.filter(Boolean));
        } catch (e) {}
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (!term) return <div className="container-tbl py-32 text-center"><h1 className="text-2xl font-bold text-slate-900 mb-3">Term not found</h1><Link to="/glossary" className="text-blue-600 font-medium">Browse glossary →</Link></div>;

  return (
    <div>
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-3">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400">
            <Link to="/" className="hover:text-blue-600">Home</Link><ChevronRight className="w-3.5 h-3.5" />
            <Link to="/glossary" className="hover:text-blue-600">Glossary</Link><ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium truncate">{term.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-tbl py-10 max-w-4xl">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{term.title}</h1>
          {term.difficulty && <DifficultyBadge level={term.difficulty} />}
        </div>
        <p className="text-lg text-slate-600 leading-relaxed mb-8">{term.definition}</p>

        {term.examples?.length > 0 && (
          <div className="mb-8 p-5 rounded-xl bg-teal-50 border border-teal-100">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3"><Lightbulb className="w-4 h-4 text-teal-600" />Examples</h2>
            <ul className="space-y-2">
              {term.examples.map((ex, i) => <li key={i} className="text-sm text-slate-700">{ex}</li>)}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {relatedTerms.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide"><BookOpen className="w-4 h-4 text-teal-600" />Related Terms</h3>
              <div className="space-y-2">
                {relatedTerms.map(r => (
                  <Link key={r.id} to={`/glossary/${r.slug}`} className="block p-3 bg-white border border-slate-200 rounded-lg hover:border-teal-200 transition-all">
                    <p className="text-sm font-semibold text-slate-900">{r.title}</p>
                    <p className="text-xs text-slate-400 line-clamp-1">{r.definition}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {relatedArticles.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide"><FileText className="w-4 h-4 text-blue-600" />Related Articles</h3>
              <div className="space-y-2">
                {relatedArticles.map(r => (
                  <Link key={r.id} to={`/article/${r.slug}`} className="block p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-200 transition-all">
                    <p className="text-sm font-semibold text-slate-900">{r.title}</p>
                    <p className="text-xs text-slate-400 line-clamp-1">{r.summary}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {term.external_references?.length > 0 && (
          <div className="mt-8">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide"><ExternalLink className="w-4 h-4 text-slate-400" />External References</h3>
            <div className="space-y-2">
              {term.external_references.map((r, i) => (
                <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <ExternalLink className="w-3.5 h-3.5" />{r.title}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}