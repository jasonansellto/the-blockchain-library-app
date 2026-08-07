import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Code2, Server, FileCode2, Plug, ShieldCheck, ArrowLeftRight, BrainCircuit } from 'lucide-react';
import Reveal from '@/components/animations/Reveal';
import StaggerGroup from '@/components/animations/StaggerGroup';
import { platformLinks } from '@/lib/platformLinks';

const features = [
  { icon: Building2, label: 'Architecture' },
  { icon: Code2, label: 'Code Examples' },
  { icon: Server, label: 'RPC Infrastructure' },
  { icon: FileCode2, label: 'Smart Contracts' },
  { icon: Plug, label: 'APIs' },
  { icon: ArrowLeftRight, label: 'Interoperability' },
  { icon: ShieldCheck, label: 'Security' },
  { icon: BrainCircuit, label: 'AI Agent Infrastructure' },
];

export default function DeveloperSection() {
  return (
    <section className="border-b border-slate-100 bg-white">
      <div className="container-tbl py-16 sm:py-20">
        <Reveal>
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Build with blockchain</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">Move From Concepts to Code</h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              The Blockchain Library connects educational concepts with practical developer resources —
              architecture, code examples, RPC infrastructure, and integration patterns.
            </p>
          </div>
        </Reveal>
        <StaggerGroup className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {features.map((f) => (
            <div key={f.label} className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <f.icon className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">{f.label}</span>
            </div>
          ))}
        </StaggerGroup>
        <div className="flex flex-wrap gap-3">
          <a href={platformLinks.developersOverview} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            Developer Resources <ArrowRight className="w-4 h-4" />
          </a>
          <a href={platformLinks.codeExamples} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
            Code Examples
          </a>
          <Link to="/developers" className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            Developer hub on this site <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}