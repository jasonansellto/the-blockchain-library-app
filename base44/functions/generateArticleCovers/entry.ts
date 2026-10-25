import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { renderCoverJpeg } from '../../shared/coverRender.ts';

// Gives every published article without a featured image a branded cover card
// (title + category colour + logo), uploads it to app storage and sets it as
// the article's featured_image. Articles that already have an image are never
// touched. Runs daily after the jasonansell.ca import; can be run by hand.
//
// Body (optional): { dryRun?: boolean, limit?: number (default 60, max 150), slugs?: string[] }

async function fetchAll(base44, entity) {
  const byId = new Map();
  for (let skip = 0; skip < 50000; skip += 500) {
    const res = await base44.asServiceRole.entities[entity].filter({}, 'id', 500, skip);
    const batch = res.results || res || [];
    for (const r of batch) byId.set(r.id, r);
    if (batch.length < 500) break;
  }
  return [...byId.values()];
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
    const limit = Math.min(Math.max(Number(body.limit) || 60, 1), 150);
    const onlySlugs = Array.isArray(body.slugs) ? new Set(body.slugs) : null;

    const [articles, categories] = await Promise.all([fetchAll(base44, 'Article'), fetchAll(base44, 'Category')]);
    const categoryName = new Map(categories.map((c) => [c.id, c.name]));

    const missing = articles
      .filter((a) => a.status === 'published' && a.title && !a.featured_image)
      .filter((a) => !onlySlugs || onlySlugs.has(a.slug))
      .sort((x, y) => String(y.published_date || '').localeCompare(String(x.published_date || '')));
    const batch = missing.slice(0, limit);

    const done = [];
    const failed = [];
    if (!dryRun) {
      const deadline = Date.now() + 240_000; // stay well inside the function time limit
      for (const a of batch) {
        if (Date.now() > deadline) break;
        try {
          const jpg = await renderCoverJpeg({ title: a.title, categoryName: categoryName.get(a.category_id) });
          const file = new File([jpg], `${(a.slug || a.id).slice(0, 80)}-cover.jpg`, { type: 'image/jpeg' });
          const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });
          if (!file_url) throw new Error('upload returned no URL');
          await base44.asServiceRole.entities.Article.update(a.id, { featured_image: file_url });
          done.push(a.slug);
        } catch (e) {
          failed.push({ slug: a.slug, error: String(e?.message || e).slice(0, 200) });
        }
      }
    }

    return Response.json({
      dryRun,
      withoutImage: missing.length,
      generated: done.length,
      failed,
      remaining: missing.length - done.length,
      sample: (dryRun ? batch : done).slice(0, 5).map((x) => (typeof x === 'string' ? x : x.slug)),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
