import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronDown, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Learn', path: '/learn' },
  { label: 'Library', path: '/library' },
  { label: 'Glossary', path: '/glossary' },
  { label: 'Books', path: '/books' },
  { label: 'Research', path: '/research' },
];

const resourceItems = [
  { label: 'Tools', path: '/tools' },
  { label: 'Developers', path: '/developers' },
  { label: 'News & Insights', path: '/news' },
  { label: 'Newsletter', path: '/newsletter' },
  { label: 'AI Assistant', path: '/ai-assistant' },
];

const secondaryItems = [
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

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

  return (
    <>
    <header className="sticky top-0 z-50">
      {/* Utility top bar */}
      <div className="hidden lg:block bg-slate-900 text-slate-300">
        <div className="container-tbl flex items-center justify-between h-9 text-xs">
          <span className="flex items-center gap-1.5 font-medium tracking-tight">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            Definitive blockchain &amp; Web3 knowledge
          </span>
          <div className="flex items-center gap-5">
            {secondaryItems.map((item) => (
              <Link key={item.path} to={item.path} className="hover:text-white transition-colors">
                {item.label}
              </Link>
            ))}
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
            <Link to="/" className="flex items-center shrink-0">
              <img src="https://media.base44.com/images/public/6a4cfcf76d7d1bf88148c979/0e5d20830_bl-logo.png" alt="The Blockchain Library" className="h-8 sm:h-9 w-auto" />
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}
                  className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors">
                  {item.label}
                </Link>
              ))}
              <div className="relative group">
                <button className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md transition-colors flex items-center gap-1">
                  Resources <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <div className="absolute left-0 top-full pt-1 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                  <div className="bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 min-w-[180px]">
                    {resourceItems.map((item) => (
                      <Link key={item.path} to={item.path}
                        className="block px-4 py-2 text-sm text-slate-600 hover:text-blue-600 hover:bg-slate-50">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              {isAdmin && (
                <Link to="/admin/learning-paths"
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                  <Shield className="w-3.5 h-3.5" /> Admin
                </Link>
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
                    className="sm:inline-flex lg:hidden items-center px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                    Dashboard
                  </Link>
                  <button onClick={() => logout()}
                    className="sm:inline-flex lg:hidden items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <Link to="/login"
                  className="sm:inline-flex lg:hidden items-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
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
                  placeholder="Search articles, glossary terms, books, research..."
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
            {[...navItems, ...resourceItems, ...secondaryItems].map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
                className="block px-3 py-3 text-base font-medium text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-md">
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin/learning-paths" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-1.5 px-3 py-3 text-base font-medium text-blue-600 bg-blue-50 rounded-md mt-2">
                <Shield className="w-4 h-4" /> Admin
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                  className="block px-3 py-3 text-base font-semibold text-blue-700 bg-blue-50 rounded-md text-center mt-3">
                  Dashboard
                </Link>
                <button onClick={() => { setMobileOpen(false); logout(); }}
                  className="block w-full px-3 py-3 text-base font-semibold text-slate-600 bg-slate-100 rounded-md text-center mt-2">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)}
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