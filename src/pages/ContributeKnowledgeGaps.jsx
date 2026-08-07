import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, AlertCircle, ArrowRight, BookOpen, GraduationCap, Code, HelpCircle, Link2 } from 'lucide-react';
import Seo from '@/components/Seo';
import { Link } from 'react-router-dom';

const GAP_ICONS = {
  research: GraduationCap, tutorial: BookOpen, codeExample: Code, quiz: HelpCircle, relatedConcepts: Link2,
};

export default function ContributeKnowledgeGaps() {
  const [coverage, setCoverage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke('calculateCoverage', {});
        setCoverage(res.data?.coverage || res.coverage);
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const opportunities = useMemo(() => {
    if (!coverage?.objects) return [];
    return coverage.objects
      .filter(o => o.priorityScore >= 40 && o.type !== 'rpc' && o.type !== 'author' && o.type !== 'category')
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, 24);
  }, [coverage]);

  const health = coverage?.health || {};
  const hasFailedHealth = Object.values(health).some((s) => s === 'failed');
  const hasWarningHealth = Object.values(health).some((s) => s === 'warning');

  return (
    <div className="min-h-full bg-slate-50">
      <Seo title="Contribute — Knowledge Gaps" description="Help improve The Blockchain Library by contributing to concepts that need research, tutorials, code examples, and more." />

      <div className="border-b border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container-tbl py-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Contribute to Knowledge Gaps</h1>
          <p className="text-slate-300 max-w-2xl text-lg leading-relaxed">
            The Blockchain Library is an open knowledge platform. Help us improve coverage by contributing research, tutorials, code examples, and more to concepts that need them most.
          </p>
        </div>
      </div>

      <div className="container-tbl py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Loading contribution opportunities…</p>
          </div>
        ) : !coverage ? (
          <div className="text-center py-20">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Unable to load coverage data right now.</p>
          </div>
        ) : hasFailedHealth ? (
          <div className="text-center py-20">
            <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <p className="text-slate-500 mb-1">Coverage data is being updated.</p>
            <p className="text-sm text-slate-400">Contribution opportunities will be available once the latest coverage analysis is complete.</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Needs Research', value: coverage.summary.topCards.missingResearch, icon: GraduationCap, color: 'text-blue-500' },
                { label: 'Needs Tutorials', value: coverage.summary.topCards.missingTutorials, icon: BookOpen, color: 'text-cyan-500' },
                { label: 'Needs Code Examples', value: coverage.summary.topCards.missingCodeExamples, icon: Code, color: 'text-indigo-500' },
                { label: 'High Priority Gaps', value: coverage.summary.topCards.highPriorityGaps, icon: AlertCircle, color: 'text-orange-500' },
              ].map(c => (
                <div key={c.label} className="bg-white border border-slate-200 rounded-xl p-5 text-center">
                  <c.icon className={`w-6 h-6 ${c.color} mx-auto mb-2`} />
                  <p className="text-2xl font-bold text-slate-900">{c.value.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">{c.label}</p>
                </div>
              ))}
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-4">Priority Contribution Opportunities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {opportunities.map(obj => (
                <div key={obj.canonicalUid} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{obj.type}</span>
                    <span className="text-xs text-slate-400 ml-auto">Coverage {obj.coverageScore}/100</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{obj.title}</h3>
                  {obj.missingResources.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {obj.missingResources.slice(0, 4).map(m => {
                        const Icon = GAP_ICONS[m] || AlertCircle;
                        return <span key={m} className="text-xs text-slate-600 bg-slate-50 px-2 py-0.5 rounded inline-flex items-center gap-1"><Icon className="w-3 h-3" />{m}</span>;
                      })}
                    </div>
                  )}
                  <Link to={`/explore/${obj.type}/${obj.canonicalUid.split(':').slice(1).join(':')}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                    Explore this concept <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}