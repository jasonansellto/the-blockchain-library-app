import React, { useState, useCallback, useMemo } from 'react';
import { Crosshair, Plus, Minus } from 'lucide-react';
import { simulateLayout } from '@/lib/graphLayout';
import { getTypeMeta } from '@/lib/knowledgeEngine';

const WIDTH = 800;
const HEIGHT = 600;

export default function KnowledgeGraph({ nodes, edges, onNodeClick, showEdgeLabels = false }) {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState(null);
  const [touchState, setTouchState] = useState(null);

  const layoutNodes = useMemo(() => {
    if (nodes.length === 0) return [];
    const copy = nodes.map(n => ({ ...n }));
    simulateLayout(copy, edges, WIDTH, HEIGHT, 250);
    return copy;
  }, [nodes, edges]);

  const nodeMap = useMemo(() => new Map(layoutNodes.map(n => [n.id, n])), [layoutNodes]);

  const handleMouseDown = useCallback((e) => {
    if (e.target.tagName === 'circle' || e.target.tagName === 'text') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  }, [transform]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setTransform(prev => ({ ...prev, x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }));
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({ ...prev, scale: Math.max(0.3, Math.min(3, prev.scale * delta)) }));
  }, []);

  const center = useCallback(() => setTransform({ x: 0, y: 0, scale: 1 }), []);

  const handleNodeClickInternal = (node) => {
    setSelectedNode(node.id);
    onNodeClick(node);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: t.clientX - transform.x, y: t.clientY - transform.y });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setTouchState({ dist, scale: transform.scale });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 1 && isDragging) {
      const t = e.touches[0];
      setTransform(prev => ({ ...prev, x: t.clientX - dragStart.x, y: t.clientY - dragStart.y }));
    } else if (e.touches.length === 2 && touchState) {
      const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const scale = Math.max(0.3, Math.min(3, touchState.scale * (dist / touchState.dist)));
      setTransform(prev => ({ ...prev, scale }));
    }
  };

  const handleTouchEnd = () => { setIsDragging(false); setTouchState(null); };

  if (nodes.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-400 text-sm">Select a concept to visualize its relationships.</div>;
  }

  return (
    <div className="relative w-full h-full">
      <svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label="Knowledge graph visualization"
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        onWheel={handleWheel} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
        style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}>
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {edges.map((e, i) => {
            const s = nodeMap.get(e.source);
            const t = nodeMap.get(e.target);
            if (!s || !t) return null;
            return (
              <g key={i}>
                <line x1={s.x} y1={s.y} x2={t.x} y2={t.y} stroke="rgba(148, 163, 184, 0.3)" strokeWidth={1} />
                {showEdgeLabels && (
                  <text x={(s.x + t.x) / 2} y={(s.y + t.y) / 2} fill="rgba(148, 163, 184, 0.7)" fontSize="8" textAnchor="middle" className="pointer-events-none">
                    {e.relationship}
                  </text>
                )}
              </g>
            );
          })}
          {layoutNodes.map(node => {
            const meta = getTypeMeta(node.type);
            const r = node.isCenter ? 12 : 7;
            const label = node.label.length > 20 ? node.label.slice(0, 18) + '…' : node.label;
            return (
              <g key={node.id} onClick={() => handleNodeClickInternal(node)} style={{ cursor: 'pointer' }} role="button" aria-label={`${node.label}, ${meta.label}`}>
                {selectedNode === node.id && <circle cx={node.x} cy={node.y} r={r + 4} fill="none" stroke="#3b82f6" strokeWidth="2" />}
                <circle cx={node.x} cy={node.y} r={r} fill={meta.color} stroke="white" strokeWidth={1.5} />
                <text x={node.x} y={node.y + r + 10} fill="white" fontSize="10" textAnchor="middle" className="pointer-events-none">{label}</text>
              </g>
            );
          })}
        </g>
      </svg>

      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        <button onClick={() => setTransform(prev => ({ ...prev, scale: Math.min(3, prev.scale * 1.2) }))} aria-label="Zoom in" className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
        <button onClick={() => setTransform(prev => ({ ...prev, scale: Math.max(0.3, prev.scale * 0.8) }))} aria-label="Zoom out" className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
        <button onClick={center} aria-label="Center graph" className="w-9 h-9 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 flex items-center justify-center"><Crosshair className="w-4 h-4" /></button>
      </div>
    </div>
  );
}