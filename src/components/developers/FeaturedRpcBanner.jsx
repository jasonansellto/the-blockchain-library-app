import React from 'react';
import { Sparkles, ExternalLink, Copy, Check, Box, Hash, Coins, Compass } from 'lucide-react';

export default function FeaturedRpcBanner({ group, copiedId, onCopy }) {
  if (!group) return null;
  const ep = group.endpoints[0];
  const isCopied = copiedId === ep?.id;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8 shadow-sm">
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="relative flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Featured Network
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">{group.network}</h2>
          {group.featuredNote && <p className="text-slate-600 max-w-2xl mb-4 leading-relaxed">{group.featuredNote}</p>}
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <Hash className="w-4 h-4 text-slate-400" /> Chain ID <strong className="text-slate-900 font-mono">{group.chainId}</strong>
            </span>
            {group.nativeCurrency && (
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <Coins className="w-4 h-4 text-slate-400" /> <strong className="text-slate-900">{group.nativeCurrency}</strong>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <Box className="w-4 h-4 text-slate-400" /> <strong className="text-slate-900 capitalize">{group.category}</strong>
            </span>
            {group.explorerUrl && (
              <a href={group.explorerUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium">
                <Compass className="w-4 h-4" /> Explorer <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
        <div className="lg:w-[420px] shrink-0">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Official RPC</span>
              <span className="text-xs text-slate-400">{group.endpoints.length} endpoint{group.endpoints.length > 1 ? 's' : ''}</span>
            </div>
            {ep && (
              <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between gap-2">
                <code className="text-xs text-slate-700 font-mono truncate">{ep.endpoint_url}</code>
                <button onClick={() => onCopy(ep)} aria-label="Copy RPC URL"
                  className={`shrink-0 p-1.5 rounded transition-colors ${isCopied ? 'text-green-600 bg-green-50' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}>
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
            {ep?.notes && <p className="text-xs text-slate-500 mt-2 leading-relaxed">{ep.notes}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}