import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, GraduationCap } from 'lucide-react';
import LearningPathCard from '@/components/cards/LearningPathCard';

export default function Learn() {
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPaths(); }, []);

  const fetchPaths = async () => {
    try {
      const res = await base44.entities.LearningPath.list('-updated_date', 50);
      setPaths(res.results || res || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div>
      <div className="border-b border-slate-100 bg-gradient-to-br from-blue-50 to-teal-50">
        <div className="container-tbl py-14">
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-3"><span>Home</span><span>/</span><span className="text-slate-700 font-medium">Learn</span></div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-2">Learning Paths</h1>
          <p className="text-slate-500 max-w-2xl">Structured, step-by-step learning journeys that take you from fundamentals to mastery. Track your progress and earn certificates as you complete each path.</p>
        </div>
      </div>
      <div className="container-tbl py-10">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
        ) : paths.length === 0 ? (
          <div className="text-center py-20"><GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-400">No learning paths available yet. Check back soon.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map(p => <LearningPathCard key={p.id} path={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}