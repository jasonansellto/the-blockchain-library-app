import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { parse } from 'npm:node-html-parser@6.1.13';
import TurndownService from 'npm:turndown@7.2.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { urls, category_map, author_id } = await req.json();

    const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
    turndown.remove(['div.sharedaddy', '.sd-sharing', '.sd-block', '.jp-relatedposts', '.wp-block-jetpack-related-posts', 'ins.adsbygoogle', '.advertisement', '.promo-wrap', '.article-promo-top', '.article-promo-bottom', '.wp-block-jetpack-slideshow']);

    const articles = [];
    const errors = [];

    for (const url of urls) {
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

        articles.push({
          title,
          slug,
          body: articleBody,
          summary: summary.substring(0, 300),
          featured_image: featuredImage,
          status: 'published',
          published_date: published_date || new Date().toISOString().split('T')[0],
          category_id,
          tags,
          author_id,
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
      attempted: urls.length,
      skipped: errors.length,
      errors,
      titles: articles.map(a => a.title),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});