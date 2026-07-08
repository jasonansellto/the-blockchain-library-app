import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch (e) {}
    if (user && user.role !== 'admin' && user.role !== 'editor') {
      return Response.json({ error: 'Forbidden — admin or editor only' }, { status: 403 });
    }

    const res = await base44.asServiceRole.entities.Article.filter(
      { status: 'published' }, '-published_date', 10
    );
    const articles = (res.results || res || []).filter(a => !a.visibility || a.visibility === 'public');

    const articleList = articles.map((a, i) =>
      `${i + 1}. "${a.title}" — ${a.summary || ''}`
    ).join('\n');

    const prompt = `You are the editor of The Blockchain Library, a premier educational platform for blockchain, cryptocurrency, and Web3.

Write a weekly newsletter edition summarizing the ${articles.length} most recent articles. The newsletter should:
- Have a compelling title for this week's edition
- A 2-3 sentence intro welcoming readers and highlighting the theme
- A brief summary (1-2 sentences) for each article with its title as a markdown heading
- A closing call-to-action encouraging readers to explore more

Recent articles:
${articleList}

Return a JSON object with:
- title: The newsletter edition title
- summary: 2-3 sentence intro
- body: Full newsletter body in markdown format (use ## for article section headers, bullet points)`;

    const llmRes = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          summary: { type: "string" },
          body: { type: "string" }
        },
        required: ["title", "summary", "body"]
      }
    });

    const existing = await base44.asServiceRole.entities.NewsletterEdition.list('-issue_number', 1);
    const existingArr = existing.results || existing || [];
    const nextIssue = (existingArr[0]?.issue_number || 0) + 1;

    const slug = ((llmRes.title || `edition-${nextIssue}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + `-${nextIssue}`).slice(0, 80);

    const edition = await base44.asServiceRole.entities.NewsletterEdition.create({
      title: llmRes.title || `Weekly Edition #${nextIssue}`,
      slug,
      issue_number: nextIssue,
      published_date: new Date().toISOString().split('T')[0],
      summary: llmRes.summary || '',
      body: llmRes.body || '',
      tags: ['weekly', 'blockchain', 'crypto', 'web3'],
    });

    return Response.json({
      success: true,
      edition: { id: edition.id, title: edition.title, slug: edition.slug, issue_number: nextIssue }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});