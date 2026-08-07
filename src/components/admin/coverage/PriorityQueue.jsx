import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Loader2, Plus } from 'lucide-react';

const PRIORITY_COLORS = {
  critical: 'text-red-600 bg-red-50',
  high: 'text-orange-600 bg-orange-50',
  medium: 'text-amber-600 bg-amber-50',
  low: 'text-blue-600 bg-blue-50',
};

function getPriorityLabel(score) {
  if (score >= 80) return 'critical';
  if (score >= 65) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export default function PriorityQueue({ coverage }) {
  const [creating, setCreating] = useState(null);
  const [created, setCreated] = useState(new Set());

  const queue = useMemo(() => {
    return [...coverage.objects].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 50);
  }, [coverage.objects]);

  const createTask = async (obj) => {
    setCreating(obj.canonicalUid);
    const priority = getPriorityLabel(obj.priorityScore);
    try {
      await base44.entities.EditorialTask.create({
        title: `Improve coverage for ${obj.title}`,
        canonical_uid: obj.canonicalUid,
        object_title: obj.title,
        object_type: obj.type,
        task_type: obj.missingResources[0] || 'content',
        priority,
        priority_score: obj.priorityScore,
        reason: `Coverage: ${obj.coverageScore}/100, Priority: ${obj.priorityScore}/100. Missing: ${obj.missingResources.join(', ')}`,
        missing_resources: obj.missingResources,
        recommendations: obj.recommendations,
        status: 'open',
        build_id: coverage.buildId,
      });
      setCreated(prev => new Set([...prev, obj.canonicalUid]));
    } catch (e) { console.error(e); }
    setCreating(null);
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">Knowledge Improvement Queue</h2>
        <p className="text-sm text-slate-500">Ranked by improvement priority — important concepts with weak coverage and high graph centrality.</p>
      </div>
      <div className="space-y-2">
        {queue.map((obj, i) => {
          const priority = getPriorityLabel(obj.priorityScore);
          const isCreated = created.has(obj.canonicalUid);
          return (
            <div key={obj.canonicalUid} className="bg-white border border-slate-200 rounded-lg p-4 flex items-start gap-4">
              <span className="text-lg font-bold text-slate-300 shrink-0 w-8 text-center">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-semibold text-slate-900">{obj.title}</h3>
                  <span className="text-xs text-slate-400">{obj.type}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLORS[priority]}`}>{priority}</span>
                </div>
                <div className="flex items-center gap-4 text-sm mb-2">
                  <span className="text-slate-600">Priority <strong className="text-orange-500">{obj.priorityScore}</strong></span>
                  <span className="text-slate-600">Coverage <strong className="text-slate-900">{obj.coverageScore}</strong></span>
                  <span className="text-slate-600">Links <strong className="text-slate-700">{obj.centrality.degree}</strong></span>
                </div>
                {obj.missingResources.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-slate-400 mb-0.5">Missing:</p>
                    <div className="flex flex-wrap gap-1">
                      {obj.missingResources.map(m => <span key={m} className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">{m}</span>)}
                    </div>
                  </div>
                )}
                {obj.recommendations.length > 0 && (
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold">Recommended:</span> {obj.recommendations.slice(0, 3).join(' · ')}
                  </div>
                )}
              </div>
              <button onClick={() => createTask(obj)} disabled={creating === obj.canonicalUid || isCreated}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50">
                {isCreated ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : creating === obj.canonicalUid ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {isCreated ? 'Task Created' : 'Create Task'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}