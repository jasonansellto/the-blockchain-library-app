import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { Bot, User, BookOpen, ArrowRight, Terminal } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-fast`}>
      {!isUser && (
        <div className="relative shrink-0 mt-1">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg blur-sm opacity-50" />
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center ring-1 ring-white/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        {isUser ? (
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-md px-4 py-3 text-sm font-medium shadow-lg shadow-blue-600/20 ring-1 ring-blue-400/20">
            {message.content}
          </div>
        ) : (
          <div className="bg-white/[0.04] border border-white/10 rounded-2xl rounded-tl-md px-4 py-3 backdrop-blur-sm shadow-lg">
            <div className="prose-tbl-invert text-sm">
              <ReactMarkdown>{message.content || ''}</ReactMarkdown>
            </div>
            {message.sources?.length > 0 && (
              <div className="mt-4 pt-3 border-t border-white/5">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400/80 uppercase tracking-wider mb-2 font-mono">
                  <BookOpen className="w-3.5 h-3.5" /> sources_from_library
                </p>
                <div className="space-y-1.5">
                  {message.sources.map((s, i) => (
                    <Link key={i} to={`/article/${s.slug}`}
                      className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 group transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 shrink-0 group-hover:bg-cyan-400" />
                      <span className="line-clamp-1 group-hover:underline">{s.title}</span>
                      <ArrowRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-1 ring-1 ring-white/10">
          <User className="w-5 h-5 text-slate-300" />
        </div>
      )}
    </div>
  );
}