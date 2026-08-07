import React, { useState, useMemo, useEffect } from 'react';
import { Search, Maximize2, Minimize2, RotateCcw, Expand } from 'lucide-react';
import { buildGraphData } from '@/lib/graphLayout';
import { getObjectByUid, getTypeMeta, TYPE_META, trackExplorerEvent } from '@/lib/knowledgeEngine';
import KnowledgeGraph from './KnowledgeGraph';

export default function GraphMode({ searchIndex, related, concept, onObjectClick }) {
  const [centerUid, setCenterUid] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [maxFirstDegree, setMaxFirstDegree] = useState(20);
  const [includeSecondDegree, setIncludeSecondDegree] = useState(false);
  const [typeFilter, setTypeFilter] = useState(new Set());
  const [showEdgeLabels, setShowEdgeLabels] = useState(false);
  const [conceptSearch, setConceptSearch] = useState('');

  useEffect(() => {
    if (concept) {
      const obj = getObjectByUid(searchIndex, concept);
      if (obj) { setCenterUid(obj.id); return; }
      const bySlug = searchIndex?.find(o => o.id.endsWith(':' + concept));
      if (bySlug) { setCenterUid(bySlug.id); return; }
    }
    if (!centerUid && searchIndex && related) {
      const first = searchIndex.find(o => o.type === 'glossary' && related[o.id]?.length > 0);
      if (first) setCenterUid(first.id);
    }
  }, [concept, searchIndex, related, centerUid]);

  const graphData = useMemo(() => {
    if (!centerUid || !searchIndex || !related) return { nodes: [], edges: [] };
    return buildGraphData(searchIndex, related, centerUid, { maxFirstDegree, includeSecondDegree });
  }, [searchIndex, related, centerUid, maxFirstDegree, includeSecondDegree]);

  const filteredGraph = useMemo(() => {
    if (typeFilter.size === 0) return graphData;
    const visibleNodes = new Set(graphData.nodes.filter(n => n.isCenter || typeFilter.has(n.type)).map(n => n.id));
    return {
      nodes: graphData.nodes.filter(n => visibleNodes.has(n.id)),
      edges: graphData.edges.filter(e => visibleNodes.has(e.source) && visibleNodes.has(e.target)),
    };
  }, [graphData, typeFilter]);

  const handleNodeClick = (node) => {
    onObjectClick(node.id);
    trackExplorerEvent('explorer_graph_node_expanded', { uid: node.id });
  };

  const handleExpand = () => {
    setMaxFirstDegree(prev => Math.min(prev + 10, 50));
    trackExplorerEvent('explorer_graph_node_expanded', { uid: centerUid });
  };

  const handleReset = () => {
    setMaxFirstDegree(20);
    setIncludeSecondDegree(false);
    setTypeFilter(new Set());
  };

  const conceptResults = useMemo(() => {
    if (!conceptSearch.trim() || !searchIndex) return [];
    const q = conceptSearch.toLowerCase();
    return searchIndex.filter(o => o.title.toLowerCase().includes(q) && related?.[o.id]?.length > 0).slice(0, 8);
  }, [conceptSearch, searchIndex, related]);

  const centerObj = centerUid ? getObjectByUid(searchIndex, centerUid) : null;
  const filterableTypes = Object.entries(TYPE_META).filter(([t]) => !['author', 'category', 'news', 'newsletter'].includes(t));

  return (
    <div className={fullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={conceptSearch} onChange={(e) => setConceptSearch(e.target.value)}
            placeholder="Search for a concept…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {conceptResults.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-20">
              {conceptResults.map(o => (
                <button key={o.id} onClick={() => { setCenterUid(o.id); setConceptSearch(''); }}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50">
                  <span className="font-medium text-slate-900">{o.title}</span>
                  <span className="text-xs text-slate-400 ml-2">{getTypeMeta(o.type).label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={handleExpand} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
          <Expand className="w-4 h-4" /> Expand
        </button>
        <button onClick={() => setIncludeSecondDegree(!includeSecondDegree)} className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border ${includeSecondDegree ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}>
          2nd Degree
        </button>
        <button onClick={() => setShowEdgeLabels(!showEdgeLabels)} className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border ${showEdgeLabels ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}>
          Labels
        </button>
        <button onClick={handleReset} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        <button onClick={() => setFullscreen(!fullscreen)} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
          {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-slate-400 font-medium">Filter by type:</span>
        {filterableTypes.map(([t, m]) => {
          const active = typeFilter.has(t);
          return (
            <button key={t} onClick={() => {
              const next = new Set(typeFilter);
              if (active) next.delete(t); else next.add(t);
              setTypeFilter(next);
            }} className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${active ? 'text-white' : 'text-slate-600 bg-slate-100'}`}
              style={active ? { backgroundColor: m.color } : {}}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: active ? 'white' : m.color }} />
              {m.label}
            </button>
          );
        })}
      </div>

      <div className={`relative bg-slate-900 rounded-xl overflow-hidden ${fullscreen ? 'h-full' : 'h-[600px]'}`}>
        <KnowledgeGraph nodes={filteredGraph.nodes} edges={filteredGraph.edges} onNodeClick={handleNodeClick} showEdgeLabels={showEdgeLabels} />
        {centerObj && (
          <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 text-white">
            <p className="text-xs text-slate-400">Center concept</p>
            <p className="font-semibold">{centerObj.title}</p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Relationships (Text View)</h3>
        <div className="space-y-1">
          {graphData.edges.map((e, i) => {
            const target = graphData.nodes.find(n => n.id === e.target);
            return (
              <div key={i} className="text-sm text-slate-600 flex items-center gap-2">
                <span className="font-medium text-slate-900">{centerObj?.title}</span>
                <span className="text-slate-400">—{e.relationship}→</span>
                <button onClick={() => handleNodeClick(target)} className="text-blue-600 hover:underline">{target?.label}</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}