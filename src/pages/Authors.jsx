import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, Users } from 'lucide-react';

export default function Authors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAuthors(); }, []);

  const fetchAuthors = async () => {
    try {
      const res = await base44.entities.Author.list('-updated_date', 50);
      setAuthors(res.results || res || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-12">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3"><span>Home</span><span>/</span><span className="text-slate-700 font-medium">Authors</span></div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">Our Authors</h1>
          <p className="text-slate-500 max-w-2xl">Experts and practitioners who write accurate, neutral, well-referenced educational content for the blockchain community.</p>
        </div>
      </div>
      <div className="container-tbl py-10">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
        ) : authors.length === 0 ? (
          <div className="text-center py-20"><Users className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-400">No authors listed yet.</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {authors.map(a => (
              <Link key={a.id} to={`/authors/${a.slug}`} className="group p-6 bg-white border border-slate-200 rounded-xl hover:shadow-lg hover:border-blue-200 transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-xl font-bold text-slate-400 shrink-0 ring-2 ring-slate-50 group-hover:ring-blue-100 transition-all">
                    {a.photo ? <img src={a.photo} alt={a.name} className="w-full h-full object-cover" /> : a.name?.[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">{a.name}</h3>
                    {a.expertise_areas?.[0] && <p className="text-sm text-slate-400">{a.expertise_areas[0]}</p>}
                  </div>
                </div>
                {a.bio && <p className="text-sm text-slate-500 line-clamp-2">{a.bio}</p>}
                {a.expertise_areas?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {a.expertise_areas.slice(0, 3).map(area => <span key={area} className="px-2 py-0.5 text-xs text-teal-700 bg-teal-50 rounded-full">{area}</span>)}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}