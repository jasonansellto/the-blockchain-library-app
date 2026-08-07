import React from 'react';
import { ArrowRight, Hash, BookOpen, FileText, GraduationCap, Code2, Sparkles, HelpCircle, Network } from 'lucide-react';
import Reveal from '@/components/animations/Reveal';
import StaggerGroup from '@/components/animations/StaggerGroup';
import { platformLinks } from '@/lib/platformLinks';

const structured = [
  { icon: Hash, label: 'Topic IDs' },
  { icon: BookOpen, label: 'Definitions' },
  { icon: Network, label: 'Relationships' },
  { icon: BookOpen, label: 'Books' },
  { icon: FileText, label: 'Research' },
  { icon: GraduationCap, label: 'Tutorials' },
  { icon: Code2, label: 'Code Examples' },
  { icon: Sparkles, label: 'AI Prompts' },
  { icon: HelpCircle, label: 'Quizzes' },
  { icon: GraduationCap, label: 'Learning Paths' },
];

export default function AiReadySection() {
  return (
    <section className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
      <div className="container-tbl py-16 sm:py-20">
        <Reveal>
          <div className="max-w-3xl mb-12">
            <p className="text-xs font-semibold text-violet-600 uppercase tracking-widest mb-2">AI-ready knowledge</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">Built for Humans — Structured for AI</h2>
            <p className="text-lg text-slate-500 leading-relaxed">
              The Blockchain Library is designed so the same canonical knowledge can support human learning, search,
              developer tools, AI assistants, and future applications.
            </p>
          </div>
        </Reveal>
        <StaggerGroup className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
          {structured.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-slate-200 text-center">
              <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                <s.icon className="w-4 h-4 text-violet-600" />
              </div>
              <span className="text-xs font-medium text-slate-700">{s.label}</span>
            </div>
          ))}
        </StaggerGroup>
        <Reveal>
          <p className="text-sm text-slate-400 mb-5 max-w-2xl">
            The Knowledge API and AI Tutor are designed to support future applications and are part of the project roadmap —
            not all capabilities are publicly available yet.
          </p>
          <a href={platformLinks.aiLearning} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors">
            AI &amp; Knowledge Architecture <ArrowRight className="w-4 h-4" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}