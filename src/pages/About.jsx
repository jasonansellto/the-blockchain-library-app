import React from 'react';
import { Target, Network, Cpu, Users, GitBranch, BookOpen, ArrowRight, Github, FileCode2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '@/components/Seo';
import { buildBreadcrumbSchema, buildOrganizationSchema } from '@/lib/seoSchemas';
import { platformLinks } from '@/lib/platformLinks';

export default function About() {
  const schemas = [
    buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }]),
    buildOrganizationSchema(),
  ];

  return (
    <div>
      <Seo title="About The Blockchain Library" description="The Blockchain Library exists to build an open, structured, AI-ready knowledge platform for blockchain technology — connecting topics, glossary, books, research, and learning." schemas={schemas} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-12">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3"><span>Home</span><span>/</span><span className="text-slate-700 font-medium">About</span></div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">About The Blockchain Library</h1>
          <p className="text-slate-500 max-w-2xl text-lg">An open, structured, AI-ready knowledge platform for blockchain technology.</p>
        </div>
      </div>

      <div className="container-tbl py-12 max-w-4xl">
        <div className="prose-tbl mb-12">
          <h2>Our Mission</h2>
          <p>The Blockchain Library exists to build an open, structured, AI-ready knowledge platform for blockchain technology. We believe blockchain represents a fundamental shift in how the world organizes trust, value, and coordination — and that understanding these systems should be accessible to everyone, regardless of technical background.</p>
          <p>We are not a blog, a news site, or a marketing platform. We are a structured knowledge platform that connects concepts instead of treating every page as an isolated resource.</p>

          <h2>Why Structured Knowledge Matters</h2>
          <p>Blockchain knowledge is fragmented. It is scattered across documentation, white papers, tutorials, research, books, repositories, and thousands of websites. A beginner searching for "what is a smart contract" will find a dozen contradictory definitions, a developer looking for the ERC-20 standard will wade through blog posts before reaching the specification, and a researcher tracing the lineage of zero-knowledge proofs will jump between disconnected PDFs.</p>
          <p>Structured knowledge solves this. Instead of isolated pages, The Blockchain Library organizes information into canonical knowledge objects with stable identities and explicit relationships — so every concept links to its definitions, related terms, research, books, and code.</p>

          <h2>Canonical Knowledge Objects</h2>
          <p>At the center of the platform is a Knowledge Engine built on canonical knowledge objects. Each topic, glossary term, book, research paper, tutorial, code example, and learning path has a stable identity and explicit relationships to the others. This is what makes the knowledge graph possible — and what makes the same knowledge usable by humans, search, developer tools, and AI systems.</p>

          <h2>Who the Platform Serves</h2>
          <ul>
            <li><strong>Beginners</strong> learning blockchain from first principles</li>
            <li><strong>Developers</strong> building with code examples, RPC infrastructure, and standards</li>
            <li><strong>Researchers</strong> exploring technical and academic work</li>
            <li><strong>Educators</strong> assembling structured learning paths</li>
            <li><strong>Businesses</strong> understanding enterprise blockchain and infrastructure</li>
            <li><strong>Technical writers</strong> contributing accurate, neutral content</li>
            <li><strong>AI systems</strong> consuming structured, connected knowledge</li>
          </ul>

          <h2>Why Open Source</h2>
          <p>The Blockchain Library is developed openly on GitHub. The repository includes the Knowledge Engine, canonical data model, documentation, validation tools, generation pipelines, learning resources, governance, architecture, editorial standards, and project roadmap. Open development keeps the knowledge accountable, verifiable, and community-driven.</p>

          <h2>Long-Term Vision</h2>
          <p>The main website is the public gateway to the ecosystem — where you discover, learn, and understand. The documentation site holds the deep reference material, topic catalogs, and developer documentation. GitHub is where the platform is built, inspected, and contributed to. Over time, the same canonical knowledge will power search, the knowledge graph, learning, research, AI assistants, and future APIs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Target, title: 'Structured, Not Scattered', desc: 'Canonical objects with stable identities and explicit relationships.' },
            { icon: Cpu, title: 'Knowledge Engine', desc: 'A core engine that powers documentation, search, the graph, and learning.' },
            { icon: Network, title: 'Connected Knowledge', desc: 'Every concept links to definitions, research, books, and code.' },
            { icon: Users, title: 'For Everyone', desc: 'Beginners, developers, researchers, educators, businesses, and AI.' },
            { icon: GitBranch, title: 'Open Source', desc: 'Built openly on GitHub with public architecture and roadmap.' },
            { icon: BookOpen, title: 'Evergreen', desc: 'Continuously updated as the technology evolves.' },
          ].map(v => (
            <div key={v.title} className="p-6 bg-white border border-slate-200 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4"><v.icon className="w-5 h-5 text-blue-600" /></div>
              <h3 className="font-bold text-slate-900 mb-1.5">{v.title}</h3>
              <p className="text-sm text-slate-500">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <a href={platformLinks.vision} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-200 hover:shadow-md transition-all">
            <Eye className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">Vision</p>
              <p className="text-xs text-slate-400">Read the project vision</p>
            </div>
          </a>
          <a href={platformLinks.architecture} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-200 hover:shadow-md transition-all">
            <FileCode2 className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">Architecture</p>
              <p className="text-xs text-slate-400">How the Knowledge Engine works</p>
            </div>
          </a>
          <a href={platformLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-200 hover:shadow-md transition-all">
            <Github className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold text-slate-900 text-sm">GitHub</p>
              <p className="text-xs text-slate-400">Explore the repository</p>
            </div>
          </a>
        </div>

        <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Join the open knowledge platform</h2>
          <p className="text-slate-300 mb-6 max-w-lg mx-auto">Start learning today, or contribute your expertise as an author, editor, or developer.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/learn" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">
              Start Learning <ArrowRight className="w-4 h-4" />
            </Link>
            <a href={platformLinks.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
              <Github className="w-4 h-4" /> Contribute
            </a>
            <Link to="/contact" className="inline-flex items-center px-6 py-3 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}