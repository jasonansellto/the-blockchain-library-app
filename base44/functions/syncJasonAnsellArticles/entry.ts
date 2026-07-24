import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import TurndownService from 'npm:turndown@7.2.0';

const FEED = 'https://jasonansell.ca/feed/';
const AUTHOR_ID = '6a4d2b0cf56d2579d02a65b0';

// WordPress top-level category (from URL path) -> site Category entity id
const CATEGORY_MAP = {
  blockchain: '6a4cfe7ce8ddbcb85df987d0',
  technology: '6a4cfe7ce8ddbcb85df987d4',
  web3: '6a4cfe7ce8ddbcb85df987d2',
  crypto: '6a4cfe7ce8ddbcb85df987d1',
  money: '6a4cfe7ce8ddbcb85df987d5',
  'affiliate-marketing': '6a4cfe7ce8ddbcb85df987d8',
  ai: '6a4cfe7ce8ddbcb85df987d3',
};

const stripCdata = (s) => s.replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '');
const decodeEntities = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const textFromHtml = (html) => decodeEntities(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());

// Fetch a post's og:image — the WP RSS feed carries no image tags, so the
// featured image must be pulled from the article page itself.
const getOgImage = async (url) => {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return '';
    const html = await res.text();
    const headEnd = html.indexOf('</head>');
    const head = headEnd === -1 ? html : html.slice(0, headEnd + 7);
    const tag = head.match(/<meta[^>]+og:image[^>]*>/i);
    if (!tag) return '';
    const c = tag[0].match(/content=["']([^"']+)["']/i);
    return c ? c[1] : '';
  } catch (_e) { return ''; }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled runs (no user context) and admin/editor manual triggers.
    let caller = null;
    try { caller = await base44.auth.me(); } catch (_e) { /* scheduled run */ }
    if (caller && caller.role !== 'admin' && caller.role !== 'editor') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
    turndown.remove(['script', 'style', 'ins.adsbygoogle', '.advertisement', '.wp-block-jetpack-related-posts', '.sharedaddy', '.sd-sharing']);

    // Fetch the latest feed pages (catch-up for a few days of posts).
    const pages = await Promise.all([1, 2].map(async (p) => {
      try {
        const url = p === 1 ? FEED : `${FEED}?paged=${p}`;
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (!res.ok) return '';
        return await res.text();
      } catch (_e) { return ''; }
    }));
    const xml = pages.join('\n');

    // Parse <item> blocks from the RSS feed.
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let m;
    while ((m = itemRegex.exec(xml)) !== null) {
      const block = m[1];

      const titleM = block.match(/<title>([\s\S]*?)<\/title>/);
      const title = titleM ? decodeEntities(stripCdata(titleM[1])).trim() : '';

      const linkM = block.match(/<link>([\s\S]*?)<\/link>/);
      const link = linkM ? linkM[1].trim() : '';
      if (!title || !link) continue;

      const slugM = link.match(/\/([^/]+)\/?$/);
      const slug = slugM ? slugM[1] : '';

      const pubM = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      let published_date = '';
      if (pubM) { const d = new Date(pubM[1].trim()); if (!isNaN(d.getTime())) published_date = d.toISOString().split('T')[0]; }

      const contentM = block.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/);
      const contentHtml = contentM ? stripCdata(contentM[1]) : '';

      // Featured image: image enclosure > media:content/thumbnail > first <img> in content.
      let featuredImage = '';
      const encM = block.match(/<enclosure[^>]+url="([^"]+)"[^>]*type="image/);
      if (encM) featuredImage = encM[1];
      if (!featuredImage) {
        const mediaM = block.match(/<media:(?:content|thumbnail)[^>]+url="([^"]+)"/);
        if (mediaM) featuredImage = mediaM[1];
      }
      if (!featuredImage) {
        const imgM = contentHtml.match(/<img[^>]+src="([^"]+)"/);
        if (imgM) featuredImage = imgM[1];
      }

      // Tags from <category domain="post_tag">.
      const tags = [];
      const tagRegex = /<category[^>]*domain="post_tag"[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/category>/g;
      let tm;
      while ((tm = tagRegex.exec(block)) !== null) tags.push(decodeEntities(tm[1]).trim());

      // WordPress category from the URL path -> site Category id.
      const pathM = link.match(/jasonansell\.ca\/([^/]+)\//);
      const wpCat = pathM ? pathM[1] : '';
      const category_id = CATEGORY_MAP[wpCat] || null;

      const summary = textFromHtml(contentHtml).slice(0, 300);

      const pidM = block.match(/<wp:post_id>(\d+)<\/wp:post_id>/);
      const internal_id = pidM ? `ja-${pidM[1]}` : `ja-${slug}`;

      items.push({ title, slug, link, published_date, contentHtml, featuredImage, tags, category_id, summary, internal_id });
    }

    // Deduplicate against already-imported articles by slug.
    const existingSlugs = new Set();
    try {
      const existing = await base44.asServiceRole.entities.Article.list('-updated_date', 5000);
      const arr = existing.results || existing || [];
      for (const a of arr) if (a.slug) existingSlugs.add(a.slug);
    } catch (_e) { /* tolerate — will re-import risk is low */ }

    const newItems = items.filter((it) => it.slug && !existingSlugs.has(it.slug));

    const articles = [];
    for (const it of newItems) {
      if (!it.featuredImage) it.featuredImage = await getOgImage(it.link);
      let body = turndown.turndown(it.contentHtml).trim();
      if (body.length > 50000) body = body.slice(0, 50000) + '\n\n*[Article truncated]*';
      articles.push({
        title: it.title,
        slug: it.slug,
        body,
        summary: it.summary,
        featured_image: it.featuredImage || '',
        status: 'published',
        published_date: it.published_date || new Date().toISOString().split('T')[0],
        category_id: it.category_id,
        tags: it.tags,
        author_id: AUTHOR_ID,
        author_ids: [AUTHOR_ID],
        difficulty: 'intermediate',
        views: 0,
        internal_id: it.internal_id,
        source_links: [{ title: 'Jason Ansell', url: it.link }],
      });
    }

    let created = [];
    if (articles.length) created = await base44.asServiceRole.entities.Article.bulkCreate(articles);

    return Response.json({
      feedItems: items.length,
      newFound: newItems.length,
      imported: created.length,
      skipped: items.length - newItems.length,
      titles: articles.map((a) => a.title),
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});