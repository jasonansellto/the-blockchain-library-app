import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronRight, Download, Quote, FileText, ExternalLink, BookOpen, Calendar, Sparkles, Tag, Lightbulb } from 'lucide-react';
import Seo from '@/components/Seo';
import DifficultyBadge from '@/components/DifficultyBadge';
import { buildScholarlyArticleSchema, buildBreadcrumbSchema } from '@/lib/seoSchemas';
import CitationBox from '@/components/CitationBox';
import GeoSummary from '@/components/GeoSummary';

const TYPE_LABELS = {
  paper: 'Paper',
  whitepaper: 'Whitepaper',
  standard: 'Standard',
  report: 'Report',
  preprint: 'Preprint',
  thesis: 'Thesis'
};

export default function ResearchDetail() {
  const { slug } = useParams();
  const [paper, setPaper] = useState(null);
  const [related, setRelated] = useState({ glossary: [], articles: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPaper(); }, [slug]);

  const fetchPaper = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.ResearchPaper.filter({ slug }, '-updated_date', 1);
      const papers = res.results || res || [];
      if (!papers.length) { setPaper(null); setLoading(false); return; }
      const p = papers[0];
      setPaper(p);
      const needGlossary = (p.related_glossary || []).length > 0;
      const needArticles = (p.related_articles || []).length > 0;
      if (needGlossary || needArticles) {
        const [gRes, aRes] = await Promise.all([
          needGlossary ? base44.entities.GlossaryTerm.list('-updated_date', 500) : Promise.resolve(null),
          needArticles ? base44.entities.Article.filter({ status: 'published' }, '-updated_date', 500) : Promise.resolve(null)
        ]);
        const gArr = gRes ? (gRes.results || gRes || []) : [];
        const aArr = aRes ? (aRes.results || aRes || []) : [];
        setRelated({
          glossary: gArr.filter((g) => (p.related_glossary || []).includes(g.slug)).slice(0, 6),
          articles: aArr.filter((a) => (p.related_articles || []).includes(a.slug)).slice(0, 5)
        });
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (!paper) return <div className="container-tbl py-32 text-center"><h1 className="text-2xl font-bold text-slate-900 mb-3">Paper not found</h1><Link to="/research" className="text-blue-600 font-medium">Browse research →</Link></div>;

  const breadcrumbItems = [{ name: 'Home', url: '/' }, { name: 'Research', url: '/research' }, { name: paper.title }];
  const schemas = [buildScholarlyArticleSchema(paper), buildBreadcrumbSchema(breadcrumbItems)];

  return (
    <div>
      <Seo title={paper.title} description={paper.seo_description || paper.abstract} type="article" schemas={schemas} image={paper.og_image} />
      <GeoSummary type="Research Paper" title={paper.title} summary={paper.abstract} keyConcepts={[...(paper.authors || []), ...(paper.tags || [])]} relatedLinks={[]} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-3">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 flex-wrap">
            <Link to="/" className="hover:text-blue-600">Home</Link><ChevronRight className="w-3.5 h-3.5" />
            <Link to="/research" className="hover:text-blue-600">Research</Link><ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium truncate">{paper.title}</span>
          </nav>
        </div>
      </div>

      <div className="container-tbl py-10 max-w-4xl">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-blue-700 bg-blue-50">
            <FileText className="w-3 h-3" />{TYPE_LABELS[paper.research_type] || 'Paper'}
          </span>
          {paper.difficulty && <DifficultyBadge level={paper.difficulty} />}
          {paper.is_original_research && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-teal-700 bg-teal-50 ring-1 ring-inset ring-teal-600/20">
              <Sparkles className="w-3 h-3" />Original Research
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3 leading-[1.2]">{paper.title}</h1>
        {paper.authors?.length > 0 && <p className="text-slate-600 mb-4">{paper.authors.join(', ')}</p>}
        <div className="flex items-center gap-4 text-sm text-slate-400 flex-wrap mb-8">
          {paper.publication && <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{paper.publication}</span>}
          {paper.publication_date && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(paper.publication_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>}
          {paper.citations_count > 0 && <span className="flex items-center gap-1"><Quote className="w-4 h-4" />{paper.citations_count} citations</span>}
          {paper.downloads > 0 && <span className="flex items-center gap-1"><Download className="w-4 h-4" />{paper.downloads} downloads</span>}
        </div>

        {/* Abstract */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Abstract</h2>
          <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl">
            <p className="text-slate-600 leading-relaxed">{paper.abstract}</p>
          </div>
        </div>

        {/* Key Findings */}
        {paper.key_findings?.length > 0 && (
          <div className="mb-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-3"><Lightbulb className="w-5 h-5 text-amber-500" />Key Findings</h2>
            <ul className="space-y-2.5">
              {paper.key_findings.map((f, i) => (
                <li key={i} className="flex items-start gap-3 p-3.5 bg-white border border-slate-200 rounded-lg">
                  <span className="w-6 h-6 shrink-0 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="text-sm text-slate-700 leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {paper.tags?.length > 0 && (
          <div className="mb-8">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide"><Tag className="w-4 h-4 text-blue-600" />Topics</h2>
            <div className="flex flex-wrap gap-2">
              {paper.tags.map((t, i) => (
                <span key={i} className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded-full">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* DOI + PDF */}
        <div className="flex flex-wrap gap-3 mb-8">
          {paper.pdf_url && (
            <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" /> Download / View
            </a>
          )}
          {paper.doi && (
            <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
              <ExternalLink className="w-4 h-4" /> DOI: {paper.doi}
            </a>
          )}
        </div>

        {/* Citation */}
        {(paper.citation || paper.bibtex) && (
          <div className="space-y-6 mb-8">
            {paper.citation && (
              <div>
                <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide"><Quote className="w-4 h-4 text-blue-600" />Citation</h2>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-600 font-serif leading-relaxed">{paper.citation}</div>
              </div>
            )}
            {paper.bibtex && (
              <div>
                <h2 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">BibTeX</h2>
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">{paper.bibtex}</pre>
              </div>
            )}
          </div>
        )}

        <CitationBox
          type="research"
          title={paper.title}
          authors={paper.authors}
          date={paper.publication_date}
          url={`${window.location.origin}/research/${paper.slug}`}
          doi={paper.doi}
          publication={paper.publication}
        />

        {/* Related */}
        {(related.glossary.length > 0 || related.articles.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
            {related.glossary.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Related Glossary Terms</h3>
                <div className="space-y-2">
                  {related.glossary.map((g) => (
                    <Link key={g.id} to={`/glossary/${g.slug}`}
                      className="block p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-colors">
                      {g.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {related.articles.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Related Articles</h3>
                <div className="space-y-2">
                  {related.articles.map((a) => (
                    <Link key={a.id} to={`/article/${a.slug}`}
                      className="block p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-colors">
                      {a.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}