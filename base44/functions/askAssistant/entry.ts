import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { question, history } = await req.json();
    if (!question || !question.trim()) {
      return Response.json({ error: 'Question is required' }, { status: 400 });
    }

    // Fetch recent published articles for keyword matching
    const articlesRes = await base44.asServiceRole.entities.Article.filter({ status: 'published' }, '-published_date', 100);
    const allArticles = articlesRes.results || articlesRes || [];

    // Score articles by keyword matches
    const stopWords = new Set(['the', 'what', 'how', 'why', 'when', 'and', 'with', 'from', 'that', 'this', 'about', 'into', 'your', 'are', 'can', 'does', 'did', 'will', 'should', 'would', 'could', 'tell', 'explain', 'mean']);
    const keywords = (question.toLowerCase().match(/\b[a-z]{3,}\b/g) || []).filter(w => !stopWords.has(w));

    const scored = allArticles.map(a => {
      let score = 0;
      const title = (a.title || '').toLowerCase();
      const summary = (a.summary || '').toLowerCase();
      const tags = (a.tags || []).join(' ').toLowerCase();
      for (const kw of keywords) {
        if (title.includes(kw)) score += 3;
        if (summary.includes(kw)) score += 2;
        if (tags.includes(kw)) score += 1;
      }
      return { id: a.id, title: a.title, slug: a.slug, summary: a.summary, featured_image: a.featured_image, body: a.body, score };
    }).filter(a => a.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);

    // Build context from top articles
    const context = scored.map(a =>
      `## ${a.title}\n${a.summary || ''}\n${(a.body || '').substring(0, 4000)}`
    ).join('\n\n---\n\n');

    const conversationContext = history
      ? `\n\nPREVIOUS CONVERSATION:\n${history}\n`
      : '';

    const prompt = `You are the AI assistant for "The Blockchain Library," an expert educational platform covering blockchain, cryptocurrency, Web3, DeFi, and emerging technology. Answer the user's question clearly and accurately.

Use the following library content as your primary source. Cite article titles when referencing specific information. If the library content doesn't fully cover the question, supplement with your own knowledge.

LIBRARY CONTENT:
${context || 'No directly matching articles were found. Answer from your general blockchain knowledge.'}
${conversationContext}

USER QUESTION: ${question}

Provide a thorough, well-structured answer using markdown formatting (headings, bullet points, bold where helpful). Keep it educational and accessible.`;

    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'automatic',
    });

    const answer = typeof llmRes === 'string' ? llmRes : (llmRes?.answer || JSON.stringify(llmRes));

    return Response.json({
      answer,
      sources: scored.map(a => ({ id: a.id, title: a.title, slug: a.slug, summary: a.summary, featured_image: a.featured_image })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});