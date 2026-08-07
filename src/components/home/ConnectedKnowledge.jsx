import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Library, GraduationCap, Code2, BookMarked, FileText, Sparkles, Network } from 'lucide-react';
import Reveal from '@/components/animations/Reveal';
import StaggerGroup from '@/components/animations/StaggerGroup';
import { platformLinks } from '@/lib/platformLinks';

const cards = [
  { icon: Network, title: 'Topics', desc: 'Explore canonical blockchain concepts and their relationships.', to: '/library', external: platformLinks.topicsCatalog },
  { icon: Library, title: 'Glossary', desc: 'Browse structured definitions across blockchain, Web3, DeFi, infrastructure, security, enterprise technology, and AI.', to: '/glossary' },
  { icon: GraduationCap, title: 'Learning', desc: 'Follow structured learning paths from foundational concepts to advanced infrastructure.', to: '/learn', external: platformLinks.learningPath },
  { icon: Code2, title: 'Developer Resources', desc: 'Move from concepts into architecture, code examples, APIs, RPC, smart contracts, and integrations.', to: '/developers', external: platformLinks.developersOverview },
  { icon: BookMarked, title: 'Books', desc: 'Discover long-form learning resources connected directly to relevant concepts.', to: '/books', external: platformLinks.booksCatalog },
  { icon: FileText, title: 'Research', desc: 'Explore technical and academic research connected to the wider knowledge graph.', to: '/research', external: platformLinks.researchCatalog },
  { icon: Sparkles, title: 'AI Resources', desc: 'Use structured prompt patterns and AI-ready knowledge resources.', to: '/ai-assistant', external: platformLinks.aiLearning },
  { icon: Network, title: 'Knowledge Graph', desc: 'Discover how blockchain concepts relate to one another.', to: '/knowledge-platform', external: platformLinks.knowledgeGraph },
];

function Card({ item }) {
  return (
    <article className="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-300 h-full flex flex-col">
      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
        <item.icon className="w-5 h-5 text-blue-600" />
      </div>
      <h3 className="font-bold text-slate-900 tracking-tight mb-1.5">{item.title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-3">{item.desc}</p>
      <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:text-blue-700">
        Explore <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </span>
    </article>
  );
}

export default function ConnectedKnowledge() {
  return (
    <section className="border-b border-slate-100 bg-white">
      <div className="container-tbl py-16 sm:py-20">
        <Reveal>
          <div className="max-w-3xl mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">One Platform. Connected Knowledge.</h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              Blockchain knowledge is scattered across documentation, white papers, tutorials, research, books,
              repositories, and thousands of websites. The Blockchain Library brings those pieces together through a
              structured Knowledge Engine that connects concepts instead of treating every page as an isolated resource.
            </p>
          </div>
        </Reveal>
        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c) => {
            const inner = <Card item={c} />;
            return c.external ? (
              <a key={c.title} href={c.external} target="_blank" rel="noopener noreferrer" className="block h-full">{inner}</a>
            ) : (
              <Link key={c.title} to={c.to} className="block h-full">{inner}</Link>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}