import React from 'react';
import { Copy, Check, Star, KeyRound } from 'lucide-react';

export default function RpcEndpointCard({ endpoint, copiedId, onCopy }) {
  const ep = endpoint;
  const isCopied = copiedId === ep.id;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-200 hover:shadow-md transition-all flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="font-semibold text-slate-900 text-sm">{ep.provider}</span>
        <div className="flex items-center gap-1 shrink-0">
          {ep.is_recommended && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full ring-1 ring-amber-600/20">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> Recommended
            </span>
          )}
          {ep.auth_required && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-full">
              <KeyRound className="w-2.5 h-2.5" /> API key
            </span>
          )}
        </div>
      </div>
      <div className="bg-slate-50 rounded-lg p-2.5 mb-2 flex items-center justify-between gap-2">
        <code className="text-xs text-slate-600 font-mono truncate">{ep.endpoint_url}</code>
        <button onClick={() => onCopy(ep)} className={`shrink-0 p-1 rounded transition-colors ${isCopied ? 'text-green-600' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`} aria-label="Copy endpoint URL">
          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      {ep.notes && <p className="text-xs text-slate-500 leading-relaxed">{ep.notes}</p>}
    </div>
  );
}