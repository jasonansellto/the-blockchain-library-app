import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Plus, CheckCircle2, Clock, Edit, FileText } from 'lucide-react';
import { getPriorityColor } from './coverageUtils';

const STATUS_ICONS = {
  open: Clock, in_progress: Edit, review: FileText, complete: CheckCircle2,
};
const STATUS_COLORS = {
  open: 'text-slate-600 bg-slate-100', in_progress: 'text-blue-600 bg-blue-50',
  review: 'text-amber-600 bg-amber-50', complete: 'text-emerald-600 bg-emerald-50',
};

export default function EditorialTaskPanel({ coverage }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.entities.EditorialTask.list('-created_date', 50);
      setTasks(res.results || res || []);
    } catch (e) {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (taskId, status) => {
    try {
      await base44.entities.EditorialTask.update(taskId, { status });
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Editorial Tasks</h2>
          <p className="text-sm text-slate-500">Tasks created from coverage recommendations. Stored in Base44 as workflow data.</p>
        </div>
        <span className="text-sm text-slate-400">{tasks.length} tasks</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-blue-600 animate-spin" /></div>
      ) : tasks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
          <Plus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 mb-1">No editorial tasks yet.</p>
          <p className="text-sm text-slate-400">Create tasks from the Priority Queue to track editorial work.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => {
            const StatusIcon = STATUS_ICONS[task.status] || Clock;
            return (
              <div key={task.id} className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 mb-1">{task.title}</h3>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className={`px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                      <span className={`px-2 py-0.5 rounded-full ${STATUS_COLORS[task.status]}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />{task.status.replace('_', ' ')}
                      </span>
                      <span className="text-slate-400">{task.task_type}</span>
                      {task.object_title && <span className="text-slate-400">· {task.object_title}</span>}
                    </div>
                    {task.reason && <p className="text-xs text-slate-500 mt-2">{task.reason}</p>}
                    {task.missing_resources?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.missing_resources.map(m => <span key={m} className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded">{m}</span>)}
                      </div>
                    )}
                  </div>
                  <select value={task.status} onChange={(e) => updateStatus(task.id, e.target.value)}
                    className="text-sm px-2 py-1 border border-slate-200 rounded-lg shrink-0">
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="complete">Complete</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}