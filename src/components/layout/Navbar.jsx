import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Shield, LogOut, Github, Database } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { platformLinks } from '@/lib/platformLinks';

// Top-level nav items (no dropdown)
const simpleNav = [
  { label: 'Books', path: '/books' },
  { label: 'Research', path: '/research' },
  { label: 'Glossary', path: '/glossary' },
  { label: 'About', path: '/about' },
];

// Dropdown definitions — mix of internal routes and external docs links
const dropdowns = [
  {
    label: 'Learn',
    items: [
      { label: 'Getting Started', href: platformLinks.quickstart, external: true },
      { label: 'Learning Paths', to: '/learn' },
      { label: 'Blockchain Basics', to: '/library' },
      { label: 'Wallet Security', to: '/tools' },
      { label: 'DeFi', to: '/library' },
      { label: 'Web3', to: '/library' },
    ],
  },
  {
    label: 'Explore',
    items: [
      { label: 'Knowledge Explorer', to: '/explore' },
      { label: 'Knowledge Platform', to: '/knowledge-platform' },
      { label: 'Knowledge Engine', to: '/knowledge-engine' },
      { label: 'Topic Catalog', href: platformLinks.topicsCatalog, external: true },
      { label: 'Knowledge Graph', href: platformLinks.knowledgeGraph, external: true },
      { label: 'AI Resources', to: '/ai-assistant' },
      { label: 'News & Insights', to: '/news' },
    ],
  },
  {
    label: 'Developers',
    items: [
      { label: 'Developer Overview', to: '/developers' },
      { label: 'Code Examples', to: '/developers/snippets' },
      { label: 'RPC Directory', to: '/developers/rpc' },
      { label: 'SDK Reference', to: '/developers/sdks' },
      { label: 'Architecture', href: platformLinks.architecture, external: true },
      { label: 'API Reference', to: '/developers/api' },
    ],
  },
];

const secondaryItems = [
  { label: 'Contact', path: '/contact' },
];

function DropdownItem({ item, onNavigate }) {
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-slate-50">
        {item.label}
      </a>
    );
  }
  return (
    <Link to={item.to} onClick={onNavigate} className="block px-4 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-slate-50">
      {item.label}
    </Link>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = user && ['editor', 'admin'].includes(user.role);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setMobileOpen(false);
      setQuery('');
    }
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
    <header className="sticky top-0 z-50">
      {/* Utility top bar */}
      <div className="hidden lg:block bg-slate-900 text-slate-300">
        <div className="container-tbl flex items-center justify-between h-9 text-xs">
          <span className="flex items-center gap-1.5 font-medium tracking-tight">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            The open knowledge platform for blockchain technology
          </span>
          <div className="flex items-center gap-5">
            {secondaryItems.map((item) => (
              <Link key={item.path} to={item.path} className="hover:text-white transition-colors">
                {item.label}
              </Link>
            ))}
            <a href={platformLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
              <Github className="w-3 h-3" /> Open Source
            </a>
            <span className="w-px h-3.5 bg-slate-700" />
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:text-white transition-colors font-medium">Dashboard</Link>
                <button onClick={() => logout()} className="flex items-center gap-1 hover:text-white transition-colors">
                  <LogOut className="w-3 h-3" /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="font-semibold text-white hover:text-cyan-300 transition-colors">Login</Link>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="bg-white/90 backdrop-blur-md border-b border-slate-200">
        <nav className="container-tbl">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src="https://media.base44.com/images/public/6a4cfcf76d7d1bf88148c979/376050251_blockchain-library-icon.png" alt="The Blockchain Library" className="w-8 h-8 logo-pulse" />
              <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                The Blockchain <span className="text-blue-600">Library</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {dropdowns.map((dd) => (
                <div key={dd.label} className="relative group">
                  <button className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors flex items-center gap-1">
                    {dd.label} <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute left-0 top-full pt-1 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                    <div className="bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 min-w-[200px]">
                      {dd.items.map((item) => (
                        <DropdownItem key={item.label} item={item} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {simpleNav.map((item) => (
                <Link key={item.path} to={item.path}
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors">
                  {item.label}
                </Link>
              ))}
              {isAdmin && (
                <>
                  <Link to="/admin/learning-paths"
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                    <Shield className="w-3.5 h-3.5" /> Admin
                  </Link>
                  <Link to="/admin/export"
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-md transition-colors">
                    <Database className="w-3.5 h-3.5" /> Export
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors">
                <Search className="w-5 h-5" />
              </button>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard"
                    className="hidden sm:inline-flex lg:hidden items-center px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                    Dashboard
                  </Link>
                  <button onClick={() => logout()}
                    className="hidden sm:inline-flex lg:hidden items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <Link to="/login"
                  className="hidden sm:inline-flex lg:hidden items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
                  Login
                </Link>
              )}
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-slate-600 rounded-md">
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {searchOpen && (
            <form onSubmit={handleSearch} className="pb-4 animate-fade-in-fast">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input autoFocus type="text" value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search topics, glossary, books, research..."
                  className="w-full pl-12 pr-4 py-3 text-base bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white" />
              </div>
            </form>
          )}

        </nav>
      </div>
    </header>

    {mobileOpen && (
      <>
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-black/20" onClick={() => setMobileOpen(false)} />
        <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-white overflow-y-auto animate-fade-in-fast">
          <div className="container-tbl py-4 space-y-1">
            {dropdowns.map((dd) => (
              <div key={dd.label} className="mb-2">
                <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">{dd.label}</p>
                {dd.items.map((item) => <DropdownItem key={item.label} item={item} onNavigate={closeMobile} />)}
              </div>
            ))}
            {simpleNav.map((item) => (
              <Link key={item.path} to={item.path} onClick={closeMobile}
                className="block px-3 py-3 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md">
                {item.label}
              </Link>
            ))}
            <a href={platformLinks.github} target="_blank" rel="noopener noreferrer" onClick={closeMobile}
              className="flex items-center gap-1.5 px-3 py-3 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md">
              <Github className="w-4 h-4" /> Open Source
            </a>
            {secondaryItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={closeMobile}
                className="block px-3 py-3 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md">
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <>
                <Link to="/admin/learning-paths" onClick={closeMobile}
                  className="flex items-center gap-1.5 px-3 py-3 text-base font-medium text-blue-600 bg-blue-50 rounded-md mt-2">
                  <Shield className="w-4 h-4" /> Admin
                </Link>
                <Link to="/admin/export" onClick={closeMobile}
                  className="flex items-center gap-1.5 px-3 py-3 text-base font-medium text-teal-600 bg-teal-50 rounded-md">
                  <Database className="w-4 h-4" /> Content Export
                </Link>
              </>
            )}
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={closeMobile}
                  className="block px-3 py-3 text-base font-semibold text-blue-700 bg-blue-50 rounded-md text-center mt-3">
                  Dashboard
                </Link>
                <button onClick={() => { closeMobile(); logout(); }}
                  className="block w-full px-3 py-3 text-base font-semibold text-slate-600 bg-slate-100 rounded-md text-center mt-2">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={closeMobile}
                className="block px-3 py-3 text-base font-semibold text-white bg-blue-600 rounded-md text-center mt-3">
                Login
              </Link>
            )}
          </div>
        </div>
      </>
    )}
    </>
  );
}