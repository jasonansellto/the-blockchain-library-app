import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { CONTENT_TYPES, fetchAll, fetchAllTypes, buildRelationships, getLastUpdated, buildManifest } from '../../shared/exportLogic.ts';

// Admin-only content export endpoint. Returns full JSON for a single content type,
// the relationship graph, or the manifest. Read-only — never mutates content.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin' && user.role !== 'editor') return Response.json({ error: 'Forbidden' }, { status: 403 });

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