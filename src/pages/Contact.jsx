import React, { useState } from 'react';
import { Mail, MessageSquare, Send, Loader2, CheckCircle2, MapPin } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setTimeout(() => setStatus('success'), 1200);
  };

  return (
    <div>
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-12">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3"><span>Home</span><span>/</span><span className="text-slate-700 font-medium">Contact</span></div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">Contact Us</h1>
          <p className="text-slate-500 max-w-2xl">Questions, feedback, content submissions, or partnership inquiries — we'd love to hear from you.</p>
        </div>
      </div>

      <div className="container-tbl py-12 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="p-5 bg-white border border-slate-200 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3"><Mail className="w-5 h-5 text-blue-600" /></div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">General Inquiries</h3>
              <p className="text-sm text-slate-500">For questions about content or the platform.</p>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center mb-3"><MessageSquare className="w-5 h-5 text-teal-600" /></div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">Content Submissions</h3>
              <p className="text-sm text-slate-500">Authors and editors interested in contributing.</p>
            </div>
            <div className="p-5 bg-white border border-slate-200 rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-3"><MapPin className="w-5 h-5 text-slate-600" /></div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">Remote-First</h3>
              <p className="text-sm text-slate-500">Contributors from around the world.</p>
            </div>
          </div>

          <div className="md:col-span-2">
            {status === 'success' ? (
              <div className="p-8 bg-teal-50 border border-teal-200 rounded-xl text-center">
                <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Message sent!</h3>
                <p className="text-sm text-slate-600">Thanks for reaching out. We'll get back to you soon.</p>
                <button onClick={() => { setStatus('idle'); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  className="mt-4 text-sm font-medium text-blue-600 hover:underline">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Name</label>
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email</label>
                    <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Subject</label>
                  <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Message</label>
                  <textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <button type="submit" disabled={status === 'loading'}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-60">
                  {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}