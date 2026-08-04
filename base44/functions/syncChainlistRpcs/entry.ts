import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Public RPC directory published by Chainlist (maintained by the DefiLlama team).
// Each entry is a chain with { name, chainId, chainSlug, isTestnet, tvl, rpc: [{ url, tracking }] }.
const CHAINLIST_URL = 'https://chainlist.org/rpcs.json';

// Curated allowlist of major EVM networks to import. Keeps the directory
// focused and useful rather than importing hundreds of obscure chains.
const ALLOWED_CHAINS = [
  'ethereum', 'polygon', 'arbitrum', 'optimism', 'base', 'avalanche',
  'bsc', 'gnosis', 'fantom', 'celo', 'moonbeam', 'moonriver',
  'blast', 'linea', 'zksync-era', 'scroll', 'mantle', 'cronos',
  'fuse', 'boba', 'metis-andromeda', 'nova', 'opbnb',
  'polygon-zkevm', 'arbitrum-nova', 'sepolia', 'goerli'
];

// Well-known public, no-auth providers — prioritized when selecting endpoints.
const PREFERRED_PROVIDERS = [
  'publicnode', 'cloudflare', 'blastapi.io', 'drpc.org', '1rpc.io',
  'blockpi.network', 'unifra.io', 'ankr.com', 'alchemy.com', 'nodies.app',
  'merkle.io', 'gateway.tenderly.co', 'onfinality.io', 'stackup.sh'
];

const MAX_PER_CHAIN = 8;

function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

function providerLabel(host: string): string {
  const h = host.toLowerCase();
  if (h.includes('publicnode')) return 'PublicNode';
  if (h.includes('cloudflare')) return 'Cloudflare';
  if (h.includes('blastapi')) return 'BlastAPI';
  if (h.includes('drpc')) return 'drpc';
  if (h.includes('1rpc')) return '1RPC';
  if (h.includes('blockpi')) return 'BlockPi';
  if (h.includes('unifra')) return 'Unifra';
  if (h.includes('ankr')) return 'Ankr';
  if (h.includes('alchemy')) return 'Alchemy';
  if (h.includes('nodies')) return 'Nodies';
  if (h.includes('merkle')) return 'Merkle';
  if (h.includes('tenderly')) return 'Tenderly';
  if (h.includes('onfinality')) return 'OnFinality';
  if (h.includes('stackup')) return 'StackUp';
  if (h.includes('dwellir')) return 'Dwellir';
  if (h.includes('nodereal')) return 'NodeReal';
  if (h.includes('meowrpc')) return 'MeowRPC';
  if (h.includes('gateway.fm')) return 'Gateway.fm';
  return host;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !['admin', 'editor'].includes(user.role)) {
      return Response.json({ error: 'Admin or editor access required' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const maxPerChain = Math.min(20, Math.max(1, parseInt(body.maxPerChain, 10) || MAX_PER_CHAIN));
    const chainsOnly = Array.isArray(body.chains) ? body.chains : ALLOWED_CHAINS;

    // 1. Fetch the Chainlist feed.
    const resp = await fetch(CHAINLIST_URL, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) {
      return Response.json({ error: `Failed to fetch Chainlist feed (${resp.status})` }, { status: 502 });
    }
    const allChains: any[] = await resp.json();

    // 2. Filter to the allowlist and select the best endpoints per chain.
    const records: any[] = [];
    for (const chain of allChains) {
      if (!chain || !chain.chainSlug || !chain.rpc) continue;
      if (!chainsOnly.includes(chain.chainSlug)) continue;

      const rpcs: any[] = Array.isArray(chain.rpc) ? chain.rpc : [];
      // Only HTTPS endpoints (skip wss://), dedupe by URL.
      const seen = new Set<string>();
      const https = rpcs
        .map((r) => (typeof r === 'string' ? { url: r } : r))
        .filter((r) => r && r.url && r.url.startsWith('https://'))
        .filter((r) => { if (seen.has(r.url)) return false; seen.add(r.url); return true; });

      // Prioritize: preferred providers first, then tracking === 'none'.
      const scored = https.map((r) => {
        const host = hostOf(r.url);
        const preferred = PREFERRED_PROVIDERS.some((p) => host.includes(p));
        const noTrack = r.tracking === 'none';
        return { r, host, score: (preferred ? 2 : 0) + (noTrack ? 1 : 0) };
      }).sort((a, b) => b.score - a.score);

      const selected = scored.slice(0, maxPerChain);
      for (const { r, host } of selected) {
        const slug = `chainlist-${chain.chainSlug}-${slugify(host)}`;
        records.push({
          network: chain.name,
          chain_id: chain.chainId,
          provider: providerLabel(host),
          endpoint_url: r.url,
          auth_required: false,
          slug,
          notes: r.tracking && r.tracking !== 'none' ? `Tracking: ${r.tracking}` : 'Public endpoint via Chainlist',
          is_recommended: PREFERRED_PROVIDERS.some((p) => host.includes(p)),
          category: chain.isTestnet ? 'testnet' : 'mainnet'
        });
      }
    }

    if (!records.length) {
      return Response.json({ message: 'No matching chains/endpoints found', created: 0, skipped: 0 });
    }

    // 3. Upsert — skip endpoint_urls already present, replace prior chainlist- imports.
    const exRes = await base44.asServiceRole.entities.RpcEndpoint.filter({ slug: { $regex: '^chainlist-' } }, '-created_date', 2000);
    const exArr: any[] = exRes.results || exRes || [];
    const existingByUrl = new Set(exArr.map((e: any) => e.endpoint_url));
    const existingSlugs = new Set(exArr.map((e: any) => e.slug));

    // Delete prior chainlist records that are no longer in the fresh feed (stale).
    const freshUrls = new Set(records.map((r) => r.endpoint_url));
    const stale = exArr.filter((e: any) => !freshUrls.has(e.endpoint_url)).map((e: any) => e.id);
    let deleted = 0;
    if (stale.length) {
      // deleteMany in small batches.
      for (let i = 0; i < stale.length; i += 100) {
        const batch = stale.slice(i, i + 100);
        await base44.asServiceRole.entities.RpcEndpoint.deleteMany({ id: { $in: batch } });
      }
      deleted = stale.length;
    }

    const toCreate = records
      .filter((r) => !existingByUrl.has(r.endpoint_url))
      .filter((r) => !existingSlugs.has(r.slug));

    let created = 0;
    if (toCreate.length) {
      for (let i = 0; i < toCreate.length; i += 100) {
        const batch = toCreate.slice(i, i + 100);
        await base44.asServiceRole.entities.RpcEndpoint.bulkCreate(batch);
        created += batch.length;
      }
    }

    return Response.json({
      source: 'chainlist',
      chainsScanned: chainsOnly.length,
      endpointsConsidered: records.length,
      created,
      skipped: records.length - toCreate.length,
      staleRemoved: deleted,
      totalInDirectory: (exArr.length - deleted) + created
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});