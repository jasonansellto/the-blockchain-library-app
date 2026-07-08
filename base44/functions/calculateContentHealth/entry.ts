import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

function calcHealth(article) {
  let s = 0;
  if (article.summary) s += 10;
  if (article.featured_image) s += 10;
  const wc = article.body ? article.body.split(/\s+/).length : 0;
  if (wc > 500) s += 15;
  if (wc > 1500) s += 10;
  if (article.key_takeaways?.length > 0) s += 10;
  if (article.faq?.length > 0) s += 10;
  if (article.references?.length > 0) s += 10;
  if (article.toc?.length > 0) s += 5;
  if (article.tags?.length > 0) s += 5;
  if (article.reading_time) s += 5;
  if (article.seo_title) s += 5;
  if (article.seo_description) s += 5;
  if (article.published_date) s += 5;
  if (article.internal_id) s += 5;
  return Math.min(s, 100);
}

function calcGeo(article) {
  let s = 0;
  if (article.summary) s += 15;
  if (article.faq?.length > 0) s += 15;
  if (article.key_takeaways?.length > 0) s += 10;
  if (article.references?.length > 0 || article.source_links?.length > 0) s += 10;
  if (article.related_articles?.length > 0 || article.related_glossary?.length > 0) s += 10;
  if (article.seo_title && article.seo_description) s += 10;
  if (article.og_image || article.featured_image) s += 10;
  if (article.internal_id) s += 10;
  if (article.last_reviewed) s += 10;
  return Math.min(s, 100);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let body = {};
    try { body = await req.json(); } catch (e) {}
    const action = body.action || 'calculate';

    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    if (action === 'single') {
      const articleId = body.article_id;
      if (!articleId) return Response.json({ error: 'article_id required' }, { status: 400 });
      const article = await base44.asServiceRole.entities.Article.get(articleId);
      const health = calcHealth(article);
      const geo = calcGeo(article);
      await base44.asServiceRole.entities.Article.update(articleId, { health_score: health, geo_score: geo });
      return Response.json({ success: true, health_score: health, geo_score: geo });
    }

    if (user.role !== 'admin') {
      return Response.json({ error: 'Admin access required for full recalculation' }, { status: 403 });
    }

    const articles = await base44.asServiceRole.entities.Article.filter({ status: 'published' }, '-updated_date', 1000);
    const articlesArr = articles.results || articles || [];

    let totalHealth = 0, totalGeo = 0;
    const buckets = { excellent: 0, good: 0, fair: 0, poor: 0 };
    const updates = [];

    for (const article of articlesArr) {
      const health = calcHealth(article);
      const geo = calcGeo(article);
      totalHealth += health;
      totalGeo += geo;
      if (health >= 80) buckets.excellent++;
      else if (health >= 60) buckets.good++;
      else if (health >= 40) buckets.fair++;
      else buckets.poor++;
      updates.push({ id: article.id, health_score: health, geo_score: geo });
    }

    for (let i = 0; i < updates.length; i += 500) {
      await base44.asServiceRole.entities.Article.bulkUpdate(updates.slice(i, i + 500));
    }

    const [categories, glossary] = await Promise.all([
      base44.asServiceRole.entities.Category.list('-updated_date', 100),
      base44.asServiceRole.entities.GlossaryTerm.list('-updated_date', 500)
    ]);
    const catArr = categories.results || categories || [];
    const glsArr = glossary.results || glossary || [];

    const clusters = catArr.map(cat => {
      const ac = articlesArr.filter(a => a.category_id === cat.id).length;
      const gc = glsArr.filter(g => g.category_id === cat.id).length;
      const coverage = Math.min(((ac + gc) / 10) * 100, 100);
      return { id: cat.id, name: cat.name, slug: cat.slug, internal_id: cat.internal_id, articles: ac, glossary: gc, coverage: Math.round(coverage) };
    }).sort((a, b) => b.articles - a.articles);

    const analyticsData = {
      total_articles: articlesArr.length,
      avg_health_score: articlesArr.length > 0 ? Math.round(totalHealth / articlesArr.length) : 0,
      avg_geo_score: articlesArr.length > 0 ? Math.round(totalGeo / articlesArr.length) : 0,
      health_buckets: buckets,
      topic_clusters: clusters,
      calculated_at: new Date().toISOString()
    };

    const existing = await base44.asServiceRole.entities.SiteAnalyticsCache.filter({ cache_key: 'content_health' }, '-updated_date', 1);
    const exArr = existing.results || existing || [];
    if (exArr.length > 0) {
      await base44.asServiceRole.entities.SiteAnalyticsCache.update(exArr[0].id, { data: analyticsData, last_refreshed: new Date().toISOString() });
    } else {
      await base44.asServiceRole.entities.SiteAnalyticsCache.create({ cache_key: 'content_health', data: analyticsData, last_refreshed: new Date().toISOString() });
    }

    return Response.json({ success: true, ...analyticsData });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});