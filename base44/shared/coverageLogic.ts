// Coverage Intelligence calculation logic for the Knowledge Engine.
// Consumes canonical GitHub Knowledge Engine data (search-index + related).
// READ-ONLY: never mutates content. Results are cached by build ID.

const KNOWLEDGE_BASE = 'https://raw.githubusercontent.com/jasonansellto/the-blockchain-library/main/public/knowledge';

// Requirement profiles by type — context-aware expectations
const REQUIREMENT_PROFILES = {
  glossary: {
    required: ['definition', 'category', 'relatedConcepts', 'seo'],
    recommended: ['references', 'article', 'learningPath'],
  },
  article: {
    required: ['summary', 'category', 'tags', 'seo', 'relationships'],
    recommended: ['references', 'book', 'learningPath'],
  },
  book: {
    required: ['title', 'author', 'category', 'seo'],
    recommended: ['references', 'research', 'learningPath'],
  },
  research: {
    required: ['summary', 'references', 'relationships'],
    recommended: ['book', 'article', 'learningPath'],
  },
  'code-snippet': {
    required: ['code', 'description', 'category'],
    recommended: ['relatedArticles', 'developerResource'],
  },
  rpc: {
    required: ['network', 'provider', 'endpoint'],
    recommended: ['codeExample', 'research'],
  },
  'learning-path': {
    required: ['title', 'description', 'lessons', 'category'],
    recommended: ['relatedArticles', 'books'],
  },
  resource: {
    required: ['name', 'url', 'category', 'description'],
    recommended: ['relatedArticles', 'codeExample'],
  },
};

const RESOURCE_LABELS = {
  definition: 'Definition', summary: 'Summary', category: 'Category', tags: 'Tags',
  seo: 'SEO', references: 'References', relatedConcepts: 'Related Concepts',
  article: 'Article', book: 'Book', books: 'Books', research: 'Research',
  learningPath: 'Learning Path', codeSnippet: 'Code Example', codeExample: 'Code Example',
  developerResource: 'Developer Resource', rpc: 'RPC', tutorial: 'Tutorial', quiz: 'Quiz',
  relatedArticles: 'Related Articles', network: 'Network', provider: 'Provider',
  endpoint: 'Endpoint', title: 'Title', author: 'Author', description: 'Description',
  lessons: 'Lessons', name: 'Name', url: 'URL', code: 'Code',
};

export function getCoverageLevel(score) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'strong';
  if (score >= 60) return 'needsImprovement';
  if (score >= 40) return 'weak';
  return 'sparse';
}

export function getCoverageLevelLabel(level) {
  return { excellent: 'Excellent', strong: 'Strong', needsImprovement: 'Needs Improvement', weak: 'Weak', sparse: 'Sparse' }[level] || level;
}

// Determine which resources an object has
export function calculateObjectResources(searchObj, relatedObjs) {
  const rel = relatedObjs || [];
  return {
    definition: !!(searchObj?.summary || searchObj?.text),
    summary: !!(searchObj?.summary),
    category: !!(searchObj?.categoryId),
    tags: !!(searchObj?.tags?.length),
    seo: !!(searchObj?.summary && searchObj?.canonicalUrl),
    references: rel.some(r => r.type === 'research' || r.type === 'book'),
    relatedConcepts: rel.some(r => r.type === 'glossary'),
    article: rel.some(r => r.type === 'article'),
    book: rel.some(r => r.type === 'book'),
    books: rel.some(r => r.type === 'book'),
    research: rel.some(r => r.type === 'research'),
    learningPath: rel.some(r => r.type === 'learning-path'),
    codeSnippet: rel.some(r => r.type === 'code-snippet'),
    codeExample: rel.some(r => r.type === 'code-snippet'),
    developerResource: rel.some(r => r.type === 'resource'),
    rpc: rel.some(r => r.type === 'rpc'),
    tutorial: rel.some(r => r.type === 'learning-path'),
    quiz: false, // Not determinable from search-index
    relatedArticles: rel.some(r => r.type === 'article'),
    relationships: rel.length > 0,
    // Type-specific fields
    title: !!searchObj?.title,
    author: false, // Not in search-index
    description: !!(searchObj?.summary || searchObj?.text),
    code: false, // Not in search-index for non-code types
    lessons: false, // Not in search-index
    name: !!searchObj?.title,
    url: !!searchObj?.canonicalUrl,
    network: false, // RPC-specific
    provider: false, // RPC-specific
    endpoint: false, // RPC-specific
  };
}

// Calculate dimension scores (0-100 each)
export function calculateDimensionScores(searchObj, relatedObjs, resources) {
  const rel = relatedObjs || [];
  const relCount = rel.length;
  const typeDiversity = new Set(rel.map(r => r.type)).size;

  const metadata = Math.min(100,
    (searchObj?.title ? 20 : 0) +
    (searchObj?.summary ? 25 : 0) +
    (resources.category ? 20 : 0) +
    (resources.tags ? 15 : 0) +
    (searchObj?.aliases?.length ? 10 : 0) +
    (searchObj?.canonicalUrl ? 10 : 0)
  );

  const seo = Math.min(100,
    (searchObj?.summary ? 30 : 0) +
    (searchObj?.canonicalUrl ? 25 : 0) +
    (searchObj?.title ? 20 : 0) +
    (resources.tags ? 15 : 0) +
    (resources.category ? 10 : 0)
  );

  const references = Math.min(100,
    (rel.some(r => r.type === 'research') ? 40 : 0) +
    (rel.some(r => r.type === 'book') ? 30 : 0) +
    (rel.some(r => r.type === 'article') ? 30 : 0)
  );

  const relationships = Math.min(100,
    Math.min(40, relCount * 5) +
    Math.min(30, typeDiversity * 10) +
    (relCount > 0 ? 30 : 0)
  );

  const learning = Math.min(100,
    (resources.learningPath ? 35 : 0) +
    (resources.tutorial ? 25 : 0) +
    (resources.quiz ? 20 : 0) +
    (rel.some(r => r.type === 'article') ? 20 : 0)
  );

  const developer = Math.min(100,
    (resources.codeSnippet ? 35 : 0) +
    (resources.developerResource ? 35 : 0) +
    (resources.rpc ? 30 : 0)
  );

  const research = Math.min(100,
    (resources.research ? 60 : 0) +
    (rel.some(r => r.type === 'book') ? 40 : 0)
  );

  return { metadata, seo, references, relationships, learning, developer, research };
}

// Calculate coverage score (0-100) — context-aware
export function calculateCoverageScore(searchObj, resources, dimensions) {
  const profile = REQUIREMENT_PROFILES[searchObj.type] || {
    required: ['definition', 'category', 'seo'],
    recommended: ['relationships'],
  };

  const reqPresent = profile.required.filter(r => resources[r]).length;
  const reqTotal = profile.required.length;
  const reqScore = reqTotal > 0 ? reqPresent / reqTotal : 1;

  const recPresent = profile.recommended.filter(r => resources[r]).length;
  const recTotal = profile.recommended.length;
  const recScore = recTotal > 0 ? recPresent / recTotal : 1;

  const baseScore = (reqScore * 0.65 + recScore * 0.35) * 100;
  const dimAvg = (dimensions.metadata + dimensions.seo + dimensions.references +
    dimensions.relationships + dimensions.learning + dimensions.developer + dimensions.research) / 7;

  return Math.round(baseScore * 0.6 + dimAvg * 0.4);
}

// Calculate priority score (0-100) — high priority = important + weak
export function calculatePriorityScore(searchObj, coverageScore, centrality, resources, dimensions) {
  const profile = REQUIREMENT_PROFILES[searchObj.type] || { required: [], recommended: [] };
  const allExpected = [...profile.required, ...profile.recommended];
  const missingCount = allExpected.filter(r => !resources[r]).length;

  const degreeScore = Math.min(100, (centrality.degree || 0) * 5);
  const inboundScore = Math.min(100, (centrality.inbound || 0) * 5);
  const missingResourceScore = Math.min(100, missingCount * 20);
  const missingMetaScore = Math.min(100, (dimensions.metadata < 80 ? 40 : 0) + (!resources.tags ? 30 : 0) + (!resources.category ? 30 : 0));
  const missingRefScore = dimensions.references < 40 ? 60 : 0;
  const missingSeoScore = dimensions.seo < 40 ? 60 : 0;
  const missingRelScore = (centrality.degree || 0) === 0 ? 80 : Math.max(0, 80 - (centrality.degree || 0) * 8);
  const inverseCoverage = 100 - coverageScore;

  const score =
    degreeScore * 0.20 +
    missingResourceScore * 0.20 +
    inverseCoverage * 0.15 +
    missingMetaScore * 0.10 +
    missingRefScore * 0.10 +
    missingRelScore * 0.10 +
    missingSeoScore * 0.05 +
    inboundScore * 0.10;

  return Math.round(Math.min(100, Math.max(0, score)));
}

// Graph centrality
export function calculateGraphCentrality(related) {
  const centrality = {};
  const inbound = {};
  const outbound = {};

  for (const [uid, rels] of Object.entries(related || {})) {
    outbound[uid] = rels.length;
    for (const r of rels) {
      inbound[r.uid] = (inbound[r.uid] || 0) + 1;
    }
  }

  const allUids = new Set([...Object.keys(related || {}), ...Object.keys(inbound)]);
  for (const uid of allUids) {
    centrality[uid] = {
      degree: (outbound[uid] || 0) + (inbound[uid] || 0),
      inbound: inbound[uid] || 0,
      outbound: outbound[uid] || 0,
    };
  }
  return centrality;
}

// PageRank
export function calculatePageRank(related, iterations = 20, damping = 0.85) {
  const inbound = {};
  const outboundCount = {};

  for (const [uid, rels] of Object.entries(related || {})) {
    outboundCount[uid] = rels.length;
    for (const r of rels) {
      if (!inbound[r.uid]) inbound[r.uid] = [];
      inbound[r.uid].push(uid);
    }
  }

  const allUids = new Set([...Object.keys(related || {}), ...Object.keys(inbound)]);
  const n = allUids.size || 1;
  let pr = {};
  for (const uid of allUids) pr[uid] = 1 / n;

  for (let i = 0; i < iterations; i++) {
    const newPr = {};
    for (const uid of allUids) {
      let sum = 0;
      const inLinks = inbound[uid] || [];
      for (const source of inLinks) {
        sum += pr[source] / (outboundCount[source] || 1);
      }
      newPr[uid] = (1 - damping) / n + damping * sum;
    }
    pr = newPr;
  }

  const maxPr = Math.max(...Object.values(pr), 0.0001);
  const normalized = {};
  for (const [uid, score] of Object.entries(pr)) {
    normalized[uid] = (score / maxPr) * 100;
  }
  return normalized;
}

// Generate editorial recommendations
export function generateRecommendations(searchObj, resources, dimensions) {
  const recs = [];
  const profile = REQUIREMENT_PROFILES[searchObj.type] || { required: [], recommended: [] };

  for (const req of profile.required) {
    if (!resources[req]) recs.push(`Add ${RESOURCE_LABELS[req] || req}`);
  }
  for (const rec of profile.recommended) {
    if (!resources[rec]) recs.push(`Add ${RESOURCE_LABELS[rec] || rec}`);
  }
  if (dimensions.seo < 50) recs.push('Write an SEO description');
  if (dimensions.references < 40) recs.push('Add a primary technical reference');
  if (dimensions.relationships < 30) recs.push('Connect to at least three related canonical concepts');
  if (!resources.category) recs.push('Assign a category');
  if (!resources.tags) recs.push('Add tags');

  return [...new Set(recs)].slice(0, 6);
}

// Calculate global score (weighted)
export function calculateGlobalScore(objects) {
  if (!objects.length) return 0;
  const avg = (key) => objects.reduce((a, o) => a + (o.scores[key] || 0), 0) / objects.length;
  return Math.round(
    avg('metadata') * 0.20 +
    avg('relationships') * 0.15 +
    avg('seo') * 0.10 +
    avg('references') * 0.10 +
    avg('learning') * 0.15 +
    avg('developer') * 0.10 +
    avg('research') * 0.10 +
    (objects.reduce((a, o) => a + o.coverageScore, 0) / objects.length) * 0.10
  );
}

// Category coverage
export function calculateCategoryCoverage(objects, categories) {
  const byCategory = {};
  for (const obj of objects) {
    const catId = obj.categoryId;
    if (!catId) continue;
    if (!byCategory[catId]) byCategory[catId] = [];
    byCategory[catId].push(obj);
  }

  return Object.entries(byCategory).map(([catId, objs]) => {
    const cat = categories.find(c => c.id === catId);
    const avgCoverage = Math.round(objs.reduce((a, o) => a + o.coverageScore, 0) / objs.length);
    const totalRels = objs.reduce((a, o) => a + (o.centrality?.degree || 0), 0);
    const sorted = [...objs].sort((a, b) => b.coverageScore - a.coverageScore);
    const missingResources = {};
    for (const o of objs) {
      for (const m of (o.missingResources || [])) {
        missingResources[m] = (missingResources[m] || 0) + 1;
      }
    }
    return {
      id: catId,
      name: cat?.name || catId,
      coverage: avgCoverage,
      objects: objs.length,
      relationships: totalRels,
      strongest: sorted.slice(0, 3).map(o => o.title),
      weakest: sorted.slice(-3).reverse().map(o => o.title),
      missingResources,
    };
  }).sort((a, b) => b.objects - a.objects);
}

// Build the full coverage report
export function buildCoverageReport(manifest, searchIndex, related, missingConcepts, reconciliation, duplicateMerges, previousSnapshot) {
  const centrality = calculateGraphCentrality(related);
  const pageRank = calculatePageRank(related);

  const objects = (searchIndex || []).map(searchObj => {
    const relatedObjs = (related || {})[searchObj.id] || [];
    const resources = calculateObjectResources(searchObj, relatedObjs);
    const dimensions = calculateDimensionScores(searchObj, relatedObjs, resources);
    const coverageScore = calculateCoverageScore(searchObj, resources, dimensions);
    const c = centrality[searchObj.id] || { degree: 0, inbound: 0, outbound: 0 };
    const priorityScore = calculatePriorityScore(searchObj, coverageScore, c, resources, dimensions);
    const missingResources = Object.entries(resources)
      .filter(([k, v]) => !v && REQUIREMENT_PROFILES[searchObj.type] &&
        (REQUIREMENT_PROFILES[searchObj.type].required.includes(k) || REQUIREMENT_PROFILES[searchObj.type].recommended.includes(k)))
      .map(([k]) => RESOURCE_LABELS[k] || k);
    const recommendations = generateRecommendations(searchObj, resources, dimensions);

    return {
      canonicalUid: searchObj.id,
      title: searchObj.title,
      type: searchObj.type,
      categoryId: searchObj.categoryId,
      coverageScore,
      priorityScore,
      coverageLevel: getCoverageLevel(coverageScore),
      scores: dimensions,
      resources,
      missingResources,
      recommendations,
      centrality: {
        degree: c.degree,
        inbound: c.inbound,
        outbound: c.outbound,
        pageRank: pageRank[searchObj.id] || 0,
      },
    };
  });

  const globalScore = calculateGlobalScore(objects);
  const categories = calculateCategoryCoverage(objects, []);

  const coverageLevels = { excellent: 0, strong: 0, needsImprovement: 0, weak: 0, sparse: 0 };
  for (const o of objects) coverageLevels[o.coverageLevel]++;

  const dimAvg = (key) => Math.round(objects.reduce((a, o) => a + (o.scores[key] || 0), 0) / (objects.length || 1));

  const highPriorityGaps = objects.filter(o => o.priorityScore >= 70).length;
  const missingResearch = objects.filter(o => !o.resources.research).length;
  const missingTutorials = objects.filter(o => !o.resources.tutorial).length;
  const missingCodeExamples = objects.filter(o => !o.resources.codeSnippet).length;
  const missingSEO = objects.filter(o => o.scores.seo < 50).length;

  const summary = {
    globalScore,
    previousScore: previousSnapshot?.global_score ?? null,
    scoreChange: previousSnapshot ? globalScore - (previousSnapshot.global_score || 0) : null,
    totalObjects: objects.length,
    totalEdges: manifest?.totals?.edges || 0,
    coverageLevels,
    dimensionScores: {
      metadata: dimAvg('metadata'),
      relationships: dimAvg('relationships'),
      seo: dimAvg('seo'),
      references: dimAvg('references'),
      learning: dimAvg('learning'),
      developer: dimAvg('developer'),
      research: dimAvg('research'),
    },
    topCards: {
      highPriorityGaps,
      missingConcepts: Array.isArray(missingConcepts) ? missingConcepts.length : 0,
      unresolvedRelationships: manifest?.quality?.unresolvedRelationships || 0,
      missingSEO,
      missingResearch,
      missingTutorials,
      missingCodeExamples,
    },
  };

  return {
    version: '2.3.0',
    buildId: manifest?.buildId,
    releaseVersion: manifest?.releaseVersion,
    generatedAt: new Date().toISOString(),
    summary,
    objects,
    categories,
    missingConcepts: missingConcepts || [],
    reconciliation: reconciliation || {},
    duplicateMerges: duplicateMerges || {},
  };
}

export async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} for ${url}`);
  return res.json();
}

export { KNOWLEDGE_BASE, REQUIREMENT_PROFILES, RESOURCE_LABELS };