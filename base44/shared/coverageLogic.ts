// Coverage Intelligence v2.3.1 — Coverage Resolution & Diagnostics
// Consumes canonical GitHub Knowledge Engine data (search-index + graph + catalog + source-map).
// READ-ONLY: never mutates content. Results cached by buildId + engineVersion + schemaVersion.

const KNOWLEDGE_BASE = 'https://raw.githubusercontent.com/jasonansellto/the-blockchain-library/main/public/knowledge';

export const COVERAGE_ENGINE_VERSION = '2.3.1';
export const SCORING_SCHEMA_VERSION = 2;
export const RESOLUTION_VERSION = 1;

// Coverage-eligible types (news/newsletter/author/category excluded from coverage scoring)
export const COVERAGE_ELIGIBLE_TYPES = new Set([
  'glossary', 'topic', 'book', 'research', 'learning-path', 'resource', 'code-example', 'infrastructure',
]);

// Canonical type → coverage type alias (for backward compat with UI that uses article/code-snippet/rpc)
export const TYPE_ALIASES = {
  'topic': 'article',
  'code-example': 'code-snippet',
  'infrastructure': 'rpc',
};

// Requirement profiles by canonical type — context-aware expectations
const REQUIREMENT_PROFILES: Record<string, { required: string[]; recommended: string[] }> = {
  glossary: {
    required: ['definition', 'category', 'relatedConcepts', 'seo'],
    recommended: ['references', 'article', 'learningPath'],
  },
  topic: {
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
  'code-example': {
    required: ['code', 'description', 'category'],
    recommended: ['relatedArticles', 'developerResource'],
  },
  infrastructure: {
    required: ['technicalMetadata', 'network', 'endpoint', 'relationships'],
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

const RESOURCE_LABELS: Record<string, string> = {
  definition: 'Definition', summary: 'Summary', category: 'Category', tags: 'Tags',
  seo: 'SEO', references: 'References', relatedConcepts: 'Related Concepts',
  article: 'Article', book: 'Book', books: 'Books', research: 'Research',
  learningPath: 'Learning Path', codeSnippet: 'Code Example', codeExample: 'Code Example',
  developerResource: 'Developer Resource', rpc: 'RPC', tutorial: 'Tutorial', quiz: 'Quiz',
  relatedArticles: 'Related Articles', network: 'Network', provider: 'Provider',
  endpoint: 'Endpoint', title: 'Title', author: 'Author', description: 'Description',
  lessons: 'Lessons', name: 'Name', url: 'URL', code: 'Code',
  technicalMetadata: 'Technical Metadata', relationships: 'Relationships',
};

// ── Coverage level helpers ──
export function getCoverageLevel(score: number) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'strong';
  if (score >= 60) return 'needsImprovement';
  if (score >= 40) return 'weak';
  return 'sparse';
}

export function getCoverageLevelLabel(level: string) {
  return { excellent: 'Excellent', strong: 'Strong', needsImprovement: 'Needs Improvement', weak: 'Weak', sparse: 'Sparse' }[level] || level;
}

// ── Index building ──
export interface ResolutionIndexes {
  objectByUid: Map<string, any>;
  objectsByType: Map<string, any[]>;
  categoryById: Map<string, string>;
  categorySourceById: Map<string, string>;
  incomingEdgesByUid: Map<string, any[]>;
  outgoingEdgesByUid: Map<string, any[]>;
  sourceMapByBase44Id: Map<string, string>;
}

export function buildResolutionIndexes(searchIndex: any[], graph: any, catalog: any[], sourceMap: Record<string, string>): ResolutionIndexes {
  const objectByUid = new Map<string, any>();
  const objectsByType = new Map<string, any[]>();

  // Build object lookup from catalog (richer data) with search-index fallback
  const catalogByUid = new Map<string, any>();
  if (Array.isArray(catalog)) {
    for (const entry of catalog) {
      catalogByUid.set(entry.uid || entry.id, entry);
    }
  }

  for (const obj of searchIndex || []) {
    const catalogEntry = catalogByUid.get(obj.id);
    const merged = catalogEntry ? { ...obj, _catalog: catalogEntry } : { ...obj, _catalog: null };
    objectByUid.set(obj.id, merged);
    const typeArr = objectsByType.get(obj.type) || [];
    typeArr.push(merged);
    objectsByType.set(obj.type, typeArr);
  }

  // Build slug-to-uid index for resolving catalog related_* fields
  const slugToUid = new Map<string, string>();
  for (const obj of searchIndex || []) {
    const slug = obj.id.split(':').slice(1).join(':');
    if (slug) slugToUid.set(slug, obj.id);
    // Also map by canonicalUrl slug
    const urlSlug = obj.canonicalUrl?.split('/').pop();
    if (urlSlug) slugToUid.set(urlSlug, obj.id);
  }

  // Category resolution: build categoryId → name map from category objects
  const categoryById = new Map<string, string>();
  const categorySourceById = new Map<string, string>();

  // Priority 1: category objects in catalog with sourceId matching Base44 category IDs
  if (Array.isArray(catalog)) {
    for (const entry of catalog) {
      if (entry.type === 'category' || entry.uid?.startsWith('category:')) {
        const name = entry.title || entry.label || entry.name;
        if (name) {
          // Map by sourceId (Base44 Category entity ID)
          if (entry.sourceId) {
            categoryById.set(entry.sourceId, name);
            categorySourceById.set(entry.sourceId, 'category-object');
          }
          if (entry.sourceIds) {
            for (const sid of entry.sourceIds) {
              categoryById.set(sid, name);
              categorySourceById.set(sid, 'category-object');
            }
          }
          // Also map by canonical UID slug
          const slug = (entry.uid || entry.id || '').replace('category:', '');
          categoryById.set(`category:${slug}`, name);
          categorySourceById.set(`category:${slug}`, 'category-object');
        }
      }
    }
  }

  // Priority 2: source-map (Base44 ID → canonical UID, then resolve UID to name)
  const sourceMapByBase44Id = new Map<string, string>();
  for (const [base44Id, canonicalUid] of Object.entries(sourceMap || {})) {
    sourceMapByBase44Id.set(base44Id, canonicalUid as string);
    if (!categoryById.has(base44Id)) {
      const targetObj = objectByUid.get(canonicalUid as string);
      if (targetObj?.type === 'category' || (canonicalUid as string).startsWith('category:')) {
        const name = targetObj?.title || (canonicalUid as string).replace('category:', '');
        const displayName = name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
        categoryById.set(base44Id, displayName);
        categorySourceById.set(base44Id, 'source-map');
      }
    }
  }

  // Build bidirectional edge indexes from graph
  const incomingEdgesByUid = new Map<string, any[]>();
  const outgoingEdgesByUid = new Map<string, any[]>();

  const edges = graph?.edges || [];
  for (const edge of edges) {
    const { from, to, type, source, strength } = edge;
    if (!from || !to) continue;

    // Outgoing
    const outArr = outgoingEdgesByUid.get(from) || [];
    outArr.push({ target: to, type, source, strength, direction: 'outbound' });
    outgoingEdgesByUid.set(from, outArr);

    // Incoming
    const inArr = incomingEdgesByUid.get(to) || [];
    inArr.push({ source: from, type, source: source, strength, direction: 'inbound' });
    incomingEdgesByUid.set(to, inArr);
  }

  // Build reverse connections from catalog data.related_* fields
  // These contain slug arrays that establish relationships not in the graph
  const relatedFieldMap: Record<string, string> = {
    related_glossary: 'glossary',
    related_articles: 'topic',
    related_books: 'book',
    related_research: 'research',
  };

  if (Array.isArray(catalog)) {
    for (const entry of catalog) {
      const sourceUid = entry.uid || entry.id;
      if (!sourceUid || !entry.data) continue;

      for (const [field, targetType] of Object.entries(relatedFieldMap)) {
        const slugArr = entry.data[field];
        if (!Array.isArray(slugArr)) continue;

        for (const slug of slugArr) {
          if (typeof slug !== 'string' || !slug.trim()) continue;
          const cleanSlug = slug.trim().toLowerCase().replace(/\s+/g, '-');

          // Try to resolve slug to UID
          let targetUid = slugToUid.get(cleanSlug);
          if (!targetUid) {
            // Try with type prefix
            targetUid = slugToUid.get(`${targetType}:${cleanSlug}`);
          }
          if (!targetUid) {
            // Construct UID from type + slug
            targetUid = `${targetType}:${cleanSlug}`;
          }

          // Only add if target exists in our object map (avoid phantom connections)
          if (objectByUid.has(targetUid)) {
            // Add outgoing edge from source to target (if not already present)
            const outArr = outgoingEdgesByUid.get(sourceUid) || [];
            const edgeType = targetType === 'glossary' ? 'related-glossary' :
              targetType === 'topic' ? 'related-article' :
              targetType === 'book' ? 'related-book' : 'related-research';
            // Check for duplicate
            if (!outArr.some((e) => e.target === targetUid && e.type === edgeType)) {
              outArr.push({ target: targetUid, type: edgeType, source: 'catalog', strength: 1, direction: 'outbound' });
              outgoingEdgesByUid.set(sourceUid, outArr);
            }

            // Add incoming edge to target from source (reverse connection)
            const inArr = incomingEdgesByUid.get(targetUid) || [];
            if (!inArr.some((e) => e.source === sourceUid && e.type === edgeType)) {
              inArr.push({ source: sourceUid, type: edgeType, source: 'catalog', strength: 1, direction: 'inbound' });
              incomingEdgesByUid.set(targetUid, inArr);
            }
          }
        }
      }
    }
  }

  return { objectByUid, objectsByType, categoryById, categorySourceById, incomingEdgesByUid, outgoingEdgesByUid, sourceMapByBase44Id };
}

// ── Category resolution ──
export function resolveCategory(obj: any, indexes: ResolutionIndexes): { id: string | null; name: string; source: string } {
  const catId = obj.categoryId;
  if (!catId) return { id: null, name: 'Uncategorized', source: 'none' };

  // Priority 1: category object UID
  if (catId.startsWith('category:')) {
    const catObj = indexes.objectByUid.get(catId);
    if (catObj?.title) return { id: catId, name: catObj.title, source: 'category-object' };
  }

  // Priority 2: categoryById map (from catalog category objects)
  if (indexes.categoryById.has(catId)) {
    return { id: catId, name: indexes.categoryById.get(catId)!, source: indexes.categorySourceById.get(catId) || 'category-mapping' };
  }

  // Priority 3: source-map lookup
  const mappedUid = indexes.sourceMapByBase44Id.get(catId);
  if (mappedUid) {
    const targetObj = indexes.objectByUid.get(mappedUid);
    if (targetObj?.title) return { id: catId, name: targetObj.title, source: 'source-map' };
  }

  // Priority 5: fallback
  return { id: catId, name: 'Uncategorized', source: 'unresolved' };
}

// ── Bidirectional relationship resolution with deduplication ──
export function resolveRelationships(uid: string, indexes: ResolutionIndexes) {
  const outgoing = indexes.outgoingEdgesByUid.get(uid) || [];
  const incoming = indexes.incomingEdgesByUid.get(uid) || [];

  // Merge and deduplicate by target UID
  const seen = new Set<string>();
  const allRelationships: any[] = [];
  const selfRelationships: any[] = [];

  for (const edge of outgoing) {
    if (edge.target === uid) { selfRelationships.push(edge); continue; }
    const key = `${edge.target}:${edge.type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const targetObj = indexes.objectByUid.get(edge.target);
    allRelationships.push({
      uid: edge.target,
      type: targetObj?.type || 'unknown',
      title: targetObj?.title || edge.target,
      edgeType: edge.type,
      direction: 'outbound',
      resolved: !!targetObj,
    });
  }

  for (const edge of incoming) {
    if (edge.source === uid) { selfRelationships.push(edge); continue; }
    const key = `${edge.source}:${edge.type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const targetObj = indexes.objectByUid.get(edge.source);
    allRelationships.push({
      uid: edge.source,
      type: targetObj?.type || 'unknown',
      title: targetObj?.title || edge.source,
      edgeType: edge.type,
      direction: 'inbound',
      resolved: !!targetObj,
    });
  }

  return { allRelationships, outgoing, incoming, selfRelationships, uniqueCount: allRelationships.length };
}

// ── Resource type classification from resolved relationships ──
export function classifyResources(relationships: any[]) {
  const classified = {
    books: [] as any[],
    research: [] as any[],
    tutorials: [] as any[],
    learningPaths: [] as any[],
    codeExamples: [] as any[],
    developerResources: [] as any[],
    infrastructureResources: [] as any[],
    relatedConcepts: [] as any[],
    articles: [] as any[],
  };

  const seenUids = new Set<string>();
  for (const rel of relationships) {
    if (seenUids.has(rel.uid)) continue;
    seenUids.add(rel.uid);

    switch (rel.type) {
      case 'book': classified.books.push(rel); break;
      case 'research': classified.research.push(rel); break;
      case 'learning-path': classified.learningPaths.push(rel); classified.tutorials.push(rel); break;
      case 'code-example': classified.codeExamples.push(rel); break;
      case 'resource': classified.developerResources.push(rel); break;
      case 'infrastructure': classified.infrastructureResources.push(rel); break;
      case 'glossary': classified.relatedConcepts.push(rel); break;
      case 'topic': classified.articles.push(rel); break;
    }
  }

  return classified;
}

// ── Reference extraction ──
const REFERENCE_FIELD_MAP: Record<string, string[]> = {
  doi: ['doi', 'DOI', 'data.doi'],
  isbn: ['isbn', 'ISBN', 'data.isbn', 'data.isbn_ebook', 'data.isbn_paperback'],
  url: ['url', 'official_url', 'documentation_url', 'website', 'data.url', 'data.official_url', 'data.documentation_url', 'data.website', 'data.pdf_url'],
  repository: ['repository', 'repo_url', 'data.repository', 'data.repo_url'],
  publication: ['publication', 'journal', 'data.publication', 'data.journal'],
  arxiv: ['arxiv', 'arxiv_id', 'data.arxiv', 'data.arxiv_id'],
  ssrn: ['ssrn', 'ssrn_id', 'data.ssrn', 'data.ssrn_id'],
  citation: ['citation', 'data.citation'],
};

function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function isValidReferenceUrl(url: string, selfUrl: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (url === selfUrl) return false;
  if (url.startsWith('/') && !url.startsWith('//')) return false; // internal navigation
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('doi:') && !url.startsWith('arxiv:')) return false;
  if (url.includes('theblockchainlibrary.com') && !url.includes('docs.')) return false;
  return true;
}

export function extractReferences(obj: any): { value: string; type: string; source: string; counts: boolean }[] {
  const refs: { value: string; type: string; source: string; counts: boolean }[] = [];
  const seen = new Set<string>();
  const selfUrl = obj.canonicalUrl || '';
  const catalog = obj._catalog;
  const dataSources = [catalog?.data, catalog, obj].filter(Boolean);

  // Extract from external_references array
  for (const src of dataSources) {
    const extRefs = src?.external_references || src?.references;
    if (Array.isArray(extRefs)) {
      for (const ref of extRefs) {
        const value = typeof ref === 'string' ? ref : (ref?.url || ref?.link || ref?.title);
        if (value && !seen.has(value)) {
          seen.add(value);
          refs.push({ value, type: 'External Reference', source: 'external_references', counts: true });
        }
      }
    }
  }

  // Extract from known reference fields
  for (const [refType, fields] of Object.entries(REFERENCE_FIELD_MAP)) {
    for (const field of fields) {
      for (const src of dataSources) {
        const val = getNestedValue(src, field);
        if (val && typeof val === 'string' && val.trim()) {
          const cleanVal = val.trim();
          if (refType === 'url' && !isValidReferenceUrl(cleanVal, selfUrl)) continue;
          if (!seen.has(cleanVal)) {
            seen.add(cleanVal);
            const typeLabel = {
              doi: 'Academic / Research', isbn: 'Book Reference', url: 'Official Documentation',
              repository: 'Repository', publication: 'Academic / Research', arxiv: 'Academic / Research',
              ssrn: 'Academic / Research', citation: 'Academic / Research',
            }[refType] || 'Reference';
            refs.push({ value: cleanVal, type: typeLabel, source: field, counts: true });
          }
        }
      }
    }
  }

  // Extract from related_research/related_books arrays in catalog data (these are title strings, not UIDs, but still count as references)
  const relatedArrays = [
    { field: 'related_research', type: 'Academic / Research' },
    { field: 'related_books', type: 'Book Reference' },
  ];
  for (const { field, type } of relatedArrays) {
    for (const src of dataSources) {
      const arr = src?.[field];
      if (Array.isArray(arr)) {
        for (const item of arr) {
          if (typeof item === 'string' && item.trim() && !seen.has(item)) {
            seen.add(item);
            refs.push({ value: item.trim(), type, source: field, counts: true });
          }
        }
      }
    }
  }

  return refs;
}

// ── Build Coverage Resolution object ──
export function buildCoverageResolution(obj: any, indexes: ResolutionIndexes) {
  const category = resolveCategory(obj, indexes);
  const { allRelationships, outgoing, incoming, selfRelationships, uniqueCount } = resolveRelationships(obj.id, indexes);
  const classified = classifyResources(allRelationships);
  const references = extractReferences(obj);

  // Check for presence of fields in catalog data
  const catalogData = obj._catalog?.data || {};
  const hasField = (field: string) => {
    const val = catalogData[field] ?? obj[field];
    return val != null && val !== '' && (!Array.isArray(val) || val.length > 0);
  };

  const resolved = {
    canonicalUid: obj.id,
    type: obj.type,
    title: obj.title,
    category,
    relatedConcepts: classified.relatedConcepts,
    books: classified.books,
    research: classified.research,
    tutorials: classified.tutorials,
    learningPaths: classified.learningPaths,
    codeExamples: classified.codeExamples,
    developerResources: classified.developerResources,
    infrastructureResources: classified.infrastructureResources,
    references,
    tags: obj.tags || [],
    seo: {
      title: catalogData.seo_title || obj._catalog?.seoTitle || '',
      description: catalogData.seo_description || obj._catalog?.seoDescription || '',
      canonicalUrl: obj.canonicalUrl || '',
    },
    metadata: {
      definition: hasField('definition') || !!(obj.summary || catalogData.summary),
      summary: !!(obj.summary || catalogData.summary || catalogData.definition || catalogData.abstract),
      description: hasField('description') || !!(obj.summary || catalogData.abstract),
      code: hasField('code'),
      lessons: hasField('lessons'),
      author: hasField('author') || hasField('authors'),
      difficulty: catalogData.difficulty || obj._catalog?.difficulty || '',
      subcategory: catalogData.subcategory || '',
    },
    inboundRelationships: incoming,
    outboundRelationships: outgoing,
    allRelationships,
    selfRelationships,
  };

  return resolved;
}

// ── Calculate resources (boolean map for requirement profiles) ──
export function calculateObjectResources(resolved: any) {
  const r = resolved;
  return {
    definition: !!r.metadata.definition,
    summary: !!r.metadata.summary,
    category: r.category.id != null && r.category.name !== 'Uncategorized',
    tags: r.tags.length > 0,
    seo: !!(r.seo.title && r.seo.description && r.seo.canonicalUrl),
    references: r.references.length > 0,
    relatedConcepts: r.relatedConcepts.length > 0,
    article: r.articles?.length > 0 || r.relatedConcepts.length > 0,
    articles: r.articles?.length > 0,
    book: r.books.length > 0,
    books: r.books.length > 0,
    research: r.research.length > 0,
    learningPath: r.learningPaths.length > 0,
    codeSnippet: r.codeExamples.length > 0,
    codeExample: r.codeExamples.length > 0,
    developerResource: r.developerResources.length > 0,
    rpc: r.infrastructureResources.length > 0,
    tutorial: r.tutorials.length > 0 || r.learningPaths.length > 0,
    quiz: false,
    relatedArticles: r.articles?.length > 0 || r.relatedConcepts.length > 0,
    relationships: r.allRelationships.length > 0,
    title: !!r.title,
    author: !!r.metadata.author,
    description: !!r.metadata.description,
    code: !!r.metadata.code,
    lessons: !!r.metadata.lessons,
    name: !!r.title,
    url: !!r.seo.canonicalUrl,
    network: !!r.metadata.subcategory || r.type === 'infrastructure',
    provider: r.type === 'infrastructure',
    endpoint: r.type === 'infrastructure' && r.infrastructureResources.length > 0,
    technicalMetadata: r.type === 'infrastructure' && !!r.metadata.description,
  };
}

// ── Calculate dimension scores (0-100) ──
export function calculateDimensionScores(resolved: any, resources: any) {
  const relCount = resolved.allRelationships.length;
  const typeDiversity = new Set(resolved.allRelationships.map((r: any) => r.type)).size;
  const refCount = resolved.references.length;

  const metadata = Math.min(100,
    (resolved.title ? 15 : 0) +
    (resources.summary || resources.definition ? 20 : 0) +
    (resources.category ? 20 : 0) +
    (resources.tags ? 15 : 0) +
    (resolved.metadata.difficulty ? 10 : 0) +
    (resolved.seo.canonicalUrl ? 10 : 0) +
    (resolved.metadata.subcategory ? 10 : 0)
  );

  const seo = Math.min(100,
    (resolved.seo.description ? 30 : 0) +
    (resolved.seo.canonicalUrl ? 25 : 0) +
    (resolved.title ? 20 : 0) +
    (resources.tags ? 15 : 0) +
    (resources.category ? 10 : 0)
  );

  const references = Math.min(100,
    (refCount > 0 ? Math.min(40, refCount * 10) : 0) +
    (resources.research ? 30 : 0) +
    (resources.book ? 20 : 0) +
    (resources.article ? 10 : 0)
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
    (resources.article ? 20 : 0)
  );

  const developer = Math.min(100,
    (resources.codeSnippet ? 35 : 0) +
    (resources.developerResource ? 35 : 0) +
    (resources.rpc ? 30 : 0)
  );

  const research = Math.min(100,
    (resources.research ? 60 : 0) +
    (resources.book ? 25 : 0) +
    (refCount > 0 ? 15 : 0)
  );

  return { metadata, seo, references, relationships, learning, developer, research };
}

// ── Calculate coverage score (0-100) ──
export function calculateCoverageScore(resolved: any, resources: any, dimensions: any) {
  const profile = REQUIREMENT_PROFILES[resolved.type] || { required: ['definition', 'category', 'seo'], recommended: ['relationships'] };

  const reqPresent = profile.required.filter((r) => resources[r]).length;
  const reqTotal = profile.required.length;
  const reqScore = reqTotal > 0 ? reqPresent / reqTotal : 1;

  const recPresent = profile.recommended.filter((r) => resources[r]).length;
  const recTotal = profile.recommended.length;
  const recScore = recTotal > 0 ? recPresent / recTotal : 1;

  const baseScore = (reqScore * 0.65 + recScore * 0.35) * 100;
  const dimAvg = (dimensions.metadata + dimensions.seo + dimensions.references +
    dimensions.relationships + dimensions.learning + dimensions.developer + dimensions.research) / 7;

  return Math.round(baseScore * 0.65 + dimAvg * 0.35);
}

// ── Calculate priority score with safeguards ──
export function calculatePriorityScore(resolved: any, coverageScore: number, centrality: any, resources: any, dimensions: any, pageRankValue: number) {
  const profile = REQUIREMENT_PROFILES[resolved.type] || { required: [], recommended: [] };
  const allExpected = [...profile.required, ...profile.recommended];
  const missingCount = allExpected.filter((r) => !resources[r]).length;

  // Normalized component defaults (never zero just because one component is missing)
  const degree = centrality.degree || 0;
  const inbound = centrality.inbound || 0;
  const outbound = centrality.outbound || 0;

  // Graph importance: use PageRank if available, fall back to degree centrality
  const prValue = pageRankValue > 0 ? pageRankValue : Math.min(100, degree * 5);
  const graphImportance = Math.min(100, prValue);

  const coverageGapWeight = (100 - coverageScore) * 0.25;
  const centralityWeight = graphImportance * 0.25;
  const resourceGapWeight = Math.min(100, missingCount * 15) * 0.20;
  const graphImportanceWeight = (Math.min(100, (inbound + outbound) * 4)) * 0.15;
  const editorialImportanceWeight = (
    (dimensions.metadata < 80 ? 25 : 0) +
    (dimensions.references < 40 ? 25 : 0) +
    (dimensions.seo < 40 ? 25 : 0) +
    (dimensions.relationships < 30 ? 25 : 0)
  ) * 0.15;

  const score = coverageGapWeight + centralityWeight + resourceGapWeight + graphImportanceWeight + editorialImportanceWeight;

  return Math.round(Math.min(100, Math.max(5, score)));
}

// ── Graph centrality (degree) ──
export function calculateGraphCentrality(indexes: ResolutionIndexes) {
  const centrality: Record<string, { degree: number; inbound: number; outbound: number }> = {};

  for (const [uid, outEdges] of indexes.outgoingEdgesByUid) {
    if (!centrality[uid]) centrality[uid] = { degree: 0, inbound: 0, outbound: 0 };
    centrality[uid].outbound = outEdges.length;
  }

  for (const [uid, inEdges] of indexes.incomingEdgesByUid) {
    if (!centrality[uid]) centrality[uid] = { degree: 0, inbound: 0, outbound: 0 };
    centrality[uid].inbound = inEdges.length;
  }

  for (const uid of Object.keys(centrality)) {
    centrality[uid].degree = centrality[uid].inbound + centrality[uid].outbound;
  }

  return centrality;
}

// ── PageRank with diagnostics ──
export function calculatePageRank(indexes: ResolutionIndexes, iterations = 20, damping = 0.85) {
  const diagnostics = {
    nodeCount: 0,
    edgeCount: 0,
    nodesWithNonZeroPageRank: 0,
    minPageRank: 0,
    maxPageRank: 0,
    medianPageRank: 0,
    failed: false,
    fallback: 'degree-centrality' as 'degree-centrality' | null,
  };

  try {
    const inbound: Record<string, string[]> = {};
    const outboundCount: Record<string, number> = {};

    for (const [uid, outEdges] of indexes.outgoingEdgesByUid) {
      outboundCount[uid] = outEdges.length;
      for (const edge of outEdges) {
        const target = edge.target;
        if (!inbound[target]) inbound[target] = [];
        inbound[target].push(uid);
      }
    }

    const allUids = new Set([...indexes.outgoingEdgesByUid.keys(), ...indexes.incomingEdgesByUid.keys()]);
    const n = allUids.size || 1;
    diagnostics.nodeCount = n;
    diagnostics.edgeCount = Object.values(outboundCount).reduce((a, b) => a + b, 0);

    let pr: Record<string, number> = {};
    for (const uid of allUids) pr[uid] = 1 / n;

    for (let i = 0; i < iterations; i++) {
      const newPr: Record<string, number> = {};
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
    const normalized: Record<string, number> = {};
    for (const [uid, score] of Object.entries(pr)) {
      normalized[uid] = (score / maxPr) * 100;
    }

    const values = Object.values(normalized).sort((a, b) => a - b);
    diagnostics.nodesWithNonZeroPageRank = values.filter((v) => v > 0).length;
    diagnostics.minPageRank = values[0] || 0;
    diagnostics.maxPageRank = values[values.length - 1] || 0;
    diagnostics.medianPageRank = values[Math.floor(values.length / 2)] || 0;
    diagnostics.failed = false;
    diagnostics.fallback = null;

    return { pageRank: normalized, diagnostics };
  } catch (e) {
    diagnostics.failed = true;
    diagnostics.fallback = 'degree-centrality';
    // Fallback: degree centrality as PageRank
    const fallback: Record<string, number> = {};
    for (const [uid] of indexes.outgoingEdgesByUid) {
      const degree = (indexes.outgoingEdgesByUid.get(uid)?.length || 0) + (indexes.incomingEdgesByUid.get(uid)?.length || 0);
      fallback[uid] = Math.min(100, degree * 5);
    }
    return { pageRank: fallback, diagnostics };
  }
}

// ── Generate deterministic "why this score" explanation ──
export function generateWhyThisScore(resolved: any, resources: any, dimensions: any, coverageScore: number) {
  const parts: string[] = [];
  const name = resolved.title;

  // Metadata assessment
  const metaStrong = dimensions.metadata >= 70;
  parts.push(metaStrong
    ? `${name} has strong metadata`
    : `${name} has incomplete metadata`);

  // Relationships assessment
  const relStrong = dimensions.relationships >= 60;
  parts.push(relStrong
    ? 'strong relationship coverage'
    : 'limited relationship coverage');

  // Resource assessments
  const resourceParts: string[] = [];
  if (resources.learningPath) resourceParts.push('learning resources');
  if (resources.developerResource || resources.codeSnippet) resourceParts.push('developer coverage');
  if (resources.research) resourceParts.push('research coverage');
  if (resources.book) resourceParts.push('book connections');

  if (resourceParts.length > 0) {
    parts.push(`and ${resourceParts.join(', ')}`);
  }

  // Missing assessment
  const missing: string[] = [];
  if (!resources.research && REQUIREMENT_PROFILES[resolved.type]?.recommended.includes('research')) missing.push('research');
  if (!resources.learningPath && REQUIREMENT_PROFILES[resolved.type]?.recommended.includes('learningPath')) missing.push('learning paths');
  if (!resources.codeSnippet && REQUIREMENT_PROFILES[resolved.type]?.recommended.includes('codeExample')) missing.push('code examples');
  if (!resources.references) missing.push('references');

  let explanation = parts.join(', ') + '.';

  if (missing.length > 0) {
    explanation += ` ${missing.length === 1 ? `No canonical ${missing[0]} was detected.` : `Missing: ${missing.join(', ')}.`}`;
  } else if (resourceParts.length > 0) {
    explanation += ' All recommended resources are present.';
  }

  return explanation;
}

// ── Generate editorial recommendations ──
export function generateRecommendations(resolved: any, resources: any, dimensions: any) {
  const recs: string[] = [];
  const profile = REQUIREMENT_PROFILES[resolved.type] || { required: [], recommended: [] };

  for (const req of profile.required) {
    if (!resources[req]) recs.push(`Add ${RESOURCE_LABELS[req] || req}`);
  }
  for (const rec of profile.recommended) {
    if (!resources[rec]) recs.push(`Add ${RESOURCE_LABELS[rec] || rec}`);
  }
  if (dimensions.seo < 50) recs.push('Write an SEO description');
  if (dimensions.references < 40 && !resources.references) recs.push('Add a primary technical reference');
  if (dimensions.relationships < 30) recs.push('Connect to at least three related canonical concepts');
  if (!resources.category) recs.push('Assign a category');
  if (!resources.tags) recs.push('Add tags');

  return [...new Set(recs)].slice(0, 6);
}

// ── Calculate global score (weighted) ──
export function calculateGlobalScore(objects: any[]) {
  if (!objects.length) return 0;
  const avg = (key: string) => objects.reduce((a, o) => a + (o.scores[key] || 0), 0) / objects.length;
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

// ── Category coverage ──
export function calculateCategoryCoverage(objects: any[]) {
  const byCategory: Record<string, any[]> = {};
  for (const obj of objects) {
    const catId = obj.category?.id || obj.categoryId;
    if (!catId) continue;
    if (!byCategory[catId]) byCategory[catId] = [];
    byCategory[catId].push(obj);
  }

  return Object.entries(byCategory).map(([catId, objs]) => {
    const cat = objs[0]?.category;
    const avgCoverage = Math.round(objs.reduce((a, o) => a + o.coverageScore, 0) / objs.length);
    const totalRels = objs.reduce((a, o) => a + (o.centrality?.degree || 0), 0);
    const sorted = [...objs].sort((a, b) => b.coverageScore - a.coverageScore);
    const missingResources: Record<string, number> = {};
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
      strongest: sorted.slice(0, 3).map((o) => o.title),
      weakest: sorted.slice(-3).reverse().map((o) => o.title),
      missingResources,
    };
  }).sort((a, b) => b.objects - a.objects);
}

// ── Health checks ──
function calculateHealthChecks(diagnostics: any, summary: any) {
  const checks: Record<string, 'healthy' | 'warning' | 'failed'> = {};

  // Category resolution
  const catResolutionRate = diagnostics.totalObjects > 0
    ? (diagnostics.resolvedCategories / diagnostics.totalObjects) : 0;
  checks.categoryResolution = catResolutionRate >= 0.80 ? 'healthy' : catResolutionRate >= 0.60 ? 'warning' : 'failed';

  // Relationship resolution
  const relResolutionRate = diagnostics.totalRelationships > 0
    ? (diagnostics.resolvedRelationships / diagnostics.totalRelationships) : 0;
  checks.relationshipResolution = relResolutionRate >= 0.60 ? 'healthy' : relResolutionRate >= 0.40 ? 'warning' : 'failed';

  // Reference resolution
  checks.referenceResolution = diagnostics.resolvedReferences > 0 ? 'healthy' : 'failed';

  // Resource mapping
  checks.resourceMapping = diagnostics.unknownTypeCount === 0 ? 'healthy' : diagnostics.unknownTypeCount < 100 ? 'warning' : 'failed';

  // Priority calculation
  checks.priorityCalculation = summary.topCards.highPriorityGaps > 0 ? 'healthy' : 'warning';

  return checks;
}

// ── Anomaly detection ──
function detectAnomalies(diagnostics: any, summary: any, objects: any[]) {
  const anomalies: { type: string; message: string; severity: 'warning' | 'failed' }[] = [];

  // All objects missing one resource type
  if (diagnostics.totalObjects > 100 && summary.topCards.missingResearch === diagnostics.totalObjects) {
    anomalies.push({ type: 'ALL_MISSING_RESEARCH', message: 'All objects marked as missing research — likely a resolution failure.', severity: 'failed' });
  }
  if (diagnostics.totalObjects > 100 && summary.topCards.missingTutorials === diagnostics.totalObjects) {
    anomalies.push({ type: 'ALL_MISSING_TUTORIALS', message: 'All objects marked as missing tutorials — likely a resolution failure.', severity: 'failed' });
  }
  if (diagnostics.totalObjects > 100 && summary.topCards.missingCodeExamples === diagnostics.totalObjects) {
    anomalies.push({ type: 'ALL_MISSING_CODE', message: 'All objects marked as missing code examples — likely a resolution failure.', severity: 'failed' });
  }

  // Zero references
  if (diagnostics.resolvedReferences === 0) {
    anomalies.push({ type: 'ZERO_REFERENCES', message: 'Zero references detected across all objects.', severity: 'failed' });
  }

  // Zero priority gaps despite sparse objects
  if (summary.topCards.highPriorityGaps === 0 && objects.filter((o) => o.coverageScore < 40).length > 100) {
    anomalies.push({ type: 'ZERO_PRIORITY_GAPS', message: 'Zero priority gaps despite >100 sparse objects.', severity: 'warning' });
  }

  // More resource connections than graph edges
  const totalResourceConnections = objects.reduce((a, o) => a + (o.resolvedResources?.total || 0), 0);
  if (totalResourceConnections > diagnostics.totalRelationships && diagnostics.totalRelationships > 0) {
    anomalies.push({ type: 'MORE_CONNECTIONS_THAN_EDGES', message: 'More resource connections than graph edges detected.', severity: 'warning' });
  }

  // More unresolved than total relationships
  if (diagnostics.unresolvedRelationships > diagnostics.totalRelationships && diagnostics.totalRelationships > 0) {
    anomalies.push({ type: 'MORE_UNRESOLVED_THAN_TOTAL', message: 'More unresolved relationships than total relationships.', severity: 'failed' });
  }

  return anomalies;
}

// ── Build the full coverage report ──
export function buildCoverageReport(
  manifest: any,
  searchIndex: any[],
  related: any,
  graph: any,
  catalog: any[],
  sourceMap: Record<string, string>,
  missingConcepts: any[],
  reconciliation: any,
  duplicateMerges: any,
  previousSnapshot: any,
  options: { validate?: boolean } = {}
) {
  // Build resolution indexes
  const indexes = buildResolutionIndexes(searchIndex, graph, catalog, sourceMap);
  const centrality = calculateGraphCentrality(indexes);
  const { pageRank, diagnostics: prDiagnostics } = calculatePageRank(indexes);

  // Diagnostics accumulators
  const mappingWarnings: any[] = [];
  let resolvedCategories = 0;
  let unresolvedCategories = 0;
  let resolvedRelationships = 0;
  let unresolvedRelationships = 0;
  let resolvedReferences = 0;
  let objectsWithNoRelationships = 0;
  let objectsWithNoCategory = 0;
  let objectsWithNoReferences = 0;
  let unknownTypeCount = 0;

  // Resource resolution counts
  let objectsWithResearch = 0;
  let objectsWithBooks = 0;
  let objectsWithLearningPaths = 0;
  let objectsWithCodeExamples = 0;
  let objectsWithDeveloperResources = 0;
  let objectsWithReferences = 0;

  // Build objects for coverage-eligible types only
  const objects = (searchIndex || [])
    .filter((obj) => COVERAGE_ELIGIBLE_TYPES.has(obj.type))
    .map((searchObj) => {
      const resolved = buildCoverageResolution(searchObj, indexes);
      const resources = calculateObjectResources(resolved);
      const dimensions = calculateDimensionScores(resolved, resources);
      const coverageScore = calculateCoverageScore(resolved, resources, dimensions);
      const c = centrality[searchObj.id] || { degree: 0, inbound: 0, outbound: 0 };
      const prValue = pageRank[searchObj.id] || 0;
      const priorityScore = calculatePriorityScore(resolved, coverageScore, c, resources, dimensions, prValue);
      const profile = REQUIREMENT_PROFILES[searchObj.type] || { required: [], recommended: [] };
      const missingResources = [
        ...profile.required.filter((r) => !resources[r]),
        ...profile.recommended.filter((r) => !resources[r]),
      ].map((r) => RESOURCE_LABELS[r] || r);
      const recommendations = generateRecommendations(resolved, resources, dimensions);
      const whyThisScore = generateWhyThisScore(resolved, resources, dimensions, coverageScore);

      // Update diagnostics
      if (resolved.category.name !== 'Uncategorized') resolvedCategories++;
      else unresolvedCategories++;
      if (resolved.allRelationships.length === 0) objectsWithNoRelationships++;
      if (!resolved.category.id) objectsWithNoCategory++;
      if (resolved.references.length === 0) objectsWithNoReferences++;

      resolvedRelationships += resolved.allRelationships.filter((r: any) => r.resolved).length;
      unresolvedRelationships += resolved.allRelationships.filter((r: any) => !r.resolved).length;
      resolvedReferences += resolved.references.length;

      if (resolved.research.length > 0) objectsWithResearch++;
      if (resolved.books.length > 0) objectsWithBooks++;
      if (resolved.learningPaths.length > 0) objectsWithLearningPaths++;
      if (resolved.codeExamples.length > 0) objectsWithCodeExamples++;
      if (resolved.developerResources.length > 0) objectsWithDeveloperResources++;
      if (resolved.references.length > 0) objectsWithReferences++;

      // Check for unknown types
      if (!COVERAGE_ELIGIBLE_TYPES.has(searchObj.type)) {
        unknownTypeCount++;
        mappingWarnings.push({ type: 'UNKNOWN_CANONICAL_TYPE', uid: searchObj.id, message: `Unknown type: ${searchObj.type}` });
      }

      // Check for self-relationships
      if (resolved.selfRelationships.length > 0) {
        mappingWarnings.push({ type: 'SELF_RELATIONSHIP', uid: searchObj.id, count: resolved.selfRelationships.length });
      }

      // Check for unresolved category
      if (resolved.category.source === 'unresolved') {
        mappingWarnings.push({ type: 'CATEGORY_UNRESOLVED', uid: searchObj.id, categoryId: resolved.category.id });
      }

      // Check for unresolved relationship targets
      for (const rel of resolved.allRelationships) {
        if (!rel.resolved) {
          mappingWarnings.push({ type: 'RELATIONSHIP_TARGET_UNRESOLVED', uid: searchObj.id, target: rel.uid });
        }
      }

      // Check for missing required fields
      for (const req of profile.required) {
        if (!resources[req]) {
          mappingWarnings.push({ type: 'MISSING_REQUIRED_FIELD', uid: searchObj.id, field: req });
        }
      }

      const resolvedResourceTotal =
        resolved.books.length + resolved.research.length + resolved.learningPaths.length +
        resolved.codeExamples.length + resolved.developerResources.length + resolved.infrastructureResources.length;

      return {
        canonicalUid: searchObj.id,
        title: searchObj.title,
        type: searchObj.type,
        typeAlias: TYPE_ALIASES[searchObj.type] || searchObj.type,
        categoryId: resolved.category.id,
        category: resolved.category,
        coverageScore,
        priorityScore,
        coverageLevel: getCoverageLevel(coverageScore),
        scores: dimensions,
        resources,
        resolvedResources: {
          books: resolved.books.length,
          research: resolved.research.length,
          learningPaths: resolved.learningPaths.length,
          tutorials: resolved.tutorials.length,
          codeExamples: resolved.codeExamples.length,
          developerResources: resolved.developerResources.length,
          infrastructureResources: resolved.infrastructureResources.length,
          relatedConcepts: resolved.relatedConcepts.length,
          references: resolved.references.length,
          total: resolvedResourceTotal + resolved.relatedConcepts.length,
        },
        missingResources,
        recommendations,
        centrality: {
          degree: c.degree,
          inbound: c.inbound,
          outbound: c.outbound,
          pageRank: prValue,
        },
        references: resolved.references,
        whyThisScore,
        diagnostics: {
          canonicalUid: searchObj.id,
          sourceType: searchObj.type,
          categoryResolution: resolved.category,
          inboundRelationships: c.inbound,
          outboundRelationships: c.outbound,
          uniqueRelationships: resolved.allRelationships.length,
          resolvedResources: {
            books: resolved.books.length,
            research: resolved.research.length,
            learningPaths: resolved.learningPaths.length,
            codeExamples: resolved.codeExamples.length,
            developerResources: resolved.developerResources.length,
            references: resolved.references.length,
          },
          referencesDetected: resolved.references.length,
          requirementProfile: profile,
          coverageCalculation: {
            requirementFulfillment: Math.round((profile.required.filter((r) => resources[r]).length / (profile.required.length || 1)) * 100),
            dimensionAverage: Math.round((dimensions.metadata + dimensions.seo + dimensions.references + dimensions.relationships + dimensions.learning + dimensions.developer + dimensions.research) / 7),
            final: coverageScore,
          },
          priorityCalculation: {
            coverageGap: 100 - coverageScore,
            centrality: Math.round(prValue),
            resourceGap: Math.min(100, missingResources.length * 15),
            final: priorityScore,
          },
        },
      };
    });

  const globalScore = calculateGlobalScore(objects);
  const categories = calculateCategoryCoverage(objects);

  const coverageLevels = { excellent: 0, strong: 0, needsImprovement: 0, weak: 0, sparse: 0 };
  for (const o of objects) coverageLevels[o.coverageLevel]++;

  const dimAvg = (key: string) => Math.round(objects.reduce((a, o) => a + (o.scores[key] || 0), 0) / (objects.length || 1));

  // Fixed missing counts — only count where required/recommended
  const highPriorityGaps = objects.filter((o) => o.priorityScore >= 70).length;
  const missingResearch = objects.filter((o) => {
    const profile = REQUIREMENT_PROFILES[o.type];
    return profile && (profile.required.includes('research') || profile.recommended.includes('research')) && !o.resources.research;
  }).length;
  const missingTutorials = objects.filter((o) => {
    const profile = REQUIREMENT_PROFILES[o.type];
    return profile && (profile.required.includes('learningPath') || profile.recommended.includes('learningPath')) && !o.resources.learningPath;
  }).length;
  const missingCodeExamples = objects.filter((o) => {
    const profile = REQUIREMENT_PROFILES[o.type];
    return profile && (profile.required.includes('codeExample') || profile.recommended.includes('codeExample')) && !o.resources.codeSnippet;
  }).length;
  const missingSEO = objects.filter((o) => o.scores.seo < 50).length;

  const summary = {
    globalScore,
    previousScore: previousSnapshot?.global_score ?? null,
    scoreChange: previousSnapshot ? globalScore - (previousSnapshot.global_score || 0) : null,
    totalObjects: objects.length,
    totalCanonicalObjects: (searchIndex || []).length,
    totalEdges: manifest?.totals?.edges || graph?.edges?.length || 0,
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

  // Diagnostics
  const diagnostics = {
    totalObjects: (searchIndex || []).length,
    coverageEligibleObjects: objects.length,
    resolvedCategories,
    unresolvedCategories,
    resolvedRelationships,
    unresolvedRelationships,
    totalRelationships: resolvedRelationships + unresolvedRelationships,
    resolvedReferences,
    objectsWithNoRelationships,
    objectsWithNoCategory,
    objectsWithNoReferences,
    unknownTypeCount,
    resourceResolutionCounts: {
      objectsWithResearch,
      objectsWithBooks,
      objectsWithLearningPaths,
      objectsWithCodeExamples,
      objectsWithDeveloperResources,
      objectsWithReferences,
    },
    pageRankDiagnostics: prDiagnostics,
    mappingWarnings: mappingWarnings.slice(0, 500), // Cap for performance
    mappingWarningCounts: mappingWarnings.reduce((acc: Record<string, number>, w: any) => {
      acc[w.type] = (acc[w.type] || 0) + 1;
      return acc;
    }, {}),
  };

  const healthChecks = calculateHealthChecks(diagnostics, summary);
  const anomalies = detectAnomalies(diagnostics, summary, objects);

  // Baseline reset detection
  const baselineReset = !previousSnapshot || previousSnapshot.scoring_schema_version !== SCORING_SCHEMA_VERSION;
  const baselineResetReason = baselineReset
    ? 'Coverage Resolution Engine updated in v2.3.1. Scoring schema version changed.'
    : null;

  return {
    version: COVERAGE_ENGINE_VERSION,
    coverageEngineVersion: COVERAGE_ENGINE_VERSION,
    scoringSchemaVersion: SCORING_SCHEMA_VERSION,
    resolutionVersion: RESOLUTION_VERSION,
    buildId: manifest?.buildId,
    releaseVersion: manifest?.releaseVersion,
    generatedAt: new Date().toISOString(),
    baselineReset,
    baselineResetReason,
    summary,
    objects,
    categories,
    missingConcepts: missingConcepts || [],
    reconciliation: reconciliation || {},
    duplicateMerges: duplicateMerges || {},
    diagnostics,
    health: healthChecks,
    anomalies,
  };
}

export async function fetchJSON(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} for ${url}`);
  return res.json();
}

export { KNOWLEDGE_BASE, REQUIREMENT_PROFILES, RESOURCE_LABELS };