import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let body: any = {};
    try { body = await req.json(); } catch (e) {}

    const [articles, glossary, books, research, paths] = await Promise.all([
      base44.asServiceRole.entities.Article.filter({ status: 'published' }, '-updated_date', 5000),
      base44.asServiceRole.entities.GlossaryTerm.list('-updated_date', 5000),
      base44.asServiceRole.entities.Book.list('-updated_date', 5000),
      base44.asServiceRole.entities.ResearchPaper.list('-updated_date', 5000),
      base44.asServiceRole.entities.LearningPath.list('-updated_date', 5000),
    ]);

    const count = (r) => (r.results || r || []).length;

    let filteredArticles = null;
    if (body.article_filter) {
      let user = null;
      try { user = await base44.auth.me(); } catch (e) {}
      if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
        return Response.json({ error: 'Forbidden — admin or editor only for custom filters' }, { status: 403 });
      }
      const filtered = await base44.asServiceRole.entities.Article.filter(
        body.article_filter, '-updated_date', 5000
      );
      filteredArticles = count(filtered);
    }

    return Response.json({
      articles: count(articles),
      glossary: count(glossary),
      books: count(books),
      research: count(research),
      paths: count(paths),
      filtered_articles: filteredArticles,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});