import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const SITE_URL = 'https://theblockchainlibrary.com';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    let variant = url.searchParams.get('variant') || 'standard';

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.variant) variant = body.variant;
      } catch (e) {}
    }

    let counts = { articles: 0, glossary: 0, books: 0, research: 0, paths: 0 };
    try {
      const cr = await base44.asServiceRole.functions.invoke('getCounts', {});
      counts = cr.data || cr || counts;
    } catch (e) {}

    if (variant === 'aitxt') {
      let aiText = `# The Blockchain Library — AI Crawler Information\n\n`;
      aiText += `Site: ${SITE_URL}\n`;
      aiText += `Purpose: Educational resource for blockchain, cryptocurrency, Web3, AI, and decentralized technology\n\n`;
      aiText += `## AI Crawler Policy\n`;
      aiText += `We permit AI crawlers and language models to access, index, and use our publicly available content for training and retrieval, provided that:\n`;
      aiText += `- Source attribution is maintained (cite The Blockchain Library and link to the original URL)\n`;
      aiText += `- Content is not misrepresented or taken out of educational context\n`;
      aiText += `- Commercial use requires written permission\n\n`;
      aiText += `## Content Discovery\n`;
      aiText += `- Full content index: ${SITE_URL}/llms.txt\n`;
      aiText += `- Detailed content index: ${SITE_URL}/llms-full.txt\n`;
      aiText += `- Sitemap: ${SITE_URL}/sitemap.xml\n`;
      aiText += `- Robots: ${SITE_URL}/robots.txt\n\n`;
      aiText += `## Content Statistics\n`;
      aiText += `Articles: ${counts.articles || 0}\n`;
      aiText += `Glossary terms: ${counts.glossary || 0}\n`;
      aiText += `Books: ${counts.books || 0}\n`;
      aiText += `Research papers: ${counts.research || 0}\n`;
      aiText += `Learning paths: ${counts.paths || 0}\n\n`;
      aiText += `## Contact\n`;
      aiText += `For AI licensing inquiries: ${SITE_URL}/contact\n`;
      return req.method === 'GET'
        ? new Response(aiText, { headers: { 'Content-Type': 'text/plain' } })
        : Response.json({ content: aiText });
    }

    let text = `# The Blockchain Library\n\n> The definitive educational resource for blockchain, cryptocurrency, Web3, AI, and decentralized technology. ${counts.articles || 0} articles, ${counts.glossary || 0} glossary terms, ${counts.books || 0} books, ${counts.research || 0} research papers, ${counts.paths || 0} learning paths.\n\n`;
    text += `## Learn\n- [Learning Paths](${SITE_URL}/learn): Structured educational paths from beginner to expert\n\n`;
    text += `## Library\n- [Article Library](${SITE_URL}/library): Browse all educational articles by category and difficulty\n- [Topic Hubs](${SITE_URL}/library): Comprehensive topic pages aggregating articles, glossary, books, and research by subject area\n\n`;
    text += `## Glossary\n- [Blockchain Glossary](${SITE_URL}/glossary): ${counts.glossary || 0} definitions of blockchain and Web3 terms\n\n`;
    text += `## Books\n- [Book Recommendations](${SITE_URL}/books): Curated blockchain and crypto books with reviews\n\n`;
    text += `## Research\n- [Research Papers](${SITE_URL}/research): Academic papers and industry research annotated and linked\n\n`;
    text += `## Developer Hub\n- [Developer Resources](${SITE_URL}/developers): Code snippets, RPC endpoints, SDK references\n- [Code Snippets](${SITE_URL}/developers/snippets): Reusable blockchain code examples in Solidity, Rust, JavaScript\n- [RPC Directory](${SITE_URL}/developers/rpc): Public RPC endpoints for major blockchain networks\n\n`;
    text += `## News\n- [Industry News](${SITE_URL}/news): Latest blockchain and cryptocurrency news aggregated from trusted sources\n\n`;
    text += `## Authors\n- [Contributors](${SITE_URL}/authors): Expert authors and contributors writing accurate, neutral, well-referenced content\n`;

    if (variant === 'full') {
      const [artRes, glsRes, catRes] = await Promise.all([
        base44.asServiceRole.entities.Article.filter({ status: 'published' }, '-updated_date', 50),
        base44.asServiceRole.entities.GlossaryTerm.list('-updated_date', 50),
        base44.asServiceRole.entities.Category.list('sort_order', 30)
      ]);
      const articles = (artRes.results || artRes || []).filter(a => !a.visibility || a.visibility === 'public');
      const glossary = glsRes.results || glsRes || [];
      const categories = catRes.results || catRes || [];

      text += `\n## Recent Articles\n`;
      for (const a of articles) {
        const summary = (a.summary || '').replace(/\n/g, ' ').substring(0, 120);
        text += `- [${a.title}](${SITE_URL}/article/${a.slug}): ${summary}\n`;
      }
      text += `\n## Recent Glossary Terms\n`;
      for (const g of glossary) {
        const def = (g.definition || '').replace(/\n/g, ' ').substring(0, 120);
        text += `- [${g.title}](${SITE_URL}/glossary/${g.slug}): ${def}\n`;
      }
      text += `\n## Topic Hubs\n`;
      for (const c of categories) {
        const desc = (c.description || '').replace(/\n/g, ' ').substring(0, 120);
        text += `- [${c.name}](${SITE_URL}/topics/${c.slug}): ${desc}\n`;
      }
    }

    return req.method === 'GET'
      ? new Response(text, { headers: { 'Content-Type': 'text/plain' } })
      : Response.json({ content: text });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});