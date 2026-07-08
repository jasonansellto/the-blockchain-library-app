import React from 'react';
import LiveBadge from './LiveBadge';
import { fromBaseUnits, ETH_DECIMALS, BTC_DECIMALS } from '@/lib/units';

const usdFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const cadFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'CAD', maximumFractionDigits: 2 });

// Live fiat equivalent of the entered amount. Prices are passed in from the
// Unit Converter page (fetched from CoinGecko) so the price + gas panels share
// one data source.
export default function LivePricePanel({ chain, baseAmount, prices, loading, lastRefresh, error }) {
  const decimals = chain === 'BTC' ? BTC_DECIMALS : ETH_DECIMALS;
  const unit = chain === 'BTC' ? 'BTC' : 'ETH';
  const coin = chain === 'BTC' ? prices.btc : prices.eth;
  const amount = parseFloat(fromBaseUnits(baseAmount, decimals) || '0');
  const usd = coin?.usd ? amount * coin.usd : null;
  const cad = coin?.cad ? amount * coin.cad : null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-slate-900">Live Price</h3>
        <LiveBadge loading={loading} lastRefresh={lastRefresh} error={error} />
      </div>
      {error ? (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          Live price data is temporarily unavailable. Conversions still work — refresh in a moment for fiat equivalents.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-slate-500">1 {unit}</span>
            <span className="font-semibold text-slate-900">
              {coin?.usd ? usdFmt.format(coin.usd) : '—'}
              <span className="text-slate-400 font-normal"> / {coin?.cad ? cadFmt.format(coin.cad) : '—'}</span>
            </span>
          </div>
          <div className="border-t border-slate-100 pt-3">
            <div className="text-xs text-slate-400 mb-1.5">Your amount ({amount} {unit})</div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-slate-500">USD</span>
              <span className="text-lg font-bold text-slate-900">{usd == null ? '—' : usdFmt.format(usd)}</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-sm text-slate-500">CAD</span>
              <span className="text-lg font-bold text-slate-900">{cad == null ? '—' : cadFmt.format(cad)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}