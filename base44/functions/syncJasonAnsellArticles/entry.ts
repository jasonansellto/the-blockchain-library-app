import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Syncs articles from jasonansell.ca into The Blockchain Library.
//
// jasonansell.ca moved from WordPress to Base44, so the old RSS feed and the
// /wp-content/uploads/ images no longer exist. This reads the site's public
// Article data instead and, on every run:
//   1. imports published articles that are not here yet (matched by slug);
//   2. repairs featured images that still point at the dead WordPress files —
//      using the article's new cover image when jasonansell.ca has one, or
//      clearing the dead link so pages render without a broken image.
// Images set by hand to any other URL are never touched.
//
// Body (optional): { dryRun?: boolean, maxImports?: number, maxRepairs?: number }

const JA_APP_ID = '6aa184855ed6b34685f2f7e8';
const JA_API = `https://jasonansell.ca/api/apps/${JA_APP_ID}/entities/Article`;
const AUTHOR_ID = '6a4d2b0cf56d2579d02a65b0';

// jasonansell.ca category name -> site Category entity id
const CATEGORY_MAP = {
  'Blockchain': '6a4cfe7ce8ddbcb85df987d0',
  'Crypto': '6a4cfe7ce8ddbcb85df987d1',
  'Web3': '6a4cfe7ce8ddbcb85df987d2',
  'Artificial Intelligence': '6a4cfe7ce8ddbcb85df987d3',
  'Technology': '6a4cfe7ce8ddbcb85df987d4',
  'Money': '6a4cfe7ce8ddbcb85df987d5',
  'Affiliate Marketing': '6a4cfe7ce8ddbcb85df987d8',
};

const META_FIELDS = 'slug,status,title,excerpt,category,tags,published_date,cover_image,canonical_url,legacy_url,legacy_wordpress_id';

const isDeadLegacyImage = (url) =>
  typeof url === 'string' && /(^|\/\/)(i\d\.wp\.com\/)?(www\.)?jasonansell\.ca\/wp-content\//i.test(url.replace(/^https?:\/\//, '//'));

const isUsableImage = (url) => {
  if (!url || typeof url !== 'string' || isDeadLegacyImage(url)) return false;
  try { return new URL(url).protocol === 'https:'; } catch (_e) { return false; }
};

async function jaFetch(params) {
  const res = await fetch(`${JA_API}?${new URLSearchParams(params)}`, { headers: { 'X-App-Id': JA_APP_ID } });
  if (!res.ok) throw new Error(`jasonansell.ca returned ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : (data.results || []);
}

async function fetchAllJa() {
  const all = [];
  for (let skip = 0; skip < 20000; skip += 500) {
    const page = await jaFetch({ limit: '500', skip: String(skip), sort: 'id', fields: META_FIELDS });
    all.push(...page);
    if (page.length < 500) break;
  }
  return all;
}

async function fetchAllLocal(base44) {
  const byId = new Map();
  for (let skip = 0; skip < 50000; skip += 500) {
    const res = await base44.asServiceRole.entities.Article.filter({}, 'id', 500, skip);
    const batch = res.results || res || [];
    for (const a of batch) byId.set(a.id, a);
    if (batch.length < 500) break;
  }
  return [...byId.values()];
}

// Many old /wp-content/ URLs still work (jasonansell.ca serves a mirror of the
// original uploads), so a legacy URL only counts as dead if it fails to load.
async function loadsAsImage(url) {
  try {
    const res = await fetch(url, { headers: { Range: 'bytes=0-63', 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(15000) });
    return (res.ok || res.status === 206) && (res.headers.get('content-type') || '').startsWith('image/');
  } catch (_e) { return false; }
}

async function inBatches(items, size, fn) {
  for (let i = 0; i < items.length; i += size) await Promise.all(items.slice(i, i + size).map(fn));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled runs (no user context) and admin/editor manual triggers.
    let caller = null;
    try { caller = await base44.auth.me(); } catch (_e) { /* scheduled run */ }
    if (caller && caller.role !== 'admin' && caller.role !== 'editor') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const dryRun = Boolean(body.dryRun);
    const maxImports = Math.min(Number(body.maxImports) || 50, 200);
    const maxRepairs = Math.min(Number(body.maxRepairs) || 250, 500);

    const [remote, local] = await Promise.all([fetchAllJa(), fetchAllLocal(base44)]);
    const remoteBySlug = new Map();
    for (const a of remote) if (a.slug && a.status === 'published') remoteBySlug.set(a.slug, a);
    const localSlugs = new Set(local.map((a) => a.slug).filter(Boolean));

    // 1. Image repairs
    const legacy = local.filter((a) => isDeadLegacyImage(a.featured_image));
    const dead = [];
    await inBatches(legacy, 10, async (a) => { if (!(await loadsAsImage(a.featured_image))) dead.push(a); });
    const repairs = [];
    for (const a of dead) {
      const src = remoteBySlug.get(a.slug);
      repairs.push({ id: a.id, featured_image: src && isUsableImage(src.cover_image) ? src.cover_image : '' });
    }
    const repairBatch = repairs.slice(0, maxRepairs);
    if (!dryRun) {
      await inBatches(repairBatch, 10, (r) => base44.asServiceRole.entities.Article.update(r.id, { featured_image: r.featured_image }));
    }

    // 2. New articles
    const candidates = [...remoteBySlug.values()]
      .filter((a) => !localSlugs.has(a.slug))
      .sort((x, y) => String(y.published_date || '').localeCompare(String(x.published_date || '')))
      .slice(0, maxImports);

    const articles = [];
    for (const meta of candidates) {
      const [full] = await jaFetch({ q: JSON.stringify({ slug: meta.slug }), limit: '1', fields: 'slug,content' });
      const content = (full?.content || '').trim();
      if (content.length < 200) continue; // content not available through the API yet
      const link = meta.canonical_url || meta.legacy_url || `https://jasonansell.ca/articles/${meta.slug}`;
      articles.push({
        title: meta.title,
        slug: meta.slug,
        body: content.length > 50000 ? content.slice(0, 50000) + '\n\n*[Article truncated]*' : content,
        summary: (meta.excerpt || content.replace(/[#*_>`\[\]]/g, '').slice(0, 300)).trim(),
        featured_image: isUsableImage(meta.cover_image) ? meta.cover_image : '',
        status: 'published',
        published_date: meta.published_date || new Date().toISOString().split('T')[0],
        category_id: CATEGORY_MAP[meta.category] || null,
        tags: Array.isArray(meta.tags) ? meta.tags : [],
        author_id: AUTHOR_ID,
        author_ids: [AUTHOR_ID],
        difficulty: 'intermediate',
        views: 0,
        internal_id: `ja-${meta.legacy_wordpress_id || meta.slug}`,
        source_links: [{ title: 'Jason Ansell', url: link }],
      });
    }

    let created = [];
    if (articles.length && !dryRun) created = await base44.asServiceRole.entities.Article.bulkCreate(articles);

    return Response.json({
      dryRun,
      sourceArticles: remoteBySlug.size,
      localArticles: local.length,
      imagesRepaired: dryRun ? 0 : repairBatch.length,
      imagesRepairable: repairs.length,
      imagesReplaced: repairBatch.filter((r) => r.featured_image).length,
      imagesCleared: repairBatch.filter((r) => !r.featured_image).length,
      imagesRemaining: repairs.length - repairBatch.length,
      newFound: candidates.length,
      imported: dryRun ? 0 : (created.length || articles.length),
      titles: articles.map((a) => a.title),
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
