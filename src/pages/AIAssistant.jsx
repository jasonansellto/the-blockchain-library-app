import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, Trash2, ChevronRight, Cpu, Zap, Terminal, BrainCircuit } from 'lucide-react';
import ChatMessage from '@/components/ai/ChatMessage';

const SUGGESTIONS = [
  { icon: '🔐', text: 'What is blockchain and how does it work?' },
  { icon: '📜', text: 'Explain smart contracts simply' },
  { icon: '🏦', text: 'What is DeFi and how is it different from traditional finance?' },
  { icon: '#️⃣', text: 'How do cryptographic hash functions work?' },
  { icon: '⚡', text: 'What are layer-2 scaling solutions?' },
  { icon: '🌐', text: 'How does Web3 differ from Web2?' },
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
    <div className="relative flex flex-col min-h-[calc(100vh-4rem)] bg-[#060912] text-slate-200 overflow-hidden">
      {/* Ambient grid + glow background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(to_right,#1e3a5f_1px,transparent_1px),linear-gradient(to_bottom,#1e3a5f_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-24 w-[400px] h-[400px] bg-teal-500/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[300px] bg-indigo-700/10 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative border-b border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="container-tbl py-8">
          <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-4 font-mono">
            <Link to="/" className="hover:text-cyan-400 transition-colors">~</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-cyan-400">ai-assistant</span>
          </nav>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl blur-md opacity-60 animate-pulse" />
              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center ring-1 ring-white/20">
                <BrainCircuit className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Blockchain AI Assistant</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono ring-1 ring-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> online
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">Ask anything about blockchain, crypto, and Web3 — answers synthesized from our library</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="relative container-tbl flex-1 flex flex-col py-6 max-w-3xl w-full">
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto pb-4">
          {messages.length === 0 && (
            <div className="text-center py-10 animate-fade-in">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl blur-lg opacity-50" />
                <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400/20 to-blue-600/20 border border-white/10 flex items-center justify-center ring-1 ring-white/10">
                  <Cpu className="w-10 h-10 text-cyan-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Initialize your query</h2>
              <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto">I'll search through our library of expert articles and synthesize a clear, accurate answer for you.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => ask(s.text)}
                    className="group text-left p-4 bg-white/[0.03] border border-white/10 rounded-xl hover:border-cyan-400/40 hover:bg-white/[0.06] transition-all text-sm text-slate-300 hover:text-white flex items-start gap-3">
                    <span className="text-base shrink-0">{s.icon}</span>
                    <span className="group-hover:text-cyan-400 transition-colors">{s.text}</span>
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
              <div className="relative shrink-0 mt-1">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg blur-sm opacity-50" />
                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center ring-1 ring-white/20">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              </div>
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl rounded-tl-md px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-sm text-slate-400 font-mono">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>searching library</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        {messages.length > 0 && (
          <div className="flex justify-end mb-3">
            <button onClick={clearChat} className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-400 transition-colors font-mono">
              <Trash2 className="w-3.5 h-3.5" /> clear_session
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-teal-500/20 rounded-xl blur-md opacity-60" />
          <div className="relative flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-xl backdrop-blur-md focus-within:border-cyan-400/50 transition-colors shadow-lg">
            <span className="pl-4 text-cyan-400/60 font-mono text-sm select-none">$</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="ask about blockchain, crypto, web3..."
              disabled={loading}
              className="flex-1 py-4 pr-2 text-base bg-transparent text-white placeholder:text-slate-500 focus:outline-none disabled:opacity-50 font-body"
            />
            <button type="submit" disabled={loading || !input.trim()}
              className="m-1.5 w-10 h-10 flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-white rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ring-1 ring-white/20 shadow-lg shadow-blue-500/30">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </form>
        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-slate-600 font-mono">
          <Zap className="w-3 h-3 text-cyan-500/60" />
          <span>powered by the blockchain library knowledge graph</span>
        </div>
      </div>
    </div>
  );
}