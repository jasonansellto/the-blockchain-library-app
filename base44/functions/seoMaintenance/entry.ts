import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Daily SEO & internal-linking maintenance (no AI credits).
//
// Fills only EMPTY fields, so anything written by hand is never overwritten:
//   • seo_title / seo_description on articles (once they have FAQs — the AI
//     enrichment writes richer ones first), glossary terms, resources, code
//     snippets, learning paths and categories
//   • Article.related_articles  — same tags / category / title words
//   • Article.related_glossary  — glossary terms the article actually uses
//   • Article.related_books / related_research — shared tags and title words
//   • GlossaryTerm.related_articles — articles that use the term
//
// Body (optional): { dryRun?: boolean, maxUpdates?: number (default 280) }
// Entity updates are paced under the platform limit (350/min per caller).

const STOP = new Set('a an and are as at be by for from how in is it its of on or that the to what when why with your you vs via into than more most new guide explained explaining'.split(' '));

const words = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
const empty = (v) => v == null || v === '' || (Array.isArray(v) && v.length === 0);
const plain = (s) => String(s || '').replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[#*_>`|]/g, ' ').replace(/\s+/g, ' ').trim();

function clip(text, max) {
  const t = plain(text);
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const sentence = cut.lastIndexOf('. ');
  if (sentence > max * 0.6) return cut.slice(0, sentence + 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:–—-]+$/, '') + '…';
}

function seoTitle(title, max = 55) {
  const t = plain(title);
  if (t.length <= max) return t;
  for (const sep of [': ', ' — ', ' – ', ' - ', ' | ']) {
    const head = t.split(sep)[0];
    if (head.length >= 20 && head.length <= max) return head;
  }
  return t.slice(0, t.slice(0, max).lastIndexOf(' ')).replace(/[,;:–—-]+$/, '');
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

function topN(scored, n, min = 1) {
  return scored.filter((s) => s.score >= min).sort((a, b) => b.score - a.score).slice(0, n).map((s) => s.id);
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
    const dryRun = Boolean(body.dryRun);
    const maxUpdates = Math.min(Math.max(Number(body.maxUpdates) || 280, 1), 1200);

    const [articles, glossary, books, research, resources, snippets, paths, categories] = await Promise.all(
      ['Article', 'GlossaryTerm', 'Book', 'ResearchPaper', 'BlockchainResource', 'CodeSnippet', 'LearningPath', 'Category'].map((e) => fetchAll(base44, e)),
    );
    const published = articles.filter((a) => a.status === 'published');
    const catName = new Map(categories.map((c) => [c.id, c.name]));

    // ---- glossary matchers (specific terms only) ----
    const terms = glossary
      .filter((g) => g.title && g.title.length >= 4)
      .map((g) => {
        const t = g.title.trim();
        const multi = /\s/.test(t);
        const acronym = /^[A-Z0-9]{2,6}$/.test(t);
        return { g, multi, re: new RegExp(`\\b${escapeRe(t)}s?\\b`, acronym ? 'g' : 'gi') };
      })
      .filter((x) => x.multi || x.g.title.length >= 6 || /^[A-Z0-9]{2,6}$/.test(x.g.title));

    const articleText = new Map(published.map((a) => [a.id, `${a.title}\n${a.summary || ''}\n${plain(a.body || '').slice(0, 20000)}`]));
    const usesTerm = new Map(); // glossaryId -> [{articleId, n}]
    const articleTerms = new Map(); // articleId -> scored glossary ids
    for (const a of published) {
      const text = articleText.get(a.id);
      const scored = [];
      for (const { g, multi, re } of terms) {
        const n = (text.match(re) || []).length;
        if (!n) continue;
        const inTitle = re.test(a.title); re.lastIndex = 0;
        const score = n + (inTitle ? 5 : 0) + (multi ? 2 : 0);
        scored.push({ id: g.id, score });
        if (!usesTerm.has(g.id)) usesTerm.set(g.id, []);
        usesTerm.get(g.id).push({ id: a.id, score });
      }
      articleTerms.set(a.id, scored);
    }

    // ---- article similarity ----
    const aw = new Map(published.map((a) => [a.id, new Set([...words(a.title), ...(a.tags || []).map((t) => String(t).toLowerCase())])]));
    const tagSet = (x) => new Set((x.tags || []).map((t) => String(t).toLowerCase()));
    function overlap(setA, setB) { let n = 0; for (const x of setA) if (setB.has(x)) n++; return n; }

    const updates = []; // { entity, id, data }
    const push = (entity, id, data) => { if (Object.keys(data).length) updates.push({ entity, id, data }); };

    for (const a of published) {
      const data = {};
      const tags = tagSet(a);
      if (empty(a.related_articles)) {
        const scored = published.filter((b) => b.id !== a.id).map((b) => ({
          id: b.id,
          score: 3 * overlap(tags, tagSet(b)) + (a.category_id && a.category_id === b.category_id ? 2 : 0) + 2 * overlap(aw.get(a.id), aw.get(b.id)),
        }));
        const ids = topN(scored, 4, 4);
        if (ids.length) data.related_articles = ids;
      }
      if (empty(a.related_glossary)) {
        const ids = topN(articleTerms.get(a.id) || [], 6, 2);
        if (ids.length) data.related_glossary = ids;
      }
      const keyset = new Set([...tags, ...aw.get(a.id)]);
      if (empty(a.related_books)) {
        const ids = topN(books.filter((b) => b.status !== 'draft').map((b) => ({ id: b.id, score: 2 * overlap(keyset, tagSet(b)) + overlap(keyset, new Set(words(b.title))) })), 3, 3);
        if (ids.length) data.related_books = ids;
      }
      if (empty(a.related_research)) {
        const ids = topN(research.map((r) => ({ id: r.id, score: 2 * overlap(keyset, tagSet(r)) + overlap(keyset, new Set(words(r.title))) })), 3, 3);
        if (ids.length) data.related_research = ids;
      }
      // Articles get AI-written SEO with their FAQs; fall back here once that is done.
      if ((a.faq || []).length) {
        if (empty(a.seo_title)) data.seo_title = seoTitle(a.title);
        if (empty(a.seo_description) && (a.summary || a.body)) data.seo_description = clip(a.summary || a.body, 155);
      }
      push('Article', a.id, data);
    }

    for (const g of glossary) {
      const data = {};
      if (empty(g.related_articles)) {
        const ids = topN(usesTerm.get(g.id) || [], 5, 1);
        if (ids.length) data.related_articles = ids;
      }
      if (empty(g.seo_title)) data.seo_title = seoTitle(`${g.title}: Definition & Meaning`, 60).length <= 60 ? `${g.title}: Definition & Meaning` : seoTitle(g.title);
      if (empty(g.seo_description) && g.definition) data.seo_description = clip(`${g.title}: ${g.definition}`, 155);
      push('GlossaryTerm', g.id, data);
    }

    for (const r of resources) {
      const data = {};
      const name = r.name || r.title;
      if (empty(r.seo_title) && name) data.seo_title = seoTitle(`${name}${r.tagline ? ` — ${r.tagline}` : ''}`);
      if (empty(r.seo_description) && (r.description || r.tagline)) data.seo_description = clip(r.description || r.tagline, 155);
      push('BlockchainResource', r.id, data);
    }
    for (const s of snippets) {
      const data = {};
      const name = s.title || s.name;
      if (empty(s.seo_title) && name) data.seo_title = seoTitle(`${name}${s.language ? ` (${s.language})` : ''}`);
      if (empty(s.seo_description) && s.description) data.seo_description = clip(s.description, 155);
      push('CodeSnippet', s.id, data);
    }
    for (const p of paths) {
      const data = {};
      const name = p.title || p.name;
      if (empty(p.seo_title) && name) data.seo_title = seoTitle(`${name} — Learning Path`);
      if (empty(p.seo_description) && p.description) data.seo_description = clip(p.description, 155);
      push('LearningPath', p.id, data);
    }
    for (const c of categories) {
      const data = {};
      if (!c.name) continue;
      if (empty(c.seo_title)) data.seo_title = seoTitle(`${c.name} — Guides, Glossary & Research`);
      if (empty(c.seo_description)) {
        data.seo_description = clip(c.description || `Learn ${c.name}: in-depth articles, clear glossary definitions, books and research papers on ${c.name.toLowerCase()} from The Blockchain Library.`, 155);
      }
      push('Category', c.id, data);
    }

    const batch = updates.slice(0, maxUpdates);
    let applied = 0;
    const failed = [];
    if (!dryRun) {
      const started = Date.now();
      for (let i = 0; i < batch.length; i += 10) {
        // pace: ≤ ~280 updates per rolling minute
        const minute = Math.floor((Date.now() - started) / 60000);
        if (applied >= (minute + 1) * 280) await new Promise((r) => setTimeout(r, (minute + 1) * 60000 - (Date.now() - started) + 500));
        await Promise.all(batch.slice(i, i + 10).map(async (u) => {
          try { await base44.asServiceRole.entities[u.entity].update(u.id, u.data); applied++; }
          catch (e) { failed.push(`${u.entity}:${u.id}: ${String(e?.message || e).slice(0, 120)}`); }
        }));
        if (Date.now() - started > 270_000) break;
      }
    }

    const summary = {};
    for (const u of updates) for (const k of Object.keys(u.data)) summary[`${u.entity}.${k}`] = (summary[`${u.entity}.${k}`] || 0) + 1;
    return Response.json({ dryRun, pendingUpdates: updates.length, applied, remaining: updates.length - applied, failed: failed.slice(0, 10), fields: summary });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
