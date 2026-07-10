import React from 'react';
import { ExternalLink } from 'lucide-react';
import { badgeStyles } from '@/lib/openAccessResources';

// External-link card for blockchain documentation/protocol hubs.
// These resources are purely external sites, so the whole card links out
// directly (target="_blank") rather than to an internal detail page.
export default function BlockchainResourceCard({ resource }) {
  const { name, type, icon, url, tagline } = resource;
  // Use a custom uploaded logo when available; otherwise pull the site's
  // favicon directly from its URL via Google's favicon service.
  const logoSrc = icon || `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="p-6 bg-white border border-slate-200 rounded-xl flex flex-col card-premium hover:border-blue-200 group h-full"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
          <img src={logoSrc} alt={`${name} logo`} loading="lazy" className="w-6 h-6 object-contain" />
        </span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset uppercase tracking-wide ${badgeStyles[type] || 'bg-slate-50 text-slate-700 ring-slate-600/20'}`}>{type}</span>
      </div>
      <h3 className="font-bold text-slate-900 tracking-tight mb-2 text-lg">{name}</h3>
      <p className="text-sm text-slate-500 mb-5 flex-1">{tagline}</p>
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-blue-600 group-hover:bg-blue-700 rounded-md transition-colors self-start">
        Visit Site <ExternalLink className="w-4 h-4" />
      </span>
    </a>
  );
}