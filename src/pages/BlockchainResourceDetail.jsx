import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, ExternalLink, ArrowLeft, Check, Star, ShieldCheck, BookOpen, FileText, GraduationCap, Library as LibIcon, Link2, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Seo from '@/components/Seo';

const favicon = (url) => {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`; }
  catch { return ''; }
};

const DIFFICULTY_STYLES = {
  beginner: 'bg-teal-50 text-teal-700',
  intermediate: 'bg-blue-50 text-blue-700',
  advanced: 'bg-purple-50 text-purple-700',
  developer: 'bg-slate-100 text-slate-700',
  research: 'bg-amber-50 text-amber-700',
};

function Stars({ rating }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`w-4 h-4 ${n <= (rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
      ))}
    </span>
  );
}

export default function BlockchainResourceDetail() {
  const { slug } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kg, setKg] = useState({ glossary: [], articles: [], books: [], research: [], related: [] });
  const [kgLoading, setKgLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await base44.entities.BlockchainResource.filter({ slug });
        const r = (res.results || res || [])[0];
        if (cancelled) return;
        setResource(r);
        if (r) await loadKnowledgeGraph(r);
      } catch (e) { console.error(e); }
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const loadKnowledgeGraph = async (r) => {
    try {
      const terms = (r.tags || []).concat([r.name]).map((t) => t.toLowerCase()).filter((t) => t && t.length >= 3);
      const [g, a, b, rp, allRes] = await Promise.all([
        base44.entities.GlossaryTerm.list('-updated_date', 100),
        base44.entities.Article.filter({ status: 'published' }, '-published_date', 100),
        base44.entities.Book.list('-updated_date', 100),
        base44.entities.ResearchPaper.list('-updated_date', 100),
        base44.entities.BlockchainResource.list('-updated_date', 200),
      ]);
      const gArr = g.results || g || [];
      const aArr = a.results || a || [];
      const bArr = b.results || b || [];
      const rpArr = rp.results || rp || [];
      const allArr = allRes.results || allRes || [];
      const match = (item, fields) => {
        const hay = fields.map((f) => (item[f] || '')).join(' ').toLowerCase();
        const tags = (item.tags || []).join(' ').toLowerCase();
        return terms.some((t) => hay.includes(t) || tags.includes(t));
      };
      const related = (r.related_resources || []).map((sl) => allArr.find((x) => x.slug === sl)).filter(Boolean);
      setKg({
        glossary: gArr.filter((x) => match(x, ['title', 'definition'])).slice(0, 5),
        articles: aArr.filter((x) => match(x, ['title', 'summary'])).slice(0, 5),
        books: bArr.filter((x) => match(x, ['title', 'description'])).slice(0, 5),
        research: rpArr.filter((x) => match(x, ['title', 'abstract'])).slice(0, 5),
        related,
      });
    } catch (e) { console.error(e); }
    setKgLoading(false);
  };

  if (loading) {
    return <div className="container-tbl py-32 text-center"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto" /></div>;
  }
  if (!resource) {
    return (
      <div className="container-tbl py-32 text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Resource not found</h1>
        <Link to="/resources/blockchain" className="inline-flex items-center gap-1 text-blue-600 font-semibold"><ArrowLeft className="w-4 h-4" /> Back to directory</Link>
      </div>
    );
  }

  const { name, url, category, difficulty, editorial_rating, editorial_label, is_official, official_org, api_availability, last_checked, tagline, description, tags } = resource;
  const api = api_availability || {};
  const hasKg = kg.glossary.length || kg.articles.length || kg.books.length || kg.research.length || kg.related.length;

  const schemas = [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
        { '@type': 'ListItem', position: 2, name: 'Resources', item: '/resources' },
        { '@type': 'ListItem', position: 3, name: 'Blockchain Resource Directory', item: '/resources/blockchain' },
        { '@type': 'ListItem', position: 4, name },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'WebPage', name, description: tagline,
      isPartOf: { '@type': 'WebSite', name: 'The Blockchain Library' },
      mainEntity: { '@type': 'WebSite', name, url },
    },
  ];

  return (
    <div>
      <Seo title={name} description={tagline} type="article" schemas={schemas} />

      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-12">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-4 flex-wrap">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/resources" className="hover:text-blue-600">Resources</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/resources/blockchain" className="hover:text-blue-600">Blockchain Resource Directory</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium truncate">{name}</span>
          </nav>
          <div className="flex items-start gap-4">
            <span className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
              <img src={favicon(url)} alt={`${name} logo`} className="w-8 h-8 object-contain" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <span className="text-xs text-slate-500 font-medium">{category}</span>
                {is_official && <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-blue-600 text-white"><ShieldCheck className="w-3 h-3" /> Official{official_org ? ` · ${official_org}` : ''}</span>}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">{name}</h1>
              <p className="text-slate-500 max-w-2xl text-lg">{tagline}</p>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <Stars rating={editorial_rating || 0} />
                {editorial_label && <span className="text-sm text-slate-500">{editorial_label}</span>}
                {difficulty && <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.intermediate}`}>{difficulty}</span>}
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Visit {name} <ExternalLink className="w-4 h-4" /></a>
            <Link to="/resources/blockchain" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"><ArrowLeft className="w-4 h-4" /> All resources</Link>
          </div>
        </div>
      </div>

      <div className="container-tbl py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {description && (
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Overview</h2>
              <p className="text-[17px] leading-[1.75] text-slate-600">{description}</p>
            </section>
          )}
          {tags && tags.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">Topics</h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-medium">{t}</span>)}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <div className="p-5 bg-white border border-slate-200 rounded-xl">
            <h3 className="font-bold text-slate-900 mb-3 text-sm">At a glance</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-400">Category</dt><dd className="text-slate-700 font-medium">{category}</dd></div>
              {difficulty && <div className="flex justify-between"><dt className="text-slate-400">Difficulty</dt><dd className="text-slate-700 font-medium capitalize">{difficulty}</dd></div>}
              {last_checked && <div className="flex justify-between"><dt className="text-slate-400">Last checked</dt><dd className="text-slate-700 font-medium">{last_checked}</dd></div>}
            </dl>
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm">
              <div className="flex items-center gap-2"><Check className={`w-4 h-4 ${api.api ? 'text-teal-500' : 'text-slate-300'}`} /> API available</div>
              <div className="flex items-center gap-2"><Check className={`w-4 h-4 ${api.sdk ? 'text-teal-500' : 'text-slate-300'}`} /> SDK / libraries</div>
              <div className="flex items-center gap-2"><Check className={`w-4 h-4 ${api.open_source ? 'text-teal-500' : 'text-slate-300'}`} /> Open source</div>
            </div>
          </div>
        </aside>
      </div>

      {/* Knowledge Graph */}
      <div className="container-tbl pb-16">
        <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <Link2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Knowledge Graph</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6">How {name} connects to the rest of The Blockchain Library.</p>

          {kgLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-slate-50 rounded-lg animate-pulse" />)}
            </div>
          ) : hasKg ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <KgSection icon={BookOpen} title="Related Glossary Terms" items={kg.glossary} linkBase="/glossary" field="slug" label="title" />
              <KgSection icon={FileText} title="Related Articles" items={kg.articles} linkBase="/article" field="slug" label="title" />
              <KgSection icon={LibIcon} title="Related Books" items={kg.books} linkBase="/books" field="slug" label="title" />
              <KgSection icon={GraduationCap} title="Related Research" items={kg.research} linkBase="/research" field="slug" label="title" />
              {kg.related.length > 0 && <KgSection icon={Link2} title="Related Directory Resources" items={kg.related} linkBase="/resources/blockchain" field="slug" label="name" />}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No direct connections surfaced yet for this resource.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function KgSection({ icon: Icon, title, items, linkBase, field, label }) {
  if (!items.length) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-slate-400" />
        <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
        <span className="text-xs text-slate-400">{items.length}</span>
      </div>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id}>
            <Link to={`${linkBase}/${it[field]}`} className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-blue-600 group">
              <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500" /> {it[label]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}