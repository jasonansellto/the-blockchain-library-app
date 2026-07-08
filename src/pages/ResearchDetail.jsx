import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronRight, Download, Quote, FileText, ExternalLink, BookOpen, BookMarked, Calendar } from 'lucide-react';
import Seo from '@/components/Seo';
import { buildScholarlyArticleSchema, buildBreadcrumbSchema } from '@/lib/seoSchemas';
import CitationBox from '@/components/CitationBox';

export default function ResearchDetail() {
  const { slug } = useParams();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPaper(); }, [slug]);

  const fetchPaper = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.ResearchPaper.filter({ slug }, '-updated_date', 1);
      const papers = res.results || res || [];
      if (!papers.length) { setPaper(null); return; }
      setPaper(papers[0]);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (!paper) return <div className="container-tbl py-32 text-center"><h1 className="text-2xl font-bold text-slate-900 mb-3">Paper not found</h1><Link to="/research" className="text-blue-600 font-medium">Browse research →</Link></div>;

  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Research', url: '/research' },
    { name: paper.title }
  ];
  const schemas = [
    buildScholarlyArticleSchema(paper),
    buildBreadcrumbSchema(breadcrumbItems)
  ];

  return (
    <div>
      <Seo title={paper.title} description={paper.abstract} type="article" schemas={schemas} />
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
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-blue-700 bg-blue-50 capitalize mb-4">
          <FileText className="w-3 h-3" />{paper.research_type || 'paper'}
        </span>
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

        {/* DOI + PDF */}
        <div className="flex flex-wrap gap-3 mb-8">
          {paper.pdf_url && (
            <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" /> Download PDF
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
          <div className="space-y-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {paper.related_articles?.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide"><FileText className="w-4 h-4 text-blue-600" />Related Articles</h3>
              <div className="space-y-2">
                {paper.related_articles.slice(0, 3).map((id, i) => (
                  <span key={i} className="block p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-500">Article reference</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}