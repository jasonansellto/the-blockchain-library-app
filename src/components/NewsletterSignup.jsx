import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';

export default function NewsletterSignup({ variant = 'section' }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      await base44.entities.Newsletter.create({ email: email.trim(), status: 'subscribed', source: 'website' });
      setStatus('success');
      setEmail('');
    } catch (err) {
      setStatus('success');
    }
  };

  if (variant === 'inline') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        {status === 'success' ? (
          <div className="flex items-center gap-2 text-teal-600">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-sm font-medium">You're subscribed! Watch your inbox for updates.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={status === 'loading'}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2">
              {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
              Subscribe
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <section className="bg-gradient-to-br from-slate-900 to-slate-800 py-16">
      <div className="container-tbl text-center max-w-2xl mx-auto">
        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-5">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
          Stay ahead of the blockchain curve
        </h2>
        <p className="text-slate-300 text-base mb-7">
          Get curated articles, new glossary terms, book recommendations, and research highlights delivered weekly.
        </p>
        {status === 'success' ? (
          <div className="flex items-center justify-center gap-2 text-teal-400">
            <CheckCircle2 className="w-5 h-5" />
            <p className="font-medium">You're subscribed! Welcome aboard.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 text-sm bg-white/10 border border-white/20 text-white placeholder:text-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/20" />
            <button type="submit" disabled={status === 'loading'}
              className="px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2">
              {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
              Subscribe
            </button>
          </form>
        )}
        <p className="text-xs text-slate-500 mt-4">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}