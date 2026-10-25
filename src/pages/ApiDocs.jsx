import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Terminal, BookOpen } from 'lucide-react';
import Seo from '@/components/Seo';
import { buildBreadcrumbSchema } from '@/lib/seoSchemas';
import CodeBlock from '@/components/CodeBlock';

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/articles',
    desc: 'List published articles with optional filtering and pagination.',
    params: 'category_id, difficulty, sort, limit, skip',
    example: `curl -X GET "https://api.theblockchainlibrary.com/articles?limit=10&sort=-published_date" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    response: `{
  "results": [
    {
      "id": "...",
      "title": "What is Blockchain?",
      "slug": "what-is-blockchain",
      "summary": "A comprehensive guide...",
      "difficulty": "beginner",
      "reading_time": 8,
      "published_date": "2024-01-15"
    }
  ],
  "total": 1247
}`,
  },
  {
    method: 'GET',
    path: '/articles/:slug',
    desc: 'Retrieve a single article by its slug, including full body and metadata.',
    params: 'slug',
    example: `curl -X GET "https://api.theblockchainlibrary.com/articles/what-is-blockchain" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    response: `{
  "id": "...",
  "title": "What is Blockchain?",
  "slug": "what-is-blockchain",
  "body": "Full markdown content...",
  "key_takeaways": ["..."],
  "related_articles": ["..."]
}`,
  },
  {
    method: 'GET',
    path: '/glossary',
    desc: 'List glossary terms with optional category filtering.',
    params: 'category_id, difficulty, limit, skip',
    example: `curl -X GET "https://api.theblockchainlibrary.com/glossary?limit=20" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    response: `{
  "results": [
    {
      "title": "Smart Contract",
      "slug": "smart-contract",
      "definition": "A self-executing...",
      "difficulty": "beginner"
    }
  ]
}`,
  },
  {
    method: 'GET',
    path: '/search',
    desc: 'Full-text search across articles, glossary terms, books, and research papers.',
    params: 'q (required), type, limit',
    example: `curl -X GET "https://api.theblockchainlibrary.com/search?q=defi&type=article&limit=5" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    response: `{
  "query": "defi",
  "results": [
    {
      "type": "article",
      "title": "Understanding DeFi",
      "slug": "understanding-defi",
      "relevance": 0.95
    }
  ]
}`,
  },
];

export default function ApiDocs() {
  const schemas = [buildBreadcrumbSchema([{ name: 'Home', url: '/' }, { name: 'Developer Hub', url: '/developers' }, { name: 'API Docs', url: '/developers/api' }])];

  return (
    <div>
      <Seo title="REST API Documentation" description="Programmatic access to the Blockchain Library knowledge base — articles, glossary, books, research papers, and full-text search." schemas={schemas} />
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-10">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-3 flex-wrap">
            <Link to="/" className="hover:text-blue-600">Home</Link><ChevronRight className="w-3.5 h-3.5" />
            <Link to="/developers" className="hover:text-blue-600">Developer Hub</Link><ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">API Docs</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">REST API Documentation</h1>
          <p className="text-slate-500 max-w-2xl">Programmatic access to the Blockchain Library knowledge base. All endpoints return JSON and require an API key.</p>
        </div>
      </div>

      <div className="container-tbl py-10 max-w-4xl">
        {/* Overview */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4 tracking-tight">
            <Terminal className="w-5 h-5 text-blue-600" /> Getting Started
          </h2>
          <div className="space-y-4 text-sm text-slate-600">
            <p>The Blockchain Library API provides read access to our entire knowledge base — articles, glossary terms, books, and research papers — plus a full-text search endpoint.</p>
            <div>
              <p className="font-semibold text-slate-900 mb-2">Base URL</p>
              <CodeBlock code="https://api.theblockchainlibrary.com" language="text" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-2">Authentication</p>
              <p className="mb-2">All requests require an API key passed in the Authorization header:</p>
              <CodeBlock code={'Authorization: Bearer YOUR_API_KEY'} language="text" />
            </div>
          </div>
        </div>

        {/* Endpoints */}
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">Endpoints</h2>
        <div className="space-y-6">
          {ENDPOINTS.map((ep, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md ${ep.method === 'GET' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>{ep.method}</span>
                <code className="text-sm font-mono text-slate-900 font-semibold">{ep.path}</code>
              </div>
              <p className="text-sm text-slate-500 mb-4">{ep.desc}</p>
              {ep.params && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Parameters</p>
                  <p className="text-sm font-mono text-slate-700">{ep.params}</p>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Example Request</p>
                  <CodeBlock code={ep.example} language="bash" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Example Response</p>
                  <CodeBlock code={ep.response} language="json" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Webhooks teaser */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 mt-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Webhooks — Coming Soon</h3>
              <p className="text-sm text-slate-300 mb-3">Subscribe to content updates and knowledge graph events. Receive POST callbacks when new articles are published or glossary terms are updated.</p>
              <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-mono">in_development</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}