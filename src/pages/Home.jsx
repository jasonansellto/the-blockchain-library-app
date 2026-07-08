import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowRight, BookOpen, Library, FileText, GraduationCap, BookMarked, TrendingUp, Users } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import NewsletterSignup from '@/components/NewsletterSignup';
import ArticleCard from '@/components/cards/ArticleCard';
import BookCard from '@/components/cards/BookCard';
import ResearchCard from '@/components/cards/ResearchCard';
import LearningPathCard from '@/components/cards/LearningPathCard';
import CategoryCard from '@/components/cards/CategoryCard';
import Seo from '@/components/Seo';

export default function Home() {
  const [data, setData] = useState({
    featuredArticles: [], latestArticles: [], featuredBooks: [],
    featuredResearch: [], featuredPaths: [], categories: [], authors: [], counts: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [articles, books, research, paths, categories, authors, countsRes] = await Promise.all([
        base44.entities.Article.filter({ status: 'published' }, '-published_date', 20),
        base44.entities.Book.list('-updated_date', 20),
        base44.entities.ResearchPaper.list('-updated_date', 20),
        base44.entities.LearningPath.list('-updated_date', 20),
        base44.entities.Category.list('-updated_date', 50),
        base44.entities.Author.filter({ is_featured: true }, '-updated_date', 6),
        base44.functions.invoke('getCounts', {}),
      ]);

      const articlesArr = articles.results || articles || [];
      const booksArr = books.results || books || [];
      const researchArr = research.results || research || [];
      const pathsArr = paths.results || paths || [];
      const catsArr = categories.results || categories || [];
      const authorsArr = authors.results || authors || [];
      const counts = countsRes.data || countsRes || {};

      setData({
        featuredArticles: articlesArr.filter(a => a.is_featured).slice(0, 3),
        latestArticles: articlesArr.slice(0, 6),
        featuredBooks: booksArr.filter(b => b.is_featured).slice(0, 4).length ? booksArr.filter(b => b.is_featured).slice(0, 4) : booksArr.slice(0, 4),
        featuredResearch: researchArr.filter(r => r.is_featured).slice(0, 3).length ? researchArr.filter(r => r.is_featured).slice(0, 3) : researchArr.slice(0, 3),
        featuredPaths: pathsArr.filter(p => p.is_featured).slice(0, 3).length ? pathsArr.filter(p => p.is_featured).slice(0, 3) : pathsArr.slice(0, 3),
        categories: catsArr.slice(0, 8),
        authors: authorsArr,
        counts: {
          articles: counts.articles ?? 0,
          glossary: counts.glossary ?? 0,
          books: counts.books ?? 0,
          research: counts.research ?? 0,
          paths: counts.paths ?? 0,
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const catName = (id) => data.categories.find(c => c.id === id)?.name;

  return (
    <div>
      <Seo title="The Definitive Blockchain Knowledge Library" description="Learn blockchain, cryptocurrency, Web3, AI, decentralized finance, and emerging technology through thousands of expertly written educational resources." />
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="container-tbl relative py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            The world's blockchain knowledge library
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1] animate-slide-up">
            The Definitive Blockchain Knowledge Library
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Learn blockchain, cryptocurrency, Web3, AI, decentralized finance, and emerging technology
            through thousands of expertly written educational resources.
          </p>
          <div className="max-w-2xl mx-auto mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <SearchBar size="lg" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link to="/learn" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
              Start Learning <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/library" className="inline-flex items-center px-6 py-3 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors">
              Browse Library
            </Link>
            <Link to="/glossary" className="inline-flex items-center px-6 py-3 text-sm font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors">
              Explore Glossary
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="border-b border-slate-100 bg-white">
        <div className="container-tbl py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { icon: BookOpen, label: 'Articles', value: data.counts.articles, color: 'text-blue-600' },
              { icon: Library, label: 'Glossary Terms', value: data.counts.glossary, color: 'text-teal-600' },
              { icon: BookMarked, label: 'Books', value: data.counts.books, color: 'text-indigo-600' },
              { icon: FileText, label: 'Research Papers', value: data.counts.research, color: 'text-purple-600' },
              { icon: GraduationCap, label: 'Learning Paths', value: data.counts.paths, color: 'text-amber-600' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className={`w-7 h-7 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{stat.value ?? '—'}</div>
                <div className="text-xs text-slate-400 font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container-tbl py-16 space-y-20">
        {/* Featured Learning Paths */}
        {data.featuredPaths.length > 0 && (
          <section>
            <SectionHeader title="Featured Learning Paths" subtitle="Structured paths to take you from beginner to expert" link="/learn" linkLabel="All paths" icon={GraduationCap} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.featuredPaths.map(p => <LearningPathCard key={p.id} path={p} />)}
            </div>
          </section>
        )}

        {/* Featured Articles */}
        {data.featuredArticles.length > 0 && (
          <section>
            <SectionHeader title="Featured Articles" subtitle="Hand-picked essential reads from our editors" link="/library" linkLabel="All articles" icon={BookOpen} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.featuredArticles.map(a => <ArticleCard key={a.id} article={a} categoryName={catName(a.category_id)} featured />)}
            </div>
          </section>
        )}

        {/* Popular Categories */}
        {data.categories.length > 0 && (
          <section>
            <SectionHeader title="Popular Categories" subtitle="Explore the full spectrum of blockchain and emerging technology" link="/library" linkLabel="Browse all" icon={TrendingUp} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.categories.map(c => <CategoryCard key={c.id} category={c} />)}
            </div>
          </section>
        )}

        {/* Latest Articles */}
        {data.latestArticles.length > 0 && (
          <section>
            <SectionHeader title="Latest Articles" subtitle="Fresh educational content, continuously updated" link="/library" linkLabel="View all" icon={BookOpen} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.latestArticles.map(a => <ArticleCard key={a.id} article={a} categoryName={catName(a.category_id)} />)}
            </div>
          </section>
        )}

        {/* Featured Books */}
        {data.featuredBooks.length > 0 && (
          <section>
            <SectionHeader title="Featured Books" subtitle="Curated reading from leading blockchain authors" link="/books" linkLabel="All books" icon={BookMarked} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {data.featuredBooks.map(b => <BookCard key={b.id} book={b} />)}
            </div>
          </section>
        )}

        {/* Featured Research */}
        {data.featuredResearch.length > 0 && (
          <section>
            <SectionHeader title="Featured Research" subtitle="Academic papers and industry research, annotated and linked" link="/research" linkLabel="All research" icon={FileText} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.featuredResearch.map(r => <ResearchCard key={r.id} paper={r} />)}
            </div>
          </section>
        )}

        {/* Featured Authors */}
        {data.authors.length > 0 && (
          <section>
            <SectionHeader title="Featured Authors" subtitle="Experts writing accurate, neutral, well-referenced content" link="/authors" linkLabel="All authors" icon={Users} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {data.authors.map(a => (
                <Link key={a.id} to={`/authors/${a.slug}`} className="group text-center">
                  <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden bg-slate-100 ring-2 ring-slate-100 group-hover:ring-blue-200 transition-all">
                    {a.photo ? <img src={a.photo} alt={a.name} className="w-full h-full object-cover" /> : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-400">{a.name?.[0]}</div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{a.name}</p>
                  <p className="text-xs text-slate-400 line-clamp-1">{a.expertise_areas?.[0]}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {loading && (
        <div className="container-tbl py-20 text-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
        </div>
      )}

      <NewsletterSignup />
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