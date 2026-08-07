import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Share2 } from 'lucide-react';
import Reveal from '@/components/animations/Reveal';

export default function ExplorerSection() {
  return (
    <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="container-tbl py-20">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-4">
              <Share2 className="w-3.5 h-3.5" /> Knowledge Explorer
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Explore Connected Blockchain Knowledge</h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              Blockchain concepts do not exist in isolation. Explore how thousands of definitions, technologies, research papers, books, developer resources and learning materials connect through The Blockchain Library Knowledge Graph.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/explore" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                Open Knowledge Explorer <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/glossary" className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <BookOpen className="w-4 h-4" /> Browse the Glossary
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}