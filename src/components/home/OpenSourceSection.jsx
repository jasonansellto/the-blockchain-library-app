import React from 'react';
import { ArrowRight, Github, Eye, Map, GitPullRequest, FileCode2 } from 'lucide-react';
import Reveal from '@/components/animations/Reveal';
import StaggerGroup from '@/components/animations/StaggerGroup';
import { platformLinks } from '@/lib/platformLinks';

const links = [
  { icon: Github, label: 'GitHub Repository', href: platformLinks.github, desc: 'Knowledge Engine, data model, generators, and governance.' },
  { icon: Eye, label: 'Vision', href: platformLinks.vision, desc: 'Why structured blockchain knowledge matters.' },
  { icon: FileCode2, label: 'Architecture', href: platformLinks.architecture, desc: 'How canonical objects power the platform.' },
  { icon: Map, label: 'Roadmap', href: platformLinks.roadmap, desc: 'Where the project is heading next.' },
  { icon: GitPullRequest, label: 'Contributing', href: platformLinks.contributing, desc: 'How to contribute knowledge, code, or review.' },
];

export default function OpenSourceSection() {
  return (
    <section className="border-b border-slate-100 bg-slate-900">
      <div className="container-tbl py-16 sm:py-20">
        <Reveal>
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-2">Open source</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">Open Knowledge. Open Development.</h2>
            <p className="text-lg text-slate-400 leading-relaxed">
              The Blockchain Library is developed openly on GitHub. The repository includes the Knowledge Engine,
              canonical data model, documentation, validation tools, generation pipelines, learning resources,
              governance, architecture, editorial standards, and project roadmap.
            </p>
          </div>
        </Reveal>
        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="group p-5 rounded-xl bg-slate-800/60 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-lg bg-slate-700 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                  <l.icon className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="font-semibold text-white">{l.label}</span>
              </div>
              <p className="text-sm text-slate-400">{l.desc}</p>
            </a>
          ))}
        </StaggerGroup>
        <Reveal>
          <a href={platformLinks.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors">
            <Github className="w-4 h-4" /> Contribute to the Library <ArrowRight className="w-4 h-4" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}