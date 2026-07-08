import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Loader2, Copy, Check } from 'lucide-react';
import ToolLayout from '@/components/tools/ToolLayout';
import { validateAddress } from '@/lib/addressValidate';

const CHAINS = ['Auto-detect', 'Ethereum / EVM', 'Bitcoin', 'Solana', 'Cosmos', 'Tron', 'Litecoin'];

export default function AddressValidator() {
  const [input, setInput] = useState('');
  const [selected, setSelected] = useState('Auto-detect');
  const [result, setResult] = useState(null);
  const [validating, setValidating] = useState(false);
  const [copied, setCopied] = useState(false);
  const reqId = useRef(0);

  useEffect(() => {
    const v = input.trim();
    if (!v) { setResult(null); setValidating(false); return; }
    const id = ++reqId.current;
    setValidating(true);
    (async () => {
      let r = await validateAddress(v);
      if (id !== reqId.current) return;
      if (selected !== 'Auto-detect' && r.chain !== selected) {
        r = { valid: false, chain: r.chain || 'Unknown', type: 'Mismatch', note: `This address does not match the selected chain (${selected}). Detected format: ${r.chain || 'none'}.` };
      }
      setResult(r);
      setValidating(false);
    })();
  }, [input, selected]);

  const copy = async () => {
    if (!result?.checksummed) return;
    try { await navigator.clipboard.writeText(result.checksummed); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  const sidebar = (
    <>
      <h3 className="font-bold text-slate-900 mb-2">How this works</h3>
      <p className="mb-4">A blockchain address encodes a network, a format, and a checksum so typos are caught <i>before</i> funds are sent. This tool validates the format and checksum locally — it does not check whether the address exists on-chain.</p>
      <h4 className="font-semibold text-slate-900 mt-4 mb-1">Supported chains</h4>
      <ul className="list-disc pl-5 space-y-1.5">
        <li><b>Ethereum / EVM</b> — 0x… 40 hex, EIP-55 checksum (Polygon, BSC, Arbitrum…).</li>
        <li><b>Bitcoin</b> — Legacy (1…), P2SH (3…), SegWit (bc1…).</li>
        <li><b>Litecoin</b> — L…/M… and ltc1….</li>
        <li><b>Tron</b> — T… Base58Check.</li>
        <li><b>Cosmos</b> — cosmos1… Bech32.</li>
        <li><b>Solana</b> — Base58 public key.</li>
      </ul>
      <p className="mt-4 text-xs text-slate-500">Tip: always send a small test amount first when using an address for the very first time.</p>
    </>
  );

  return (
    <ToolLayout
      title="Address Validator"
      name="Address Validator"
      subtitle="Verify blockchain addresses across Ethereum, Bitcoin, Solana, Cosmos, Tron, and Litecoin — with full checksum verification."
      icon={ShieldCheck}
      seoDescription="Validate blockchain addresses across Ethereum, Bitcoin, Solana, Cosmos, Tron, and Litecoin. Checks format and checksum, returns EIP-55 encoded EVM addresses."
      sidebar={sidebar}
    >
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Blockchain address</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste an address (0x…, bc1…, T…, cosmos1…, …)"
          className="w-full px-3 py-2.5 text-sm font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {CHAINS.map((c) => (
            <button
              key={c}
              onClick={() => setSelected(c)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${selected === c ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {validating && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-2 text-slate-500">
          <Loader2 className="w-4 h-4 animate-spin" /> Validating…
        </div>
      )}

      {result && !validating && (
        <div className={`rounded-xl border p-5 ${result.valid ? 'bg-teal-50 border-teal-200' : 'bg-rose-50 border-rose-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            {result.valid ? <CheckCircle2 className="w-5 h-5 text-teal-600" /> : <XCircle className="w-5 h-5 text-rose-600" />}
            <span className={`text-lg font-bold ${result.valid ? 'text-teal-700' : 'text-rose-700'}`}>{result.valid ? 'Valid address' : 'Invalid'}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-3">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Chain</div>
              <div className="font-semibold text-slate-900">{result.chain || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide">Format / Type</div>
              <div className="font-semibold text-slate-900">{result.type || '—'}</div>
            </div>
          </div>
          <p className="text-sm text-slate-600">{result.note}</p>
          {result.checksummed && (
            <div className="mt-4 p-3 bg-white border border-slate-200 rounded-lg">
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">EIP-55 checksummed address</div>
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-slate-900 break-all">{result.checksummed}</code>
                <button onClick={copy} className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
                  {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </ToolLayout>
  );
}