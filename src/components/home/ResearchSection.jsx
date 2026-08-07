import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, ExternalLink } from 'lucide-react';
import Reveal from '@/components/animations/Reveal';
import StaggerGroup from '@/components/animations/StaggerGroup';
import ResearchCard from '@/components/cards/ResearchCard';
import { platformLinks } from '@/lib/platformLinks';

export default function ResearchSection({ papers }) {
  if (!papers || papers.length === 0) return null;
  return (
    <section className="border-b border-slate-100 bg-slate-50">
      <div className="container-tbl py-16 sm:py-20">
        <Reveal>
          <div className="max-w-3xl mb-10">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Research</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">Research &amp; Technical Publishing</h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              The platform connects research directly to relevant topics — so every paper sits inside the wider
              knowledge graph rather than as an isolated document.
            </p>
          </div>
        </Reveal>
        <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {papers.slice(0, 3).map((p) => <ResearchCard key={p.id} paper={p} />)}
        </StaggerGroup>
        <div className="flex flex-wrap gap-3">
          <Link to="/research" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            <FileText className="w-4 h-4" /> Explore Research
          </Link>
          <a href={platformLinks.researchOverview} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors">
            Research Documentation <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}