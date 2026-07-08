import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowRight, BookOpen, Library, BookMarked, FileText, GraduationCap, ChevronRight, Loader2 } from 'lucide-react';
import Seo from '@/components/Seo';
import GeoSummary from '@/components/GeoSummary';
import ArticleCard from '@/components/cards/ArticleCard';
import BookCard from '@/components/cards/BookCard';
import ResearchCard from '@/components/cards/ResearchCard';
import LearningPathCard from '@/components/cards/LearningPathCard';
import GlossaryCard from '@/components/cards/GlossaryCard';
import { buildCollectionPageSchema, buildBreadcrumbSchema } from '@/lib/seoSchemas';

export default function TopicHub() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const catRes = await base44.entities.Category.filter({ slug }, '-updated_date', 1, 0);
        const catArr = catRes.results || catRes || [];
        const category = catArr[0];
        if (!category) { setData(null); setLoading(false); return; }

        const [articles, glossary, books, research, paths, subcats] = await Promise.all([
          base44.entities.Article.filter({ category_id: category.id, status: 'published' }, '-published_date', 12),
          base44.entities.GlossaryTerm.filter({ category_id: category.id }, 'title', 12),
          base44.entities.Book.filter({ category_id: category.id }, '-updated_date', 6),
          base44.entities.ResearchPaper.filter({ category_id: category.id }, '-updated_date', 6),
          base44.entities.LearningPath.filter({ category_id: category.id }, '-updated_date', 6),
          base44.entities.Category.filter({ parent_id: category.id }, 'sort_order', 20),
        ]);

        setData({
          category,
          articles: articles.results || articles || [],
          glossary: glossary.results || glossary || [],
          books: books.results || books || [],
          research: research.results || research || [],
          paths: paths.results || paths || [],
          subcategories: subcats.results || subcats || [],
        });
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;
  }
  if (!data) {
    return (
      <div className="container-tbl py-20 text-center">
        <p className="text-slate-400 mb-4">Topic not found.</p>
        <Link to="/library" className="text-blue-600 font-semibold hover:underline">Browse all content</Link>
      </div>
    );
  }

  const { category, articles, glossary, books, research, paths, subcategories } = data;
  const totalCount = articles.length + glossary.length + books.length + research.length + paths.length;

  const schemas = [
    buildCollectionPageSchema(
      category.name,
      category.description || `Explore ${category.name} content on The Blockchain Library.`,
      `/topics/${slug}`,
      [
        ...articles.slice(0, 5).map(a => ({ name: a.title, url: `/article/${a.slug}` })),
        ...glossary.slice(0, 5).map(t => ({ name: t.title, url: `/glossary/${t.slug}` })),
      ]
    ),
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Library', url: '/library' },
      { name: category.name, url: `/topics/${slug}` },
    ]),
  ];

  return (
    <div>
      <Seo
        title={category.seo_title || `${category.name} — Resources & Guides`}
        description={category.seo_description || category.description || `Explore articles, glossary terms, books, research, and learning paths about ${category.name}.`}
        schemas={schemas}
      />
      <GeoSummary
        type="Topic Hub"
        title={category.name}
        summary={category.description}
        keyConcepts={subcategories.map(s => s.name)}
        relatedLinks={[
          ...articles.slice(0, 5).map(a => ({ title: a.title, type: 'Article', url: `/article/${a.slug}` })),
          ...glossary.slice(0, 5).map(t => ({ title: t.title, type: 'Glossary Term', url: `/glossary/${t.slug}` })),
        ]}
      />

      {/* Hero */}
      <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
        <div className="container-tbl py-14">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-4 flex-wrap">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/library" className="hover:text-blue-600">Library</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">{category.name}</span>
          </nav>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center text-3xl shrink-0">
              {category.icon || '📚'}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight">{category.name}</h1>
          </div>
          {category.description && <p className="text-lg text-slate-500 max-w-2xl">{category.description}</p>}
          <div className="flex flex-wrap gap-3 mt-6">
            <StatBadge icon={BookOpen} count={articles.length} label="Articles" />
            <StatBadge icon={Library} count={glossary.length} label="Glossary Terms" />
            <StatBadge icon={BookMarked} count={books.length} label="Books" />
            <StatBadge icon={FileText} count={research.length} label="Research" />
            <StatBadge icon={GraduationCap} count={paths.length} label="Learning Paths" />
          </div>
        </div>
      </div>

      <div className="container-tbl py-12 space-y-16">
        {/* Subcategories */}
        {subcategories.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">Subtopics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {subcategories.map(sc => (
                <Link key={sc.id} to={`/topics/${sc.slug}`} className="group p-5 bg-white border border-slate-200 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all">
                  <div className="text-2xl mb-2">{sc.icon || '📄'}</div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{sc.name}</h3>
                  {sc.description && <p className="text-sm text-slate-400 mt-1 line-clamp-2">{sc.description}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Articles */}
        {articles.length > 0 && (
          <section>
            <SectionHeader title="Articles" subtitle="In-depth educational content" link={`/library?category=${slug}`} linkLabel="All articles" icon={BookOpen} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.slice(0, 6).map(a => <ArticleCard key={a.id} article={a} categoryName={category.name} />)}
            </div>
          </section>
        )}

        {/* Glossary Terms */}
        {glossary.length > 0 && (
          <section>
            <SectionHeader title="Key Glossary Terms" subtitle="Essential vocabulary for this topic" link="/glossary" linkLabel="All terms" icon={Library} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {glossary.slice(0, 6).map(t => <GlossaryCard key={t.id} term={t} />)}
            </div>
          </section>
        )}

        {/* Learning Paths */}
        {paths.length > 0 && (
          <section>
            <SectionHeader title="Learning Paths" subtitle="Structured study tracks" link="/learn" linkLabel="All paths" icon={GraduationCap} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paths.map(p => <LearningPathCard key={p.id} path={p} />)}
            </div>
          </section>
        )}

        {/* Books */}
        {books.length > 0 && (
          <section>
            <SectionHeader title="Books" subtitle="Recommended reading" link="/books" linkLabel="All books" icon={BookMarked} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.slice(0, 4).map(b => <BookCard key={b.id} book={b} />)}
            </div>
          </section>
        )}

        {/* Research */}
        {research.length > 0 && (
          <section>
            <SectionHeader title="Research Papers" subtitle="Academic and industry research" link="/research" linkLabel="All research" icon={FileText} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {research.slice(0, 3).map(r => <ResearchCard key={r.id} paper={r} />)}
            </div>
          </section>
        )}

        {totalCount === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 mb-4">No content in this topic yet.</p>
            <Link to="/library" className="text-blue-600 font-semibold hover:underline">Browse all content</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBadge({ icon: Icon, count, label }) {
  return (
    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2">
      <Icon className="w-4 h-4 text-blue-500" />
      <span className="text-sm text-slate-600"><strong className="text-slate-900">{count}</strong> {label}</span>
    </div>
  );
}

function SectionHeader({ title, subtitle, link, linkLabel, icon: Icon }) {
  return (
    <div className="flex items-end justify-between mb-8">
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          {Icon && <Icon className="w-5 h-5 text-blue-600" />}
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{title}</h2>
        </div>
        <p className="text-slate-500 text-sm sm:text-base">{subtitle}</p>
      </div>
      {link && (
        <Link to={link} className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 shrink-0 ml-4">
          {linkLabel} <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}