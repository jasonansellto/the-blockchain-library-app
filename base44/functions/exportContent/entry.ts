import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { CONTENT_TYPES, fetchAll, fetchAllTypes, buildRelationships, getLastUpdated, buildManifest } from '../../shared/exportLogic.ts';

// Content export endpoint. Returns full JSON for a single content type,
// the relationship graph, or the manifest. Read-only — never mutates content.
//
// Access: a signed-in admin/editor (Admin Export page), OR the GitHub sync
// workflow presenting the KNOWLEDGE_SYNC_TOKEN secret in the
// `x-knowledge-sync-token` header (scheduled Base44 → GitHub knowledge release).
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const syncToken = Deno.env.get('KNOWLEDGE_SYNC_TOKEN');
    const presented = req.headers.get('x-knowledge-sync-token');
    const viaSyncToken = Boolean(syncToken && syncToken.length >= 32 && presented && timingSafeEqual(presented, syncToken));
    if (!viaSyncToken) {
      const user = await base44.auth.me().catch(() => null);
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      if (user.role !== 'admin' && user.role !== 'editor') return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { type, metaOnly } = body;

    if (type === 'relationships') {
      const allData = await fetchAllTypes(base44);
      const relationships = buildRelationships(allData);
      return Response.json({ type, count: relationships.length, lastUpdated: null, records: relationships });
    }

    if (type === 'manifest') {
      const allData = await fetchAllTypes(base44);
      const relationships = buildRelationships(allData);
      return Response.json({ type, records: buildManifest(allData, relationships) });
    }

    const ct = CONTENT_TYPES.find(c => c.key === type);
    if (!ct) return Response.json({ error: 'Unknown type: ' + type }, { status: 400 });

    const records = await fetchAll(base44, ct.entity);
    const lastUpdated = getLastUpdated(records);

    if (metaOnly) {
      return Response.json({ type, count: records.length, lastUpdated });
    }
    return Response.json({ type, count: records.length, lastUpdated, records });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
