import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { Clock, Calendar, ChevronRight, Lightbulb, HelpCircle, BookOpen, FileText, ExternalLink, Printer, Share2, ArrowRight, BookMarked } from 'lucide-react';
import DifficultyBadge from '@/components/DifficultyBadge';
import CategoryBadge from '@/components/CategoryBadge';
import NewsletterSignup from '@/components/NewsletterSignup';
import ArticleCard from '@/components/cards/ArticleCard';

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [category, setCategory] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => { fetchArticle(); }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.Article.filter({ slug, status: 'published' }, '-updated_date', 1);
      const articles = res.results || res || [];
      if (!articles.length) { setArticle(null); return; }
      const art = articles[0];
      setArticle(art);
      if (art.category_id) {
        try { const cat = await base44.entities.Category.get(art.category_id); setCategory(cat); } catch (e) {}
      }
      if (art.author_id) {
        try { const au = await base44.entities.Author.get(art.author_id); setAuthor(au); } catch (e) {}
      }
      if (art.related_articles?.length) {
        try {
          const rels = await Promise.all(art.related_articles.slice(0, 3).map(id => base44.entities.Article.get(id).catch(() => null)));
          setRelated(rels.filter(Boolean));
        } catch (e) {}
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (!article) return (
    <div className="container-tbl py-32 text-center">
      <h1 className="text-2xl font-bold text-slate-900 mb-3">Article not found</h1>
      <Link to="/library" className="text-blue-600 font-medium">Browse all articles →</Link>
    </div>
  );

  const toc = Array.isArray(article.toc) ? article.toc : [];

  return (
    <div>
      {/* Breadcrumbs */}
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-3">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 flex-wrap">
            <Link to="/" className="hover:text-blue-600">Home</Link><ChevronRight className="w-3.5 h-3.5" />
            <Link to="/library" className="hover:text-blue-600">Library</Link>
            {category && <><ChevronRight className="w-3.5 h-3.5" /><Link to={`/library?category=${category.id}`} className="hover:text-blue-600">{category.name}</Link></>}
            <ChevronRight className="w-3.5 h-3.5" /><span className="text-slate-700 font-medium truncate">{article.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className="border-b border-slate-100">
        <div className="container-tbl py-10 max-w-4xl">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {category && <CategoryBadge name={category.name} slug={category.id} />}
            {article.difficulty && <DifficultyBadge level={article.difficulty} />}
            {article.tags?.slice(0, 3).map(t => <span key={t} className="text-xs text-slate-400">#{t}</span>)}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15] mb-4">
            {article.title}
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed mb-6">{article.summary}</p>
          <div className="flex items-center gap-5 text-sm text-slate-400 flex-wrap">
            {author && (
              <Link to={`/authors/${author.slug}`} className="flex items-center gap-2 group">
                <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-xs font-bold text-slate-500">
                  {author.photo ? <img src={author.photo} alt={author.name} className="w-full h-full object-cover" /> : author.name?.[0]}
                </div>
                <span className="font-medium text-slate-700 group-hover:text-blue-600">{author.name}</span>
              </Link>
            )}
            {article.reading_time && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{article.reading_time} min read</span>}
            {article.published_date && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(article.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
            <div className="flex items-center gap-1 ml-auto">
              <button onClick={() => window.print()} className="p-1.5 hover:text-blue-600 rounded transition-colors" title="Print"><Printer className="w-4 h-4" /></button>
              <button onClick={() => navigator.share?.({ title: article.title, url: window.location.href }).catch(() => {})} className="p-1.5 hover:text-blue-600 rounded transition-colors" title="Share"><Share2 className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Body with TOC */}
      <div className="container-tbl py-10">
        <div className="flex gap-10 max-w-6xl">
          {toc.length > 0 && (
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-24">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">On this page</p>
                <nav className="space-y-1.5 border-l border-slate-200 pl-3">
                  {toc.map((item) => (
                    <a key={item.id} href={`#${item.id}`}
                      onClick={() => setActiveSection(item.id)}
                      className={`block text-sm py-1 transition-colors ${activeSection === item.id ? 'text-blue-600 font-medium' : 'text-slate-500 hover:text-blue-600'}`}>
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          <article className="flex-1 min-w-0 max-w-3xl">
            {article.featured_image && (
              <div className="mb-8 rounded-xl overflow-hidden bg-slate-100">
                <img src={article.featured_image} alt={article.title} className="w-full h-auto" />
              </div>
            )}
            <div className="prose-tbl">
              <ReactMarkdown>{article.body || ''}</ReactMarkdown>
            </div>

            {/* Key Takeaways */}
            {article.key_takeaways?.length > 0 && (
              <div className="mt-12 p-6 rounded-xl bg-blue-50 border border-blue-100">
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4"><Lightbulb className="w-5 h-5 text-blue-600" />Key Takeaways</h2>
                <ul className="space-y-2.5">
                  {article.key_takeaways.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* FAQ */}
            {article.faq?.length > 0 && (
              <div className="mt-10">
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-5"><HelpCircle className="w-5 h-5 text-blue-600" />Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {article.faq.map((f, i) => (
                    <details key={i} className="group bg-white border border-slate-200 rounded-lg overflow-hidden">
                      <summary className="cursor-pointer p-4 font-medium text-slate-900 flex items-center justify-between hover:bg-slate-50">
                        {f.question}
                        <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                      </summary>
                      <div className="px-4 pb-4 text-sm text-slate-600">{f.answer}</div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* References */}
            {article.references?.length > 0 && (
              <div className="mt-10">
                <h2 className="text-xl font-bold text-slate-900 mb-4">References</h2>
                <ol className="space-y-2 list-decimal pl-5">
                  {article.references.map((r, i) => (
                    <li key={i} className="text-sm text-slate-600">
                      {r.url ? <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">{r.title} <ExternalLink className="w-3 h-3" /></a> : r.title}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Related content sidebar */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              {related.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide"><BookOpen className="w-4 h-4 text-blue-600" />Related Articles</h3>
                  <div className="space-y-2">
                    {related.slice(0, 3).map(r => (
                      <Link key={r.id} to={`/article/${r.slug}`} className="block p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all">
                        <p className="text-sm font-medium text-slate-900 hover:text-blue-600">{r.title}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {article.related_external?.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide"><ExternalLink className="w-4 h-4 text-teal-600" />External Resources</h3>
                  <div className="space-y-2">
                    {article.related_external.slice(0, 4).map((r, i) => (
                      <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-white border border-slate-200 rounded-lg hover:border-teal-200 hover:shadow-sm transition-all">
                        <p className="text-sm font-medium text-slate-900 hover:text-teal-600 flex items-center gap-1">{r.title} <ExternalLink className="w-3 h-3" /></p>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Next lesson CTA */}
            <div className="mt-12 p-6 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-teal-400 font-semibold uppercase tracking-wide mb-1">Keep learning</p>
                <p className="text-lg font-bold">Explore more in {category?.name || 'this topic'}</p>
              </div>
              <Link to={category ? `/library?category=${category.id}` : '/library'} className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-white text-slate-900 rounded-lg hover:bg-slate-100 transition-colors">
                Continue <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </article>
        </div>
      </div>

      <NewsletterSignup variant="section" />
    </div>
  );
}