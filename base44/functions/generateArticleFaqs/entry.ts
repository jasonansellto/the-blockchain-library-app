import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Workflow-triggered calls have no user session; allow the service-role path.
    const user = await base44.auth.me().catch(() => null);
    if (user && user.role !== 'admin' && user.role !== 'editor') {
      return Response.json({ error: 'Forbidden — admin or editor only' }, { status: 403 });
    }

    let limit = 5;
    let offset = 0;
    let articleId = null;
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.limit) limit = Math.min(Math.max(body.limit, 1), 10);
        if (body.offset) offset = body.offset;
        if (body.article_id) articleId = String(body.article_id);
      } catch (e) {}
    }

    // Target a specific article when invoked by the new-article workflow;
    // otherwise scan recent published articles missing FAQs (admin UI batch).
    let batch = [];
    let totalWithoutFaqs = 0;
    if (articleId) {
      const article = await base44.asServiceRole.entities.Article.get(articleId);
      if (article && (!article.faq || article.faq.length === 0)) {
        batch = [article];
      }
      totalWithoutFaqs = batch.length;
    } else {
      const res = await base44.asServiceRole.entities.Article.filter(
        { status: 'published' }, '-published_date', 5000, 0
      );
      const allArticles = res.results || res || [];
      const noFaqArticles = allArticles.filter(a => !a.faq || a.faq.length === 0);
      totalWithoutFaqs = noFaqArticles.length;
      batch = noFaqArticles.slice(offset, offset + limit);
    }

    const results = [];
    for (const article of batch) {
      try {
        const prompt = `Generate 3-5 frequently asked questions with concise answers for this educational article about blockchain, cryptocurrency, Web3, or emerging technology.

Title: ${article.title}
Summary: ${article.summary || ''}
Content excerpt: ${(article.body || '').substring(0, 2000)}

Requirements:
- Questions should be natural and specific to this content
- Answers should be 2-3 sentences, accurate, and educational
- Do NOT include generic questions like "What is this article about?"
- Return a JSON object with a "faqs" array of {question, answer} objects`;

        const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: {
            type: "object",
            properties: {
              faqs: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: { type: "string" },
                    answer: { type: "string" }
                  },
                  required: ["question", "answer"]
                }
              }
            }
          }
        });

        const faqs = (llmRes.faqs || llmRes).filter(f => f.question && f.answer);
        if (faqs.length > 0) {
          await base44.asServiceRole.entities.Article.update(article.id, { faq: faqs });
          results.push({ id: article.id, title: article.title, count: faqs.length, status: 'success' });
        } else {
          results.push({ id: article.id, title: article.title, count: 0, status: 'no_faqs' });
        }
      } catch (e) {
        results.push({ id: article.id, title: article.title, count: 0, status: 'error', error: e.message });
      }
    }

    return Response.json({
      totalWithoutFaqs,
      processed: batch.length,
      results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});