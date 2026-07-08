import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import MarkdownContent from '@/components/MarkdownContent';
import { Loader2, ChevronRight, ArrowLeft, BookOpen, Tag } from 'lucide-react';
import CodeBlock from '@/components/CodeBlock';
import DifficultyBadge from '@/components/DifficultyBadge';
import Seo from '@/components/Seo';
import { buildBreadcrumbSchema } from '@/lib/seoSchemas';

export default function CodeSnippetDetail() {
  const { slug } = useParams();
  const [snippet, setSnippet] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await base44.entities.CodeSnippet.filter({ slug }, '-updated_date', 1, 0);
        const arr = res.results || res || [];
        const s = arr[0];
        if (s) {
          setSnippet(s);
          base44.entities.CodeSnippet.update(s.id, { views: (s.views || 0) + 1 }).catch(() => {});
          if (s.related_articles?.length > 0) {
            const articles = await Promise.all(
              s.related_articles.slice(0, 4).map(id => base44.entities.Article.get(id).catch(() => null))
            );
            setRelated(articles.filter(Boolean));
          }
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;
  }
  if (!snippet) {
    return (
      <div className="container-tbl py-20 text-center">
        <p className="text-slate-400 mb-4">Snippet not found.</p>
        <Link to="/developers/snippets" className="text-blue-600 font-semibold hover:underline">Back to Code Snippets</Link>
      </div>
    );
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": snippet.title,
    "description": snippet.seo_description || snippet.description,
    "url": `${window.location.origin}/developers/snippets/${slug}`,
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${window.location.origin}/developers/snippets/${slug}` },
    "proficiencyLevel": snippet.difficulty,
    "dependencies": snippet.language,
    "publisher": { "@type": "Organization", "name": "The Blockchain Library" },
  };
  if (snippet.tags?.length) articleSchema.keywords = snippet.tags.join(', ');

  const schemas = [
    articleSchema,
    buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Developer Hub', url: '/developers' }, { name: 'Code Snippets', url: '/developers/snippets' }, { name: snippet.title, url: '/developers/snippets/' + slug }]),
  ];

  return (
    <div>
      <Seo title={snippet.seo_title || snippet.title} description={snippet.seo_description || snippet.description} type="article" schemas={schemas} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-8">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-4 flex-wrap">
            <Link to="/" className="hover:text-blue-600">Home</Link><ChevronRight className="w-3.5 h-3.5" />
            <Link to="/developers" className="hover:text-blue-600">Developer Hub</Link><ChevronRight className="w-3.5 h-3.5" />
            <Link to="/developers/snippets" className="hover:text-blue-600">Code Snippets</Link><ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium line-clamp-1">{snippet.title}</span>
          </nav>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-200 text-slate-700 capitalize">{snippet.language}</span>
            {snippet.chain && snippet.chain !== 'none' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">{snippet.chain}</span>
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 capitalize">{snippet.category}</span>
            <DifficultyBadge level={snippet.difficulty} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">{snippet.title}</h1>
          <p className="text-slate-500 max-w-2xl">{snippet.description}</p>
        </div>
      </div>

      <div className="container-tbl py-10 max-w-4xl">
        <Link to="/developers/snippets" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> All snippets
        </Link>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">Code</h2>
          <CodeBlock code={snippet.code} language={snippet.language} />
        </div>

        {snippet.explanation && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">Explanation</h2>
            <div className="prose-tbl">
              <MarkdownContent>{snippet.explanation}</MarkdownContent>
            </div>
          </div>
        )}

        {snippet.tags?.length > 0 && (
          <div className="mb-8 flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-slate-400" />
            {snippet.tags.map((t, i) => (
              <span key={i} className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">{t}</span>
            ))}
          </div>
        )}

        {related.length > 0 && (
          <div className="border-t border-slate-100 pt-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4 tracking-tight">
              <BookOpen className="w-5 h-5 text-blue-600" /> Related Articles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {related.map(a => (
                <Link key={a.id} to={`/article/${a.slug}`} className="group p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all">
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-sm line-clamp-2 mb-1">{a.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{a.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}