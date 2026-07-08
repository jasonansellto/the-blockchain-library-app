import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, Tag as TagIcon, BookOpen, FileText, Code } from 'lucide-react';
import ArticleCard from '@/components/cards/ArticleCard';
import Seo from '@/components/Seo';
import { buildCollectionPageSchema, buildBreadcrumbSchema } from '@/lib/seoSchemas';

export default function TagBrowse() {
  const { tag } = useParams();
  const decodedTag = decodeURIComponent(tag);
  const [articles, setArticles] = useState([]);
  const [books, setBooks] = useState([]);
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchByTag(); }, [decodedTag]);

  const fetchByTag = async () => {
    setLoading(true);
    try {
      const [artRes, bookRes, snipRes] = await Promise.all([
        base44.entities.Article.filter({ tags: decodedTag, status: 'published' }, '-views', 24),
        base44.entities.Book.filter({ tags: decodedTag }, '-rating', 12),
        base44.entities.CodeSnippet.filter({ tags: decodedTag }, '-views', 12),
      ]);
      setArticles(artRes.results || artRes || []);
      setBooks(bookRes.results || bookRes || []);
      setSnippets(snipRes.results || snipRes || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const total = articles.length + books.length + snippets.length;
  const schemas = [
    buildCollectionPageSchema(`Tag: ${decodedTag}`, `All content tagged "${decodedTag}" on The Blockchain Library — articles, books, and code snippets.`, `/tags/${tag}`, [
      ...articles.slice(0, 5).map(a => ({ name: a.title, url: `/article/${a.slug}` })),
      ...books.slice(0, 3).map(b => ({ name: b.title, url: `/books/${b.slug}` })),
    ]),
    buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Tags', url: '/library' }, { name: decodedTag, url: `/tags/${tag}` }])
  ];

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  return (
    <div>
      <Seo title={`Tagged: ${decodedTag}`} description={`Browse all articles, books, and code snippets tagged "${decodedTag}" on The Blockchain Library.`} schemas={schemas} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-12">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
            <Link to="/" className="hover:text-blue-600">Home</Link><span>/</span>
            <span className="text-slate-700 font-medium">Tags</span><span>/</span>
            <span className="text-slate-700 font-medium">{decodedTag}</span>
          </div>
          <div className="flex items-center gap-3">
            <TagIcon className="w-7 h-7 text-blue-600" />
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{decodedTag}</h1>
          </div>
          <p className="text-slate-500 mt-2">{total} resources tagged "{decodedTag}"</p>
        </div>
      </div>

      <div className="container-tbl py-10 space-y-12">
        {total === 0 ? (
          <div className="text-center py-20">
            <TagIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400">No content found with this tag.</p>
          </div>
        ) : (
          <>
            {articles.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-5"><FileText className="w-5 h-5 text-blue-600" /> Articles ({articles.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {articles.map(a => <ArticleCard key={a.id} article={a} />)}
                </div>
              </section>
            )}
            {books.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-5"><BookOpen className="w-5 h-5 text-teal-600" /> Books ({books.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {books.map(b => (
                    <Link key={b.id} to={`/books/${b.slug}`} className="group block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-teal-200 transition-all">
                      {b.cover && <img src={b.cover} alt={b.title} className="w-16 h-24 object-cover rounded mb-3 float-right ml-4" loading="lazy" />}
                      <h3 className="font-bold text-slate-900 group-hover:text-teal-600 mb-1 line-clamp-2">{b.title}</h3>
                      {b.subtitle && <p className="text-sm text-slate-400 mb-2">{b.subtitle}</p>}
                      <p className="text-sm text-slate-500 line-clamp-2">{b.description}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
            {snippets.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-5"><Code className="w-5 h-5 text-purple-600" /> Code Snippets ({snippets.length})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {snippets.map(s => (
                    <Link key={s.id} to={`/developers/snippets/${s.slug}`} className="group block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:border-purple-200 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-600">{s.language}</span>
                        <span className="text-xs text-slate-400">{s.chain}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 group-hover:text-purple-600 mb-1">{s.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2">{s.description}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}