import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Book importer & enrichment tool for The Blockchain Library.
// Actions:
//   - fix-affiliate-links : retag all Amazon links with the affiliate ID
//   - fix-covers          : replace broken/LLM-hallucinated cover URLs with
//                           reliable covers from the Google Books API (+ ISBN)
//   - fix-ratings         : look up real Amazon ratings for books missing them
//   - import-category     : bulk import top books from a given Amazon category URL
//   - (default)           : generate a batch from Amazon Bitcoin & Crypto bestsellers
const BATCH_SIZE = 5;
const TOTAL_BATCHES = 5;
const AFFILIATE_TAG = 'whemusliv-20';

const CATEGORY_BUCKETS = [
  'Bitcoin', 'Ethereum', 'Blockchain Basics', 'Cryptography', 'Smart Contracts',
  'DeFi', 'NFTs', 'Trading & Investing', 'Web3', 'Wallets & Security', 'Economics'
];

function slugify(text: string): string {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Ensure a URL carries the affiliate tag (replace existing tag or append).
function applyAffiliateTag(url: string): string {
  if (!url) return url;
  const u = String(url).trim();
  if (!u) return u;
  if (/[?&]tag=/i.test(u)) {
    return u.replace(/([?&]tag=)[^&]*/i, `$1${AFFILIATE_TAG}`);
  }
  const sep = u.includes('?') ? '&' : '?';
  return `${u}${sep}tag=${AFFILIATE_TAG}`;
}

function amazonUrl(asin: string): string {
  return `https://www.amazon.ca/dp/${asin}?tag=${AFFILIATE_TAG}`;
}

// Reliable cover + ISBN from Open Library (free, lenient rate limits).
// LLM-generated m.media-amazon.com cover URLs frequently 404, and the Google
// Books API rate-limits (429) the server IP — so every imported book gets its
// cover from Open Library instead.
async function openLibraryCover(title: string, author: string): Promise<{ cover: string; isbn: string }> {
  // Try title+author first, then title-only (catches multi-author books and
  // minor author-name mismatches).
  for (const useAuthor of [true, false]) {
    try {
      const sp = new URLSearchParams();
      sp.set('title', title);
      if (useAuthor && author) sp.set('author', author);
      sp.set('limit', '1');
      const r = await fetch(`https://openlibrary.org/search.json?${sp.toString()}`, { redirect: 'follow' });
      if (!r.ok) continue;
      const data: any = await r.json();
      const doc = data?.docs?.[0];
      if (doc && doc.cover_i) {
        const isbnArr: any[] = doc.isbn || [];
        return { cover: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`, isbn: isbnArr[0] || '' };
      }
    } catch (_e) {
      continue;
    }
  }
  return { cover: '', isbn: '' };
}

// Fallback: fetch the Amazon product page and extract the real cover image URL
// (og:image / hiRes / large). Used when Open Library has no match.
async function amazonCover(link: string): Promise<string> {
  if (!link) return '';
  const cleanLink = link.split('?')[0];
  try {
    const r = await fetch(cleanLink, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      redirect: 'follow'
    });
    if (!r.ok) return '';
    const html = await r.text();
    const og = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
    if (og && og[1]) return og[1];
    const hiRes = html.match(/["']hiRes["']\s*:\s*["'](https:\/\/m\.media-amazon\.com\/images\/I\/[^"']+)["']/i);
    if (hiRes && hiRes[1]) return hiRes[1];
    const large = html.match(/["']large["']\s*:\s*["'](https:\/\/m\.media-amazon\.com\/images\/I\/[^"']+)["']/i);
    if (large && large[1]) return large[1];
    return '';
  } catch (_e) {
    return '';
  }
}

async function ensureCategories(usedCats: string[], base44: any): Promise<Record<string, any>> {
  const catRes = await base44.asServiceRole.entities.Category.list('sort_order', 200);
  const catArr: any[] = catRes.results || catRes || [];
  const catByName: Record<string, any> = {};
  catArr.forEach((c) => { catByName[c.name.toLowerCase()] = c; });
  const catsToCreate: any[] = [];
  usedCats.forEach((name) => {
    if (!catByName[name.toLowerCase()] && !catsToCreate.find((c) => c.name === name)) {
      catsToCreate.push({ name, slug: slugify(name), sort_order: 100 });
    }
  });
  if (catsToCreate.length) {
    const createdCats = await base44.asServiceRole.entities.Category.bulkCreate(catsToCreate);
    (createdCats.results || createdCats || []).forEach((c) => { catByName[c.name.toLowerCase()] = c; });
  }
  return catByName;
}

// Build & persist Book entities from LLM-generated book data.
// Fetches a reliable cover + ISBN from Google Books for each title.
async function persistNewBooks(generated: any[], existingArr: any[], base44: any): Promise<{ entries: any[]; skipped: number }> {
  const existingSlugs = new Set(existingArr.map((b) => b.slug));
  const newBooks = generated.filter((b) => b && b.title && !existingSlugs.has(slugify(b.title)));
  const skipped = generated.length - newBooks.length;
  if (!newBooks.length) return { entries: [], skipped };

  const usedCats = [...new Set(newBooks.map((b) => b.category).filter(Boolean))];
  const catByName = await ensureCategories(usedCats, base44);

  let maxNum = 0;
  existingArr.forEach((b) => {
    const m = b.internal_id && String(b.internal_id).match(/(\d+)$/);
    if (m) { const n = parseInt(m[1], 10); if (n > maxNum) maxNum = n; }
  });

  const entries: any[] = [];
  for (const b of newBooks) {
    maxNum += 1;
    const internalId = `BOOK-${String(maxNum).padStart(6, '0')}`;
    const asin = String(b.asin || '').trim();
    const kindleAsin = String(b.kindle_asin || '').trim();
    const authorName = String(b.author || '').trim();
    let { cover, isbn } = await openLibraryCover(b.title, authorName);
    if (!cover && asin) cover = await amazonCover(amazonUrl(asin));
    const formats = kindleAsin ? ['Paperback', 'Kindle'] : ['Paperback'];
    const rating = typeof b.rating === 'number' ? Math.max(0, Math.min(5, b.rating)) : 0;
    const desc = b.description || '';
    entries.push({
      title: b.title,
      slug: slugify(b.title),
      subtitle: b.subtitle || '',
      cover,
      description: desc,
      isbn,
      amazon_link: asin ? amazonUrl(asin) : '',
      amazon_kindle_link: kindleAsin ? amazonUrl(kindleAsin) : '',
      formats,
      publisher: '',
      publication_year: b.publication_year || null,
      author_ids: authorName ? [authorName] : [],
      rating,
      pages: null,
      language: 'English',
      tags: (b.tags || []).slice(0, 8),
      is_featured: false,
      category_id: (catByName[(b.category || '').toLowerCase()] || {}).id || null,
      status: 'published',
      visibility: 'public',
      internal_id: internalId,
      seo_title: `${b.title} — Book | The Blockchain Library`,
      seo_description: (desc || b.title).slice(0, 160),
      citation: `${authorName || 'Unknown'} (${b.publication_year || 'n.d.'}). ${b.title}. Amazon.`
    });
  }
  if (entries.length) {
    await base44.asServiceRole.entities.Book.bulkCreate(entries);
  }
  return { entries, skipped };
}

const BOOKS_JSON_SCHEMA = {
  type: 'object',
  properties: {
    books: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          subtitle: { type: 'string' },
          author: { type: 'string' },
          asin: { type: 'string' },
          kindle_asin: { type: 'string' },
          publication_year: { type: 'number' },
          rating: { type: 'number' },
          description: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          category: { type: 'string' }
        }
      }
    }
  }
};

// ---- ISBN Search import (isbnsearch.org) ----
// Reliable book discovery: real ISBNs, real covers, real publishers.
// The ISBN-10 doubles as a valid Amazon ASIN, so amazon.com /dp/ links always
// resolve — no more hallucinated-ASIN 404s.
const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9'
};

function decodeEntities(s: string): string {
  return String(s)
    .replace(/&#0*(\d+);/g, (_m, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

// "Last, First" -> "First Last"; takes the first author when multiple are listed.
function cleanAuthor(raw: string): string {
  const first = raw.split(/\s+-\s+/)[0].trim();
  const commaM = first.match(/^([^,]+),\s*(.+)$/);
  return commaM ? `${commaM[2].trim()} ${commaM[1].trim()}` : first;
}

// Parse one isbnsearch.org search-results HTML page into book records.
// Anchors each book on its cover image (one per result, at the start of the
// block), then captures title / author / ISBN-13 / ISBN-10 forward to the next
// cover — robust whether results are <li> or <div> wrapped.
function parseIsbnSearch(html: string): any[] {
  const coverRe = /m\.media-amazon\.com\/images\/I\/([A-Za-z0-9+_]+)\._S[A-Z]/g;
  const coverMatches = [...html.matchAll(coverRe)];
  const books: any[] = [];
  for (let i = 0; i < coverMatches.length; i++) {
    const start = coverMatches[i].index || 0;
    const end = i + 1 < coverMatches.length ? (coverMatches[i + 1].index || 0) : html.length;
    const block = html.slice(start, end);
    const titleM = block.match(/<h2[^>]*>\s*<a[^>]*>([^<]+)<\/a>/);
    const isbn13M = block.match(/ISBN-13:\s*([\dX]{10,13})/);
    const authorM = block.match(/Authors?:\s*([^<\n]+)/);
    const isbn10M = block.match(/ISBN-10:\s*([\dX]{10})/);
    if (!titleM || !isbn13M) continue;
    const authorRaw = authorM ? decodeEntities(authorM[1]).trim() : '';
    books.push({
      isbn13: isbn13M[1],
      isbn10: isbn10M ? isbn10M[1] : '',
      coverId: coverMatches[i][1],
      title: decodeEntities(titleM[1]).trim(),
      author: cleanAuthor(authorRaw)
    });
  }
  return books;
}

// Fetch the isbnsearch.org detail page for publisher / year / binding.
async function fetchIsbnDetail(isbn13: string): Promise<{ publisher: string; pubYear: number | null; binding: string }> {
  try {
    const r = await fetch(`https://isbnsearch.org/isbn/${isbn13}`, { redirect: 'follow' });
    if (!r.ok) return { publisher: '', pubYear: null, binding: 'Paperback' };
    const html = await r.text();
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
    const pm = text.match(/Publisher:\s*([^\n]+)/);
    const ym = text.match(/Published:\s*(\d{4})/);
    const bm = text.match(/Binding:\s*([^\n]+)/);
    return {
      publisher: pm ? pm[1].trim() : '',
      pubYear: ym ? parseInt(ym[1], 10) : null,
      binding: bm ? bm[1].trim() : 'Paperback'
    };
  } catch (_e) {
    return { publisher: '', pubYear: null, binding: 'Paperback' };
  }
}

// Scrape the real Amazon average rating for a book (ISBN-10 or ISBN-13 as ASIN).
async function fetchAmazonRating(asin: string): Promise<number> {
  try {
    const r = await fetch(`https://www.amazon.com/dp/${asin}`, { headers: BROWSER_HEADERS, redirect: 'follow' });
    if (!r.ok) return 0;
    const html = await r.text();
    const m = html.match(/(\d+\.\d)\s+out of 5\s+stars/i);
    return m ? Math.max(0, Math.min(5, parseFloat(m[1]))) : 0;
  } catch (_e) {
    return 0;
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !['admin', 'editor'].includes(user.role)) {
      return Response.json({ error: 'Admin or editor access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));

    // ---- Action: fix affiliate links on all existing books ----
    if (body.action === 'fix-affiliate-links') {
      const res = await base44.asServiceRole.entities.Book.filter({}, '-created_date', 1000);
      const books: any[] = res.results || res || [];
      const updates: any[] = [];
      for (const b of books) {
        const link = applyAffiliateTag(b.amazon_link);
        const kindle = applyAffiliateTag(b.amazon_kindle_link);
        if (link !== (b.amazon_link || '') || kindle !== (b.amazon_kindle_link || '')) {
          updates.push({ id: b.id, amazon_link: link, amazon_kindle_link: kindle });
        }
      }
      if (updates.length) {
        await base44.asServiceRole.entities.Book.bulkUpdate(updates);
      }
      return Response.json({ action: 'fix-affiliate-links', updated: updates.length, total: books.length });
    }

    // ---- Action: fix broken/missing covers via Google Books API ----
    if (body.action === 'fix-covers') {
      const res = await base44.asServiceRole.entities.Book.filter({}, '-created_date', 1000);
      const books: any[] = res.results || res || [];
      const targets = books.filter((b) => !b.cover || String(b.cover).includes('m.media-amazon.com'));
      const updates: any[] = [];
      for (const b of targets) {
        const author = (b.author_ids?.[0]) || '';
        let { cover, isbn } = await openLibraryCover(b.title, author);
        if (!cover && b.amazon_link) cover = await amazonCover(b.amazon_link);
        if (cover) {
          const upd: any = { id: b.id, cover };
          if (isbn) upd.isbn = isbn;
          updates.push(upd);
        }
      }
      if (updates.length) {
        await base44.asServiceRole.entities.Book.bulkUpdate(updates);
      }
      return Response.json({
        action: 'fix-covers',
        updated: updates.length,
        total: targets.length,
        withIsbn: updates.filter((u) => u.isbn).length
      });
    }

    // ---- Action: update Amazon ratings for books missing them (rating 0) ----
    // Fetches each book's Amazon product page directly (browser UA) and extracts
    // the "X.X out of 5 stars" rating — far more reliable than LLM web search for
    // less-indexed titles. Processes all missing-rating books in one call.
    if (body.action === 'fix-ratings') {
      const res = await base44.asServiceRole.entities.Book.filter({}, 'internal_id', 1000);
      const books: any[] = res.results || res || [];
      const targets = books.filter((b) => !b.rating || b.rating === 0);
      const totalTargets = targets.length;
      if (!totalTargets) {
        return Response.json({ action: 'fix-ratings', updated: 0, totalTargets: 0, hasMore: false, results: [] });
      }
      const results: any[] = [];
      const updates: any[] = [];
      for (const b of targets) {
        const link = (b.amazon_link || '').split('?')[0];
        if (!link) {
          results.push({ title: b.title, rating: null, status: 'no_link' });
          continue;
        }
        try {
          const r = await fetch(link, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9'
            },
            redirect: 'follow'
          });
          if (!r.ok) {
            results.push({ title: b.title, rating: null, status: 'fetch_failed', code: r.status });
            continue;
          }
          const html = await r.text();
          const m = html.match(/(\d+\.\d)\s+out of 5\s+stars/i);
          if (m) {
            const rating = Math.max(0, Math.min(5, parseFloat(m[1])));
            updates.push({ id: b.id, rating });
            results.push({ title: b.title, rating, status: 'updated' });
          } else {
            results.push({ title: b.title, rating: null, status: 'no_rating_on_page' });
          }
        } catch (e) {
          results.push({ title: b.title, rating: null, status: 'error', error: e.message });
        }
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
      if (updates.length) {
        await base44.asServiceRole.entities.Book.bulkUpdate(updates);
      }
      return Response.json({ action: 'fix-ratings', updated: updates.length, totalTargets, hasMore: false, results });
    }

    // ---- Action: bulk import from an Amazon category URL ----
    if (body.action === 'import-category') {
      const categoryUrl = String(body.category_url || '').trim();
      const limit = Math.min(20, Math.max(1, parseInt(body.limit, 10) || 10));
      if (!categoryUrl) {
        return Response.json({ error: 'category_url is required' }, { status: 400 });
      }
      const existingRes = await base44.asServiceRole.entities.Book.filter({}, '-created_date', 1000);
      const existingArr: any[] = existingRes.results || existingRes || [];
      const existingTitles = existingArr.map((b) => b.title);

      const prompt = `You are a senior book curator for The Blockchain Library.
Source: this Amazon bestsellers / category page: ${categoryUrl}
Already listed in the library (do NOT repeat any): ${existingTitles.length ? existingTitles.join(' | ') : '(none yet)'}

List the top ${limit} books currently shown on that Amazon category page. Use REAL, accurate, verifiable data from Amazon — real ASINs, real ratings, real publication years. For each book provide ALL fields:
- title: exact book title
- subtitle: the subtitle if one exists, otherwise ""
- author: primary author name as a plain readable string
- asin: 10-character Amazon ASIN for the print/paperback/hardcover edition (must be real)
- kindle_asin: 10-character ASIN for the Kindle edition if one exists, otherwise ""
- publication_year: 4-digit year as a number
- rating: Amazon average customer rating (1.0-5.0, one decimal) as a number
- description: 2-3 sentence neutral, educational description
- tags: 5-8 lowercase topic tags
- category: exactly one of: ${CATEGORY_BUCKETS.join(', ')}

Return JSON: { "books": [ {...}, ... ] } — up to ${limit} entries, no duplicates with already-listed titles.`;
      const llmResponse: any = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: BOOKS_JSON_SCHEMA
      });
      const generated: any[] = (llmResponse && llmResponse.books) || [];
      if (!generated.length) {
        return Response.json({ error: 'No books found for that category URL', raw: llmResponse }, { status: 500 });
      }
      const { entries, skipped } = await persistNewBooks(generated, existingArr, base44);
      return Response.json({
        action: 'import-category',
        category_url: categoryUrl,
        created: entries.length,
        skipped,
        books: entries.map((e) => ({
          title: e.title,
          slug: e.slug,
          internal_id: e.internal_id,
          author: (e.author_ids || [])[0] || '',
          rating: e.rating,
          cover: e.cover ? 'yes' : 'no',
          amazon: e.amazon_link ? 'tagged' : 'none'
        }))
      });
    }

    // ---- Action: import from isbnsearch.org (reliable ISBN-based discovery) ----
    if (body.action === 'import-isbn-search') {
      const term = String(body.term || '').trim();
      const pages = Math.min(5, Math.max(1, parseInt(body.pages, 10) || 1));
      if (!term) {
        return Response.json({ error: 'term is required' }, { status: 400 });
      }

      const existingRes = await base44.asServiceRole.entities.Book.filter({}, '-created_date', 1000);
      const existingArr: any[] = existingRes.results || existingRes || [];
      const existingIsbns = new Set(existingArr.map((b) => b.isbn).filter(Boolean));
      const existingSlugs = new Set(existingArr.map((b) => b.slug));

      // 1. Fetch + parse the search page(s)
      const found: any[] = [];
      for (let p = 1; p <= pages; p++) {
        const url = `https://isbnsearch.org/search?s=${encodeURIComponent(term)}${p > 1 ? `&p=${p}` : ''}`;
        try {
          const r = await fetch(url, { redirect: 'follow' });
          if (!r.ok) continue;
          const html = await r.text();
          found.push(...parseIsbnSearch(html));
        } catch (_e) { continue; }
      }

      // 2. Dedup by ISBN-13 (primary) + slug
      const newBooks = found.filter((b) => b.isbn13 && !existingIsbns.has(b.isbn13) && !existingSlugs.has(slugify(b.title)));
      const skipped = found.length - newBooks.length;

      if (!newBooks.length) {
        return Response.json({ action: 'import-isbn-search', term, pages, found: found.length, created: 0, skipped, books: [] });
      }

      // 3. One LLM call for neutral educational descriptions
      const descPrompt = `You are a senior book curator for The Blockchain Library. Write a 2-3 sentence neutral, educational description for each of these books based on its title and author. Be factual and concise.
Books: ${JSON.stringify(newBooks.map((b) => ({ isbn13: b.isbn13, title: b.title, author: b.author })))}
Return JSON: { "descriptions": [{ "isbn13": "...", "description": "..." }] } — one entry per book, using the same isbn13 values.`;
      const descMap: Record<string, string> = {};
      try {
        const descRes: any = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: descPrompt,
          response_json_schema: {
            type: 'object',
            properties: {
              descriptions: {
                type: 'array',
                items: { type: 'object', properties: { isbn13: { type: 'string' }, description: { type: 'string' } } }
              }
            }
          }
        });
        (descRes?.descriptions || []).forEach((d: any) => { descMap[d.isbn13] = d.description; });
      } catch (_e) { /* descriptions optional */ }

      // 4. Ensure categories (use the search term as the category name)
      const catByName = await ensureCategories([term], base44);
      const categoryId = (catByName[term.toLowerCase()] || {}).id || null;

      // 5. Compute next internal_id
      let maxNum = 0;
      existingArr.forEach((b) => {
        const m = b.internal_id && String(b.internal_id).match(/(\d+)$/);
        if (m) { const n = parseInt(m[1], 10); if (n > maxNum) maxNum = n; }
      });

      // 6. Enrich each book: detail page + Amazon rating + cover + link
      const entries: any[] = [];
      for (const b of newBooks) {
        const detail = await fetchIsbnDetail(b.isbn13);
        const asin = b.isbn10 || b.isbn13;
        const rating = await fetchAmazonRating(asin);
        await new Promise((resolve) => setTimeout(resolve, 350));
        maxNum += 1;
        const internalId = `BOOK-${String(maxNum).padStart(6, '0')}`;
        const cover = b.coverId ? `https://m.media-amazon.com/images/I/${b.coverId}._SL500_.jpg` : '';
        const desc = descMap[b.isbn13] || '';
        entries.push({
          title: b.title,
          slug: slugify(b.title),
          subtitle: '',
          cover,
          description: desc,
          isbn: b.isbn13,
          amazon_link: `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`,
          amazon_kindle_link: '',
          formats: [detail.binding || 'Paperback'],
          publisher: detail.publisher,
          publication_year: detail.pubYear,
          author_ids: b.author ? [b.author] : [],
          rating,
          pages: null,
          language: 'English',
          tags: [term.toLowerCase()],
          is_featured: false,
          category_id: categoryId,
          status: 'published',
          visibility: 'public',
          internal_id: internalId,
          seo_title: `${b.title} — Book | The Blockchain Library`,
          seo_description: (desc || b.title).slice(0, 160),
          citation: `${b.author || 'Unknown'} (${detail.pubYear || 'n.d.'}). ${b.title}. ${detail.publisher || ''}. ISBN ${b.isbn13}.`
        });
      }

      if (entries.length) {
        await base44.asServiceRole.entities.Book.bulkCreate(entries);
      }

      return Response.json({
        action: 'import-isbn-search',
        term,
        pages,
        found: found.length,
        created: entries.length,
        skipped,
        books: entries.map((e) => ({
          title: e.title,
          slug: e.slug,
          internal_id: e.internal_id,
          isbn: e.isbn,
          author: (e.author_ids || [])[0] || '',
          publisher: e.publisher,
          year: e.publication_year,
          rating: e.rating,
          cover: e.cover ? 'yes' : 'no',
          amazon: 'tagged'
        }))
      });
    }

    // ---- Default action: generate a batch from Amazon Bitcoin & Crypto bestsellers ----
    const batch = Math.max(1, parseInt(body.batch, 10) || 1);
    const existingRes = await base44.asServiceRole.entities.Book.filter({}, '-created_date', 1000);
    const existingArr: any[] = existingRes.results || existingRes || [];
    const existingTitles = existingArr.map((b) => b.title);

    const prompt = `You are a senior book curator for The Blockchain Library, a premier educational knowledge platform.

Source: Amazon's "Bitcoin & Cryptocurrencies" bestsellers list (Amazon category node 203569026011).
Already listed in the library (do NOT repeat any of these): ${existingTitles.length ? existingTitles.join(' | ') : '(none yet)'}

Provide exactly ${BATCH_SIZE} of the most popular, highest-rated books about blockchain, cryptocurrency, Bitcoin, Ethereum, DeFi, NFTs, crypto trading & investing, and Web3 that currently rank high on Amazon's Bitcoin & Cryptocurrencies bestsellers list. Prefer well-known, reputable, in-print titles. Use REAL, accurate, verifiable data from Amazon — real ASINs, real ratings, real publication years.

For EACH book provide ALL fields:
- title: exact book title
- subtitle: the subtitle if one exists, otherwise ""
- author: primary author name as a plain readable string (e.g. "Andreas M. Antonopoulos")
- asin: the 10-character Amazon ASIN for the print/paperback/hardcover edition (must be real)
- kindle_asin: the 10-character ASIN for the Kindle edition if one exists, otherwise ""
- publication_year: 4-digit publication year as a number
- rating: the book's Amazon average customer rating (1.0 to 5.0, one decimal) as a number
- description: a 2-3 sentence neutral, educational description of what the book covers and who it is for
- tags: 5-8 lowercase topic tags
- category: a broad topic bucket, exactly one of: ${CATEGORY_BUCKETS.join(', ')}

Return JSON: { "books": [ {title, subtitle, author, asin, kindle_asin, publication_year, rating, description, tags, category}, ... ] } — exactly ${BATCH_SIZE} entries, no duplicates with the already-listed titles.`;

    const llmResponse: any = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: BOOKS_JSON_SCHEMA
    });

    const generated: any[] = (llmResponse && llmResponse.books) || [];
    if (!generated.length) {
      return Response.json({ error: 'LLM returned no books', raw: llmResponse }, { status: 500 });
    }

    const { entries, skipped } = await persistNewBooks(generated, existingArr, base44);

    return Response.json({
      created: entries.length,
      skipped,
      batch,
      totalSeed: TOTAL_BATCHES * BATCH_SIZE,
      books: entries.map((e) => ({
        title: e.title,
        slug: e.slug,
        internal_id: e.internal_id,
        author: (e.author_ids || [])[0] || '',
        rating: e.rating,
        cover: e.cover ? 'yes' : 'no',
        amazon: e.amazon_link ? 'tagged' : 'none'
      }))
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});