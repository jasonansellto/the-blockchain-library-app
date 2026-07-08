import React, { useState, useEffect } from 'react';
import { Hash, Copy, Check } from 'lucide-react';
import { keccak256, toUtf8Bytes } from 'ethers';
import ToolLayout from '@/components/tools/ToolLayout';

function bufToHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function HashGenerator() {
  const [text, setText] = useState('');
  const [hashes, setHashes] = useState({ sha256: '', keccak: '', sha512: '' });
  const [copied, setCopied] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!text) { setHashes({ sha256: '', keccak: '', sha512: '' }); return; }
      const enc = new TextEncoder().encode(text);
      const [s256, s512] = await Promise.all([
        crypto.subtle.digest('SHA-256', enc),
        crypto.subtle.digest('SHA-512', enc),
      ]);
      let keccak = '';
      try { keccak = keccak256(toUtf8Bytes(text)); } catch { keccak = ''; }
      if (!cancelled) setHashes({ sha256: bufToHex(s256), keccak, sha512: bufToHex(s512) });
    })();
    return () => { cancelled = true; };
  }, [text]);

  const copy = async (key, value) => {
    try { await navigator.clipboard.writeText(value); setCopied(key); setTimeout(() => setCopied(''), 1500); } catch {}
  };

  const rows = [
    { key: 'sha256', label: 'SHA-256', value: hashes.sha256, note: 'General-purpose hash used in Bitcoin block headers and proof-of-work (Bitcoin actually double-hashes with SHA-256).' },
    { key: 'keccak', label: 'Keccak-256', value: hashes.keccak, note: "Ethereum's hash function — used for address derivation (EIP-55 checksums), transaction hashes, and smart-contract storage keys." },
    { key: 'sha512', label: 'SHA-512', value: hashes.sha512, note: 'Wider SHA-2 variant; less common in blockchain but used in some signature and key-derivation schemes.' },
  ];

  const sidebar = (
    <>
      <h3 className="font-bold text-slate-900 mb-2">How this works</h3>
      <p className="mb-4">A hash maps any input to a fixed-size digest. A tiny change in the input produces a completely different hash. Blockchains rely on hashes for integrity, addressing, and proof-of-work.</p>
      <h4 className="font-semibold text-slate-900 mt-4 mb-1">Algorithm cheat sheet</h4>
      <ul className="list-disc pl-5 space-y-1.5">
        <li><b>SHA-256</b> — Bitcoin proof-of-work & block headers.</li>
        <li><b>Keccak-256</b> — Ethereum: tx hashes, address checksums, contract storage.</li>
        <li><b>SHA-512</b> — wider SHA-2; some KDF & signature schemes.</li>
      </ul>
      <p className="mt-4 text-xs text-slate-500">Note: Keccak-256 ≠ SHA-3-256. Ethereum uses the original Keccak (pre-NIST padding) — a common source of bugs when switching libraries.</p>
    </>
  );

  return (
    <ToolLayout
      title="Hash Generator"
      name="Hash Generator"
      subtitle="Generate SHA-256, Keccak-256, and SHA-512 hashes instantly as you type."
      icon={Hash}
      seoDescription="Generate SHA-256, Keccak-256, and SHA-512 cryptographic hashes from any text input. Copy hex digests for blockchain development."
      sidebar={sidebar}
    >
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">Input text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Type or paste any text to hash…"
          className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
        />
        <div className="text-xs text-slate-400 mt-2">{text.length} characters</div>
      </div>

      <div className="space-y-4">
        {rows.map((r) => (
          <div key={r.key} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900">{r.label}</h3>
              {r.value && (
                <button
                  onClick={() => copy(r.key, r.value)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  {copied === r.key ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              )}
            </div>
            <code className={`block w-full break-all font-mono text-xs rounded-lg p-3 ${r.value ? 'bg-slate-900 text-teal-300' : 'bg-slate-50 text-slate-400'}`}>
              {r.value || '—'}
            </code>
            <p className="text-xs text-slate-500 mt-3">{r.note}</p>
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}