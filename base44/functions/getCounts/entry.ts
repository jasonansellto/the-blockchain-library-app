import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const [articles, glossary, books, research, paths] = await Promise.all([
      base44.asServiceRole.entities.Article.filter({ status: 'published' }, '-updated_date', 5000),
      base44.asServiceRole.entities.GlossaryTerm.list('-updated_date', 5000),
      base44.asServiceRole.entities.Book.list('-updated_date', 5000),
      base44.asServiceRole.entities.ResearchPaper.list('-updated_date', 5000),
      base44.asServiceRole.entities.LearningPath.list('-updated_date', 5000),
    ]);

    const count = (r) => (r.results || r || []).length;

    return Response.json({
      articles: count(articles),
      glossary: count(glossary),
      books: count(books),
      research: count(research),
      paths: count(paths),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});