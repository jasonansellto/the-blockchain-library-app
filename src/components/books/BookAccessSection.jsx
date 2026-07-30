import React from 'react';
import { ExternalLink, BookOpen, Headphones, Globe, Building2 } from 'lucide-react';

export default function BookAccessSection({ book, compact = false }) {
  const a = book.access_links || {};
  const links = [];
  if (a.google_books_url) links.push({ label: 'Preview on Google Books', url: a.google_books_url, icon: Globe });
  if (a.kindle_url) links.push({ label: 'View Kindle Edition', url: a.kindle_url, icon: BookOpen });
  if (a.paperback_url) links.push({ label: 'View Paperback', url: a.paperback_url, icon: BookOpen });
  if (a.hardcover_url) links.push({ label: 'View Hardcover', url: a.hardcover_url, icon: BookOpen });
  if (a.audible_url) links.push({ label: 'Listen on Audible', url: a.audible_url, icon: Headphones });
  if (a.official_website) links.push({ label: 'Visit Official Website', url: a.official_website, icon: Globe });
  if (a.publisher_page) links.push({ label: 'View at Publisher', url: a.publisher_page, icon: Building2 });
  // Fallbacks for legacy books without structured access_links.
  if (!links.length) {
    if (book.amazon_link) links.push({ label: 'Buy Paperback', url: book.amazon_link, icon: BookOpen });
    if (book.amazon_kindle_link) links.push({ label: 'Buy Kindle', url: book.amazon_kindle_link, icon: BookOpen });
  }
  if (!links.length) return null;

  if (compact) {
    return (
      <div className="mt-4 space-y-2">
        {links.map((l) => (
          <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            <l.icon className="w-4 h-4" /> {l.label} <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        ))}
      </div>
    );
  }

  return (
    <section className="mt-12 max-w-3xl">
      <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">Access This Book</h2>
      <p className="text-sm text-slate-500 mb-5">Preview or obtain this title through your preferred retailer — all links open in a new tab.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map((l) => (
          <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:border-blue-200 hover:bg-slate-50 rounded-lg transition-colors">
            <l.icon className="w-4 h-4 text-blue-600 shrink-0" /> {l.label}
            <ExternalLink className="w-3.5 h-3.5 ml-auto text-slate-400" />
          </a>
        ))}
      </div>
    </section>
  );
}