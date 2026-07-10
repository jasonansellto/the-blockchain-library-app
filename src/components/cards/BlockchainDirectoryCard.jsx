import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Check, ShieldCheck, FileText, GraduationCap, Lock, Wrench, BookOpen, Search, BarChart3, Server } from 'lucide-react';

const TYPE_ICONS = {
  docs: FileText, research: GraduationCap, security: Lock, tool: Wrench,
  standard: BookOpen, learning: GraduationCap, explorer: Search,
  analytics: BarChart3, infrastructure: Server, wallet: Server,
};

const DIFFICULTY_STYLES = {
  beginner: 'bg-teal-50 text-teal-700',
  intermediate: 'bg-blue-50 text-blue-700',
  advanced: 'bg-purple-50 text-purple-700',
  developer: 'bg-slate-100 text-slate-700',
  research: 'bg-amber-50 text-amber-700',
};

const favicon = (url) => {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`; }
  catch { return ''; }
};

function Stars({ rating }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`w-3.5 h-3.5 ${n <= (rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
      ))}
    </span>
  );
}

export default function BlockchainDirectoryCard({ resource }) {
  const {
    name, slug, url, category, difficulty, editorial_rating, editorial_label,
    resource_type, is_official, official_org, api_availability, last_checked, tagline,
  } = resource;
  const TypeIcon = TYPE_ICONS[resource_type] || FileText;
  const api = api_availability || {};

  return (
    <Link to={`/resources/blockchain/${slug}`} className="p-5 bg-white border border-slate-200 rounded-xl flex flex-col card-premium hover:border-blue-200 group h-full">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
            <img src={resource.logo_url || favicon(url)} alt={`${name} logo`} loading="lazy" className="w-6 h-6 object-contain" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-900 tracking-tight truncate group-hover:text-blue-600 transition-colors">{name}</h3>
              {is_official && <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />}
            </div>
            <span className="text-xs text-slate-400">{category}</span>
          </div>
        </div>
        <TypeIcon className="w-4 h-4 text-slate-300 shrink-0" />
      </div>

      <p className="text-sm text-slate-500 mb-3 line-clamp-2 flex-1">{tagline}</p>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Stars rating={editorial_rating || 0} />
        {editorial_label && <span className="text-xs text-slate-400 truncate">{editorial_label}</span>}
      </div>

      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.intermediate}`}>{difficulty}</span>
        {is_official && <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-50 text-blue-700 truncate">Official{official_org ? ` · ${official_org}` : ''}</span>}
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-400 mb-3 flex-wrap">
        {api.api && <span className="inline-flex items-center gap-1"><Check className="w-3 h-3 text-teal-500" /> API</span>}
        {api.sdk && <span className="inline-flex items-center gap-1"><Check className="w-3 h-3 text-teal-500" /> SDK</span>}
        {api.open_source && <span className="inline-flex items-center gap-1"><Check className="w-3 h-3 text-teal-500" /> OSS</span>}
        {last_checked && <span className="ml-auto">Checked {last_checked}</span>}
      </div>

      <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all self-start">
        View details <ArrowRight className="w-4 h-4" />
      </span>
    </Link>
  );
}