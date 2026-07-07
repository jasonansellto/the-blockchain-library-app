import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { Bot, User, BookOpen, ArrowRight } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in-fast`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shrink-0 mt-1">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
        {isUser ? (
          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-3 text-sm font-medium">
            {message.content}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3">
            <div className="prose-tbl text-sm">
              <ReactMarkdown>{message.content || ''}</ReactMarkdown>
            </div>
            {message.sources?.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                  <BookOpen className="w-3.5 h-3.5" /> Sources from the Library
                </p>
                <div className="space-y-1.5">
                  {message.sources.map((s, i) => (
                    <Link key={i} to={`/article/${s.slug}`}
                      className="flex items-center gap-2 text-xs text-slate-600 hover:text-blue-600 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                      <span className="line-clamp-1 group-hover:underline">{s.title}</span>
                      <ArrowRight className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center shrink-0 mt-1">
          <User className="w-5 h-5 text-slate-600" />
        </div>
      )}
    </div>
  );
}