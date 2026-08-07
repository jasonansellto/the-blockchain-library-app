import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import {
  buildCoverageReport, fetchJSON, KNOWLEDGE_BASE,
  COVERAGE_ENGINE_VERSION, SCORING_SCHEMA_VERSION,
} from '../../shared/coverageLogic.ts';

const GITHUB_RAW = 'https://raw.githubusercontent.com/jasonansellto/the-blockchain-library/main';

// Versioned cache key — invalidates when engine version or schema version changes
function getCacheKey(buildId: string) {
  return `coverage:${buildId}:v${COVERAGE_ENGINE_VERSION}:schema${SCORING_SCHEMA_VERSION}`;
}

// Admin-only: calculates and caches coverage intelligence data from the canonical
// GitHub Knowledge Engine. Read-only — never mutates content.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { recalculate, validate } = body;

    // Auth: recalculate and validate require admin/editor; public reads are allowed
    const user = await base44.auth.me().catch(() => null);
    if (recalculate || validate) {
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      if (user.role !== 'admin' && user.role !== 'editor') return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch manifest first (small) to get buildId for versioned cache key
    const manifest = await fetchJSON(`${GITHUB_RAW}/knowledge-release.json`);
    const cacheKey = getCacheKey(manifest.buildId);

    // Check for cached coverage (unless recalculate or validate)
    if (!recalculate && !validate) {
      const existing = await base44.asServiceRole.entities.SiteAnalyticsCache.filter({ cache_key: cacheKey });
      const cachedArr = existing.results || existing || [];
      const cachedEntry = cachedArr[0] || null;
      if (cachedEntry?.data) {
        return Response.json({ coverage: cachedEntry.data, cached: true, lastCalculated: cachedEntry.last_refreshed });
      }
      // No cache: if not admin, return minimal response so public pages can gate display
      if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
        return Response.json({
          coverage: { health: { categoryResolution: 'failed', relationshipResolution: 'failed', referenceResolution: 'failed', resourceMapping: 'failed', priorityCalculation: 'warning' }, summary: { globalScore: 0, totalObjects: 0, topCards: {} }, objects: [] },
          cached: false,
          updating: true,
        });
      }
    }

    // Fetch all canonical data from GitHub in parallel
    const [searchIndex, related, graph, catalog, sourceMap] = await Promise.all([
      fetchJSON(`${KNOWLEDGE_BASE}/search-index.json`),
      fetchJSON(`${KNOWLEDGE_BASE}/related.json`),
      fetchJSON(`${KNOWLEDGE_BASE}/graph.json`),
      fetchJSON(`${KNOWLEDGE_BASE}/catalog.json`),
      fetchJSON(`${KNOWLEDGE_BASE}/source-map.json`),
    ]);

    // Fetch quality data (may not exist yet — handle gracefully)
    let missingConcepts = [], reconciliation = {}, duplicateMerges = {};
    try { missingConcepts = await fetchJSON(`${KNOWLEDGE_BASE}/missing-concepts.json`); } catch (e) {}
    try { reconciliation = await fetchJSON(`${KNOWLEDGE_BASE}/reconciliation.json`); } catch (e) {}
    try { duplicateMerges = await fetchJSON(`${KNOWLEDGE_BASE}/duplicate-merges.json`); } catch (e) {}

    // Get previous snapshot for comparison (only if same scoring schema)
    let previousSnapshot = null;
    try {
      const snapshots = await base44.asServiceRole.entities.CoverageSnapshot.list('-created_date', 5);
      const snapArr = snapshots.results || snapshots || [];
      // Find a previous snapshot with the same scoring schema version, different build
      previousSnapshot = snapArr.find((s: any) =>
        s.build_id !== manifest.buildId && s.scoring_schema_version === SCORING_SCHEMA_VERSION
      ) || null;
    } catch (e) {}

    // Calculate coverage with resolution
    const coverage = buildCoverageReport(
      manifest, searchIndex, related, graph, catalog, sourceMap,
      missingConcepts, reconciliation, duplicateMerges, previousSnapshot,
      { validate }
    );

    // Validate mode: return diagnostics without saving
    if (validate) {
      return Response.json({
        coverage,
        cached: false,
        validate: true,
        lastCalculated: new Date().toISOString(),
      });
    }

    // Cache in SiteAnalyticsCache
    const now = new Date().toISOString();
    const existingCache = await base44.asServiceRole.entities.SiteAnalyticsCache.filter({ cache_key: cacheKey });
    const cacheArr = existingCache.results || existingCache || [];
    const cachedEntry = cacheArr[0] || null;

    if (cachedEntry) {
      await base44.asServiceRole.entities.SiteAnalyticsCache.update(cachedEntry.id, {
        data: coverage,
        last_refreshed: now,
      });
    } else {
      await base44.asServiceRole.entities.SiteAnalyticsCache.create({
        cache_key: cacheKey,
        data: coverage,
        last_refreshed: now,
      });
    }

    // Store snapshot with versioning
    try {
      await base44.asServiceRole.entities.CoverageSnapshot.create({
        build_id: manifest.buildId,
        release_version: manifest.releaseVersion,
        global_score: coverage.summary.globalScore,
        total_objects: coverage.summary.totalObjects,
        total_edges: coverage.summary.totalEdges,
        coverage_levels: coverage.summary.coverageLevels,
        dimension_scores: coverage.summary.dimensionScores,
        high_priority_gaps: coverage.summary.topCards.highPriorityGaps,
        missing_concepts_count: coverage.summary.topCards.missingConcepts,
        unresolved_relationships_count: coverage.summary.topCards.unresolvedRelationships,
        research_coverage: coverage.summary.dimensionScores.research,
        learning_coverage: coverage.summary.dimensionScores.learning,
        developer_coverage: coverage.summary.dimensionScores.developer,
        coverage_engine_version: COVERAGE_ENGINE_VERSION,
        scoring_schema_version: SCORING_SCHEMA_VERSION,
        resolution_version: 1,
        baseline_reset: coverage.baselineReset,
        baseline_reset_reason: coverage.baselineResetReason,
      });
    } catch (e) {}

    return Response.json({ coverage, cached: false, lastCalculated: now });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}