import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Static map: RSS feed source -> tags applied to every imported story.
const tagMap = {
  CoinDesk: ['Bitcoin', 'Markets', 'DeFi'],
  Cointelegraph: ['Altcoins', 'Blockchain', 'Regulation'],
  Bitcoinist: ['Bitcoin', 'Mining'],
  NewsBTC: ['Trading', 'Markets'],
  CryptoSlate: ['DeFi', 'NFT', 'Web3'],
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow scheduled runs (no user context) and admin/editor manual triggers.
    // Block regular users from forcing imports.
    let caller = null;
    try { caller = await base44.auth.me(); } catch (_e) { /* scheduled run */ }
    if (caller && caller.role !== 'admin' && caller.role !== 'editor') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const feeds = [
      { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml', source: 'CoinDesk' },
      { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph' },
      { url: 'https://bitcoinist.com/feed/', source: 'Bitcoinist' },
      { url: 'https://www.newsbtc.com/feed/', source: 'NewsBTC' },
      { url: 'https://cryptoslate.com/feed/', source: 'CryptoSlate' },
    ];

    const parseXml = (xml, defaultSource) => {
      const items = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      while ((match = itemRegex.exec(xml)) !== null) {
        const block = match[1];
        const titleMatch = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/);
        const title = titleMatch ? titleMatch[1].trim().replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'") : '';
        if (!title) continue;

        const linkMatch = block.match(/<link>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/);
        const link = linkMatch ? linkMatch[1].trim() : '';

        const pubDateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
        const rawDate = pubDateMatch ? pubDateMatch[1].trim() : '';
        let isoDate = '';
        if (rawDate) { const d = new Date(rawDate); if (!isNaN(d.getTime())) isoDate = d.toISOString(); }

        let thumbnail = '';
        const encMatch = block.match(/<enclosure[^>]+url="([^"]+)"/);
        if (encMatch) thumbnail = encMatch[1];
        if (!thumbnail) {
          const mediaMatch = block.match(/<media:(?:content|thumbnail)[^>]+url="([^"]+)"/);
          if (mediaMatch) thumbnail = mediaMatch[1];
        }

        items.push({ title, source: defaultSource, link, pubDate: isoDate, thumbnail });
      }
      return items;
    };

    // Fetch all feeds in parallel, tolerate individual failures.
    const results = await Promise.all(
      feeds.map(async (feed) => {
        try {
          const res = await fetch(feed.url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' },
          });
          if (!res.ok) return [];
          const xml = await res.text();
          return parseXml(xml, feed.source);
        } catch (_e) { return []; }
      })
    );

    // Combine + deduplicate within this batch by link; apply source tags.
    const seenLinks = new Set();
    const candidates = [];
    for (const feedItems of results) {
      for (const item of feedItems) {
        if (!item.link || seenLinks.has(item.link)) continue;
        seenLinks.add(item.link);
        candidates.push({
          title: item.title,
          link: item.link,
          source: item.source,
          pubDate: item.pubDate,
          thumbnail: item.thumbnail,
          tags: tagMap[item.source] || [],
        });
      }
    }

    // Deduplicate against already-archived stories by link.
    const existing = await base44.asServiceRole.entities.NewsItem.list('-pubDate', 1000);
    const exArr = existing.results || existing || [];
    const existingLinks = new Set(exArr.map((n) => n.link).filter(Boolean));
    const newItems = candidates.filter((c) => !existingLinks.has(c.link));

    if (newItems.length) {
      await base44.asServiceRole.entities.NewsItem.bulkCreate(newItems);
    }

    return Response.json({
      fetched: candidates.length,
      inserted: newItems.length,
      skipped: candidates.length - newItems.length,
      archivedAt: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});