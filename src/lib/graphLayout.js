// Force-directed graph layout for the Knowledge Explorer.
// Pure JS — no deps. Runs a simple Verlet simulation synchronously.

export function simulateLayout(nodes, edges, width, height, iterations = 250) {
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * 0.35;

  // Initialize positions — center node in middle, others in a circle
  nodes.forEach((n, i) => {
    if (n.isCenter) {
      n.x = cx;
      n.y = cy;
    } else {
      const angle = (i / Math.max(nodes.length - 1, 1)) * 2 * Math.PI;
      n.x = cx + Math.cos(angle) * maxR;
      n.y = cy + Math.sin(angle) * maxR;
    }
    n.vx = 0;
    n.vy = 0;
  });

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let distSq = dx * dx + dy * dy;
        if (distSq < 1) { distSq = 1; dx = 0.5; dy = 0.5; }
        const dist = Math.sqrt(distSq);
        const force = 4000 / distSq;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      const s = nodeMap.get(edge.source);
      const t = nodeMap.get(edge.target);
      if (!s || !t) continue;
      const dx = t.x - s.x;
      const dy = t.y - s.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - 130) * 0.04;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      s.vx += fx; s.vy += fy;
      t.vx -= fx; t.vy -= fy;
    }

    // Centering + damping + apply
    for (const n of nodes) {
      if (!n.isCenter) {
        n.vx += (cx - n.x) * 0.008;
        n.vy += (cy - n.y) * 0.008;
        n.vx *= 0.82;
        n.vy *= 0.82;
        n.x += n.vx;
        n.y += n.vy;
      }
    }
  }

  return nodes;
}

export function buildGraphData(searchIndex, related, centerUid, { maxFirstDegree = 20, includeSecondDegree = false } = {}) {
  const centerObj = searchIndex?.find(o => o.id === centerUid);
  if (!centerObj) return { nodes: [], edges: [] };

  const nodes = new Map();
  const edges = [];
  const edgeSet = new Set();

  const addNode = (uid, label, type, canonicalUrl, isCenter = false) => {
    if (!nodes.has(uid)) {
      const meta = searchIndex?.find(o => o.id === uid);
      nodes.set(uid, {
        id: uid,
        label: label || meta?.title || uid,
        type: type || meta?.type || 'unknown',
        canonicalUrl: canonicalUrl || meta?.canonicalUrl,
        categoryId: meta?.categoryId,
        isCenter,
      });
    }
    return nodes.get(uid);
  };

  addNode(centerUid, centerObj.title, centerObj.type, centerObj.canonicalUrl, true);

  const firstDegree = (related?.[centerUid] || []).slice(0, maxFirstDegree);
  for (const rel of firstDegree) {
    addNode(rel.uid, rel.title, rel.type, rel.canonicalUrl);
    const eKey = `${centerUid}→${rel.uid}`;
    if (!edgeSet.has(eKey)) {
      edgeSet.add(eKey);
      edges.push({ source: centerUid, target: rel.uid, relationship: rel.relationship || 'related-to', strength: rel.strength || 1 });
    }
  }

  if (includeSecondDegree) {
    for (const rel of firstDegree.slice(0, 8)) {
      const secondRels = (related?.[rel.uid] || []).slice(0, 4);
      for (const r2 of secondRels) {
        if (r2.uid === centerUid || nodes.has(r2.uid)) continue;
        addNode(r2.uid, r2.title, r2.type, r2.canonicalUrl);
        const eKey = `${rel.uid}→${r2.uid}`;
        if (!edgeSet.has(eKey)) {
          edgeSet.add(eKey);
          edges.push({ source: rel.uid, target: r2.uid, relationship: r2.relationship || 'related-to', strength: r2.strength || 1 });
        }
      }
    }
  }

  return { nodes: Array.from(nodes.values()), edges };
}