import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Github, Rss, ExternalLink } from 'lucide-react';
import { platformLinks } from '@/lib/platformLinks';

const footerSections = [
  {
    title: 'Learn',
    links: [
      { label: 'Getting Started', href: platformLinks.quickstart, external: true },
      { label: 'Learning Paths', path: '/learn' },
      { label: 'Topics', path: '/library' },
      { label: 'Glossary', path: '/glossary' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Knowledge Explorer', path: '/explore' },
      { label: 'Knowledge Engine', path: '/knowledge-engine' },
      { label: 'Knowledge Graph', href: platformLinks.knowledgeGraph, external: true },
      { label: 'Books', path: '/books' },
      { label: 'Research', path: '/research' },
    ],
  },
  {
    title: 'Build',
    links: [
      { label: 'Developer Resources', path: '/developers' },
      { label: 'Code Examples', path: '/developers/snippets' },
      { label: 'API Reference', path: '/developers/api' },
      { label: 'RPC Directory', path: '/developers/rpc' },
    ],
  },
  {
    title: 'Project',
    links: [
      { label: 'GitHub', href: platformLinks.github, external: true },
      { label: 'Vision', href: platformLinks.vision, external: true },
      { label: 'Roadmap', href: platformLinks.roadmap, external: true },
      { label: 'Contributing', href: platformLinks.contributing, external: true },
    ],
  },
];

function FooterLink({ link }) {
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-teal-400 transition-colors">
        {link.label} <ExternalLink className="w-3 h-3 opacity-60" />
      </a>
    );
  }
  return (
    <Link to={link.path} className="text-sm text-slate-400 hover:text-teal-400 transition-colors">
      {link.label}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="container-tbl py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src="https://media.base44.com/images/public/6a4cfcf76d7d1bf88148c979/e03f7646e_blockchain-library-icon.png" alt="The Blockchain Library" className="w-9 h-9 rounded-lg" />
              <span className="font-bold text-[15px] text-white tracking-tight">
                The Blockchain Library
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-5">
              The Blockchain Library is an open knowledge platform for blockchain technology —
              structured, connected, and built for humans and AI.
            </p>
            <div className="space-y-1.5 text-xs text-slate-500 mb-5">
              <a href="https://theblockchainlibrary.com" className="block hover:text-slate-300 transition-colors">theblockchainlibrary.com</a>
              <a href="https://docs.theblockchainlibrary.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-slate-300 transition-colors">
                docs.theblockchainlibrary.com <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex items-center gap-3">
              <a href={platformLinks.github} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"><Github className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"><Linkedin className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"><Rss className="w-4 h-4" /></a>
            </div>
          </div>
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © 2026 The Blockchain Library. Open knowledge for the decentralized world.
          </p>
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <Link to="/privacy" className="hover:text-slate-300">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-300">Terms &amp; Conditions</Link>
            <Link to="/cookies" className="hover:text-slate-300">Cookie Policy</Link>
            <Link to="/disclaimer" className="hover:text-slate-300">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}