import { base44 } from '@/api/base44Client';

// ── GitHub Knowledge Engine URLs ──
const GITHUB_RAW = 'https://raw.githubusercontent.com/jasonansellto/the-blockchain-library/main';
const KNOWLEDGE_BASE = `${GITHUB_RAW}/public/knowledge`;
export const GITHUB_REPO_URL = 'https://github.com/jasonansellto/the-blockchain-library';
export const DOCS_BASE = 'https://docs.theblockchainlibrary.com';

// ── Type metadata (label, color, URL segment) ──
export const TYPE_META = {
  glossary:        { label: 'Glossary',           color: '#3b82f6', urlSegment: 'glossary' },
  article:         { label: 'Topic',              color: '#8b5cf6', urlSegment: 'topic' },
  book:            { label: 'Book',               color: '#f59e0b', urlSegment: 'book' },
  research:        { label: 'Research',           color: '#10b981', urlSegment: 'research' },
  'learning-path': { label: 'Learning Path',      color: '#ec4899', urlSegment: 'learning-path' },
  resource:        { label: 'Developer Resource', color: '#06b6d4', urlSegment: 'resource' },
  'code-snippet':  { label: 'Code Example',       color: '#6366f1', urlSegment: 'code' },
  rpc:             { label: 'RPC Infrastructure',  color: '#14b8a6', urlSegment: 'rpc' },
  author:          { label: 'Author',             color: '#64748b', urlSegment: 'author' },
  category:        { label: 'Category',           color: '#94a3b8', urlSegment: 'category' },
  news:            { label: 'News',               color: '#ef4444', urlSegment: 'news' },
  newsletter:      { label: 'Newsletter',         color: '#a855f7', urlSegment: 'newsletter' },
};

export function getTypeMeta(type) {
  return TYPE_META[type] || { label: type, color: '#64748b', urlSegment: type };
}

export function buildExploreUrl(type, slug) {
  return `/explore/${getTypeMeta(type).urlSegment}/${slug}`;
}

export function parseExploreUrl(segment, slug) {
  for (const [type, meta] of Object.entries(TYPE_META)) {
    if (meta.urlSegment === segment) return { type, uid: `${type}:${slug}` };
  }
  return null;
}

// ── IndexedDB key-value cache (by buildId) ──
const _db = {
  _p: null,
  async getDB() {
    if (this._p) return this._p;
    if (typeof indexedDB === 'undefined') return null;
    this._p = new Promise((resolve, reject) => {
      const req = indexedDB.open('tbl-knowledge-cache', 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => { this._p = null; reject(e.target.error); };
    });
    return this._p;
  },
  async get(key) {
    const db = await this.getDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction('kv', 'readonly');
      const req = tx.objectStore('kv').get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  },
  async set(key, value) {
    const db = await this.getDB();
    if (!db) return;
    return new Promise((resolve) => {
      const tx = db.transaction('kv', 'readwrite');
      tx.objectStore('kv').put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  },
  async getAllKeys() {
    const db = await this.getDB();
    if (!db) return [];
    return new Promise((resolve) => {
      const tx = db.transaction('kv', 'readonly');
      const req = tx.objectStore('kv').getAllKeys();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  },
  async delete(key) {
    const db = await this.getDB();
    if (!db) return;
    return new Promise((resolve) => {
      const tx = db.transaction('kv', 'readwrite');
      tx.objectStore('kv').delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  },
};

async function cleanOldCaches(currentBuildId) {
  const keys = await _db.getAllKeys();
  for (const key of keys) {
    if (typeof key === 'string' && key.includes(':') && !key.includes(currentBuildId)) {
      await _db.delete(key);
    }
  }
}

// ── Data loading ──
export async function fetchManifest() {
  const res = await fetch(`${GITHUB_RAW}/knowledge-release.json`, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Manifest fetch failed: ${res.status}`);
  return res.json();
}

export async function loadSearchIndex(buildId) {
  const key = `search-index:${buildId}`;
  const cached = await _db.get(key);
  if (cached) return cached;
  const res = await fetch(`${KNOWLEDGE_BASE}/search-index.json`);
  if (!res.ok) throw new Error('Search index fetch failed');
  const data = await res.json();
  await _db.set(key, data);
  await cleanOldCaches(buildId);
  return data;
}

export async function loadRelated(buildId) {
  const key = `related:${buildId}`;
  const cached = await _db.get(key);
  if (cached) return cached;
  const res = await fetch(`${KNOWLEDGE_BASE}/related.json`);
  if (!res.ok) throw new Error('Related fetch failed');
  const data = await res.json();
  await _db.set(key, data);
  return data;
}

// ── Object lookup ──
export function buildObjectMap(searchIndex) {
  const map = new Map();
  if (!searchIndex) return map;
  for (const obj of searchIndex) map.set(obj.id, obj);
  return map;
}

export function getObjectByUid(searchIndex, uid) {
  if (!searchIndex) return null;
  return searchIndex.find(o => o.id === uid) || null;
}

// ── Relationships ──
export function getRelatedObjects(related, uid) {
  return related?.[uid] || [];
}

export function getRelationshipCount(related, uid) {
  return related?.[uid]?.length || 0;
}

export function groupRelatedByType(related, uid) {
  const rels = getRelatedObjects(related, uid);
  const groups = {};
  for (const r of rels) {
    if (!groups[r.type]) groups[r.type] = [];
    groups[r.type].push(r);
  }
  return groups;
}

// ── Quality scoring ──
export function calculateQualityScore(obj, relatedCount) {
  let score = 0;
  if (obj.summary) score += 15;
  if (obj.tags?.length > 0) score += 10 + Math.min(obj.tags.length * 2, 10);
  if (obj.aliases?.length > 0) score += 5;
  if (obj.categoryId) score += 10;
  if (relatedCount > 0) score += Math.min(relatedCount * 6, 40);
  if (obj.canonicalUrl) score += 5;
  return Math.min(Math.round(score), 100);
}

// ── Search ──
export function searchObjects(searchIndex, related, query, filters = {}, sort = 'relevance') {
  if (!searchIndex) return [];
  const q = (query || '').toLowerCase().trim();
  let results = searchIndex.map(obj => {
    const relCount = getRelationshipCount(related, obj.id);
    return { ...obj, _relCount: relCount, _quality: calculateQualityScore(obj, relCount) };
  });

  if (filters.type) results = results.filter(r => r.type === filters.type);
  if (filters.categoryId) results = results.filter(r => r.categoryId === filters.categoryId);
  if (filters.tag) results = results.filter(r => (r.tags || []).some(t => t.toLowerCase() === filters.tag.toLowerCase()));
  if (filters.minRelationships > 0) results = results.filter(r => r._relCount >= filters.minRelationships);
  if (filters.hasResearch) results = results.filter(r => {
    const rels = getRelatedObjects(related, r.id);
    return rels.some(rl => rl.type === 'research');
  });
  if (filters.hasBooks) results = results.filter(r => {
    const rels = getRelatedObjects(related, r.id);
    return rels.some(rl => rl.type === 'book');
  });
  if (filters.hasDevResources) results = results.filter(r => {
    const rels = getRelatedObjects(related, r.id);
    return rels.some(rl => ['resource', 'code-snippet', 'rpc'].includes(rl.type));
  });
  if (filters.hasLearningPath) results = results.filter(r => {
    const rels = getRelatedObjects(related, r.id);
    return rels.some(rl => rl.type === 'learning-path');
  });

  if (q) {
    results = results
      .map(r => {
        const title = (r.title || '').toLowerCase();
        const summary = (r.summary || '').toLowerCase();
        const text = (r.text || '').toLowerCase();
        const tags = (r.tags || []).join(' ').toLowerCase();
        const aliases = (r.aliases || []).join(' ').toLowerCase();
        let score = 0;
        if (title === q) score += 100;
        else if (title.startsWith(q)) score += 60;
        else if (title.includes(q)) score += 40;
        if (aliases.includes(q)) score += 35;
        if (summary.includes(q)) score += 20;
        if (tags.includes(q)) score += 15;
        if (text.includes(q)) score += 10;
        return { ...r, _score: score };
      })
      .filter(r => r._score > 0);
  }

  switch (sort) {
    case 'alphabetical': results.sort((a, b) => (a.title || '').localeCompare(b.title || '')); break;
    case 'mostConnected': results.sort((a, b) => b._relCount - a._relCount); break;
    case 'highestQuality': results.sort((a, b) => b._quality - a._quality); break;
    default: results.sort((a, b) => (b._score || 0) - (a._score || 0)); break;
  }

  return results;
}

// ── Featured knowledge ──
export function getFeaturedKnowledge(searchIndex, related, count = 6) {
  if (!searchIndex) return [];
  const scored = searchIndex
    .map(obj => {
      const relCount = getRelationshipCount(related, obj.id);
      return { obj, relCount, quality: calculateQualityScore(obj, relCount) };
    })
    .filter(item => item.quality >= 40)
    .sort((a, b) => b.quality - a.quality);

  const featured = [];
  const typeCounts = {};
  for (const item of scored) {
    if (featured.length >= count) break;
    const type = item.obj.type;
    if (typeCounts[type] >= 2) continue;
    featured.push(item);
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  }
  return featured;
}

// ── Counts ──
export function getTypeCounts(manifest) {
  return manifest?.sourceCounts || {};
}

export function getCategoryCounts(searchIndex) {
  const counts = {};
  if (!searchIndex) return counts;
  for (const obj of searchIndex) {
    if (obj.categoryId) counts[obj.categoryId] = (counts[obj.categoryId] || 0) + 1;
  }
  return counts;
}

export function getExampleConcepts(searchIndex, categoryId, count = 3) {
  if (!searchIndex) return [];
  return searchIndex
    .filter(o => o.categoryId === categoryId && o.summary)
    .slice(0, count)
    .map(o => ({ title: o.title, uid: o.id, canonicalUrl: o.canonicalUrl }));
}

// ── Analytics ──
export function trackExplorerEvent(eventName, properties = {}) {
  try {
    base44.analytics.track({ eventName, properties });
  } catch (e) { /* silent */ }
}

// ── Documentation URL ──
export function getDocsUrl(type, slug) {
  const catalogMap = {
    glossary: '/generated/catalogs/glossary',
    article: '/generated/catalogs/topics',
    book: '/generated/catalogs/books',
    research: '/generated/catalogs/research',
    'code-snippet': '/generated/catalogs/code-examples',
  };
  const path = catalogMap[type] || '';
  return path ? `${DOCS_BASE}${path}` : DOCS_BASE;
}