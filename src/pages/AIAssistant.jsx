import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Send, Sparkles, Loader2, MessageSquare, Trash2, ChevronRight } from 'lucide-react';
import ChatMessage from '@/components/ai/ChatMessage';

const SUGGESTIONS = [
  'What is blockchain and how does it work?',
  'Explain smart contracts simply',
  'What is DeFi and how is it different from traditional finance?',
  'How do cryptographic hash functions work?',
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const buildHistory = () => {
    return messages
      .filter(m => m.content)
      .slice(-6)
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.substring(0, 500)}`)
      .join('\n');
  };

  const ask = async (question) => {
    if (!question.trim() || loading) return;
    const userMsg = { role: 'user', content: question.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await base44.functions.invoke('askAssistant', {
        question: question.trim(),
        history: messages.length > 0 ? buildHistory() : null,
      });
      const data = res.data || res;
      if (data.error) throw new Error(data.error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${e.message}. Please try again.`,
        sources: [],
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    ask(input);
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 4rem)' }}>
      {/* Header */}
      <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="container-tbl py-8">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-3">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">AI Assistant</span>
          </nav>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Blockchain AI Assistant</h1>
              <p className="text-sm text-slate-500">Ask anything about blockchain, crypto, and Web3 — answers synthesized from our library</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="container-tbl flex-1 flex flex-col py-6 max-w-3xl w-full">
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto pb-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center mx-auto mb-5">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Ask me anything</h2>
              <p className="text-sm text-slate-500 mb-8 max-w-md mx-auto">I'll search through our library of expert articles and synthesize a clear, accurate answer for you.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => ask(s)}
                    className="text-left p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all text-sm text-slate-700 hover:text-blue-600">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <ChatMessage key={i} message={m} />
          ))}

          {loading && (
            <div className="flex gap-3 justify-start animate-fade-in-fast">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center shrink-0 mt-1">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span>Searching the library</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        {messages.length > 0 && (
          <div className="flex justify-end mb-3">
            <button onClick={clearChat} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Clear conversation
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about blockchain, crypto, Web3..."
            disabled={loading}
            className="w-full pl-4 pr-14 py-4 text-base bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 shadow-sm"
          />
          <button type="submit" disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}