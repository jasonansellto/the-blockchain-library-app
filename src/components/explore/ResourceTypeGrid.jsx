import React from 'react';
import { BookOpen, FileText, BookMarked, GraduationCap, Map, Code, Terminal, Server } from 'lucide-react';

const RESOURCE_TYPES = [
  { type: 'glossary', label: 'Glossary', icon: BookOpen, desc: 'Definitions and explanations' },
  { type: 'article', label: 'Topics', icon: FileText, desc: 'In-depth articles and guides' },
  { type: 'book', label: 'Books', icon: BookMarked, desc: 'Comprehensive books and series' },
  { type: 'research', label: 'Research', icon: GraduationCap, desc: 'Academic papers and reports' },
  { type: 'learning-path', label: 'Learning Paths', icon: Map, desc: 'Structured learning journeys' },
  { type: 'resource', label: 'Developer Resources', icon: Code, desc: 'Tools, SDKs, and documentation' },
  { type: 'code-snippet', label: 'Code Examples', icon: Terminal, desc: 'Reusable code snippets' },
  { type: 'rpc', label: 'RPC Infrastructure', icon: Server, desc: 'Network endpoints and providers' },
];

export default function ResourceTypeGrid({ typeCounts, onTypeClick }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {RESOURCE_TYPES.map(rt => {
        const Icon = rt.icon;
        const count = typeCounts[rt.type] || 0;
        return (
          <div key={rt.type} onClick={() => onTypeClick(rt.type)} role="button" tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onTypeClick(rt.type)}
            className="group p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors shrink-0">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-slate-900 text-sm group-hover:text-blue-600">{rt.label}</h4>
                <p className="text-lg font-bold text-slate-700">{count.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500">{rt.desc}</p>
          </div>
        );
      })}
    </div>
  );
}