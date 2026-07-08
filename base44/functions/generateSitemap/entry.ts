import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const SITE_URL = 'https://theblockchainlibrary.com';

const STATIC_PAGES = [
  { url: '/', changefreq: 'daily', priority: '1.0' },
  { url: '/learn', changefreq: 'weekly', priority: '0.9' },
  { url: '/library', changefreq: 'weekly', priority: '0.8' },
  { url: '/glossary', changefreq: 'weekly', priority: '0.7' },
  { url: '/news', changefreq: 'daily', priority: '0.7' },
  { url: '/books', changefreq: 'monthly', priority: '0.6' },
  { url: '/research', changefreq: 'monthly', priority: '0.6' },
  { url: '/developers', changefreq: 'monthly', priority: '0.6' },
  { url: '/developers/rpc', changefreq: 'monthly', priority: '0.5' },
  { url: '/authors', changefreq: 'monthly', priority: '0.5' },
  { url: '/about', changefreq: 'monthly', priority: '0.3' },
  { url: '/contact', changefreq: 'monthly', priority: '0.3' }
];

const SITEMAP_CONFIG = [
  { type: 'pages', entity: null },
  { type: 'articles', entity: 'Article', urlPath: (i) => `/article/${i.slug}`, filter: { status: 'published' }, changefreq: 'weekly', priority: '0.8' },
  { type: 'glossary', entity: 'GlossaryTerm', urlPath: (i) => `/glossary/${i.slug}`, filter: {}, changefreq: 'monthly', priority: '0.7' },
  { type: 'books', entity: 'Book', urlPath: (i) => `/books/${i.slug}`, filter: {}, changefreq: 'yearly', priority: '0.6' },
  { type: 'research', entity: 'ResearchPaper', urlPath: (i) => `/research/${i.slug}`, filter: {}, changefreq: 'yearly', priority: '0.6' },
  { type: 'authors', entity: 'Author', urlPath: (i) => `/authors/${i.slug}`, filter: {}, changefreq: 'monthly', priority: '0.5' },
  { type: 'learning-paths', entity: 'LearningPath', urlPath: (i) => `/learn/${i.slug}`, filter: {}, changefreq: 'weekly', priority: '0.9' },
  { type: 'categories', entity: 'Category', urlPath: (i) => `/topics/${i.slug}`, filter: {}, changefreq: 'weekly', priority: '0.8' },
  { type: 'developers', entity: 'CodeSnippet', urlPath: (i) => `/developers/snippets/${i.slug}`, filter: {}, changefreq: 'monthly', priority: '0.6' },
  { type: 'newsletter', entity: 'NewsletterEdition', urlPath: (i) => `/newsletter/${i.slug}`, filter: {}, changefreq: 'weekly', priority: '0.5' },
  { type: 'tags', entity: 'tags' }
];

function escapeXml(s) {
  if (!s) return '';
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    let type = url.searchParams.get('type') || 'index';

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.type) type = body.type;
      } catch (e) {}
    }

    if (type === 'index') {
      const lastmod = new Date().toISOString();
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
      for (const c of SITEMAP_CONFIG) {
        xml += `  <sitemap><loc>${SITE_URL}/sitemaps/${c.type}.xml</loc><lastmod>${lastmod}</lastmod></sitemap>\n`;
      }
      xml += '</sitemapindex>';
      return req.method === 'GET'
        ? new Response(xml, { headers: { 'Content-Type': 'application/xml' } })
        : Response.json({ content: xml });
    }

    const config = SITEMAP_CONFIG.find(c => c.type === type);
    if (!config) return Response.json({ error: 'Invalid sitemap type' }, { status: 400 });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    if (config.entity === null) {
      for (const p of STATIC_PAGES) {
        xml += `  <url><loc>${SITE_URL}${p.url}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>\n`;
      }
    } else if (config.entity === 'tags') {
      const [artRes, bookRes, snipRes] = await Promise.all([
        base44.asServiceRole.entities.Article.filter({ status: 'published' }, '-updated_date', 5000),
        base44.asServiceRole.entities.Book.list('-updated_date', 500),
        base44.asServiceRole.entities.CodeSnippet.list('-updated_date', 500)
      ]);
      const tagSet = new Set();
      [...(artRes.results || artRes || []), ...(bookRes.results || bookRes || []), ...(snipRes.results || snipRes || [])].forEach(item => {
        (item.tags || []).forEach(t => tagSet.add(t));
      });
      for (const tag of tagSet) {
        xml += `  <url><loc>${SITE_URL}/tags/${encodeURIComponent(tag)}</loc><changefreq>weekly</changefreq><priority>0.5</priority></url>\n`;
      }
    } else {
      const entityApi = base44.asServiceRole.entities[config.entity];
      const res = await entityApi.filter(config.filter, '-updated_date', 50000);
      const items = (res.results || res || []).filter(i => !i.visibility || i.visibility === 'public');
      for (const item of items) {
        if (!item.slug) continue;
        const loc = `${SITE_URL}${config.urlPath(item)}`;
        const lastmod = item.updated_date ? new Date(item.updated_date).toISOString() : new Date().toISOString();
        xml += `  <url><loc>${escapeXml(loc)}</loc><lastmod>${lastmod}</lastmod><changefreq>${config.changefreq}</changefreq><priority>${config.priority}</priority></url>\n`;
      }
    }

    xml += '</urlset>';
    return req.method === 'GET'
      ? new Response(xml, { headers: { 'Content-Type': 'application/xml' } })
      : Response.json({ content: xml });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});