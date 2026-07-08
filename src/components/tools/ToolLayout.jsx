import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import Seo from '@/components/Seo';

// Shared shell for every tool sub-page: SEO, breadcrumbs (Home → Tools → Tool),
// a back link, title/subtitle, and a two-column grid (interactive panel on the
// left, sticky educational sidebar on the right).
export default function ToolLayout({ title, name, subtitle, icon: Icon, seoDescription, children, sidebar }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: title,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    description: seoDescription || subtitle || '',
  };
  return (
    <div>
      <Seo title={title} description={seoDescription} type="website" schemas={[schema]} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-3">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 flex-wrap">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/tools" className="hover:text-blue-600">Tools</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">{name}</span>
          </nav>
        </div>
      </div>
      <div className="container-tbl py-10">
        <Link to="/tools" className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> All tools
        </Link>
        <div className="flex items-center gap-3 mb-2">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{title}</h1>
        </div>
        {subtitle && <p className="text-slate-500 text-base sm:text-lg mb-8 max-w-2xl">{subtitle}</p>}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">{children}</div>
          <aside className="lg:col-span-1">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 lg:sticky lg:top-24 text-slate-600 text-sm leading-relaxed">
              {sidebar}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}