// Shared export + reconciliation logic for the Knowledge Engine Content Export Center.
// READ-ONLY: never mutates existing content. Used by exportContent + exportReconciliation functions.

export const CONTENT_TYPES = [
  { key: 'glossary', label: 'Glossary', entity: 'GlossaryTerm', file: 'glossary.json', keObject: 'Glossary Object' },
  { key: 'articles', label: 'Articles / Topics', entity: 'Article', file: 'articles.json', keObject: 'Topic Object' },
  { key: 'books', label: 'Books', entity: 'Book', file: 'books.json', keObject: 'Book Object' },
  { key: 'research', label: 'Research', entity: 'ResearchPaper', file: 'research.json', keObject: 'Research Object' },
  { key: 'learning-paths', label: 'Learning Paths', entity: 'LearningPath', file: 'learning-paths.json', keObject: 'Tutorial Object' },
  { key: 'resources', label: 'Developer Resources', entity: 'BlockchainResource', file: 'resources.json', keObject: 'Resource Object' },
  { key: 'code-snippets', label: 'Code Snippets', entity: 'CodeSnippet', file: 'code-examples.json', keObject: 'Code Example Object' },
  { key: 'rpc', label: 'RPC Endpoints', entity: 'RpcEndpoint', file: 'rpc.json', keObject: 'Infrastructure Object' },
  { key: 'authors', label: 'Authors', entity: 'Author', file: 'authors.json', keObject: 'Author Object' },
  { key: 'categories', label: 'Categories', entity: 'Category', file: 'categories.json', keObject: 'Category Object' },
  { key: 'news', label: 'News', entity: 'NewsItem', file: 'news.json', keObject: 'News Object' },
  { key: 'newsletters', label: 'Newsletters', entity: 'NewsletterEdition', file: 'newsletters.json', keObject: 'Newsletter Object' },
];

const RELATIONSHIP_FIELDS = [
  'related_articles', 'related_books', 'related_glossary', 'related_research',
  'related_terms', 'related_resources', 'related_external', 'related_glossary_terms',
];

// Paginated fetch of every record for an entity type (service-role scope).
export async function fetchAll(base44, entityName) {
  const all = [];
  let skip = 0;
  const limit = 500;
  let safety = 0;
  while (safety < 20) {
    const res = await base44.asServiceRole.entities[entityName].filter({}, '-updated_date', limit, skip);
    const batch = res.results || res || [];
    if (!Array.isArray(batch)) break;
    all.push(...batch);
    if (batch.length < limit) break;
    skip += limit;
    safety++;
  }
  return all;
}

export async function fetchAllTypes(base44) {
  const data = {};
  for (const ct of CONTENT_TYPES) {
    data[ct.key] = await fetchAll(base44, ct.entity);
  }
  return data;
}

export function getLastUpdated(records) {
  if (!records.length) return null;
  let latest = null;
  for (const r of records) {
    const d = r.updated_date || r.created_date;
    if (d && (!latest || new Date(d) > new Date(latest))) latest = d;
  }
  return latest;
}

// Build a relationship graph from every related_* + source_links field across all content.
export function buildRelationships(allData) {
  const edges = [];
  for (const [type, records] of Object.entries(allData)) {
    for (const r of records) {
      const source = { type, id: r.id, slug: r.slug, title: r.title || r.name || r.network || r.term };
      for (const field of RELATIONSHIP_FIELDS) {
        const targets = r[field];
        if (!Array.isArray(targets)) continue;
        for (const t of targets) {
          if (t == null || t === '') continue;
          const targetId = typeof t === 'string' ? t : (t.id || t.slug || String(t));
          const targetLabel = typeof t === 'string' ? t : (t.title || t.slug || t.id);
          edges.push({
            source,
            target: { id: targetId, label: targetLabel },
            relationshipType: field.replace('related_', '').replace(/s$/, ''),
            strength: 1,
            category: type,
          });
        }
      }
      if (Array.isArray(r.source_links)) {
        for (const sl of r.source_links) {
          if (sl && sl.url) {
            edges.push({ source, target: { id: sl.url, label: sl.title || sl.url }, relationshipType: 'reference', strength: 0.5, category: type });
          }
        }
      }
    }
  }
  return edges;
}

// 0–100 quality score per record based on metadata, relationships, SEO, references, categorization, tags.
export function computeQualityScore(record, type) {
  let score = 0;
  let max = 0;
  max += 25;
  if (record.title || record.name || record.network) score += 8;
  if (record.slug) score += 8;
  if (record.description || record.summary || record.definition || record.abstract || record.body || record.code) score += 9;
  max += 20;
  if (record.seo_title) score += 10;
  if (record.seo_description) score += 10;
  max += 20;
  const relCount = RELATIONSHIP_FIELDS.reduce((acc, f) => acc + ((record[f] || []).length), 0);
  score += Math.min(20, relCount * 4);
  max += 15;
  const hasRefs = (record.source_links && record.source_links.length) || (record.references && record.references.length) || record.doi || record.pdf_url;
  if (hasRefs) score += 15;
  max += 10;
  if (record.category_id || record.category) score += 10;
  max += 10;
  if (record.tags && record.tags.length) score += Math.min(10, record.tags.length * 2);
  return max > 0 ? Math.round((score / max) * 100) : 0;
}

export function reconcile(allData, relationships) {
  const report = {};
  const allSlugs = new Set();
  const allIds = new Set();
  for (const records of Object.values(allData)) {
    for (const r of records) {
      if (r.slug) allSlugs.add(r.slug);
      if (r.id) allIds.add(r.id);
    }
  }
  let totalBroken = 0;
  for (const edge of relationships) {
    const t = edge.target && edge.target.id;
    if (t && !allSlugs.has(t) && !allIds.has(t) && !String(t).startsWith('http')) totalBroken++;
  }
  for (const ct of CONTENT_TYPES) {
    const records = allData[ct.key] || [];
    const slugs = records.map(r => r.slug).filter(Boolean);
    const dupSlugs = slugs.filter((s, i) => slugs.indexOf(s) !== i);
    const ids = records.map(r => r.id).filter(Boolean);
    const dupIds = ids.filter((s, i) => ids.indexOf(s) !== i);
    const hasContent = (r) => r.description || r.summary || r.definition || r.abstract || r.body || r.code;
    report[ct.key] = {
      label: ct.label,
      exportCount: records.length,
      mappedCount: records.filter(r => r.slug && (r.title || r.name || r.network)).length,
      missingIds: records.filter(r => !r.id).length,
      duplicateIds: [...new Set(dupIds)].length,
      duplicateSlugs: [...new Set(dupSlugs)].length,
      missingMetadata: records.filter(r => !hasContent(r)).length,
      missingSEO: records.filter(r => !r.seo_title || !r.seo_description).length,
      missingCanonicalUrls: records.filter(r => !r.slug).length,
      uncategorizedRecords: records.filter(r => !(r.category_id || r.category)).length,
      missingTags: records.filter(r => !(r.tags && r.tags.length)).length,
      invalidReferences: records.filter(r => Array.isArray(r.source_links) && r.source_links.some(sl => !sl.url)).length,
      avgQualityScore: records.length ? Math.round(records.reduce((a, r) => a + computeQualityScore(r, ct.key), 0) / records.length) : 0,
    };
  }
  return { contentTypes: report, totalBrokenRelationships: totalBroken, relationshipCount: relationships.length };
}

export function buildManifest(allData, relationships) {
  const contentTypes = {};
  for (const ct of CONTENT_TYPES) {
    const records = allData[ct.key] || [];
    contentTypes[ct.key] = { label: ct.label, file: ct.file, count: records.length, lastUpdated: getLastUpdated(records) };
  }
  return {
    exportDate: new Date().toISOString(),
    version: '1.0.0',
    schemaVersion: '1.0',
    contentTypes,
    relationships: { file: 'relationships.json', count: relationships.length },
    recordCounts: Object.fromEntries(Object.entries(contentTypes).map(([k, v]) => [k, v.count])),
  };
}