import React, { useState } from 'react';
// DataQuality: Missing concepts, unresolved relationships, and duplicate intelligence
import { base44 } from '@/api/base44Client';
import { FileSearch, Link2, Copy, CheckCircle2, Loader2, Plus, AlertTriangle } from 'lucide-react';

export default function DataQuality({ coverage }) {
  const [activeSection, setActiveSection] = useState('missing');
  const [creating, setCreating] = useState(null);
  const [created, setCreated] = useState(new Set());

  const missingConcepts = coverage.missingConcepts || [];
  const reconciliation = coverage.reconciliation || {};
  const duplicates = coverage.duplicateMerges || {};

  const unresolvedRels = reconciliation.unresolved || reconciliation.relationships || [];
  const dupMerges = duplicates.merges || duplicates.duplicateMerges || [];
  const aliases = duplicates.aliases || [];

  const createDraft = async (concept) => {
    setCreating(concept.concept || concept.name || concept);
    try {
      await base44.entities.GlossaryTerm.create({
        title: concept.concept || concept.name,
        slug: (concept.concept || concept.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        definition: `Draft entry for ${concept.concept || concept.name}. This concept was identified as missing from the Knowledge Engine.`,
        status: 'draft',
      });
      setCreated(prev => new Set([...prev, concept.concept || concept.name]));
    } catch (e) { console.error(e); }
    setCreating(null);
  };

  return (
    <div>
      <div className="flex items-center gap-1 mb-6">
        {[
          { id: 'missing', label: 'Missing Concepts', count: missingConcepts.length, icon: FileSearch },
          { id: 'unresolved', label: 'Unresolved Relationships', count: unresolvedRels.length || coverage.summary?.topCards?.unresolvedRelationships || 0, icon: Link2 },
          { id: 'duplicates', label: 'Duplicate Intelligence', count: dupMerges.length + aliases.length, icon: Copy },
        ].map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg ${activeSection === s.id ? 'bg-slate-900 text-white' : 'text-slate-600 bg-white border border-slate-200'}`}>
            <s.icon className="w-4 h-4" /> {s.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeSection === s.id ? 'bg-white/20' : 'bg-slate-100'}`}>{s.count}</span>
          </button>
        ))}
      </div>

      {activeSection === 'missing' && (
        <div className="space-y-2">
          {missingConcepts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
              <p>No missing concepts detected.</p>
            </div>
          ) : (
            missingConcepts.slice(0, 50).map((c, i) => {
              const name = c.concept || c.name || c.title || `Concept ${i}`;
              const refs = c.referencedBy || c.referenced_by || c.referencedByCount || c.relationshipCount || 0;
              const suggestedType = c.suggestedType || c.suggested_type || 'Glossary / Topic';
              return (
                <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 mb-1">{name}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span>Referenced by: {typeof refs === 'number' ? refs : Array.isArray(refs) ? refs.length : refs}</span>
                      <span>Suggested type: {suggestedType}</span>
                    </div>
                  </div>
                  <button onClick={() => createDraft(c)} disabled={creating === name || created.has(name)}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50">
                    {created.has(name) ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : creating === name ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {created.has(name) ? 'Draft Created' : 'Create Draft'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeSection === 'unresolved' && (
        <div className="space-y-2">
          {unresolvedRels.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-400" />
              <p className="text-slate-500 mb-1">{coverage.summary?.topCards?.unresolvedRelationships || 0} unresolved relationships detected in the Knowledge Engine.</p>
              <p className="text-xs text-slate-400">Detailed reconciliation data will be available when the compiler exports it.</p>
            </div>
          ) : (
            unresolvedRels.slice(0, 50).map((r, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-slate-900">{r.source || r.sourceObject}</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-medium text-orange-600">"{r.target || r.unresolvedTarget}"</span>
                </div>
                {r.possibleMatch && (
                  <p className="text-xs text-slate-500">Possible match: <span className="text-blue-600">{r.possibleMatch}</span> (confidence: {r.confidence || 'N/A'})</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeSection === 'duplicates' && (
        <div className="space-y-4">
          {dupMerges.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">Merged Canonical Objects</h3>
              <div className="space-y-2">
                {dupMerges.slice(0, 20).map((d, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-lg p-3">
                    <p className="font-medium text-slate-900">{d.canonical || d.title || d.name}</p>
                    {d.aliases && <p className="text-xs text-slate-500 mt-1">Aliases: {Array.isArray(d.aliases) ? d.aliases.join(', ') : d.aliases}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {aliases.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase mb-2">Alias Candidates</h3>
              <div className="space-y-2">
                {aliases.slice(0, 20).map((a, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-lg p-3">
                    <p className="font-medium text-slate-900">{a.canonical || a.title}</p>
                    <p className="text-xs text-slate-500 mt-1">Aliases: {Array.isArray(a.aliases) ? a.aliases.join(', ') : a.aliases}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {dupMerges.length === 0 && aliases.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Copy className="w-8 h-8 mx-auto mb-2" />
              <p>Duplicate intelligence data will appear here when the compiler exports it.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}