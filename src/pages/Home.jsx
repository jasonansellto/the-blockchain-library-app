import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ArrowRight, BookOpen, GraduationCap, TrendingUp, Users } from 'lucide-react';
import NewsletterSignup from '@/components/NewsletterSignup';
import ArticleCard from '@/components/cards/ArticleCard';
import LearningPathCard from '@/components/cards/LearningPathCard';
import CategoryCard from '@/components/cards/CategoryCard';
import LatestNewsWidget from '@/components/news/LatestNewsWidget';
import Seo from '@/components/Seo';
import Reveal from '@/components/animations/Reveal';
import StaggerGroup from '@/components/animations/StaggerGroup';
import { buildOrganizationSchema, buildWebSiteSchema } from '@/lib/seoSchemas';
import PlatformHero from '@/components/home/PlatformHero';
import ConnectedKnowledge from '@/components/home/ConnectedKnowledge';
import PlatformNumbers from '@/components/home/PlatformNumbers';
import KnowledgeEngineSection from '@/components/home/KnowledgeEngineSection';
import LearnSection from '@/components/home/LearnSection';
import GlossarySection from '@/components/home/GlossarySection';
import DeveloperSection from '@/components/home/DeveloperSection';
import BooksSection from '@/components/home/BooksSection';
import ResearchSection from '@/components/home/ResearchSection';
import AiReadySection from '@/components/home/AiReadySection';
import OpenSourceSection from '@/components/home/OpenSourceSection';
import PlatformStatus from '@/components/home/PlatformStatus';

export default function Home() {
  const [data, setData] = useState({
    featuredArticles: [], latestArticles: [], featuredBooks: [],
    featuredResearch: [], featuredPaths: [], categories: [], authors: [], counts: {}
  });
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke('fetchNews', { t: Date.now() });
        const newsData = res.data || res;
        if (!newsData.error) setNews(newsData.items || []);
      } catch (e) { console.error(e); }
      setNewsLoading(false);
    })();
  }, []);

  const fetchData = async () => {
    try {
      const pinnedResearchSlug = 'deterministic-execution-fixed-cost-transaction-models';
      const [articles, books, allBooks, research, pinnedResearchRes, paths, categories, authors] = await Promise.all([
        base44.entities.Article.filter({ status: 'published' }, '-published_date', 20),
        base44.entities.Book.filter({ is_featured: true }, '-updated_date', 20),
        base44.entities.Book.list('-updated_date', 100),
        base44.entities.ResearchPaper.list('-updated_date', 20),
        base44.entities.ResearchPaper.filter({ slug: pinnedResearchSlug }),
        base44.entities.LearningPath.list('-updated_date', 20),
        base44.entities.Category.list('-updated_date', 50),
        base44.entities.Author.list('-updated_date', 50),
      ]);

      const articlesArr = articles.results || articles || [];
      const booksArr = books.results || books || [];
      const allBooksArr = allBooks.results || allBooks || [];
      const researchArr = research.results || research || [];
      const pathsArr = paths.results || paths || [];
      const catsArr = categories.results || categories || [];
      const authorsArr = authors.results || authors || [];

      const realAuthors = [...authorsArr].sort((a, b) => (/jason ansell/i.test(a.name) ? -1 : /jason ansell/i.test(b.name) ? 1 : 0));
      const seenAuthorNames = new Set(realAuthors.map((a) => a.name.toLowerCase()));
      const fillerAuthors = [];
      for (const b of allBooksArr) {
        for (const aid of (b.author_ids || [])) {
          const name = String(aid).trim();
          if (!name || /^[0-9a-f]{24}$/i.test(name) || seenAuthorNames.has(name.toLowerCase())) continue;
          seenAuthorNames.add(name.toLowerCase());
          fillerAuthors.push({ name, hasPage: false });
          if (fillerAuthors.length >= 6) break;
        }
        if (fillerAuthors.length >= 6) break;
      }
      const authorsList = [
        ...realAuthors.map((a) => ({ id: a.id, name: a.name, slug: a.slug, photo: a.photo, expertise: (a.expertise_areas || [])[0], hasPage: true })),
        ...fillerAuthors
      ].slice(0, 6);

      const researchFeatured = researchArr.filter((r) => r.is_featured);
      const researchSrc = researchFeatured.length ? researchFeatured : researchArr;
      const pinnedResearch = (pinnedResearchRes.results || pinnedResearchRes || [])[0] || null;
      const featuredResearchList = [pinnedResearch, ...researchSrc.filter((r) => r.slug !== pinnedResearchSlug)].filter(Boolean).slice(0, 3);
      const articleCatIds = new Set(articlesArr.map(a => a.category_id).filter(Boolean));
      const catPriority = ['blockchain', 'cryptocurrency', 'web3', 'technology'];
      const catDeprio = ['money', 'affiliate'];
      const sortedCats = catsArr
        .filter(c => articleCatIds.has(c.id) && !catDeprio.some(d => (c.name || '').toLowerCase().includes(d)))
        .sort((a, b) => {
          const aName = (a.name || '').toLowerCase();
          const bName = (b.name || '').toLowerCase();
          const aPri = catPriority.findIndex(p => aName.includes(p));
          const bPri = catPriority.findIndex(p => bName.includes(p));
          if (aPri !== -1 && bPri !== -1) return aPri - bPri;
          if (aPri !== -1) return -1;
          if (bPri !== -1) return 1;
          return 0;
        });

      setData({
        featuredArticles: articlesArr.filter(a => a.is_featured).slice(0, 3),
        latestArticles: articlesArr.slice(0, 6),
        featuredBooks: booksArr.slice(0, 4),
        featuredResearch: featuredResearchList,
        featuredPaths: pathsArr.filter(p => p.is_featured).slice(0, 3).length ? pathsArr.filter(p => p.is_featured).slice(0, 3) : pathsArr.slice(0, 3),
        categories: sortedCats.slice(0, 8),
        authors: authorsList,
        counts: {}
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }

    try {
      const countsRes = await base44.functions.invoke('getCounts', {});
      const counts = countsRes.data || countsRes || {};
      setData(prev => ({ ...prev, counts: { articles: counts.articles ?? 0, glossary: counts.glossary ?? 0, books: counts.books ?? 0, research: counts.research ?? 0, paths: counts.paths ?? 0 } }));
    } catch (e) { console.error(e); }
  };

  const catName = (id) => data.categories.find(c => c.id === id)?.name;

  const schemas = [buildOrganizationSchema(), buildWebSiteSchema()];

  return (
    <div>
      <Seo title="The Open Knowledge Platform for Blockchain Technology" description="The Blockchain Library is an open, structured, AI-ready knowledge platform connecting blockchain topics, glossary definitions, tutorials, books, research, developer resources, and learning paths." schemas={schemas} />

      <PlatformHero />
      <ConnectedKnowledge />
      <PlatformNumbers />
      <KnowledgeEngineSection />
      <LearnSection />
      <GlossarySection />
      <DeveloperSection />
      <BooksSection books={data.featuredBooks} />
      <ResearchSection papers={data.featuredResearch} />
      <AiReadySection />
      <OpenSourceSection />
      <PlatformStatus />

      <div className="container-tbl py-16 space-y-20">
        {/* Featured Learning Paths */}
        {data.featuredPaths.length > 0 && (
          <section>
            <Reveal>
              <SectionHeader title="Featured Learning Paths" subtitle="Structured paths to take you from beginner to expert" link="/learn" linkLabel="All paths" icon={GraduationCap} />
            </Reveal>
            <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.featuredPaths.map(p => <LearningPathCard key={p.id} path={p} />)}
            </StaggerGroup>
          </section>
        )}

        {/* Featured Articles */}
        {data.featuredArticles.length > 0 && (
          <section>
            <Reveal>
              <SectionHeader title="Featured Articles" subtitle="Hand-picked essential reads from our editors" link="/library" linkLabel="All articles" icon={BookOpen} />
            </Reveal>
            <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data.featuredArticles.map(a => <ArticleCard key={a.id} article={a} categoryName={catName(a.category_id)} featured />)}
            </StaggerGroup>
          </section>
        )}

        {/* Popular Categories */}
        {data.categories.length > 0 && (
          <section>
            <Reveal>
              <SectionHeader title="Popular Categories" subtitle="Explore the full spectrum of blockchain and emerging technology" link="/library" linkLabel="Browse all" icon={TrendingUp} />
            </Reveal>
            <StaggerGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.categories.map(c => <CategoryCard key={c.id} category={c} />)}
            </StaggerGroup>
          </section>
        )}

        {/* Latest Articles */}
        {data.latestArticles.length > 0 && (
          <section>
            <Reveal>
              <SectionHeader title="Latest Articles" subtitle="Fresh educational content, continuously updated" link="/library" linkLabel="View all" icon={BookOpen} />
            </Reveal>
            <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.latestArticles.map(a => <ArticleCard key={a.id} article={a} categoryName={catName(a.category_id)} />)}
            </StaggerGroup>
          </section>
        )}

        {/* Latest News */}
        {(newsLoading || news.length > 0) && (
          <LatestNewsWidget items={news} loading={newsLoading} />
        )}

        {/* Featured Authors */}
        {data.authors.length > 0 && (
          <section>
            <SectionHeader title="Featured Authors" subtitle="Experts writing accurate, neutral, well-referenced content" link="/authors" linkLabel="All authors" icon={Users} />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {data.authors.map(a => {
                const inner = (
                  <>
                    <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden bg-slate-100 ring-2 ring-slate-100 group-hover:ring-blue-200 transition-all">
                      {a.photo ? <img src={a.photo} alt={a.name} className="w-full h-full object-cover" /> : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-400">{a.name?.[0]}</div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{a.name}</p>
                    {a.expertise ? <p className="text-xs text-slate-400 line-clamp-1">{a.expertise}</p> : null}
                  </>
                );
                return a.hasPage ? (
                  <Link key={a.id || a.name} to={`/authors/${a.slug}`} className="group text-center">{inner}</Link>
                ) : (
                  <div key={a.name} className="group text-center">{inner}</div>
                );
              })}
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