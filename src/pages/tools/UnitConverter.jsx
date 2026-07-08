import React, { useState, useEffect } from 'react';
import { Coins } from 'lucide-react';
import ToolLayout from '@/components/tools/ToolLayout';
import LivePricePanel from '@/components/tools/LivePricePanel';
import GasPanel from '@/components/tools/GasPanel';
import { toBaseUnits, fromBaseUnits, ETH_DECIMALS, GWEI_DECIMALS, BTC_DECIMALS } from '@/lib/units';

const RPC_URLS = ['https://eth.llamarpc.com', 'https://cloudflare-eth.com', 'https://rpc.ankr.com/eth'];
const REFRESH_MS = 60000;

function Field({ label, value, onChange, mono, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${mono ? 'font-mono' : ''}`}
      />
    </div>
  );
}

export default function UnitConverter() {
  const [chain, setChain] = useState('ETH');
  const [ether, setEther] = useState('1');
  const [gwei, setGwei] = useState(fromBaseUnits(10n ** 18n, GWEI_DECIMALS));
  const [wei, setWei] = useState((10n ** 18n).toString());
  const [btc, setBtc] = useState('1');
  const [sats, setSats] = useState((10n ** 8n).toString());

  const [prices, setPrices] = useState({ eth: {}, btc: {} });
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceRefresh, setPriceRefresh] = useState(null);
  const [priceError, setPriceError] = useState(false);
  const [gas, setGas] = useState(null);
  const [gasLoading, setGasLoading] = useState(true);
  const [gasRefresh, setGasRefresh] = useState(null);
  const [gasError, setGasError] = useState(false);

  const fetchPrices = async () => {
    try {
      const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin&vs_currencies=usd,cad');
      if (!r.ok) throw new Error('bad');
      const d = await r.json();
      setPrices({ eth: { usd: d.ethereum?.usd, cad: d.ethereum?.cad }, btc: { usd: d.bitcoin?.usd, cad: d.bitcoin?.cad } });
      setPriceRefresh(Date.now());
      setPriceError(false);
    } catch { setPriceError(true); }
    finally { setPriceLoading(false); }
  };

  const fetchGas = async () => {
    const body = JSON.stringify([
      { jsonrpc: '2.0', id: 1, method: 'eth_gasPrice', params: [] },
      { jsonrpc: '2.0', id: 2, method: 'eth_maxPriorityFeePerGas', params: [] },
    ]);
    for (const url of RPC_URLS) {
      try {
        const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
        if (!r.ok) continue;
        const d = await r.json();
        const gp = BigInt(d[0]?.result || '0x0');
        if (gp > 0n) {
          const tip = BigInt(d[1]?.result || '0x0');
          const standard = Number(gp) / 1e9;
          const tipG = Number(tip) / 1e9;
          setGas({
            slow: Math.max(1, standard - (tipG > 0 ? tipG * 2 : standard * 0.15)),
            standard,
            fast: standard + (tipG > 0 ? tipG * 2 : standard * 0.2),
          });
          setGasRefresh(Date.now());
          setGasError(false);
          setGasLoading(false);
          return;
        }
      } catch { /* try next RPC */ }
    }
    setGasError(true);
    setGasLoading(false);
  };

  useEffect(() => {
    fetchPrices();
    fetchGas();
    const id = setInterval(() => { fetchPrices(); fetchGas(); }, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  const onEther = (v) => { setEther(v); const b = toBaseUnits(v, ETH_DECIMALS); setGwei(fromBaseUnits(b, GWEI_DECIMALS)); setWei(b.toString()); };
  const onGwei = (v) => { setGwei(v); const b = toBaseUnits(v, GWEI_DECIMALS); setEther(fromBaseUnits(b, ETH_DECIMALS)); setWei(b.toString()); };
  const onWei = (v) => { setWei(v); let b = 0n; try { b = BigInt(v.replace(/[^0-9-]/g, '') || '0'); } catch {} setEther(fromBaseUnits(b, ETH_DECIMALS)); setGwei(fromBaseUnits(b, GWEI_DECIMALS)); };
  const onBtc = (v) => { setBtc(v); const b = toBaseUnits(v, BTC_DECIMALS); setSats(b.toString()); };
  const onSats = (v) => { setSats(v); let b = 0n; try { b = BigInt(v.replace(/[^0-9-]/g, '') || '0'); } catch {} setBtc(fromBaseUnits(b, BTC_DECIMALS)); };

  const baseAmount = chain === 'BTC' ? toBaseUnits(btc, BTC_DECIMALS) : toBaseUnits(ether, ETH_DECIMALS);

  const sidebar = (
    <>
      <h3 className="font-bold text-slate-900 mb-2">How this works</h3>
      <p className="mb-4">Ethereum's native unit is <b>wei</b>: 1 ether = 10⁹ gwei = 10¹⁸ wei. Bitcoin's native unit is the <b>satoshi</b>: 1 BTC = 10⁸ satoshis. This converter uses BigInt math, so even enormous wei values stay exact — no floating-point rounding.</p>
      <h4 className="font-semibold text-slate-900 mt-4 mb-1">Why it matters</h4>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Gas prices are quoted in gwei; transactions are paid in wei.</li>
        <li>Smart contracts often handle raw wei amounts.</li>
        <li>Misplacing a zero by a factor of 10⁹ is a common — and costly — mistake.</li>
      </ul>
      <h4 className="font-semibold text-slate-900 mt-4 mb-1">Live data</h4>
      <p>Prices come from CoinGecko; gas prices are read live from the Ethereum network via public RPC. Both refresh every 60 seconds.</p>
    </>
  );

  return (
    <ToolLayout
      title="Unit Converter"
      name="Unit Converter"
      subtitle="Convert between wei, gwei, ether, satoshis, and bitcoin — with live fiat prices and Ethereum gas costs."
      icon={Coins}
      seoDescription="Convert between wei, gwei, ether, satoshis, and bitcoin with live USD/CAD prices and current Ethereum gas fees."
      sidebar={sidebar}
    >
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-slate-900">Convert</h3>
          <div className="inline-flex p-1 bg-slate-100 rounded-lg">
            {['ETH', 'BTC'].map((c) => (
              <button key={c} onClick={() => setChain(c)} className={`px-5 py-1.5 text-sm font-semibold rounded-md transition-colors ${chain === c ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{c}</button>
            ))}
          </div>
        </div>
        {chain === 'ETH' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Ether" value={ether} onChange={onEther} placeholder="1" />
            <Field label="Gwei" value={gwei} onChange={onGwei} placeholder="1000000000" />
            <Field label="Wei" value={wei} onChange={onWei} mono placeholder="1000000000000000000" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Bitcoin" value={btc} onChange={onBtc} placeholder="1" />
            <Field label="Satoshi" value={sats} onChange={onSats} mono placeholder="100000000" />
          </div>
        )}
      </div>

      <LivePricePanel
        chain={chain}
        baseAmount={baseAmount}
        prices={prices}
        loading={priceLoading}
        lastRefresh={priceRefresh}
        error={priceError}
      />

      {chain === 'ETH' && (
        <GasPanel
          gas={gas}
          ethUsd={prices.eth?.usd}
          loading={gasLoading}
          lastRefresh={gasRefresh}
          error={gasError}
        />
      )}
    </ToolLayout>
  );
}