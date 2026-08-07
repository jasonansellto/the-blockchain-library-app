import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Cpu, Network, Hash, GitBranch, GraduationCap, Code2, BookMarked, FileText, Sparkles, Server, Search, BookOpen, Layers } from 'lucide-react';
import Seo from '@/components/Seo';
import { buildBreadcrumbSchema, buildOrganizationSchema } from '@/lib/seoSchemas';
import { platformLinks } from '@/lib/platformLinks';

const sections = [
  { icon: Cpu, title: 'The Knowledge Engine', desc: 'A structured core that organizes information into canonical knowledge objects with stable identities and explicit relationships — instead of disconnected pages.' },
  { icon: Hash, title: 'Canonical Knowledge Objects', desc: 'Every topic, glossary term, book, research paper, tutorial, and code example has a stable identity and explicit links to related knowledge.' },
  { icon: Network, title: 'Knowledge Graph', desc: 'Concepts connect to definitions, research, books, and code — so you can trace any idea through the full knowledge graph.' },
  { icon: GraduationCap, title: 'Learning', desc: 'Structured learning paths take you from foundational concepts to advanced infrastructure, with every step connected.' },
  { icon: Code2, title: 'Developers', desc: 'Move from concepts into architecture, code examples, RPC infrastructure, smart contracts, and integrations.' },
  { icon: BookMarked, title: 'Books & Research', desc: 'Long-form resources and technical research are connected directly to relevant topics rather than sitting in isolation.' },
  { icon: Sparkles, title: 'AI-Ready Architecture', desc: 'The same canonical knowledge supports human learning, search, developer tools, AI assistants, and future applications.' },
  { icon: GitBranch, title: 'Open Source', desc: 'The Knowledge Engine, data model, generators, and governance are developed openly on GitHub.' },
];

const futureApis = [
  { icon: Search, label: 'Search' },
  { icon: BookOpen, label: 'Documentation' },
  { icon: Network, label: 'Knowledge Graph' },
  { icon: GraduationCap, label: 'Learning' },
  { icon: FileText, label: 'Research' },
  { icon: Sparkles, label: 'AI' },
  { icon: Server, label: 'Future APIs' },
];

export default function KnowledgePlatform() {
  const schemas = [
    buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Knowledge Platform', url: '/knowledge-platform' }]),
    buildOrganizationSchema(),
  ];

  return (
    <div>
      <Seo title="The Blockchain Knowledge Platform | The Blockchain Library" description="Explore The Blockchain Library, an open, structured and AI-ready knowledge platform connecting blockchain topics, definitions, tutorials, books, research, developer resources and learning paths." schemas={schemas} />

      <section className="border-b border-slate-100 bg-gradient-to-b from-blue-50/70 via-slate-50 to-white">
        <div className="container-tbl py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-5">
            <Layers className="w-3.5 h-3.5" /> The open knowledge platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-5 max-w-3xl mx-auto leading-[1.1]">The Blockchain Knowledge Platform</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            An open, structured, AI-ready platform that connects blockchain topics, glossary definitions, tutorials,
            books, research, developer resources, and learning paths — powered by a central Knowledge Engine.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href={platformLinks.knowledgeEngine} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md">
              Explore the Knowledge Engine <ArrowRight className="w-4 h-4" />
            </a>
            <a href={platformLinks.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-100 bg-white">
        <div className="container-tbl py-16">
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">What Is The Blockchain Library?</h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              The Blockchain Library is no longer simply a collection of blockchain articles. It is an open-source,
              structured, AI-ready blockchain knowledge platform. The main website is the public gateway where you
              discover, learn, and understand the ecosystem. Deep documentation, topic catalogs, and developer
              reference live on the docs subdomain, and the platform itself is built openly on GitHub.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {sections.map((s) => (
              <div key={s.title} className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1.5">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-16">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">The Future Knowledge API</h2>
            <p className="text-lg text-slate-500 leading-relaxed mb-8">
              The same canonical knowledge is designed to power search, the knowledge graph, learning, research,
              AI assistants, and future APIs. The Knowledge API is part of the project roadmap — not all capabilities
              are publicly available yet.
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto mb-8">
              {futureApis.map((f) => (
                <span key={f.label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600">
                  <f.icon className="w-3.5 h-3.5 text-blue-600" /> {f.label}
                </span>
              ))}
            </div>
            <a href={platformLinks.roadmap} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors">
              View the Roadmap <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="container-tbl py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-4">Start exploring the platform</h2>
          <p className="text-slate-500 mb-8 max-w-xl mx-auto">Begin with the fundamentals, browse the glossary, or move straight into developer resources.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/learn" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Start Learning <ArrowRight className="w-4 h-4" /></Link>
            <Link to="/glossary" className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">Browse Glossary</Link>
            <Link to="/developers" className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">Developer Resources</Link>
          </div>
        </div>
      </section>
    </div>
  );
}