import React from 'react';
import { ArrowRight, Map, CheckCircle2, Clock, Circle } from 'lucide-react';
import Reveal from '@/components/animations/Reveal';
import { platformLinks } from '@/lib/platformLinks';

// status: live | expanding | planned
const items = [
  { label: 'Documentation Platform', status: 'live' },
  { label: 'Knowledge Engine', status: 'live' },
  { label: 'Knowledge Graph', status: 'expanding' },
  { label: 'Topic Catalog — 100+', status: 'live' },
  { label: 'Glossary — 250+', status: 'live' },
  { label: 'Books — Connected', status: 'live' },
  { label: 'Research — Expanding', status: 'expanding' },
  { label: 'Tutorials — Expanding', status: 'expanding' },
  { label: 'Code Examples — Expanding', status: 'expanding' },
  { label: 'Knowledge API', status: 'planned' },
  { label: 'AI Tutor', status: 'planned' },
];

const dot = {
  live: { icon: CheckCircle2, cls: 'text-teal-400' },
  expanding: { icon: Clock, cls: 'text-amber-400' },
  planned: { icon: Circle, cls: 'text-slate-500' },
};

const label = { live: 'Live', expanding: 'Expanding', planned: 'Planned' };

export default function PlatformStatus() {
  return (
    <section className="border-b border-slate-100 bg-white">
      <div className="container-tbl py-16 sm:py-20">
        <Reveal>
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Project status</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">The Platform Is Growing</h2>
          </div>
        </Reveal>
        <Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto mb-10">
            {items.map((it) => {
              const d = dot[it.status];
              return (
                <div key={it.label} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-sm font-medium text-slate-700">{it.label}</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${d.cls}`}>
                    <d.icon className="w-3.5 h-3.5" /> {label[it.status]}
                  </span>
                </div>
              );
            })}
          </div>
        </Reveal>
        <div className="text-center">
          <a href={platformLinks.roadmap} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors">
            View the Roadmap <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}