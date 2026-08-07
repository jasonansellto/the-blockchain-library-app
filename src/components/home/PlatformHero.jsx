import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Github, Network, Cpu, Layers } from 'lucide-react';
import { platformLinks } from '@/lib/platformLinks';
import NeuralGraph from '@/components/animations/NeuralGraph';

// Visual architecture diagram: Knowledge Platform → Knowledge Engine → outputs
function ArchitectureDiagram() {
  const outputs = ['Topics', 'Glossary', 'Learning', 'Books', 'Research', 'Developers', 'AI'];
  return (
    <div className="mt-12 max-w-3xl mx-auto">
      <div className="flex flex-col items-center gap-4">
        <div className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold tracking-tight shadow-lg">
          Knowledge Platform
        </div>
        <div className="w-px h-6 bg-slate-300" />
        <div className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold tracking-tight shadow-lg flex items-center gap-2">
          <Cpu className="w-4 h-4" /> Knowledge Engine
        </div>
        <div className="w-px h-6 bg-slate-300" />
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
          {outputs.map((o) => (
            <span key={o} className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 shadow-sm">
              {o}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PlatformHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-slate-50 to-white border-b border-slate-100">
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[480px] bg-gradient-to-b from-blue-100/50 to-transparent blur-3xl rounded-full pointer-events-none" />
      <NeuralGraph className="opacity-50" />
      <div className="container-tbl relative py-20 sm:py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-6 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          The open knowledge platform for blockchain technology
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight mb-6 max-w-4xl mx-auto leading-[1.08] animate-slide-up">
          The Open Knowledge Platform for Blockchain Technology
        </h1>
        <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Learn blockchain through structured, connected knowledge built for beginners,
          developers, researchers, educators, and AI systems.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Link to="/learn" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
            Start Learning <ArrowRight className="w-4 h-4" />
          </Link>
          <a href={platformLinks.knowledgeEngine} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-700 bg-white/80 backdrop-blur-sm hover:bg-white border border-slate-200 rounded-lg transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
            <Layers className="w-4 h-4 text-blue-600" /> Explore the Knowledge Platform
          </a>
          <a href={platformLinks.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
            <Github className="w-4 h-4" /> View on GitHub
          </a>
        </div>
        <ArchitectureDiagram />
      </div>
    </section>
  );
}