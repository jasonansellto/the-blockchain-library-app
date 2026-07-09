import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Curated seed of 30 canonical blockchain research papers, whitepapers,
// standards (EIPs), reports, and original research entries.
const SEED_PAPERS = [
  { title: "Bitcoin: A Peer-to-Peer Electronic Cash System", authors: ["Satoshi Nakamoto"], year: 2008, url: "https://bitcoin.org/bitcoin.pdf", collection: "Consensus Mechanisms", research_type: "whitepaper" },
  { title: "Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform", authors: ["Vitalik Buterin"], year: 2013, url: "https://ethereum.org/en/whitepaper/", collection: "Smart Contracts", research_type: "whitepaper" },
  { title: "Ethereum: A Secure Decentralised Generalised Transaction Ledger (Yellow Paper)", authors: ["Gavin Wood"], year: 2014, url: "https://ethereum.github.io/yellowpaper/paper.pdf", collection: "Smart Contracts", research_type: "report" },
  { title: "EIP-20: ERC-20 Token Standard", authors: ["Fabian Vogelsteller", "Vitalik Buterin"], year: 2015, url: "https://eips.ethereum.org/EIPS/eip-20", collection: "Standards", research_type: "standard" },
  { title: "EIP-721: Non-Fungible Token Standard", authors: ["William Entriken", "Dieter Shirley", "Jacob Evans", "Nastassia Sachs"], year: 2018, url: "https://eips.ethereum.org/EIPS/eip-721", collection: "Standards", research_type: "standard" },
  { title: "EIP-1155: Multi Token Standard", authors: ["Witek Radomski", "Andrew Cooke"], year: 2018, url: "https://eips.ethereum.org/EIPS/eip-1155", collection: "Standards", research_type: "standard" },
  { title: "EIP-4626: Tokenized Vault Standard", authors: ["Joey Santoro", "Adam Piech"], year: 2022, url: "https://eips.ethereum.org/EIPS/eip-4626", collection: "Standards", research_type: "standard" },
  { title: "The Knowledge Complexity of Interactive Proof-Systems", authors: ["Shafi Goldwasser", "Silvio Micali", "Charles Rackoff"], year: 1985, url: "https://people.csail.mit.edu/silvio/Selected%20Scientific%20Papers/Proof%20Systems/The_Knowledge_Complexity_Of_Interactive_Proof_Systems.pdf", collection: "Zero Knowledge", research_type: "paper" },
  { title: "Zerocash: Decentralized Anonymous Payments from Bitcoin", authors: ["Eli Ben-Sasson", "Alessandro Chiesa", "Christina Garman", "Matthew Green", "Ian Miers", "Eran Tromer", "Madars Virza"], year: 2014, url: "https://eprint.iacr.org/2014/349", collection: "Privacy", research_type: "paper" },
  { title: "Scalable, Transparent, and Post-Quantum Secure Zero-Knowledge Proofs (STARKs)", authors: ["Eli Ben-Sasson", "Iddo Bentov", "Yinon Horesh", "Michael Riabzev"], year: 2018, url: "https://eprint.iacr.org/2018/046", collection: "Zero Knowledge", research_type: "paper" },
  { title: "Practical Byzantine Fault Tolerance", authors: ["Miguel Castro", "Barbara Liskov"], year: 1999, url: "http://pmg.csail.mit.edu/papers/osdi99.pdf", collection: "Consensus Mechanisms", research_type: "paper" },
  { title: "The Latest Gossip on BFT Consensus (Tendermint)", authors: ["Ethan Buchman", "Jae Kwon", "Zarko Milosevic"], year: 2018, url: "https://arxiv.org/abs/1807.04906", collection: "Consensus Mechanisms", research_type: "report" },
  { title: "HotStuff: BFT Consensus with Linearity and Responsiveness", authors: ["Mao Yin", "Dahlia Malkhi", "Michael Reiter", "Guy Golan Gueta", "Ittai Abraham"], year: 2019, url: "https://arxiv.org/abs/1803.05069", collection: "Consensus Mechanisms", research_type: "paper" },
  { title: "Casper the Friendly Finality Gadget", authors: ["Vitalik Buterin", "Virgil Griffith"], year: 2017, url: "https://arxiv.org/abs/1710.09437", collection: "Consensus Mechanisms", research_type: "paper" },
  { title: "Snowflake to Avalanche: A Novel Metastable Consensus Protocol Family for Cryptocurrencies", authors: ["Team Rocket"], year: 2018, url: "https://avalabs.org/snowflake-to-avalanche", collection: "Consensus Mechanisms", research_type: "whitepaper" },
  { title: "Uniswap V2 Core", authors: ["Hayden Adams"], year: 2020, url: "https://uniswap.org/whitepaper.pdf", collection: "DeFi", research_type: "whitepaper" },
  { title: "Uniswap V3 Core", authors: ["Hayden Adams", "Noah Zinsmeister", "Dan Robinson"], year: 2021, url: "https://uniswap.org/whitepaper-v3.pdf", collection: "DeFi", research_type: "whitepaper" },
  { title: "Bancor Protocol: Continuous Liquidity for Autonomous Token Exchange", authors: ["Eyal Hertzog", "Galia Benartzi", "Guido Schmitz"], year: 2017, url: "https://blog.bancor.network/", collection: "DeFi", research_type: "whitepaper" },
  { title: "Chainlink 1.0: A Decentralized Oracle Network", authors: ["Sergey Nazarov", "Steve Ellis"], year: 2017, url: "https://chain.link/whitepaper", collection: "Oracles", research_type: "whitepaper" },
  { title: "Chainlink 2.0: Next Steps in the Evolution of Decentralized Oracle Networks", authors: ["Sergey Nazarov", "Aditya Sharma"], year: 2021, url: "https://chain.link/whitepaper-v2", collection: "Oracles", research_type: "whitepaper" },
  { title: "The Dai Stablecoin System (MakerDAO)", authors: ["MakerDAO Team"], year: 2017, url: "https://makerdao.com/en/whitepaper/", collection: "Stablecoins & CBDC", research_type: "whitepaper" },
  { title: "Libra White Paper: An Introduction to Libra", authors: ["Libra Association"], year: 2019, url: "https://libra.org/en-US/white-paper/", collection: "Stablecoins & CBDC", research_type: "whitepaper" },
  { title: "IPFS - Content Addressed, Versioned, P2P File System", authors: ["Juan Benet"], year: 2014, url: "https://github.com/ipfs/papers/raw/master/ipfs-cap2pfs/ipfs-p2p-file-system.pdf", collection: "Storage", research_type: "paper" },
  { title: "Filecoin: A Decentralized Storage Network and Market", authors: ["Protocol Labs"], year: 2017, url: "https://filecoin.io/filecoin.pdf", collection: "Storage", research_type: "whitepaper" },
  { title: "Cosmos: A Network of Distributed Ledgers", authors: ["Jae Kwon"], year: 2014, url: "https://cosmos.network/about/whitepaper", collection: "Interoperability", research_type: "whitepaper" },
  { title: "Polkadot: Vision for a Heterogeneous Multi-chain Framework", authors: ["Gavin Wood"], year: 2016, url: "https://polkadot.network/PolkaDotPaper.pdf", collection: "Interoperability", research_type: "whitepaper" },
  { title: "Aragon Whitepaper: A New Decentralized Charter for Human Organization", authors: ["Luis Cuende", "Jorge Izquierdo"], year: 2017, url: "https://github.com/aragon/whitepaper", collection: "DAOs", research_type: "whitepaper" },
  { title: "An Incomplete Guide to zk-Rollups", authors: ["Vitalik Buterin"], year: 2021, url: "https://vitalik.ca/general/2021/01/05/rollup.html", collection: "Zero Knowledge", research_type: "report" },
  { title: "Vector Smart Chain: A Machine-First Blockchain Architecture", authors: ["Jason Ansell"], year: 2024, url: "", collection: "Original Research", research_type: "whitepaper", is_original_research: true },
  { title: "Deterministic Execution and Fixed Gas Models for Enterprise Blockchain", authors: ["Jason Ansell"], year: 2024, url: "", collection: "Original Research", research_type: "paper", is_original_research: true }
];

// Priority import list — canonical, high-value papers & standards to seed the
// library first. Only the title/collection/type are hardcoded; real authors,
// year, and source URL are resolved by a web-search LLM at import time.
const PRIORITY_PAPERS: any[] = [
  { title: "Bitcoin: A Peer-to-Peer Electronic Cash System", collection: "Bitcoin", research_type: "whitepaper" },
  { title: "The Bitcoin Backbone Protocol", collection: "Bitcoin", research_type: "paper" },
  { title: "Bitcoin-NG: A Scalable Blockchain Protocol", collection: "Bitcoin", research_type: "paper" },
  { title: "The Bitcoin Lightning Network: Scalable Off-Chain Instant Payments", collection: "Bitcoin", research_type: "whitepaper" },
  { title: "BIP 152: Compact Block Relay", collection: "Bitcoin", research_type: "standard" },
  { title: "Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform", collection: "Ethereum", research_type: "whitepaper" },
  { title: "Ethereum: A Secure Decentralised Generalised Transaction Ledger (Yellow Paper)", collection: "Ethereum", research_type: "report" },
  { title: "EIP-1559: Fee Market Change for ETH 1.0 Chain", collection: "Ethereum", research_type: "standard" },
  { title: "EIP-4844: Shard Blob Transactions", collection: "Layer-2 Scaling", research_type: "standard" },
  { title: "EIP-20: ERC-20 Token Standard", collection: "Standards & Specifications", research_type: "standard" },
  { title: "EIP-721: Non-Fungible Token Standard", collection: "Standards & Specifications", research_type: "standard" },
  { title: "EIP-1155: Multi Token Standard", collection: "Standards & Specifications", research_type: "standard" },
  { title: "EIP-4626: Tokenized Vault Standard", collection: "Standards & Specifications", research_type: "standard" },
  { title: "EIP-4337: Account Abstraction Using Alt Mempool", collection: "Smart Contracts", research_type: "standard" },
  { title: "Practical Byzantine Fault Tolerance", collection: "Consensus Mechanisms", research_type: "paper" },
  { title: "The Latest Gossip on BFT Consensus", collection: "Consensus Mechanisms", research_type: "report" },
  { title: "Ouroboros: A Provably Secure Proof-of-Stake Blockchain Protocol", collection: "Consensus Mechanisms", research_type: "paper" },
  { title: "HotStuff: BFT Consensus with Linearity and Responsiveness", collection: "Consensus Mechanisms", research_type: "paper" },
  { title: "Casper the Friendly Finality Gadget", collection: "Consensus Mechanisms", research_type: "paper" },
  { title: "The HoneyBadger of BFT Protocols", collection: "Consensus Mechanisms", research_type: "paper" },
  { title: "Snowflake to Avalanche: A Novel Metastable Consensus Protocol Family for Cryptocurrencies", collection: "Consensus Mechanisms", research_type: "whitepaper" },
  { title: "Pinocchio: Nearly Practical Verifiable Computation", collection: "Zero-Knowledge Proofs", research_type: "paper" },
  { title: "Bulletproofs: Short Proofs for Confidential Transactions and More", collection: "Zero-Knowledge Proofs", research_type: "paper" },
  { title: "Halo: Recursive Proof Composition without a Trusted Setup", collection: "Zero-Knowledge Proofs", research_type: "paper" },
  { title: "Scalable, Transparent, and Post-Quantum Secure Zero-Knowledge Proofs", collection: "Zero-Knowledge Proofs", research_type: "paper" },
  { title: "PLONK: Permutations over Lagrange-bases for Oecumenical Noninteractive arguments of Knowledge", collection: "Zero-Knowledge Proofs", research_type: "paper" },
  { title: "Nova: Recursive Zero-Knowledge Arguments from Folding Schemes", collection: "Zero-Knowledge Proofs", research_type: "paper" },
  { title: "Spartan: Efficient and General-Purpose zkSNARKs via Cycles of Elliptic Curves", collection: "Zero-Knowledge Proofs", research_type: "paper" },
  { title: "Zerocash: Decentralized Anonymous Payments from Bitcoin", collection: "Zero-Knowledge Proofs", research_type: "paper" },
  { title: "A Certified Digital Signature", collection: "Cryptography", research_type: "paper" },
  { title: "Hashcash - A Denial of Service Counter-Measure", collection: "Cryptography", research_type: "paper" },
  { title: "A Method for Obtaining Digital Signatures and Public-Key Cryptosystems", collection: "Cryptography", research_type: "paper" },
  { title: "Elliptic Curve Cryptosystems", collection: "Cryptography", research_type: "paper" },
  { title: "Short Signatures from the Weil Pairing", collection: "Cryptography", research_type: "paper" },
  { title: "How to Share a Secret", collection: "Cryptography", research_type: "paper" },
  { title: "Verifiable Random Functions", collection: "Cryptography", research_type: "paper" },
  { title: "Uniswap V2 Core", collection: "DeFi", research_type: "whitepaper" },
  { title: "Uniswap V3 Core", collection: "DeFi", research_type: "whitepaper" },
  { title: "Aave: Protocol Whitepaper", collection: "DeFi", research_type: "whitepaper" },
  { title: "Compound Protocol Whitepaper", collection: "DeFi", research_type: "whitepaper" },
  { title: "The Dai Stablecoin System", collection: "Stablecoins & CBDCs", research_type: "whitepaper" },
  { title: "Hyperledger Fabric: A Distributed Operating System for Permissioned Blockchains", collection: "Enterprise Blockchain", research_type: "paper" },
  { title: "Corda: A Distributed Ledger", collection: "Enterprise Blockchain", research_type: "whitepaper" },
  { title: "Decentralized Identifiers (DIDs) v1.0", collection: "Digital Identity", research_type: "standard" },
  { title: "Verifiable Credentials Data Model 1.0", collection: "Digital Identity", research_type: "standard" },
  { title: "NISTIR 8202: Blockchain Technology Overview", collection: "Government & Policy", research_type: "report" }
];

const BATCH_SIZE = 5;

function slugify(text: string): string {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function typeLabel(t: string): string {
  const map: Record<string, string> = {
    whitepaper: 'Project Whitepaper',
    standard: 'Standard Specification',
    report: 'Technical Report',
    paper: 'Academic Paper',
    preprint: 'Preprint',
    thesis: 'Thesis'
  };
  return map[t] || 'Publication';
}

function inferPublication(url: string, research_type: string): string {
  if (!url) return typeLabel(research_type);
  if (url.includes('eips.ethereum.org')) return 'Ethereum Improvement Proposals';
  if (url.includes('arxiv.org')) return 'arXiv preprint';
  if (url.includes('eprint.iacr.org')) return 'IACR ePrint Archive';
  if (url.includes('bitcoin.org')) return 'Bitcoin Whitepaper';
  return typeLabel(research_type);
}

function buildCitation(p: any): string {
  const authors = (p.authors || []).join(', ');
  const year = p.year || 'n.d.';
  return `${authors} (${year}). ${p.title}. ${inferPublication(p.url, p.research_type)}.${p.url ? ` ${p.url}` : ''}`;
}

function buildBibtex(p: any): string {
  const key = (slugify(p.title).split('-').slice(0, 2).join('') || 'paper') + (p.year || '');
  const authors = (p.authors || []).join(' and ');
  let s = `@misc{${key},\n  title = {${p.title}},\n  author = {${authors}},\n  year = {${p.year || ''}},`;
  if (p.url) s += `\n  howpublished = {\\url{${p.url}}},`;
  s += `\n}`;
  return s;
}

// Shared pipeline: annotate a batch of candidate papers via LLM, cross-link to
// glossary + articles, ensure categories, and persist ResearchPaper entries.
// candidates: [{ title, authors, year, url, research_type, collection, is_original_research? }]
async function annotateAndPersist(candidates: any[], base44: any, model?: string): Promise<{ created: number; skipped: number; papers: any[] }> {
  // Skip papers that already exist (by slug)
  const existingRes = await base44.asServiceRole.entities.ResearchPaper.filter({}, '-created_date', 1000);
  const existingArr: any[] = existingRes.results || existingRes || [];
  const existingSlugs = new Set(existingArr.map((p: any) => p.slug));
  const newPapers = candidates.filter((p: any) => p && p.title && !existingSlugs.has(slugify(p.title)));
  const skipped = candidates.length - newPapers.length;

  if (!newPapers.length) {
    return { created: 0, skipped, papers: [] };
  }

  // Generate annotations via LLM (one call for the batch)
  const prompt = `You are a senior blockchain research curator for The Blockchain Library, a premier educational knowledge platform.

For each of the ${newPapers.length} papers below, produce an authoritative annotation and structured metadata. Be accurate, neutral, and educational — do not hype.

PAPERS:
${newPapers.map((p: any, i: number) => `${i + 1}. Title: ${p.title}
   Authors: ${(p.authors || []).join(', ')}
   Year: ${p.year || 'n.d.'}
   Type: ${p.research_type}
   Source: ${p.url || 'n/a'}`).join('\n\n')}

For EACH paper provide ALL fields:
- title: echo the exact title given above
- abstract: a 150-300 word authoritative annotation summarizing the paper's core contribution, methodology, key results, and significance to the blockchain/Web3 field. Neutral academic tone.
- key_findings: 3-5 concise standalone insight sentences
- difficulty: one of "beginner", "intermediate", "advanced", "expert"
- tags: 5-8 relevant lowercase concept tags (e.g. "proof of work", "erc-20", "zero-knowledge proof")
- key_concepts: 5-10 specific blockchain concept names this paper relates to, using common terminology that would match a glossary (e.g. "Proof of Work", "Smart Contract", "Merkle Tree", "Zero-Knowledge Proof", "ERC-20", "Consensus", "Oracle")

Return JSON: { "papers": [ {title, abstract, key_findings, difficulty, tags, key_concepts}, ... ] } — one entry per paper, same order.`;

  const llmResponse: any = await base44.asServiceRole.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: {
      type: "object",
      properties: {
        papers: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              abstract: { type: "string" },
              key_findings: { type: "array", items: { type: "string" } },
              difficulty: { type: "string" },
              tags: { type: "array", items: { type: "string" } },
              key_concepts: { type: "array", items: { type: "string" } }
            }
          }
        }
      }
    },
    ...(model ? { model } : {})
  });

  const generated: any[] = (llmResponse && llmResponse.papers) || [];
  if (!generated.length) {
    throw new Error('LLM returned no papers');
  }

  // Load glossary + published articles for related-link matching
  const [gRes, aRes] = await Promise.all([
    base44.asServiceRole.entities.GlossaryTerm.filter({}, '-updated_date', 500),
    base44.asServiceRole.entities.Article.filter({ status: 'published' }, '-updated_date', 500)
  ]);
  const glossaryArr: any[] = gRes.results || gRes || [];
  const articlesArr: any[] = aRes.results || aRes || [];

  function matchRelated(keywords: string[], items: any[], max: number): string[] {
    const kw = keywords.map((k) => String(k).toLowerCase().trim()).filter((k) => k.length > 2);
    const matched: string[] = [];
    for (const item of items) {
      const title = String(item.title || '').toLowerCase();
      const itemTags = (item.tags || item.related_terms || []).map((t: any) => String(t).toLowerCase());
      const hit = kw.some((k) =>
        k === title ||
        (k.length > 3 && (title.includes(k) || k.includes(title))) ||
        itemTags.includes(k)
      );
      if (hit && item.slug) {
        matched.push(item.slug);
        if (matched.length >= max) break;
      }
    }
    return matched;
  }

  // Ensure categories exist for collections used in this batch
  const usedCollections = [...new Set(newPapers.map((p: any) => p.collection))];
  const catRes = await base44.asServiceRole.entities.Category.list('sort_order', 200);
  const catArr: any[] = catRes.results || catRes || [];
  const catByName: Record<string, any> = {};
  catArr.forEach((c: any) => { catByName[c.name.toLowerCase()] = c; });
  const catsToCreate: any[] = [];
  usedCollections.forEach((name) => {
    if (!catByName[name.toLowerCase()] && !catsToCreate.find((c) => c.name === name)) {
      catsToCreate.push({ name, slug: slugify(name), sort_order: 100 });
    }
  });
  if (catsToCreate.length) {
    const createdCats = await base44.asServiceRole.entities.Category.bulkCreate(catsToCreate);
    (createdCats.results || createdCats || []).forEach((c: any) => { catByName[c.name.toLowerCase()] = c; });
  }

  // Compute next sequential RES-XXXXXX id
  let maxNum = 0;
  existingArr.forEach((p: any) => {
    if (p.internal_id) {
      const m = p.internal_id.match(/-(\d+)$/);
      if (m) { const n = parseInt(m[1], 10); if (n > maxNum) maxNum = n; }
    }
  });

  // Index generated by slug for reliable matching
  const genMap: Record<string, any> = {};
  generated.forEach((g, i) => { if (g && g.title) genMap[slugify(g.title)] = { g, i }; });

  const entries = newPapers.map((seed: any, idx: number) => {
    const key = slugify(seed.title);
    const gen: any = (genMap[key] && genMap[key].g) || generated[idx] || generated[0] || {};
    const keywords = [...(gen.tags || []), ...(gen.key_concepts || [])];
    const relatedGlossary = matchRelated(keywords, glossaryArr, 6);
    const relatedArticles = matchRelated(keywords, articlesArr, 5);
    maxNum += 1;
    const internalId = `RES-${String(maxNum).padStart(6, '0')}`;
    const abstract = gen.abstract || '';
    return {
      title: seed.title,
      slug: key,
      authors: seed.authors || [],
      abstract,
      key_findings: (gen.key_findings || []).slice(0, 5),
      tags: (gen.tags || []).slice(0, 8),
      difficulty: ['beginner', 'intermediate', 'advanced', 'expert'].includes(gen.difficulty) ? gen.difficulty : 'intermediate',
      research_type: seed.research_type || 'paper',
      is_original_research: !!seed.is_original_research,
      is_featured: true,
      visibility: 'public',
      status: 'published',
      category_id: (catByName[(seed.collection || '').toLowerCase()] || {}).id || null,
      related_glossary: relatedGlossary,
      related_articles: relatedArticles,
      publication: inferPublication(seed.url, seed.research_type),
      publication_date: seed.year ? `${seed.year}-01-01` : null,
      doi: null,
      pdf_url: seed.url || null,
      citation: buildCitation(seed),
      bibtex: buildBibtex(seed),
      seo_title: `${seed.title} — Research Annotation | The Blockchain Library`,
      seo_description: (abstract || seed.title).slice(0, 160),
      internal_id: internalId,
      language: 'en',
      downloads: 0,
      citations_count: 0
    };
  });

  await base44.asServiceRole.entities.ResearchPaper.bulkCreate(entries);

  return {
    created: entries.length,
    skipped,
    papers: entries.map((e) => ({
      title: e.title,
      slug: e.slug,
      internal_id: e.internal_id,
      collection: usedCollections.find((c) => catByName[c.toLowerCase()] && catByName[c.toLowerCase()].id === e.category_id) || null,
      related_glossary: e.related_glossary.length,
      related_articles: e.related_articles.length
    }))
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !['admin', 'editor'].includes(user.role)) {
      return Response.json({ error: 'Admin or editor access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { batch = 1, papers: customPapers, model, action } = body;

    let candidates: any[];
    let meta: Record<string, any> = {};

    if (action === 'discover') {
      // Discover NEW research beyond the seed set via a web-search-enabled LLM.
      const collection = String(body.collection || '').trim();
      const topic = String(body.topic || '').trim() || (collection || 'blockchain and Web3');
      const count = Math.min(10, Math.max(1, parseInt(body.count, 10) || 5));
      const collectionFocus = collection ? ` All papers MUST belong to the "${collection}" collection — set each paper's "collection" field to exactly "${collection}".` : '';

      const exRes = await base44.asServiceRole.entities.ResearchPaper.filter({}, '-created_date', 1000);
      const exArr: any[] = exRes.results || exRes || [];
      const existingTitles = exArr.map((p: any) => p.title);

      const discoverPrompt = `You are a senior blockchain research curator for The Blockchain Library, a premier educational knowledge platform.

Topic focus: ${topic}${collectionFocus}
Already in the library (do NOT repeat any of these): ${existingTitles.length ? existingTitles.join(' | ') : '(none yet)'}

Discover ${count} notable, REAL blockchain/Web3 research papers, whitepapers, EIPs/standards, or technical reports that are NOT already listed above. Prefer influential, citable works with real authors and real source URLs (arXiv, IACR ePrint, official EIP pages, project whitepapers). Include a mix of foundational and recent (2020-2024) work. Do NOT invent papers — every entry must be a real, verifiable publication.

For EACH provide:
- title: exact paper/whitepaper/standard title
- authors: array of author names (as strings)
- year: 4-digit publication year as a number
- url: real source URL (PDF or canonical page); "" only if genuinely none
- research_type: one of "paper", "whitepaper", "report", "standard", "preprint", "thesis"
- collection: a topic bucket, e.g. "Consensus Mechanisms", "Zero Knowledge", "DeFi", "Oracles", "Layer 2", "Privacy", "Interoperability", "DAOs", "Stablecoins & CBDC", "Storage", "Smart Contracts", "Original Research"

Return JSON: { "papers": [ {title, authors, year, url, research_type, collection}, ... ] } — exactly ${count} entries, none already in the library.`;

      const discRes: any = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: discoverPrompt,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: "object",
          properties: {
            papers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  authors: { type: "array", items: { type: "string" } },
                  year: { type: "number" },
                  url: { type: "string" },
                  research_type: { type: "string" },
                  collection: { type: "string" }
                }
              }
            }
          }
        }
      });

      candidates = (discRes && discRes.papers) || [];
      if (!candidates.length) {
        return Response.json({ error: 'Discovery returned no papers', raw: discRes }, { status: 500 });
      }
      meta = collection ? { topic, collection } : { topic };
    } else if (action === 'import-priority') {
      // Import a slice of the canonical priority list, enriching each with real
      // metadata (authors/year/URL) via a web-search LLM, then annotate + persist.
      const limit = Math.min(20, Math.max(1, parseInt(body.limit, 10) || 10));
      const offset = Math.max(0, parseInt(body.offset, 10) || 0);
      const collectionFilter = String(body.collection || '').trim();
      const pool: any[] = collectionFilter
        ? PRIORITY_PAPERS.filter((p: any) => p.collection === collectionFilter)
        : PRIORITY_PAPERS;
      const slice: any[] = pool.slice(offset, offset + limit);
      if (!slice.length) {
        return Response.json({ action: 'import-priority', enriched: 0, created: 0, skipped: 0, papers: [], priorityTotal: PRIORITY_PAPERS.length, remaining: 0 });
      }

      const exRes = await base44.asServiceRole.entities.ResearchPaper.filter({}, '-created_date', 1000);
      const exArr: any[] = exRes.results || exRes || [];
      const existingTitles = exArr.map((p: any) => p.title);

      const enrichPrompt = `You are a senior research librarian. For each real paper/standard below, find its REAL authors, publication year, and canonical source URL (arXiv abstract page, eprint.iacr.org, eips.ethereum.org, official project whitepaper PDF, or W3C/NIST/ISO page). Do NOT invent — if you cannot verify an entry, return it with empty authors, year 0, and url "". Echo the exact title, research_type, and collection given.

Already in the library (skip if a title already matches one of these): ${existingTitles.length ? existingTitles.join(' | ') : '(none yet)'}

Entries:
${slice.map((p: any, i: number) => `${i + 1}. Title: ${p.title}\n   Type: ${p.research_type}\n   Collection: ${p.collection}`).join('\n\n')}

Return JSON: { "papers": [ {title, authors, year, url, research_type, collection}, ... ] } — one entry per input, same order.`;
      const enrichRes: any = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: enrichPrompt,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: {
          type: "object",
          properties: {
            papers: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  authors: { type: "array", items: { type: "string" } },
                  year: { type: "number" },
                  url: { type: "string" },
                  research_type: { type: "string" },
                  collection: { type: "string" }
                }
              }
            }
          }
        }
      });

      candidates = ((enrichRes && enrichRes.papers) || []).filter((p: any) => p && p.title && p.url);
      meta = { action: 'import-priority', enriched: candidates.length, priorityTotal: PRIORITY_PAPERS.length, remaining: Math.max(0, pool.length - offset - slice.length) };
    } else if (Array.isArray(customPapers) && customPapers.length) {
      candidates = customPapers;
      meta = { batch: 'custom' };
    } else {
      const b = Math.max(1, parseInt(batch, 10) || 1);
      candidates = SEED_PAPERS.slice((b - 1) * BATCH_SIZE, b * BATCH_SIZE);
      meta = { batch: b, totalSeed: SEED_PAPERS.length };
    }

    if (!candidates.length) {
      return Response.json({ message: 'No papers to process in this batch', created: 0, skipped: 0, ...meta });
    }

    const result = await annotateAndPersist(candidates, base44, model);
    return Response.json({ ...result, ...meta });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});