import React from 'react';
import Reveal from '@/components/animations/Reveal';
import { platformStats } from '@/lib/platformLinks';

export default function PlatformNumbers() {
  return (
    <section className="border-b border-slate-100 bg-slate-900">
      <div className="container-tbl py-16">
        <Reveal>
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-2">The platform in numbers</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">A growing knowledge graph — and growing</h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {platformStats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{s.value}</div>
              <div className="text-xs text-slate-400 font-medium mt-1.5 leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}