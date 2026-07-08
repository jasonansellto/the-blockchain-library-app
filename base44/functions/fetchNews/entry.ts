Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const _cacheBust = url.searchParams.get('t');

    // Crypto news RSS feeds — designed for syndication, reliable from server-side
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

        // Source: prefer <dc:creator> or <source>, fallback to feed default
        const creatorMatch = block.match(/<dc:creator[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/dc:creator>/);
        const sourceTagMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/);
        const source = (sourceTagMatch ? sourceTagMatch[1].trim() : '') || (creatorMatch ? creatorMatch[1].trim() : '') || defaultSource;

        const pubDateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
        const rawDate = pubDateMatch ? pubDateMatch[1].trim() : '';
        let isoDate = '';
        if (rawDate) { const d = new Date(rawDate); if (!isNaN(d.getTime())) isoDate = d.toISOString(); }

        // Thumbnail: check <enclosure>, <media:content>, or <media:thumbnail>
        let thumbnail = '';
        const encMatch = block.match(/<enclosure[^>]+url="([^"]+)"/);
        if (encMatch) thumbnail = encMatch[1];
        if (!thumbnail) {
          const mediaMatch = block.match(/<media:(?:content|thumbnail)[^>]+url="([^"]+)"/);
          if (mediaMatch) thumbnail = mediaMatch[1];
        }

        items.push({ title, source, link, pubDate: isoDate, thumbnail });
      }
      return items;
    };

    // Fetch all feeds in parallel, tolerate individual failures
    const results = await Promise.all(
      feeds.map(async (feed) => {
        try {
          const res = await fetch(feed.url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36' },
          });
          if (!res.ok) return [];
          const xml = await res.text();
          return parseXml(xml, feed.source);
        } catch { return []; }
      })
    );

    // Combine, deduplicate by title, sort by date descending, take top 40
    const seen = new Set();
    const allItems = [];
    for (const items of results) {
      for (const item of items) {
        const key = item.title.toLowerCase().slice(0, 80);
        if (!seen.has(key)) {
          seen.add(key);
          allItems.push(item);
        }
      }
    }

    allItems.sort((a, b) => {
      if (a.pubDate && b.pubDate) return new Date(b.pubDate) - new Date(a.pubDate);
      if (a.pubDate) return -1;
      if (b.pubDate) return 1;
      return 0;
    });

    const items = allItems.slice(0, 40);

    if (items.length === 0) {
      return Response.json({ error: 'No news available' }, { status: 502 });
    }

    return Response.json({ items, count: items.length, fetchedAt: new Date().toISOString() });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});