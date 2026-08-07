import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Boxes, Coins, Wallet, GitFork, FileCode2, TrendingUp, Globe, Layers2, ArrowLeftRight, Building2, BrainCircuit } from 'lucide-react';
import Reveal from '@/components/animations/Reveal';
import StaggerGroup from '@/components/animations/StaggerGroup';
import { platformLinks } from '@/lib/platformLinks';

const areas = [
  { icon: Boxes, label: 'Blockchain Basics' },
  { icon: Coins, label: 'Cryptocurrency' },
  { icon: Wallet, label: 'Wallets & Security' },
  { icon: GitFork, label: 'Consensus' },
  { icon: FileCode2, label: 'Smart Contracts' },
  { icon: TrendingUp, label: 'DeFi' },
  { icon: Globe, label: 'Web3' },
  { icon: Layers2, label: 'Layer 2' },
  { icon: Building2, label: 'Blockchain Infrastructure' },
  { icon: ArrowLeftRight, label: 'Interoperability' },
  { icon: Building2, label: 'Enterprise Blockchain' },
  { icon: BrainCircuit, label: 'AI + Blockchain' },
];

export default function LearnSection() {
  return (
    <section className="border-b border-slate-100 bg-white">
      <div className="container-tbl py-16 sm:py-20">
        <Reveal>
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Learn blockchain</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">Start With the Fundamentals. Go as Deep as You Want.</h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Follow structured learning paths that take you from first principles to advanced infrastructure —
              with every concept connected to definitions, research, and code.
            </p>
          </div>
        </Reveal>
        <StaggerGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
          {areas.map((a) => (
            <div key={a.label} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <a.icon className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">{a.label}</span>
            </div>
          ))}
        </StaggerGroup>
        <div className="flex flex-wrap gap-3">
          <a href={platformLinks.learningPath} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            Explore Learning Paths <ArrowRight className="w-4 h-4" />
          </a>
          <a href={platformLinks.topicsCatalog} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
            Browse 100 Topics
          </a>
          <Link to="/learn" className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Learning paths on this site <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}