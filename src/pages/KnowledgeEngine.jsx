import React from 'react';
import { ArrowRight, Cpu, FileText, Search, Network, GraduationCap, BookMarked, FileSearch, Sparkles, Server, Hash } from 'lucide-react';
import Seo from '@/components/Seo';
import { buildBreadcrumbSchema, buildOrganizationSchema } from '@/lib/seoSchemas';
import { platformLinks } from '@/lib/platformLinks';

const outputs = [
  { icon: FileText, label: 'Documentation', desc: 'Canonical objects render into structured documentation pages.' },
  { icon: Search, label: 'Search', desc: 'Stable identities make knowledge searchable across the platform.' },
  { icon: Network, label: 'Knowledge Graph', desc: 'Explicit relationships connect every concept to related knowledge.' },
  { icon: GraduationCap, label: 'Learning', desc: 'Learning paths thread through connected canonical objects.' },
  { icon: BookMarked, label: 'Books', desc: 'Long-form resources link directly to relevant topics.' },
  { icon: FileSearch, label: 'Research', desc: 'Research papers sit inside the wider knowledge graph.' },
  { icon: Sparkles, label: 'AI', desc: 'Structured knowledge supports AI assistants and retrieval.' },
  { icon: Server, label: 'Future APIs', desc: 'The same objects are designed to power future APIs.' },
];

export default function KnowledgeEngine() {
  const schemas = [
    buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Knowledge Engine', url: '/knowledge-engine' }]),
    buildOrganizationSchema(),
  ];

  return (
    <div>
      <Seo title="Blockchain Knowledge Engine | The Blockchain Library" description="The Blockchain Library Knowledge Engine organizes information into canonical knowledge objects with stable identities and explicit relationships — powering documentation, search, the knowledge graph, learning, research, and AI." schemas={schemas} />

      <section className="border-b border-slate-100 bg-gradient-to-b from-blue-50/70 via-slate-50 to-white">
        <div className="container-tbl py-16 sm:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-5">
              <Cpu className="w-3.5 h-3.5" /> The core of the platform
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-5 leading-[1.1]">The Blockchain Knowledge Engine</h1>
            <p className="text-lg text-slate-500 leading-relaxed mb-8">
              At the center of The Blockchain Library is a structured Knowledge Engine. Instead of treating blockchain
              education as disconnected pages, the platform organizes information into canonical knowledge objects
              with stable identities and explicit relationships.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={platformLinks.knowledgeEngine} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md">
                Read the full documentation <ArrowRight className="w-4 h-4" />
              </a>
              <a href={platformLinks.architecture} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
                View the Architecture
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-100 bg-white">
        <div className="container-tbl py-16">
          <div className="max-w-3xl mb-10">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">How Canonical Objects Power the Platform</h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Each topic, glossary term, book, research paper, tutorial, and code example is a canonical knowledge
              object. The Knowledge Engine reads those objects and powers every surface of the platform — so the
              same knowledge serves humans, search, developers, and AI.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {outputs.map((o) => (
              <div key={o.label} className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-4">
                  <o.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1.5">{o.label}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{o.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold mb-6">
              <Hash className="w-4 h-4" /> Canonical Knowledge Objects
            </div>
            <div className="w-px h-8 bg-slate-300 mx-auto mb-2" />
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold mb-6">
              <Cpu className="w-4 h-4" /> Knowledge Engine
            </div>
            <p className="text-slate-500 mb-8">One structured core. Every surface of the platform. Built for humans and AI.</p>
            <a href={platformLinks.knowledgeEngine} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              Explore the Knowledge Engine <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}