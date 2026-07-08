import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Github, Rss } from 'lucide-react';

const footerSections = [
  {
    title: 'Learn',
    links: [
      { label: 'Learning Paths', path: '/learn' },
      { label: 'Article Library', path: '/library' },
      { label: 'Glossary', path: '/glossary' },
      { label: 'Books', path: '/books' },
      { label: 'Research', path: '/research' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Developer Hub', path: '/developers' },
      { label: 'Tools', path: '/tools' },
      { label: 'News & Insights', path: '/news' },
      { label: 'AI Assistant', path: '/ai-assistant' },
      { label: 'Categories', path: '/library' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', path: '/about' },
      { label: 'Contact', path: '/contact' },
      { label: 'Authors', path: '/authors' },
      { label: 'Submit Content', path: '/contact' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="container-tbl py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <img src="https://media.base44.com/images/public/6a4cfcf76d7d1bf88148c979/e03f7646e_blockchain-library-icon.png" alt="The Blockchain Library" className="w-9 h-9 rounded-lg" />
              <span className="font-bold text-[15px] text-white tracking-tight">
                The Blockchain Library
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-5">
              The definitive educational resource for blockchain, cryptocurrency, Web3,
              AI, and decentralized technology. Accurate, neutral, and evergreen.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"><Linkedin className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"><Github className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"><Rss className="w-4 h-4" /></a>
            </div>
          </div>
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-sm text-slate-400 hover:text-teal-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © 2026 The Blockchain Library. Educational content for the decentralized world.
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