import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Curated book importer: pulls top Bitcoin & Cryptocurrency books from Amazon's
// bestsellers (category node 203569026011) via an LLM with web context, and
// creates Book entities with affiliate-tagged Amazon (.ca) links.
const BATCH_SIZE = 5;
const TOTAL_BATCHES = 5;
const AFFILIATE_TAG = 'whemusliv-20';

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
      return Response.json({
        action: 'fix-affiliate-links',
        updated: updates.length,
        total: books.length
      });
    }

    // ---- Action: generate a batch of books ----
    const batch = Math.max(1, parseInt(body.batch, 10) || 1);

    const existingRes = await base44.asServiceRole.entities.Book.filter({}, '-created_date', 1000);
    const existingArr: any[] = existingRes.results || existingRes || [];
    const existingSlugs = new Set(existingArr.map((b: any) => b.slug));
    const existingTitles = existingArr.map((b: any) => b.title);

    const prompt = `You are a senior book curator for The Blockchain Library, a premier educational knowledge platform.

Source: Amazon's "Bitcoin & Cryptocurrencies" bestsellers list (Amazon category node 203569026011).
Already listed in the library (do NOT repeat any of these): ${existingTitles.length ? existingTitles.join(' | ') : '(none yet)'}

Provide exactly ${BATCH_SIZE} of the most popular, highest-rated books about blockchain, cryptocurrency, Bitcoin, Ethereum, DeFi, NFTs, crypto trading & investing, and Web3 that currently rank high on Amazon's Bitcoin & Cryptocurrencies bestsellers list. Prefer well-known, reputable, in-print titles. Use REAL, accurate, verifiable data from Amazon — real ASINs, real ratings, real publication years.

For EACH book provide ALL fields:
- title: exact book title
- subtitle: the subtitle if one exists, otherwise empty string ""
- author: primary author name as a plain readable string (e.g. "Andreas M. Antonopoulos")
- asin: the 10-character Amazon ASIN for the print/paperback/hardcover edition (must be real)
- kindle_asin: the 10-character ASIN for the Kindle edition if one exists, otherwise empty string ""
- cover_url: the Amazon product cover image URL (m.media-amazon.com images/I/... format). If you cannot confirm one, use empty string ""
- publication_year: 4-digit publication year as a number
- rating: the book's Amazon average customer rating (1.0 to 5.0, one decimal) as a number
- description: a 2-3 sentence neutral, educational description of what the book covers and who it is for
- tags: 5-8 lowercase topic tags
- category: a broad topic bucket, exactly one of: "Bitcoin", "Ethereum", "Blockchain Basics", "Cryptography", "Smart Contracts", "DeFi", "NFTs", "Trading & Investing", "Web3", "Wallets & Security", "Economics"

Return JSON: { "books": [ {title, subtitle, author, asin, kindle_asin, cover_url, publication_year, rating, description, tags, category}, ... ] } — exactly ${BATCH_SIZE} entries, no duplicates with the already-listed titles.`;

    const llmResponse: any = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: "object",
        properties: {
          books: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                subtitle: { type: "string" },
                author: { type: "string" },
                asin: { type: "string" },
                kindle_asin: { type: "string" },
                cover_url: { type: "string" },
                publication_year: { type: "number" },
                rating: { type: "number" },
                description: { type: "string" },
                tags: { type: "array", items: { type: "string" } },
                category: { type: "string" }
              }
            }
          }
        }
      }
    });

    const generated: any[] = (llmResponse && llmResponse.books) || [];
    if (!generated.length) {
      return Response.json({ error: 'LLM returned no books', raw: llmResponse }, { status: 500 });
    }

    // Dedup by slug against existing books
    const newBooks = generated.filter((b: any) => b && b.title && !existingSlugs.has(slugify(b.title)));
    const skipped = generated.length - newBooks.length;
    if (!newBooks.length) {
      return Response.json({ message: 'All books in this batch already exist', created: 0, skipped, batch });
    }

    // Ensure categories exist for the buckets used in this batch
    const usedCats = [...new Set(newBooks.map((b: any) => b.category).filter(Boolean))];
    const catRes = await base44.asServiceRole.entities.Category.list('sort_order', 200);
    const catArr: any[] = catRes.results || catRes || [];
    const catByName: Record<string, any> = {};
    catArr.forEach((c: any) => { catByName[c.name.toLowerCase()] = c; });
    const catsToCreate: any[] = [];
    usedCats.forEach((name) => {
      if (!catByName[name.toLowerCase()] && !catsToCreate.find((c) => c.name === name)) {
        catsToCreate.push({ name, slug: slugify(name), sort_order: 100 });
      }
    });
    if (catsToCreate.length) {
      const createdCats = await base44.asServiceRole.entities.Category.bulkCreate(catsToCreate);
      (createdCats.results || createdCats || []).forEach((c: any) => { catByName[c.name.toLowerCase()] = c; });
    }

    // Compute next sequential BOOK-XXXXXX id
    let maxNum = 0;
    existingArr.forEach((b: any) => {
      if (b.internal_id) {
        const m = b.internal_id.match(/-(\d+)$/);
        if (m) { const n = parseInt(m[1], 10); if (n > maxNum) maxNum = n; }
      }
    });

    const entries = newBooks.map((b: any) => {
      maxNum += 1;
      const internalId = `BOOK-${String(maxNum).padStart(6, '0')}`;
      const asin = String(b.asin || '').trim();
      const kindleAsin = String(b.kindle_asin || '').trim();
      const authorName = String(b.author || '').trim();
      const formats = kindleAsin ? ['Paperback', 'Kindle'] : ['Paperback'];
      const rating = typeof b.rating === 'number' ? Math.max(0, Math.min(5, b.rating)) : 0;
      const desc = b.description || '';
      return {
        title: b.title,
        slug: slugify(b.title),
        subtitle: b.subtitle || '',
        cover: b.cover_url || '',
        description: desc,
        isbn: null,
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
      };
    });

    await base44.asServiceRole.entities.Book.bulkCreate(entries);

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
        amazon: e.amazon_link ? 'tagged' : 'none'
      }))
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});