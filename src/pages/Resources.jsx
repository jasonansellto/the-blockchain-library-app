import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Code2, Newspaper, ArrowRight } from 'lucide-react';

export default function Resources({ type }) {
  const configs = {
    tools: { icon: Wrench, title: 'Blockchain Tools', desc: 'Calculators, converters, and interactive utilities for blockchain practitioners and learners.', items: [
      { name: 'Gas Fee Calculator', desc: 'Estimate transaction costs across major networks.', status: 'Coming soon' },
      { name: 'Hash Generator', desc: 'Generate SHA-256, Keccak-256, and other cryptographic hashes.', status: 'Available', link: '/tools/hash-generator' },
      { name: 'Address Validator', desc: 'Verify blockchain addresses across multiple chains.', status: 'Available', link: '/tools/address-validator' },
      { name: 'Unit Converter', desc: 'Convert between wei, gwei, ether, satoshis, and bitcoin.', status: 'Available', link: '/tools/unit-converter' },
      { name: 'Mnemonic Generator', desc: 'Educational tool for understanding BIP39 seed phrases.', status: 'Coming soon' },
      { name: 'Block Explorer', desc: 'Search transactions, blocks, and addresses across chains.', status: 'Coming soon' },
    ]},
    developers: { icon: Code2, title: 'Developer Hub', desc: 'Resources, code examples, and documentation for blockchain developers building on decentralized protocols.', items: [
      { name: 'Smart Contract Examples', desc: 'Annotated Solidity, Vyper, and Rust contract examples.', status: 'Coming soon' },
      { name: 'RPC Directory', desc: 'Public RPC endpoints for major blockchain networks.', status: 'Coming soon' },
      { name: 'SDK Reference', desc: 'Library guides for ethers.js, web3.js, viem, and more.', status: 'Coming soon' },
      { name: 'Developer Learning Paths', desc: 'Structured paths from smart contract basics to advanced DeFi.', status: 'Available', link: '/learn' },
      { name: 'Public REST API', desc: 'Programmatic access to the Blockchain Library knowledge base.', status: 'Coming soon' },
      { name: 'Webhooks', desc: 'Subscribe to content updates and knowledge graph events.', status: 'Coming soon' },
    ]},
    news: { icon: Newspaper, title: 'News & Insights', desc: 'Educational analysis and explainers on developments in blockchain, crypto, and Web3 — not breaking news, but lasting context.', items: [
      { name: 'Protocol Deep Dives', desc: 'Technical explainers on how major protocols work.', status: 'Available', link: '/library' },
      { name: 'Research Highlights', desc: 'Summaries of significant academic and industry research.', status: 'Available', link: '/research' },
      { name: 'Regulatory Explainers', desc: 'Neutral analysis of regulatory developments worldwide.', status: 'Coming soon' },
      { name: 'Market Structure', desc: 'How crypto markets work — order books, AMMs, liquidity.', status: 'Coming soon' },
      { name: 'Ecosystem Maps', desc: 'Visual guides to blockchain ecosystems and their components.', status: 'Coming soon' },
      { name: 'Glossary Updates', desc: 'Newly added terms and updated definitions.', status: 'Available', link: '/glossary' },
    ]},
  };

  const config = configs[type] || configs.tools;

  return (
    <div>
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-12">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3"><span>Home</span><span>/</span><span className="text-slate-700 font-medium">{config.title}</span></div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">{config.title}</h1>
          <p className="text-slate-500 max-w-2xl">{config.desc}</p>
        </div>
      </div>
      <div className="container-tbl py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config.items.map((item) => (
            <div key={item.name} className="p-6 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-slate-900 tracking-tight">{item.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${item.status === 'Available' ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>{item.status}</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">{item.desc}</p>
              {item.link ? (
                <Link to={item.link} className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:underline">Explore <ArrowRight className="w-4 h-4" /></Link>
              ) : (
                <span className="text-sm text-slate-400">In development</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}