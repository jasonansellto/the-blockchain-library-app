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

const GENERIC_TERMS = new Set('account accounts collection interface network transaction transactions platform application system community value asset assets market markets address balance block chain record server client protocol standard layer'.split(' '));

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

    // ---- glossary matchers (specific terms only) ----
    // Single pass per article: count 1–4 word phrases and look them up.
    const termByPhrase = new Map(); // normalized phrase -> { id, multi, acronym }
    for (const g of glossary) {
      const t = String(g.title || '').trim();
      if (t.length < 2) continue;
      const acronym = /^[A-Z0-9]{2,6}$/.test(t);
      const toks = t.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean);
      if (!toks.length || toks.length > 4) continue;
      const multi = toks.length > 1;
      if (!multi && !acronym && t.length < 6) continue; // skip short generic single words
      if (!multi && GENERIC_TERMS.has(toks[0])) continue; // everyday words that happen to be glossary entries
      termByPhrase.set(toks.join(' '), { id: g.id, multi, acronym, raw: t });
    }
    const tokenize = (s) => String(s || '').replace(/[^A-Za-z0-9\s-]/g, ' ').split(/\s+/).filter(Boolean);
    function phraseCounts(text) {
      const toks = tokenize(text);
      const lower = toks.map((t) => t.toLowerCase());
      const counts = new Map();
      for (let i = 0; i < lower.length; i++) {
        let p = '';
        for (let n = 0; n < 4 && i + n < lower.length; n++) {
          p = n ? `${p} ${lower[i + n]}` : lower[i];
          for (const key of [p, p.endsWith('s') ? p.slice(0, -1) : null]) {
            if (!key) continue;
            const hit = termByPhrase.get(key);
            if (!hit) continue;
            if (hit.acronym && n === 0 && toks[i] !== hit.raw && toks[i] !== `${hit.raw}s`) continue;
            counts.set(hit.id, (counts.get(hit.id) || 0) + 1);
          }
        }
      }
      return counts;
    }

    // Count term usage per article, then weight by rarity (IDF) so specific terms
    // like "Account Abstraction" outrank ones used everywhere like "Blockchain".
    const N = Math.max(published.length, 1);
    const perArticle = new Map(); // articleId -> { body: Map, title: Map }
    const df = new Map(); // glossaryId -> #articles using it
    for (const a of published) {
      const body = phraseCounts(`${a.summary || ''} ${plain(a.body || '').slice(0, 20000)}`);
      const title = phraseCounts(a.title);
      perArticle.set(a.id, { body, title });
      for (const id of new Set([...body.keys(), ...title.keys()])) df.set(id, (df.get(id) || 0) + 1);
    }
    const idf = (id) => Math.log(N / (df.get(id) || 1));
    const usesTerm = new Map(); // glossaryId -> [{id: articleId, score}]
    const articleTerms = new Map(); // articleId -> [{id: glossaryId, score}]
    for (const a of published) {
      const { body, title } = perArticle.get(a.id);
      const scored = [];
      for (const id of new Set([...body.keys(), ...title.keys()])) {
        if ((df.get(id) || 0) > N * 0.25) continue; // used by >25% of articles: too generic to link
        const n = body.get(id) || 0;
        const score = ((n ? 1 + Math.log(n) : 0) + (title.has(id) ? 2 : 0)) * idf(id);
        scored.push({ id, score });
        if (!usesTerm.has(id)) usesTerm.set(id, []);
        usesTerm.get(id).push({ id: a.id, score });
      }
      articleTerms.set(a.id, scored);
    }

    // Keyword rarity across articles, for matching books and research.
    const kwDf = new Map();
    const articleKeywords = new Map();
    for (const a of published) {
      const kws = new Set([...(a.tags || []).map((t) => String(t).toLowerCase()), ...words(a.title)]);
      articleKeywords.set(a.id, kws);
      for (const k of kws) kwDf.set(k, (kwDf.get(k) || 0) + 1);
    }
    const kwIdf = (k) => Math.log((N + 1) / ((kwDf.get(k) || 0) + 1));
    const docKeywords = (d) => new Set([...(d.tags || []).map((t) => String(t).toLowerCase()), ...words(d.title)]);
    function keywordScore(articleKws, doc) {
      let s = 0; let shared = 0;
      for (const k of docKeywords(doc)) if (articleKws.has(k)) { s += kwIdf(k); shared++; }
      return shared >= 2 ? s : 0;
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
        const ids = topN(articleTerms.get(a.id) || [], 6, 3);
        if (ids.length) data.related_glossary = ids;
      }
      const kws = articleKeywords.get(a.id);
      if (empty(a.related_books)) {
        const ids = topN(books.filter((b) => b.status !== 'draft').map((b) => ({ id: b.id, score: keywordScore(kws, b) })), 3, 6);
        if (ids.length) data.related_books = ids;
      }
      if (empty(a.related_research)) {
        const ids = topN(research.map((r) => ({ id: r.id, score: keywordScore(kws, r) })), 3, 6);
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
      if (empty(g.seo_title) && g.title) {
        const full = `${g.title}: Definition & Meaning`;
        data.seo_title = full.length <= 55 ? full : seoTitle(g.title);
      }
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
        // steady pace: 10 writes per 2.6 s ≈ 230/min (platform limit is 350/min per caller)
        const due = (i / 10) * 2600 - (Date.now() - started);
        if (due > 0) await new Promise((r) => setTimeout(r, due));
        await Promise.all(batch.slice(i, i + 10).map(async (u) => {
          try { await base44.asServiceRole.entities[u.entity].update(u.id, u.data); applied++; }
          catch (e) { failed.push(`${u.entity}:${u.id}: ${String(e?.message || e).slice(0, 120)}`); }
        }));
        if (Date.now() - started > 270_000) break;
      }
    }

    const summary = {};
    for (const u of updates) for (const k of Object.keys(u.data)) summary[`${u.entity}.${k}`] = (summary[`${u.entity}.${k}`] || 0) + 1;

    // dryRun preview: show proposed links as titles for a few articles.
    let preview;
    if (dryRun && body.preview) {
      const titleOf = new Map([...articles, ...glossary, ...books, ...research].map((x) => [x.id, x.title]));
      preview = updates.filter((u) => u.entity === 'Article').slice(0, Math.min(Number(body.preview) || 5, 15)).map((u) => ({
        article: titleOf.get(u.id),
        ...Object.fromEntries(Object.entries(u.data).filter(([k]) => k.startsWith('related_')).map(([k, v]) => [k, v.map((id) => titleOf.get(id))])),
      }));
    }
    return Response.json({ dryRun, pendingUpdates: updates.length, applied, remaining: updates.length - applied, failed: failed.slice(0, 10), fields: summary, preview });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
