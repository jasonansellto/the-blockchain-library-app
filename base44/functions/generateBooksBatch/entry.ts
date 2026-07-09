import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Book importer & enrichment tool for The Blockchain Library.
// Actions:
//   - fix-affiliate-links : retag all Amazon links with the affiliate ID
//   - fix-covers          : replace broken/missing cover URLs with reliable
//                           covers (and ISBNs) from Open Library
//   - fix-ratings         : look up real Amazon ratings for books missing them
//   - fix-amazon-links    : recover amazon.com buy-links from stored 978 ISBNs
//   - import-category     : bulk import top books from a given Amazon category URL
//   - import-isbn-search  : discover & import real books from Open Library search
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
// Returns the ISBN even when no cover image is available, so buy-links can still
// be recovered downstream. The Google Books API rate-limits (429) the server IP
// and LLM-generated m.media-amazon.com cover URLs frequently 404, so Open Library
// is the authoritative source for every imported book.
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
      if (doc) {
        const isbnArr: string[] = (doc.isbn || []).map(String);
        const isbn = isbnArr.find((i) => i.length === 13 && i.startsWith('978')) || isbnArr[0] || '';
        const cover = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : '';
        return { cover, isbn };
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
// Fetches a reliable cover + ISBN from Open Library for each title.
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

// Shared browser headers for scraping Amazon product pages (covers / ratings).
const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9'
};

// Derive the ISBN-10 from a 978-prefixed ISBN-13 (the ISBN-10 is a valid Amazon
// ASIN). 979-prefixed ISBN-13s have no ISBN-10 equivalent — those books use a
// separate B0... ASIN on Amazon which Open Library does not expose, so we return
// '' and skip building an amazon link for them (avoids 404 buy-links).
function isbn13To10(isbn13: string): string {
  if (!isbn13 || !isbn13.startsWith('978')) return '';
  const core = isbn13.slice(3, 12);
  if (!/^\d{9}$/.test(core)) return '';
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(core[i], 10) * (10 - i);
  const check = (11 - (sum % 11)) % 11;
  const checkChar = check === 10 ? 'X' : String(check);
  return core + checkChar;
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

    // ---- Action: fix broken/missing covers via Open Library ----
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

    // ---- Action: recover amazon.com buy-links for books missing them ----
    // Looks up the ISBN on Open Library (by main title + author, then full title)
    // and builds an amazon.com link using the derived ISBN-10 (valid ASIN). Also
    // backfills the isbn field and cover when Open Library has them.
    if (body.action === 'fix-amazon-links') {
      const res = await base44.asServiceRole.entities.Book.filter({}, 'internal_id', 1000);
      const books: any[] = res.results || res || [];
      const targets = books.filter((b) => !b.amazon_link && b.title);
      if (!targets.length) {
        return Response.json({ action: 'fix-amazon-links', scanned: 0, restored: 0, results: [] });
      }
      const results: any[] = [];
      const updates: any[] = [];
      for (const b of targets) {
        let isbn13 = '';
        // Use the stored ISBN when it's a 978 (reliable, no network needed).
        // Title-based lookup (isbnsearch/Open Library) is too unreliable for
        // buy-link generation — it returns wrong editions or unrelated matches —
        // so books without a stored 978 ISBN are left without a buy-link rather
        // than risking an incorrect one.
        if (b.isbn && String(b.isbn).length === 13 && String(b.isbn).startsWith('978')) {
          isbn13 = String(b.isbn);
        }
        if (isbn13) {
          const isbn10 = isbn13To10(isbn13);
          if (isbn10) {
            const upd: any = { id: b.id, amazon_link: `https://www.amazon.com/dp/${isbn10}?tag=${AFFILIATE_TAG}` };
            updates.push(upd);
            results.push({ title: b.title, isbn: isbn13, status: 'restored' });
          } else {
            results.push({ title: b.title, status: 'no_isbn10' });
          }
        } else {
          results.push({ title: b.title, status: 'no_isbn' });
        }
      }
      if (updates.length) {
        await base44.asServiceRole.entities.Book.bulkUpdate(updates);
      }
      return Response.json({ action: 'fix-amazon-links', scanned: targets.length, restored: updates.length, results });
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

    // ---- Action: import from Open Library search (reliable ISBN-based discovery) ----
    if (body.action === 'import-isbn-search') {
      const term = String(body.term || '').trim();
      const limit = Math.min(40, Math.max(5, parseInt(body.limit, 10) || 20));
      if (!term) {
        return Response.json({ error: 'term is required' }, { status: 400 });
      }

      const existingRes = await base44.asServiceRole.entities.Book.filter({}, '-created_date', 1000);
      const existingArr: any[] = existingRes.results || existingRes || [];
      // Dedup keys: every existing ISBN-13, its derived ISBN-10, and the ASIN
      // extracted from each amazon_link (covers originals imported before ISBNs
      // were stored, and amazon.ca links that carry the ISBN-10 as /dp/ ASIN).
      const existingIds = new Set<string>();
      existingArr.forEach((b) => {
        if (b.isbn) { existingIds.add(b.isbn); const d10 = isbn13To10(b.isbn); if (d10) existingIds.add(d10); }
        const am = String(b.amazon_link || '').match(/\/dp\/([A-Z0-9]{10})(?:\?|$)/);
        if (am) existingIds.add(am[1]);
      });
      const existingSlugs = new Set(existingArr.map((b) => b.slug));

      // Open Library search — authoritative ISBNs, covers, authors, years, publishers.
      const found: any[] = [];
      try {
        const r = await fetch(
          `https://openlibrary.org/search.json?q=${encodeURIComponent(term)}&limit=${limit * 3}&fields=title,author_name,first_publish_year,publisher,isbn,cover_i`,
          { redirect: 'follow' }
        );
        if (!r.ok) {
          return Response.json({ error: `Open Library search failed (${r.status})` }, { status: 502 });
        }
        const data: any = await r.json();
        for (const doc of data?.docs || []) {
          const isbnArr: string[] = (doc.isbn || []).map(String);
          const isbn13 = isbnArr.find((i) => i.length === 13 && i.startsWith('978')) || isbnArr.find((i) => i.length === 13) || '';
          if (!isbn13) continue;
          const isbn10 = isbnArr.find((i) => i.length === 10) || isbn13To10(isbn13) || '';
          found.push({
            isbn13,
            isbn10,
            cover_i: doc.cover_i || null,
            title: String(doc.title || '').trim(),
            author: (doc.author_name || [])[0] || '',
            year: doc.first_publish_year || null,
            publisher: (doc.publisher || [])[0] || ''
          });
        }
      } catch (e: any) {
        return Response.json({ error: 'Open Library search error: ' + e.message }, { status: 502 });
      }

      // Dedup within found by ISBN-13, then against existing records + slug.
      const seenIsbn = new Set<string>();
      const newBooks = found.filter((b) => {
        if (!b.isbn13 || seenIsbn.has(b.isbn13)) return false;
        seenIsbn.add(b.isbn13);
        if (existingIds.has(b.isbn13)) return false;
        if (b.isbn10 && existingIds.has(b.isbn10)) return false;
        const d10 = isbn13To10(b.isbn13);
        if (d10 && existingIds.has(d10)) return false;
        if (existingSlugs.has(slugify(b.title))) return false;
        return true;
      });
      const skipped = found.length - newBooks.length;
      const toCreate = newBooks.slice(0, limit);

      if (!toCreate.length) {
        return Response.json({ action: 'import-isbn-search', term, found: found.length, created: 0, skipped, books: [] });
      }

      // One LLM call for neutral educational descriptions.
      const descPrompt = `You are a senior book curator for The Blockchain Library. Write a 2-3 sentence neutral, educational description for each of these books based on its title and author. Be factual and concise.
Books: ${JSON.stringify(toCreate.map((b) => ({ isbn13: b.isbn13, title: b.title, author: b.author })))}
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

      // Ensure categories (use the search term as the category name)
      const catByName = await ensureCategories([term], base44);
      const categoryId = (catByName[term.toLowerCase()] || {}).id || null;

      // Compute next internal_id
      let maxNum = 0;
      existingArr.forEach((b) => {
        const m = b.internal_id && String(b.internal_id).match(/(\d+)$/);
        if (m) { const n = parseInt(m[1], 10); if (n > maxNum) maxNum = n; }
      });

      // Enrich each book: cover + amazon link (ISBN-10 as ASIN) + live Amazon rating
      const entries: any[] = [];
      for (const b of toCreate) {
        const asin = b.isbn10 || isbn13To10(b.isbn13);
        const rating = await fetchAmazonRating(asin);
        await new Promise((resolve) => setTimeout(resolve, 350));
        maxNum += 1;
        const internalId = `BOOK-${String(maxNum).padStart(6, '0')}`;
        let cover = b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-L.jpg` : '';
        if (!cover && asin) cover = await amazonCover(amazonUrl(asin));
        const desc = descMap[b.isbn13] || '';
        entries.push({
          title: b.title,
          slug: slugify(b.title),
          subtitle: '',
          cover,
          description: desc,
          isbn: b.isbn13,
          amazon_link: asin ? `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}` : '',
          amazon_kindle_link: '',
          formats: ['Paperback'],
          publisher: b.publisher,
          publication_year: b.year,
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
          citation: `${b.author || 'Unknown'} (${b.year || 'n.d.'}). ${b.title}. ${b.publisher || ''}. ISBN ${b.isbn13}.`
        });
      }

      if (entries.length) {
        await base44.asServiceRole.entities.Book.bulkCreate(entries);
      }

      return Response.json({
        action: 'import-isbn-search',
        term,
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