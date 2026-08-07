import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const MANIFEST_URL = 'https://raw.githubusercontent.com/jasonansellto/the-blockchain-library/main/knowledge-release.json';
const CACHE_KEY = 'knowledge-release-manifest';

// Admin-only: fetches the live GitHub Knowledge Engine manifest, optionally
// stores it in SiteAnalyticsCache, and returns the current release status.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin' && user.role !== 'editor') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { refresh } = body;
    const now = new Date().toISOString();

    // Fetch live manifest from GitHub
    let manifest = null;
    let fetchError = null;
    try {
      const res = await fetch(MANIFEST_URL, { cache: 'no-cache' });
      if (res.ok) manifest = await res.json();
      else fetchError = `GitHub returned ${res.status}`;
    } catch (e) {
      fetchError = e.message;
    }

    // Get existing cached manifest
    const existing = await base44.asServiceRole.entities.SiteAnalyticsCache.filter({ cache_key: CACHE_KEY });
    const existingArr = existing.results || existing || [];
    let cachedEntry = existingArr[0] || null;

    // Store if refreshing and we got a valid manifest
    if (refresh && manifest) {
      if (cachedEntry) {
        await base44.asServiceRole.entities.SiteAnalyticsCache.update(cachedEntry.id, {
          data: { ...manifest, lastSyncedAt: now },
          last_refreshed: now,
        });
      } else {
        await base44.asServiceRole.entities.SiteAnalyticsCache.create({
          cache_key: CACHE_KEY,
          data: { ...manifest, lastSyncedAt: now },
          last_refreshed: now,
        });
      }
      cachedEntry = { ...cachedEntry, data: { ...manifest, lastSyncedAt: now }, last_refreshed: now };
    }

    return Response.json({
      manifest,
      fetchError,
      cached: cachedEntry?.data || null,
      lastSynced: cachedEntry?.last_refreshed || null,
      fetchedAt: now,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}