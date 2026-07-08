import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, BookOpen } from 'lucide-react';
import Seo from '@/components/Seo';
import { buildBreadcrumbSchema } from '@/lib/seoSchemas';
import CodeBlock from '@/components/CodeBlock';

const SDKS = [
  {
    name: 'ethers.js',
    version: 'v6',
    language: 'javascript',
    desc: 'Complete Ethereum wallet and smart contract library for JavaScript.',
    docs: 'https://docs.ethers.org',
    install: 'npm install ethers',
    snippet: `import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth");
const balance = await provider.getBalance("0x...");
console.log(ethers.formatEther(balance));`,
    tags: ['ethereum', 'evm'],
  },
  {
    name: 'viem',
    version: 'v2',
    language: 'typescript',
    desc: 'TypeScript interface for Ethereum — fast, lightweight, modular.',
    docs: 'https://viem.sh',
    install: 'npm install viem',
    snippet: `import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

const blockNumber = await client.getBlockNumber();`,
    tags: ['ethereum', 'evm', 'typescript'],
  },
  {
    name: 'web3.js',
    version: 'v4',
    language: 'javascript',
    desc: 'Ethereum JavaScript API — interact with smart contracts and nodes.',
    docs: 'https://docs.web3js.org',
    install: 'npm install web3',
    snippet: `import Web3 from "web3";

const web3 = new Web3("https://rpc.ankr.com/eth");
const balance = await web3.eth.getBalance("0x...");
console.log(web3.utils.fromWei(balance, "ether"));`,
    tags: ['ethereum', 'evm'],
  },
  {
    name: 'wagmi',
    version: 'v2',
    language: 'typescript',
    desc: 'React Hooks for Ethereum — wallets, contracts, transactions.',
    docs: 'https://wagmi.sh',
    install: 'npm install wagmi viem',
    snippet: `import { useAccount, useBalance } from "wagmi";

function Wallet() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  return <p>{balance?.formatted} {balance?.symbol}</p>;
}`,
    tags: ['ethereum', 'react', 'evm'],
  },
  {
    name: 'solana-web3',
    version: 'v1',
    language: 'javascript',
    desc: 'Solana JavaScript SDK for interacting with the Solana blockchain.',
    docs: 'https://solana-labs.github.io/solana-web3.js',
    install: 'npm install @solana/web3.js',
    snippet: `import { Connection, PublicKey } from "@solana/web3.js";

const conn = new Connection("https://api.mainnet-beta.solana.com");
const balance = await conn.getBalance(
  new PublicKey("...")
);
console.log(balance / 1e9);`,
    tags: ['solana'],
  },
  {
    name: 'web3.py',
    version: 'v6',
    language: 'python',
    desc: 'Python library for interacting with Ethereum.',
    docs: 'https://web3py.readthedocs.io',
    install: 'pip install web3',
    snippet: `from web3 import Web3

w3 = Web3(Web3.HTTPProvider("https://rpc.ankr.com/eth"))
balance = w3.eth.get_balance("0x...")
print(w3.from_wei(balance, "ether"))`,
    tags: ['ethereum', 'python', 'evm'],
  },
];

export default function SdkReference() {
  const schemas = [buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Developer Hub', url: '/developers' }, { name: 'SDK Reference', url: '/developers/sdks' }])];

  return (
    <div>
      <Seo title="SDK Reference" description="Quick-start guides and code examples for ethers.js, viem, web3.js, wagmi, solana-web3, and web3.py — the essential blockchain developer libraries." schemas={schemas} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-10">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-3 flex-wrap">
            <Link to="/" className="hover:text-blue-600">Home</Link><ChevronRight className="w-3.5 h-3.5" />
            <Link to="/developers" className="hover:text-blue-600">Developer Hub</Link><ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">SDK Reference</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">SDK Reference</h1>
          <p className="text-slate-500 max-w-2xl">Quick-start guides for the essential blockchain developer libraries. Each card includes install instructions and a working code example.</p>
        </div>
      </div>

      <div className="container-tbl py-10">
        <div className="space-y-8">
          {SDKS.map(sdk => (
            <div key={sdk.name} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight font-mono">{sdk.name}</h2>
                  <span className="px-2 py-0.5 text-xs font-mono font-medium bg-slate-100 text-slate-600 rounded-full">{sdk.version}</span>
                  <span className="px-2 py-0.5 text-xs font-mono font-medium bg-purple-50 text-purple-700 rounded-full capitalize">{sdk.language}</span>
                </div>
                <a href={sdk.docs} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:gap-2 transition-all">
                  Official Docs <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              <p className="text-sm text-slate-500 mb-4">{sdk.desc}</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Install</p>
                  <CodeBlock code={sdk.install} language="bash" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Quick Start</p>
                  <CodeBlock code={sdk.snippet} language={sdk.language} />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 flex-wrap">
                {sdk.tags.map(t => (
                  <span key={t} className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full capitalize">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}