import React from 'react';

// Pulsing-dot "Live" indicator with a last-refresh timestamp. Turns amber
// when the upstream data source is unavailable so the rest of the UI degrades
// gracefully instead of breaking.
export default function LiveBadge({ loading, lastRefresh, error }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="relative flex h-2 w-2">
        {loading && !error && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${error ? 'bg-amber-400' : 'bg-teal-500'}`} />
      </span>
      <span className={error ? 'text-amber-600 font-medium' : 'text-slate-400'}>
        {error ? 'Unavailable' : loading ? 'Fetching…' : 'Live'}
      </span>
      {lastRefresh && !error && (
        <span className="text-slate-300">· updated {new Date(lastRefresh).toLocaleTimeString()}</span>
      )}
    </div>
  );
}