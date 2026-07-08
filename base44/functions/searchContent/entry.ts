import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const SYNONYM_MAP = {
  'pos': 'Proof of Stake', 'pow': 'Proof of Work', 'defi': 'Decentralized Finance',
  'nft': 'Non-Fungible Token', 'dao': 'Decentralized Autonomous Organization',
  'l2': 'Layer 2', 'l1': 'Layer 1', 'eth': 'Ethereum', 'btc': 'Bitcoin',
  'dapp': 'Decentralized Application', 'dapps': 'Decentralized Applications',
  'tvl': 'Total Value Locked', 'amm': 'Automated Market Maker',
  'ico': 'Initial Coin Offering', 'ieo': 'Initial Exchange Offering',
  'ido': 'Initial DEX Offering', 'lp': 'Liquidity Provider',
  'evm': 'Ethereum Virtual Machine', 'zksync': 'zkSync', 'rollup': 'Rollup',
  'gas': 'Gas Fee', 'mainnet': 'Mainnet', 'testnet': 'Testnet',
  'staking': 'Staking', 'slashing': 'Slashing', 'validator': 'Validator',
  'oracle': 'Oracle', 'bridge': 'Blockchain Bridge', 'tokenomics': 'Tokenomics',
  'erc20': 'ERC-20', 'erc721': 'ERC-721', 'erc1155': 'ERC-1155',
  'bep20': 'BEP-20', 'solidity': 'Solidity', 'vyper': 'Vyper',
  'smart contract': 'Smart Contract', 'private key': 'Private Key',
  'public key': 'Public Key', 'seed phrase': 'Seed Phrase',
  'liquid staking': 'Liquid Staking', 'restaking': 'Restaking',
  'proof of reserves': 'Proof of Reserves', 'merkle': 'Merkle Tree',
  'yield farming': 'Yield Farming', 'optimistic rollup': 'Optimistic Rollup',
  'zk rollup': 'Zero Knowledge Rollup', 'sharding': 'Sharding',
  'fork': 'Hard Fork', 'airdrop': 'Airdrop', 'pump': 'Pump and Dump',
  'rug pull': 'Rug Pull', 'whale': 'Crypto Whale', 'hodl': 'Hold On for Dear Life'
};

function expandQuery(query) {
  const lower = query.toLowerCase();
  const terms = [query];
  for (const [abbr, full] of Object.entries(SYNONYM_MAP)) {
    const abbrLower = abbr.toLowerCase();
    const fullLower = full.toLowerCase();
    const regex = new RegExp(`\\b${abbrLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lower) && !terms.includes(full)) terms.push(full);
    if (lower.includes(fullLower) && !terms.includes(abbr)) terms.push(abbr);
  }
  return [...new Set(terms)];
}

function matchItem(item, terms, fields) {
  const lowerTerms = terms.map(t => t.toLowerCase());
  return fields.some(field => {
    const val = item[field];
    if (!val) return false;
    if (Array.isArray(val)) {
      return val.some(v => lowerTerms.some(t => String(v).toLowerCase().includes(t)));
    }
    const str = String(val).toLowerCase();
    return lowerTerms.some(t => str.includes(t));
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let body = {};
    try { body = await req.json(); } catch (e) {}

    const query = body.query || new URL(req.url).searchParams.get('query') || '';
    const types = body.types || ['articles', 'glossary', 'books', 'research', 'authors', 'paths'];
    const difficulty = body.difficulty || '';
    const limit = body.limit || 20;

    if (!query.trim()) {
      return Response.json({ results: {}, total: 0, query });
    }

    const terms = expandQuery(query);

    const [articlesRes, glossaryRes, booksRes, researchRes, authorsRes, pathsRes] = await Promise.all([
      types.includes('articles') ? base44.asServiceRole.entities.Article.filter({ status: 'published' }, '-updated_date', 200) : Promise.resolve([]),
      types.includes('glossary') ? base44.asServiceRole.entities.GlossaryTerm.list('title', 500) : Promise.resolve([]),
      types.includes('books') ? base44.asServiceRole.entities.Book.list('-updated_date', 50) : Promise.resolve([]),
      types.includes('research') ? base44.asServiceRole.entities.ResearchPaper.list('-updated_date', 50) : Promise.resolve([]),
      types.includes('authors') ? base44.asServiceRole.entities.Author.list('-updated_date', 50) : Promise.resolve([]),
      types.includes('paths') ? base44.asServiceRole.entities.LearningPath.list('-updated_date', 50) : Promise.resolve([]),
    ]);

    const filterDifficulty = (item) => !difficulty || item.difficulty === difficulty;
    const results = {};

    if (types.includes('articles')) {
      results.articles = (articlesRes.results || articlesRes || [])
        .filter(a => matchItem(a, terms, ['title', 'summary', 'body', 'tags']))
        .filter(filterDifficulty).slice(0, limit)
        .map(a => ({ id: a.id, slug: a.slug, title: a.title, summary: a.summary, difficulty: a.difficulty, featured_image: a.featured_image, category_id: a.category_id, tags: a.tags, reading_time: a.reading_time, type: 'article' }));
    }
    if (types.includes('glossary')) {
      results.glossary = (glossaryRes.results || glossaryRes || [])
        .filter(t => matchItem(t, terms, ['title', 'definition', 'simple_explanation', 'subcategory']))
        .filter(filterDifficulty).slice(0, limit)
        .map(t => ({ id: t.id, slug: t.slug, title: t.title, definition: t.definition, difficulty: t.difficulty, subcategory: t.subcategory, type: 'glossary' }));
    }
    if (types.includes('books')) {
      results.books = (booksRes.results || booksRes || [])
        .filter(b => matchItem(b, terms, ['title', 'subtitle', 'description', 'tags']))
        .slice(0, limit)
        .map(b => ({ id: b.id, slug: b.slug, title: b.title, subtitle: b.subtitle, description: b.description, cover: b.cover, rating: b.rating, author_ids: b.author_ids, type: 'book' }));
    }
    if (types.includes('research')) {
      results.research = (researchRes.results || researchRes || [])
        .filter(r => matchItem(r, terms, ['title', 'abstract', 'authors', 'publication']))
        .slice(0, limit)
        .map(r => ({ id: r.id, slug: r.slug, title: r.title, abstract: r.abstract, authors: r.authors, publication: r.publication, research_type: r.research_type, type: 'research' }));
    }
    if (types.includes('authors')) {
      results.authors = (authorsRes.results || authorsRes || [])
        .filter(a => matchItem(a, terms, ['name', 'bio', 'expertise_areas']))
        .slice(0, limit)
        .map(a => ({ id: a.id, slug: a.slug, name: a.name, bio: a.bio, photo: a.photo, expertise_areas: a.expertise_areas, type: 'author' }));
    }
    if (types.includes('paths')) {
      results.paths = (pathsRes.results || pathsRes || [])
        .filter(p => matchItem(p, terms, ['title', 'description']))
        .filter(filterDifficulty).slice(0, limit)
        .map(p => ({ id: p.id, slug: p.slug, title: p.title, description: p.description, difficulty: p.difficulty, cover_image: p.cover_image, estimated_time: p.estimated_time, lessons: p.lessons, type: 'path' }));
    }

    const total = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
    return Response.json({ results, total, query, expandedTerms: terms });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});