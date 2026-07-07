import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, ChevronRight, Clock, Trash2, BookOpen, ArrowRight } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await base44.entities.ReadingHistory.list('-accessed_date', 50);
      setHistory(res.results || res || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const removeItem = async (id) => {
    try {
      await base44.entities.ReadingHistory.delete(id);
      setHistory(prev => prev.filter(h => h.id !== id));
    } catch (e) { console.error(e); }
  };

  const clearAll = async () => {
    try {
      await base44.entities.ReadingHistory.deleteMany({});
      setHistory([]);
    } catch (e) { console.error(e); }
  };

  const groupByDate = (items) => {
    const groups = {};
    items.forEach(item => {
      const date = new Date(item.accessed_date || item.updated_date);
      const today = new Date();
      const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));
      let label;
      if (diffDays === 0) label = 'Today';
      else if (diffDays === 1) label = 'Yesterday';
      else if (diffDays < 7) label = 'This Week';
      else if (diffDays < 30) label = 'This Month';
      else label = 'Earlier';
      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    });
    return groups;
  };

  const grouped = groupByDate(history);
  const groupOrder = ['Today', 'Yesterday', 'This Week', 'This Month', 'Earlier'];

  return (
    <div>
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-10">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-3">
            <Link to="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">Reading History</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-1">Reading History</h1>
              <p className="text-slate-500">Pick up where you left off — your recently accessed articles.</p>
            </div>
            {history.length > 0 && (
              <button onClick={clearAll} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-500 hover:text-red-600 bg-white border border-slate-200 hover:border-red-200 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" /> Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container-tbl py-10 max-w-3xl">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
        ) : history.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-700 mb-1">No reading history yet</h2>
            <p className="text-sm text-slate-400 mb-6">Articles you read will appear here so you can easily return to them.</p>
            <Link to="/library" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              Browse the Library <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {groupOrder.map(label => grouped[label] && (
              <div key={label}>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">{label}</h2>
                <div className="space-y-2">
                  {grouped[label].map(item => (
                    <div key={item.id} className="group flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-200 transition-all">
                      {item.featured_image ? (
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          <img src={item.featured_image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5 text-slate-300" />
                        </div>
                      )}
                      <Link to={`/article/${item.slug}`} className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{item.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                          {item.category_name && <span>{item.category_name}</span>}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.accessed_date ? new Date(item.accessed_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      </Link>
                      <button onClick={() => removeItem(item.id)}
                        className="p-2 text-slate-300 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}