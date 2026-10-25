import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Creates glossary entries for concepts the site already references but has
// no page for. The list comes from the open-source Knowledge Engine release
// (public/knowledge/missing-concepts.json, rebuilt by the daily GitHub sync):
// each concept is linked from existing glossary terms or articles, so a new
// entry both adds a page and repairs those dead-end links.
// Generation itself is done by generateGlossaryBatch (uses AI credits).
//
// Body (optional): { limit?: number (default 10, max 30), minMentions?: number (default 2), dryRun?: boolean }

const APP_ID = '6a4cfcf76d7d1bf88148c979';
const MISSING_URL = 'https://raw.githubusercontent.com/jasonansellto/the-blockchain-library/main/public/knowledge/missing-concepts.json';
const FUNCTIONS = `https://theblockchainlibrary.com/api/apps/${APP_ID}/functions`;

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

async function fetchAll(base44, entity) {
  const byId = new Map();
  for (let skip = 0; skip < 60000; skip += 500) {
    const res = await base44.asServiceRole.entities[entity].filter({}, 'id', 500, skip);
    const batch = res.results || res || [];
    for (const r of batch) byId.set(r.id, r);
    if (batch.length < 500) break;
  }
  return [...byId.values()];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let caller = null;
    try { caller = await base44.auth.me(); } catch (_e) { /* scheduled run */ }
    if (caller && caller.role !== 'admin' && caller.role !== 'editor') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body.limit) || 10, 1), 30);
    const minMentions = Math.max(Number(body.minMentions) || 2, 1);

    const res = await fetch(MISSING_URL, { cache: 'no-cache' });
    if (!res.ok) return Response.json({ error: `Knowledge release unavailable (${res.status})` }, { status: 502 });
    const missing = await res.json();

    const glossary = await fetchAll(base44, 'GlossaryTerm');
    const known = new Set();
    const subcategoryOf = new Map();
    for (const g of glossary) {
      known.add(norm(g.title));
      if (g.slug) known.add(norm(g.slug));
      for (const a of g.aliases || []) known.add(norm(a));
      subcategoryOf.set(g.id, g.subcategory);
    }

    const candidates = (Array.isArray(missing) ? missing : [])
      .filter((m) => m && m.label && (m.count || 0) >= minMentions)
      .filter((m) => /[a-z]/i.test(m.label) && m.label.length >= 3 && m.label.length <= 60 && !/^https?:/i.test(m.label))
      .filter((m) => !/^[0-9a-f]{24}$/i.test(m.label.trim())) // unresolved record IDs, not concepts
      .filter((m) => !known.has(norm(m.label)) && !known.has(norm(m.label.replace(/s$/i, ''))))
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, limit);

    // File each new term under the subcategory most of its referring terms use.
    const groups = new Map();
    for (const c of candidates) {
      const votes = {};
      for (const ex of c.examples || []) {
        const sub = subcategoryOf.get(ex?.source?.id);
        if (sub) votes[sub] = (votes[sub] || 0) + 1;
      }
      const category = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Blockchain Fundamentals';
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(c.label);
    }

    if (body.dryRun) {
      return Response.json({ dryRun: true, missingTotal: Array.isArray(missing) ? missing.length : 0, wouldCreate: Object.fromEntries(groups) });
    }

    // Small chunks: large batches make the AI return nothing.
    const results = [];
    const started = Date.now();
    for (const [category, all] of groups) {
      for (let i = 0; i < all.length; i += 3) {
        if (Date.now() - started > 240_000) break;
        const terms = all.slice(i, i + 3);
        const r = await fetch(`${FUNCTIONS}/generateGlossaryBatch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-App-Id': APP_ID },
          body: JSON.stringify({ category, terms }),
        });
        const out = await r.json().catch(() => ({}));
        results.push({ category, terms, created: out.created ?? 0, error: out.error });
      }
    }
    const created = results.reduce((n, r) => n + (Number(r.created) || 0), 0);
    return Response.json({ requested: candidates.length, created, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
