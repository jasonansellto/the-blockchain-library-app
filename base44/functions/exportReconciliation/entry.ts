import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { CONTENT_TYPES, fetchAllTypes, buildRelationships, reconcile, computeQualityScore } from '../../shared/exportLogic.ts';

// Admin-only reconciliation endpoint. Compares all content against Knowledge Engine
// requirements and returns per-type metrics, mapping suggestions, and quality scores.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin' && user.role !== 'editor') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const allData = await fetchAllTypes(base44);
    const relationships = buildRelationships(allData);
    const reconciliation = reconcile(allData, relationships);

    const mapping = CONTENT_TYPES.map(ct => ({
      sourceType: ct.key,
      sourceLabel: ct.label,
      targetObject: ct.keObject,
      recordCount: (allData[ct.key] || []).length,
    }));

    const qualityScores = {};
    for (const ct of CONTENT_TYPES) {
      const records = allData[ct.key] || [];
      qualityScores[ct.key] = records.map(r => ({
        id: r.id,
        slug: r.slug,
        title: r.title || r.name || r.network || r.term,
        score: computeQualityScore(r, ct.key),
      }));
    }

    return Response.json({ reconciliation, mapping, qualityScores, relationshipCount: relationships.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
