import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Library } from 'lucide-react';
import Reveal from '@/components/animations/Reveal';
import { platformLinks } from '@/lib/platformLinks';

export default function GlossarySection() {
  return (
    <section className="border-b border-slate-100 bg-slate-50">
      <div className="container-tbl py-16 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div>
              <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mb-2">Blockchain glossary</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">250+ Blockchain Terms, Explained Clearly</h2>
              <p className="text-lg text-slate-500 leading-relaxed mb-6">
                Understand blockchain terminology without navigating promotional definitions, fragmented
                documentation, or unexplained jargon. The Blockchain Library glossary provides structured
                definitions designed to connect directly to related concepts and deeper learning resources.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/glossary" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors">
                  Browse the Glossary <ArrowRight className="w-4 h-4" />
                </Link>
                <a href={platformLinks.glossaryCatalog} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors">
                  Full glossary catalog
                </a>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="grid grid-cols-2 gap-3">
              {['Proof of Work', 'Smart Contract', 'Zero-Knowledge Proof', 'ERC-20', 'Merkle Tree', 'Rollup', 'Oracle', 'DAO'].map((term, i) => (
                <Link key={term} to={`/glossary/${term.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} className="group p-4 rounded-xl bg-white border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <Library className="w-3.5 h-3.5 text-teal-500" />
                    <span className="text-[10px] font-mono text-slate-400">TERM {String(i + 1).padStart(3, '0')}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">{term}</p>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}