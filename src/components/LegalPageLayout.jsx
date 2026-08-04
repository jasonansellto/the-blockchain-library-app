import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Seo from '@/components/Seo';

export default function LegalPageLayout({ title, description, lastUpdated, effectiveDate, children }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    dateModified: lastUpdated,
    publisher: {
      '@type': 'Organization',
      name: 'The Blockchain Library',
      url: 'https://theblockchainlibrary.com'
    }
  };

  return (
    <>
      <Seo title={title} description={description} type="article" schemas={[schema]} />
      <div className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="container-tbl py-12 sm:py-16">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-medium">{title}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
            {effectiveDate && <span>Effective date: {effectiveDate}</span>}
            {lastUpdated && <span>Last updated: {lastUpdated}</span>}
          </div>
          <p className="mt-4 max-w-2xl text-slate-600 text-base leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="container-tbl py-12 sm:py-16">
        <div className="max-w-3xl">
          <div className="prose-tbl">{children}</div>
          <div className="mt-12 pt-8 border-t border-slate-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">ChatGPT App</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <Link to="/privacy" className="text-slate-500 hover:text-blue-600 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-slate-500 hover:text-blue-600 transition-colors">Terms &amp; Conditions</Link>
              <Link to="/disclaimer" className="text-slate-500 hover:text-blue-600 transition-colors">Disclaimer</Link>
              <Link to="/cookies" className="text-slate-500 hover:text-blue-600 transition-colors">Cookie Policy</Link>
              <Link to="/contact" className="ml-auto text-slate-500 hover:text-blue-600 transition-colors">Questions? Contact us →</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}