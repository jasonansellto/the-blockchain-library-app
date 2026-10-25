import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Daily AI enrichment for articles (uses integration credits).
// One AI call per article produces, in a single pass:
//   faq (3–5 Q&A, feeds FAQPage rich results), key_takeaways (3–5),
//   seo_title and seo_description.
// Only empty fields are written; articles that already have FAQs are skipped.
// Newest articles first, so fresh imports are enriched the same day.
//
// Body (optional): { limit?: number (default 25, max 60), dryRun?: boolean, article_id?: string }

async function fetchPublished(base44) {
  const byId = new Map();
  for (let skip = 0; skip < 60000; skip += 500) {
    const res = await base44.asServiceRole.entities.Article.filter({ status: 'published' }, 'id', 500, skip);
    const batch = res.results || res || [];
    for (const a of batch) byId.set(a.id, a);
    if (batch.length < 500) break;
  }
  return [...byId.values()];
}

const clean = (s, max) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, max);
const isCreditError = (e) => /credit|quota|paywall|limit exceeded|insufficient/i.test(String(e?.message || e));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let caller = null;
    try { caller = await base44.auth.me(); } catch (_e) { /* scheduled run */ }
    if (caller && caller.role !== 'admin' && caller.role !== 'editor') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(Number(body.limit) || 25, 1), 60);
    const dryRun = Boolean(body.dryRun);

    const all = body.article_id
      ? [await base44.asServiceRole.entities.Article.get(String(body.article_id))].filter(Boolean)
      : await fetchPublished(base44);
    const todo = all
      .filter((a) => a.title && a.body && (!a.faq || a.faq.length === 0))
      .sort((x, y) => String(y.published_date || y.created_date || '').localeCompare(String(x.published_date || x.created_date || '')));
    const batch = todo.slice(0, limit);
    if (dryRun) return Response.json({ dryRun, withoutFaq: todo.length, wouldProcess: batch.map((a) => a.slug) });

    const results = [];
    const started = Date.now();
    for (const article of batch) {
      if (Date.now() - started > 250_000) break;
      try {
        const prompt = `You are the editor of The Blockchain Library, a neutral, accurate educational site about blockchain, crypto, Web3, AI and digital technology.

For the article below, write:
1. faq: 3-5 questions a reader would genuinely search for, each with a 2-3 sentence answer that stands on its own. Specific to this article; no "What is this article about?". Factual and neutral; no financial advice or price predictions.
2. key_takeaways: 3-5 short bullet points (max 20 words each) capturing the article's main points.
3. seo_title: a compelling search title, max 55 characters, containing the main topic keyword (the site name is added automatically; do not include it).
4. seo_description: a meta description of 140-155 characters that summarizes the value of the article and includes the main keyword. No quotes, no emojis.

Title: ${article.title}
Summary: ${article.summary || ''}
Article:
${String(article.body).slice(0, 6000)}`;

        const res = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: 'object',
            properties: {
              faq: { type: 'array', items: { type: 'object', properties: { question: { type: 'string' }, answer: { type: 'string' } }, required: ['question', 'answer'] } },
              key_takeaways: { type: 'array', items: { type: 'string' } },
              seo_title: { type: 'string' },
              seo_description: { type: 'string' },
            },
            required: ['faq', 'key_takeaways', 'seo_title', 'seo_description'],
          },
        });

        const faq = (res.faq || []).filter((f) => f?.question && f?.answer).slice(0, 5)
          .map((f) => ({ question: clean(f.question, 200), answer: clean(f.answer, 700) }));
        const takeaways = (res.key_takeaways || []).map((t) => clean(t, 200)).filter(Boolean).slice(0, 5);
        if (!faq.length) { results.push({ slug: article.slug, status: 'no_output' }); continue; }

        const data = { faq };
        if (!article.key_takeaways?.length && takeaways.length) data.key_takeaways = takeaways;
        if (!article.seo_title && res.seo_title) data.seo_title = clean(res.seo_title, 70);
        if (!article.seo_description && res.seo_description) data.seo_description = clean(res.seo_description, 170);
        await base44.asServiceRole.entities.Article.update(article.id, data);
        results.push({ slug: article.slug, status: 'ok', faq: faq.length });
      } catch (e) {
        results.push({ slug: article.slug, status: 'error', error: String(e?.message || e).slice(0, 200) });
        if (isCreditError(e)) break; // out of AI credits — stop and let tomorrow's run continue
      }
    }

    const ok = results.filter((r) => r.status === 'ok').length;
    return Response.json({ withoutFaq: todo.length, processed: results.length, enriched: ok, remaining: todo.length - ok, results: results.slice(0, 60) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
