import React from 'react';
import { ArrowRight, Cpu, FileText, Search, Network, GraduationCap, BookMarked, FileSearch, Sparkles, Server } from 'lucide-react';
import Reveal from '@/components/animations/Reveal';
import { platformLinks } from '@/lib/platformLinks';

const outputs = [
  { icon: FileText, label: 'Documentation' },
  { icon: Search, label: 'Search' },
  { icon: Network, label: 'Knowledge Graph' },
  { icon: GraduationCap, label: 'Learning' },
  { icon: BookMarked, label: 'Books' },
  { icon: FileSearch, label: 'Research' },
  { icon: Sparkles, label: 'AI' },
  { icon: Server, label: 'Future APIs' },
];

export default function KnowledgeEngineSection() {
  return (
    <section className="border-b border-slate-100 bg-gradient-to-b from-white to-slate-50">
      <div className="container-tbl py-16 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">The core</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">Powered by the Blockchain Library Knowledge Engine</h2>
              <p className="text-lg text-slate-500 leading-relaxed mb-6">
                At the center of The Blockchain Library is a structured Knowledge Engine. Instead of treating
                blockchain education as disconnected pages, the platform organizes information into canonical
                knowledge objects with stable identities and explicit relationships.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href={platformLinks.knowledgeEngine} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                  Explore the Knowledge Engine <ArrowRight className="w-4 h-4" />
                </a>
                <a href={platformLinks.architecture} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
                  View the Architecture
                </a>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold tracking-tight flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> Knowledge Engine
                </div>
                <div className="w-px h-6 bg-slate-300" />
                <div className="px-5 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold border border-blue-100">
                  Canonical Knowledge Objects
                </div>
                <div className="w-px h-6 bg-slate-300" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                  {outputs.map((o) => (
                    <div key={o.label} className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <o.icon className="w-4 h-4 text-blue-600" />
                      <span className="text-[11px] font-medium text-slate-600 text-center leading-tight">{o.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}