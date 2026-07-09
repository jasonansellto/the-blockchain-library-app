import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TAXONOMY: Record<string, string[]> = {
  "Blockchain Fundamentals": [
    "Account", "Account Abstraction", "Address", "Airdrop", "Altcoin",
    "Application Layer", "Atomic Swap", "Authentication", "Block", "Block Explorer",
    "Block Height", "Block Producer", "Block Reward", "Blockchain", "Blockchain Trilemma",
    "Chain", "Chain Reorganization", "Coin", "Cold Wallet", "Confirmation",
    "Consensus", "Consensus Algorithm", "Cryptography", "Decentralization", "Digital Signature",
    "Distributed Ledger", "Double Spend", "EVM", "Fork", "Full Node",
    "Genesis Block", "Hash", "Hash Function", "Immutability", "Layer 1",
    "Layer 2", "Ledger", "Mainnet", "Merkle Root", "Merkle Tree",
    "Mempool", "Miner", "Mining", "Network", "Node",
    "On-chain", "Off-chain", "Peer-to-Peer Network", "Permissionless Blockchain", "Private Blockchain",
    "Proof of Authority", "Proof of Stake", "Proof of Work", "Public Blockchain", "RPC",
    "Seed Phrase", "Sidechain", "Smart Contract", "Soft Fork", "State",
    "Testnet", "Token", "Transaction", "Transaction Fee", "Validator",
    "Wallet", "Web3"
  ],
  "Cryptography": [
    "AES Encryption", "Asymmetric Encryption", "BIP39", "BIP44", "Cipher",
    "Digital Certificate", "Elliptic Curve Cryptography", "Encryption", "Entropy", "Hash Collision",
    "HMAC", "Keccak-256", "Mnemonic Phrase", "Multi-party Computation", "One-Time Password",
    "PKI", "Private Key", "Public Key", "Quantum Resistance", "RSA",
    "Schnorr Signature", "Secret Sharing", "SHA-256", "Symmetric Encryption", "Threshold Signature",
    "Zero-Knowledge Proof"
  ],
  "Wallets": [
    "Browser Wallet", "Cold Storage", "Custodial Wallet", "Hardware Wallet", "HD Wallet",
    "Hot Wallet", "Mobile Wallet", "Multi-signature Wallet", "Paper Wallet", "Recovery Phrase",
    "Self-Custody", "WalletConnect", "Wallet Address", "Wallet Backup", "Wallet Import",
    "Wallet Security"
  ],
  "Smart Contracts": [
    "ABI", "Bytecode", "Constructor", "Delegatecall", "Event Log",
    "Factory Contract", "Function Selector", "Gas", "Gas Limit", "Gas Price",
    "Immutable Variable", "Interface", "Library Contract", "Modifier", "Oracle",
    "Proxy Contract", "Reentrancy", "Solidity", "Storage", "Upgradeable Contract",
    "View Function"
  ],
  "Ethereum Ecosystem": [
    "Beacon Chain", "Blob", "Burn Address", "Chain ID", "EIP",
    "ERC-20", "ERC-721", "ERC-1155", "ERC-4626", "ERC-4337",
    "Ether", "Ethereum", "Ethereum Virtual Machine", "Execution Layer", "Finality",
    "Gwei", "Rollup", "Shanghai Upgrade", "Staking", "The Merge"
  ],
  "DeFi": [
    "AMM", "Arbitrage", "Automated Market Maker", "Borrowing", "Collateral",
    "DEX", "Flash Loan", "Impermanent Loss", "Lending", "Liquidity",
    "Liquidity Mining", "Liquidity Pool", "LP Token", "Market Maker", "Money Market",
    "Oracle Attack", "Slippage", "Stablecoin", "Swap", "TVL",
    "Yield Farming", "Yield Optimizer"
  ],
  "Stablecoins": [
    "Algorithmic Stablecoin", "Asset-backed Stablecoin", "Fiat-backed Stablecoin", "Overcollateralized Stablecoin",
    "Stablecoin Peg", "Synthetic Dollar", "USDC", "USDT"
  ],
  "NFTs": [
    "Avatar NFT", "Collection", "Floor Price", "Metadata", "Mint",
    "Minting", "NFT Marketplace", "NFT Royalties", "Non-Fungible Token", "PFP",
    "Provenance", "Soulbound Token"
  ],
  "DAOs": [
    "DAO", "Governance", "Governance Proposal", "Governance Token", "On-chain Governance",
    "Proposal", "Quorum", "Snapshot Voting", "Treasury", "Voting Power"
  ],
  "Layer 2 Scaling": [
    "Arbitrum", "Base", "Optimistic Rollup", "Polygon", "Rollup",
    "Sidechain", "Starknet", "State Channel", "Validium", "zkEVM",
    "zkRollup"
  ],
  "Tokenomics": [
    "Burn", "Circulating Supply", "Deflationary Token", "Emission", "Inflationary Token",
    "Max Supply", "Mint", "Token Allocation", "Token Generation Event", "Token Vesting",
    "Total Supply"
  ],
  "Security": [
    "51% Attack", "Audit", "Bug Bounty", "Front-running", "Honeypot",
    "MEV", "Phishing", "Private Key Leak", "Replay Attack", "Rug Pull",
    "Scam Token", "Smart Contract Audit", "Sybil Attack"
  ],
  "Cross-Chain": [
    "Bridge", "Cross-chain", "Interoperability", "IBC", "Relayer",
    "Wrapped Asset", "Wrapped Bitcoin"
  ],
  "Enterprise Blockchain": [
    "BaaS", "Consortium Blockchain", "Digital Identity", "Enterprise Blockchain", "Permissioned Blockchain",
    "Supply Chain", "Tokenization", "Traceability"
  ],
  "AI + Blockchain": [
    "AI Agent", "Autonomous Agent", "Decentralized AI", "Federated Learning", "Machine Economy",
    "On-chain AI", "Proof of Intelligence", "Tokenized AI"
  ],
  "Real World Assets (RWA)": [
    "Asset Tokenization", "Digital Securities", "Fractional Ownership", "RWA", "Security Token",
    "Tokenized Bonds", "Tokenized Real Estate", "Tokenized Stocks"
  ],
  "Gaming & Metaverse": [
    "GameFi", "Metaverse", "Play-to-Earn", "Virtual Land", "Web3 Gaming"
  ],
  "Infrastructure": [
    "API", "Archive Node", "Blockchain Explorer", "CDN", "Chain Indexer",
    "Indexer", "Load Balancer", "Node Provider", "RPC Endpoint", "Validator Set"
  ],
  "Advanced Consensus": [
    "Avalanche Consensus", "BFT", "Byzantine Fault Tolerance", "Delegated Proof of Stake",
    "Directed Acyclic Graph", "Finality Gadget", "HotStuff", "Nakamoto Consensus", "Tendermint"
  ],
  "Vector Smart Chain": [
    "Deterministic Execution", "Fixed Gas Model", "Flat Transaction Fees", "FIFO Transaction Ordering",
    "Predictable Execution", "Hyper-Deflationary Economics", "VSC Validator", "Vector Smart Chain",
    "Vector Smart Gas", "Machine-First Blockchain", "Enterprise Blockchain Infrastructure",
    "Blockchain as a Business", "Deterministic Consensus", "Business Module",
    "On-chain Business Automation", "Real-World Blockchain Infrastructure"
  ]
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Workflow-triggered calls have no user session; allow the service-role path.
    const user = await base44.auth.me().catch(() => null);
    if (user && !['admin', 'editor'].includes(user.role)) {
      return Response.json({ error: 'Forbidden — admin or editor only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const category = body.category;
    const count = body.count || 10;
    const offset = body.offset || 0;
    let customTerms = body.terms;
    const model = body.model;
    const articleId = body.article_id;

    // Article-driven mode (new-article workflow): detect complex terms in the
    // article, dedupe against the whole glossary, then fall through to the
    // standard generation path with those terms. No-ops when no complex terms.
    if (articleId) {
      const article = await base44.asServiceRole.entities.Article.get(String(articleId));
      if (!article) return Response.json({ error: 'Article not found' }, { status: 404 });
      const text = `${article.title || ''}\n${article.summary || ''}\n${article.body || ''}`.slice(0, 8000);
      const detectRes: any = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a blockchain terminology analyst. Read the article below and identify complex blockchain, cryptocurrency, Web3, cryptography, DeFi, or related technical terms used in a way that would benefit from a dedicated glossary entry. Include only established technical terms, not generic words. Return up to 10 terms, most important first.

Article:
${text}

Return JSON: { "terms": ["Term1", "Term2", ...] }`,
        response_json_schema: { type: "object", properties: { terms: { type: "array", items: { type: "string" } } } }
      });
      const detected: string[] = (detectRes?.terms || []).map((t: any) => String(t).trim()).filter(Boolean);
      if (detected.length === 0) {
        return Response.json({ has_complex_terms: false, created: 0, terms: [] });
      }
      const allGlossary = await base44.asServiceRole.entities.GlossaryTerm.list('-updated_date', 5000);
      const allGlossaryArr: any[] = allGlossary.results || allGlossary || [];
      const allExistingTitles = new Set(allGlossaryArr.map((t: any) => String(t.title).toLowerCase()));
      const articleNewTerms = detected.filter((t: string) => !allExistingTitles.has(t.toLowerCase()));
      if (articleNewTerms.length === 0) {
        return Response.json({ has_complex_terms: true, created: 0, terms: detected, skipped: detected.length });
      }
      customTerms = articleNewTerms;
    }

    // No category → return taxonomy overview
    if (!category && !customTerms) {
      return Response.json({
        categories: Object.keys(TAXONOMY),
        counts: Object.fromEntries(Object.entries(TAXONOMY).map(([k, v]) => [k, v.length])),
        totalTerms: Object.values(TAXONOMY).flat().length,
        usage: 'Call with { category, count, offset } to generate terms, or { terms: [...], category } for custom terms'
      });
    }

    const categoryName = category || 'Blockchain Fundamentals';
    let termsToGenerate: string[];

    if (customTerms && Array.isArray(customTerms)) {
      termsToGenerate = customTerms;
    } else {
      const allTerms = TAXONOMY[category] || [];
      termsToGenerate = allTerms.slice(offset, offset + count);
    }

    if (termsToGenerate.length === 0) {
      return Response.json({ message: 'No terms to generate at this offset', created: 0 });
    }

    // Check which already exist
    const existing = await base44.asServiceRole.entities.GlossaryTerm.filter(
      { subcategory: categoryName },
      '-updated_date',
      500
    );
    const existingArr = existing.results || existing || [];
    const existingTitles = new Set(existingArr.map((t: any) => t.title.toLowerCase()));
    const newTerms = termsToGenerate.filter(t => !existingTitles.has(t.toLowerCase()));

    if (newTerms.length === 0) {
      return Response.json({
        message: 'All terms in this batch already exist',
        created: 0,
        skipped: termsToGenerate.length
      });
    }

    // Generate via LLM
    const prompt = `You are a blockchain expert and educator writing for The Blockchain Library, a premier educational resource for blockchain, Web3, cryptocurrency, and decentralized technology.

Generate detailed, professional glossary entries for the following ${newTerms.length} terms in the "${categoryName}" category:

${newTerms.map((t, i) => `${i + 1}. ${t}`).join('\n')}

For EACH term, provide ALL of the following fields:
- title: The term name (exactly as given)
- definition: A clear, authoritative definition (50-100 words). Be precise and technically accurate.
- simple_explanation: An "Explain Like I'm 12" version using simple, accessible language. Avoid jargon. Use analogies.
- why_it_matters: 2-3 sentences explaining why this concept matters in the blockchain/crypto ecosystem and its real-world impact.
- how_it_works: A clear technical explanation of how it works (3-5 sentences).
- real_world_example: A concrete, specific real-world example (name real projects, protocols, or scenarios where applicable).
- advantages: Array of 2-4 key advantages (short phrases, max ~12 words each).
- limitations: Array of 2-4 key limitations or risks (short phrases, max ~12 words each).
- common_misconceptions: Array of 2-3 common misconceptions about this term (each as a full sentence clarifying the misconception).
- difficulty: One of "beginner", "intermediate", or "advanced".
- related_terms: Array of 5-8 related blockchain/crypto terms (just the term names, no descriptions).
- seo_description: A 150-160 character SEO meta description for the glossary page.

Guidelines:
- Be accurate, neutral, and educational. Do not hype or shill.
- Write for a professional audience but keep explanations accessible.
- Use proper grammar and clear, concise language.
- Each field should be substantive — no placeholder or generic text.

Return a JSON object with a "terms" array containing one entry object per term.`;

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          terms: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                definition: { type: "string" },
                simple_explanation: { type: "string" },
                why_it_matters: { type: "string" },
                how_it_works: { type: "string" },
                real_world_example: { type: "string" },
                advantages: { type: "array", items: { type: "string" } },
                limitations: { type: "array", items: { type: "string" } },
                common_misconceptions: { type: "array", items: { type: "string" } },
                difficulty: { type: "string" },
                related_terms: { type: "array", items: { type: "string" } },
                seo_description: { type: "string" }
              }
            }
          }
        }
      },
      ...(model ? { model } : {})
    });

    const generatedTerms = (llmResponse as any)?.terms || [];

    if (generatedTerms.length === 0) {
      return Response.json({ error: 'LLM returned no terms', raw: llmResponse }, { status: 500 });
    }

    // Find category record
    const cats = await base44.asServiceRole.entities.Category.filter({ name: categoryName });
    const cat = (cats.results || cats || [])[0];

    // Build entries
    const entries = generatedTerms.map((t: any) => ({
      title: t.title,
      slug: slugify(t.title),
      definition: t.definition,
      simple_explanation: t.simple_explanation,
      why_it_matters: t.why_it_matters,
      how_it_works: t.how_it_works,
      real_world_example: t.real_world_example,
      advantages: t.advantages || [],
      limitations: t.limitations || [],
      common_misconceptions: t.common_misconceptions || [],
      subcategory: categoryName,
      category_id: cat?.id || null,
      difficulty: ['beginner', 'intermediate', 'advanced'].includes(t.difficulty) ? t.difficulty : 'intermediate',
      related_terms: t.related_terms || [],
      seo_description: t.seo_description,
      seo_title: `${t.title} — Definition & Explanation | The Blockchain Library`
    }));

    const created = await base44.asServiceRole.entities.GlossaryTerm.bulkCreate(entries);

    return Response.json({
      created: entries.length,
      category: categoryName,
      terms: entries.map(e => e.title),
      remaining: (TAXONOMY[category]?.length || 0) - (offset + count),
      totalInCategory: TAXONOMY[category]?.length || 0
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});