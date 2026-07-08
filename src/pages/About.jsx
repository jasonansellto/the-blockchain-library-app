import React from 'react';
import { BookOpen, Target, Heart, Users, Award, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import Seo from '@/components/Seo';
import { buildBreadcrumbSchema } from '@/lib/seoSchemas';

export default function About() {
  const schemas = [buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'About', url: '/about' }])];

  return (
    <div>
      <Seo title="About The Blockchain Library" description="The definitive educational resource for blockchain, cryptocurrency, Web3, and decentralized technology — built to inform, not to sell." schemas={schemas} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-12">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3"><span>Home</span><span>/</span><span className="text-slate-700 font-medium">About</span></div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">About The Blockchain Library</h1>
          <p className="text-slate-500 max-w-2xl text-lg">The definitive educational resource for blockchain, cryptocurrency, Web3, and decentralized technology — built to inform, not to sell.</p>
        </div>
      </div>

      <div className="container-tbl py-12 max-w-4xl">
        <div className="prose-tbl mb-12">
          <h2>Our Mission</h2>
          <p>The Blockchain Library exists to educate. We believe blockchain and decentralized technology represent a fundamental shift in how the world organizes trust, value, and coordination — and that understanding these systems should be accessible to everyone, regardless of technical background.</p>
          <p>We are not a blog, a news site, or a marketing platform. We are a structured knowledge library modeled after the depth and quality of Investopedia, MDN Web Docs, and Wikipedia — but focused entirely on blockchain and emerging technology.</p>

          <h2>Content Philosophy</h2>
          <p>Every piece of content on this platform adheres to strict editorial standards:</p>
          <ul>
            <li><strong>Accurate</strong> — technically correct and verified by domain experts</li>
            <li><strong>Neutral</strong> — educational, never promotional or marketing material</li>
            <li><strong>Well-referenced</strong> — claims are backed by primary sources, research, and documentation</li>
            <li><strong>Beginner-friendly</strong> — complex concepts explained from first principles</li>
            <li><strong>Evergreen</strong> — continuously updated as the technology evolves</li>
            <li><strong>Interconnected</strong> — every article links to glossary terms, books, research, and related content through our knowledge graph</li>
          </ul>

          <h2>Editorial Independence</h2>
          <p>When real-world implementations are discussed — including Ethereum, Bitcoin, Solana, Cosmos, and others — they are presented as examples within educational content, not as endorsements. Our monetization through affiliate links and premium memberships never influences editorial coverage or rankings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: Target, title: 'Accuracy First', desc: 'Every article is reviewed for technical correctness before publication.' },
            { icon: Shield, title: 'Neutral & Objective', desc: 'No paid placements. No promotional content disguised as education.' },
            { icon: Award, title: 'Expert Reviewed', desc: 'Content is authored and reviewed by practitioners and researchers.' },
            { icon: Users, title: 'Community Driven', desc: 'Authors, editors, and researchers contribute across specialties.' },
            { icon: Heart, title: 'Accessible', desc: 'Free to read. Premium features enhance, never gate, core learning.' },
            { icon: BookOpen, title: 'Evergreen', desc: 'Content is continuously updated as the technology evolves.' },
          ].map(v => (
            <div key={v.title} className="p-6 bg-white border border-slate-200 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4"><v.icon className="w-5 h-5 text-blue-600" /></div>
              <h3 className="font-bold text-slate-900 mb-1.5">{v.title}</h3>
              <p className="text-sm text-slate-500">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Join the knowledge library</h2>
          <p className="text-slate-300 mb-6 max-w-lg mx-auto">Start learning today, or contribute your expertise as an author or editor.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/learn" className="px-6 py-3 text-sm font-semibold bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors">Start Learning</Link>
            <Link to="/contact" className="px-6 py-3 text-sm font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">Contribute Content</Link>
          </div>
        </div>
      </div>
    </div>
  );
}