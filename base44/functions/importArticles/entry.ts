import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { parse } from 'npm:node-html-parser@6.1.13';
import TurndownService from 'npm:turndown@7.2.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { urls, category_map, author_id, sitemap_mode, batch_size, sitemap_url, offset } = await req.json();

    const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
    turndown.remove(['div.sharedaddy', '.sd-sharing', '.sd-block', '.jp-relatedposts', '.wp-block-jetpack-related-posts', 'ins.adsbygoogle', '.advertisement', '.promo-wrap', '.article-promo-top', '.article-promo-bottom', '.wp-block-jetpack-slideshow']);

    let urlsToProcess = urls || [];

    // Sitemap mode: fetch sitemap, filter out already-imported slugs
    let remainingAfter = 0;
    if (sitemap_mode) {
      const batchSize = batch_size || 40;
      const sitemapRes = await fetch(sitemap_url || 'https://jasonansell.ca/sitemap.xml', { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const sitemapXml = await sitemapRes.text();
      const allUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim());
      const articleUrls = allUrls.filter(u => {
        if (!u.includes('jasonansell.ca/')) return false;
        const path = u.replace('https://jasonansell.ca/', '').replace('http://jasonansell.ca/', '');
        const parts = path.split('/').filter(Boolean);
        if (parts.length < 2) return false;
        const excluded = ['about', 'blog', 'disclaimer', 'privacy-policy', 'category', 'author', 'wp-content', 'wp-includes', 'wp-json', 'feed', 'comments', 'tag', 'page'];
        if (excluded.includes(parts[0])) return false;
        return true;
      });

      // Get already imported slugs
      const existingSlugs = new Set();
      try {
        const existing = await base44.asServiceRole.entities.Article.list('-updated_date', 500);
        const existingArr = existing.results || existing || [];
        if (Array.isArray(existingArr)) {
          for (const a of existingArr) { if (a.slug) existingSlugs.add(a.slug); }
        }
      } catch (e) { console.log('list error:', e.message); }

      const toImport = articleUrls.filter(u => {
        const slug = u.match(/\/([^/]+)\/?$/)?.[1] || '';
        return !existingSlugs.has(slug);
      });

      const off = offset || 0;
      urlsToProcess = toImport.slice(off, off + batchSize);
      remainingAfter = toImport.length - off - urlsToProcess.length;
    }

    const articles = [];
    const errors = [];

    for (const url of urlsToProcess) {
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        const root = parse(html);

        // Title: og:title > h1 > title tag
        let title = root.querySelector('meta[property="og:title"]')?.getAttribute('content')?.trim()
          || root.querySelector('article h1')?.text?.trim()
          || root.querySelector('h1')?.text?.trim()
          || root.querySelector('title')?.text?.trim() || '';
        title = title.replace(/\s*[-|]\s*Jason Ansell.*$/i, '').replace(/\s*[-|]\s*$/, '').trim();

        // Body: find the longest .entry-content (the main article, not sidebar widgets)
        const allEntryContents = root.querySelectorAll('.entry-content');
        let entryContent = null;
        let maxLen = 0;
        for (const ec of allEntryContents) {
          const len = ec.innerHTML.length;
          if (len > maxLen) { maxLen = len; entryContent = ec; }
        }
        if (entryContent) {
          entryContent.querySelectorAll('.sharedaddy, .sd-sharing, .sd-block, .jp-relatedposts, .wp-block-jetpack-related-posts, ins.adsbygoogle, .article-promo-top, .article-promo-bottom, .promo-wrap, .wp-block-jetpack-slideshow, script, style').forEach(el => el.remove());
        }
        const bodyHtml = entryContent?.innerHTML || '';
        const articleBody = turndown.turndown(bodyHtml).trim();

        // Date
        const pubDate = root.querySelector('meta[property="article:published_time"]')?.getAttribute('content') || '';
        let published_date = '';
        if (pubDate) {
          published_date = pubDate.split('T')[0];
        } else {
          const dateText = root.querySelector('.entry-meta li:nth-child(2) a')?.text?.trim();
          if (dateText) {
            const parsed = new Date(dateText);
            if (!isNaN(parsed.getTime())) published_date = parsed.toISOString().split('T')[0];
          }
        }

        // Featured image
        const featuredImage = root.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';

        // Summary
        const summary = root.querySelector('meta[property="og:description"]')?.getAttribute('content')?.trim()
          || articleBody.substring(0, 300);

        // Category from URL path
        const pathMatch = url.match(/jasonansell\.ca\/([^/]+)\//);
        const wpCategory = pathMatch ? pathMatch[1] : '';
        const category_id = category_map[wpCategory] || null;

        // Tags from article class names
        const articleEl = root.querySelector('article.post-wrapper') || root.querySelector('article');
        const classes = articleEl?.getAttribute('class') || '';
        const tags = [...classes.matchAll(/tag-([a-z0-9-]+)/g)].map(m => m[1].replace(/-/g, ' '));

        // Slug from URL
        const slugMatch = url.match(/\/([^/]+)\/?$/);
        const slug = slugMatch ? slugMatch[1] : '';

        if (!title || !articleBody || !slug) {
          errors.push({ url, reason: 'Missing title, body, or slug' });
          continue;
        }

        // Skip 404 / page not found
        if (/page not found|404|not found/i.test(title)) {
          errors.push({ url, reason: 'Page not found (404)' });
          continue;
        }

        // Truncate body to avoid oversized records
        const truncatedBody = articleBody.length > 50000 ? articleBody.substring(0, 50000) + '\n\n*[Article truncated]*' : articleBody;

        articles.push({
          title,
          slug,
          body: truncatedBody,
          summary: (summary || '').substring(0, 300),
          featured_image: featuredImage || '',
          status: 'published',
          published_date: published_date || new Date().toISOString().split('T')[0],
          category_id: category_id || null,
          tags: Array.isArray(tags) ? tags : [],
          author_id: author_id || null,
          difficulty: 'intermediate',
          views: 0,
        });
      } catch (e) {
        errors.push({ url, reason: e.message });
      }
    }

    let created = [];
    if (articles.length > 0) {
      created = await base44.asServiceRole.entities.Article.bulkCreate(articles);
    }

    return Response.json({
      imported: created.length,
      attempted: urlsToProcess.length,
      skipped: errors.length,
      remaining: remainingAfter,
      errors,
      titles: articles.map(a => a.title),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});