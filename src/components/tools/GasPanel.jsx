import React from 'react';
import LiveBadge from './LiveBadge';
import { TYPICAL_TX_GAS } from '@/lib/units';

const usdFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

function costUsd(gwei, ethUsd) {
  if (gwei == null || !ethUsd) return null;
  return (gwei * TYPICAL_TX_GAS) / 1e9 * ethUsd;
}

// Live Ethereum gas tiers (slow / standard / fast) read from the network via
// public RPC, with an estimated USD cost for a typical 21,000-gas transfer
// priced using the live ETH value passed in from the Unit Converter page.
export default function GasPanel({ gas, ethUsd, loading, lastRefresh, error }) {
  const tiers = [
    { label: 'Slow', gwei: gas?.slow, hint: '~3-5 min' },
    { label: 'Standard', gwei: gas?.standard, hint: '~1 min' },
    { label: 'Fast', gwei: gas?.fast, hint: '<30 sec' },
  ];
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4 gap-4">
        <div>
          <h3 className="font-bold text-slate-900">Live Gas (Ethereum)</h3>
          <p className="text-xs text-slate-400">Estimated cost for a typical transfer (21,000 gas)</p>
        </div>
        <LiveBadge loading={loading} lastRefresh={lastRefresh} error={error} />
      </div>
      {error ? (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          Live gas data is temporarily unavailable from the public RPCs. Please try again shortly.
        </p>
      ) : (
        <div className="space-y-2">
          {tiers.map((t) => (
            <div key={t.label} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <div>
                <div className="text-sm font-semibold text-slate-900">{t.label}</div>
                <div className="text-xs text-slate-400">{t.hint}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-900">{t.gwei == null ? '—' : `${t.gwei.toFixed(1)} Gwei`}</div>
                <div className="text-xs text-slate-500">{costUsd(t.gwei, ethUsd) == null ? '—' : usdFmt.format(costUsd(t.gwei, ethUsd))}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}