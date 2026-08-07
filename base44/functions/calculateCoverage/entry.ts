import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { buildCoverageReport, fetchJSON, KNOWLEDGE_BASE } from '../../shared/coverageLogic.ts';

const GITHUB_RAW = 'https://raw.githubusercontent.com/jasonansellto/the-blockchain-library/main';
const COVERAGE_CACHE_KEY = 'coverage-intelligence';

// Admin-only: calculates and caches coverage intelligence data from the canonical
// GitHub Knowledge Engine. Read-only — never mutates content.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin' && user.role !== 'editor') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const { recalculate } = body;

    // Check for cached coverage
    const existing = await base44.asServiceRole.entities.SiteAnalyticsCache.filter({ cache_key: COVERAGE_CACHE_KEY });
    const cachedArr = existing.results || existing || [];
    let cachedEntry = cachedArr[0] || null;

    if (!recalculate && cachedEntry?.data) {
      return Response.json({ coverage: cachedEntry.data, cached: true, lastCalculated: cachedEntry.last_refreshed });
    }

    // Fetch manifest
    const manifest = await fetchJSON(`${GITHUB_RAW}/knowledge-release.json`);

    // Fetch canonical data from GitHub
    const [searchIndex, related] = await Promise.all([
      fetchJSON(`${KNOWLEDGE_BASE}/search-index.json`),
      fetchJSON(`${KNOWLEDGE_BASE}/related.json`),
    ]);

    // Fetch quality data (may not exist yet — handle gracefully)
    let missingConcepts = [], reconciliation = {}, duplicateMerges = {};
    try { missingConcepts = await fetchJSON(`${KNOWLEDGE_BASE}/missing-concepts.json`); } catch (e) {}
    try { reconciliation = await fetchJSON(`${KNOWLEDGE_BASE}/reconciliation.json`); } catch (e) {}
    try { duplicateMerges = await fetchJSON(`${KNOWLEDGE_BASE}/duplicate-merges.json`); } catch (e) {}

    // Get previous snapshot for comparison
    let previousSnapshot = null;
    try {
      const snapshots = await base44.asServiceRole.entities.CoverageSnapshot.list('-created_date', 1);
      const snapArr = snapshots.results || snapshots || [];
      if (snapArr.length > 0 && snapArr[0].build_id !== manifest.buildId) {
        previousSnapshot = snapArr[0];
      }
    } catch (e) {}

    // Calculate coverage
    const coverage = buildCoverageReport(manifest, searchIndex, related, missingConcepts, reconciliation, duplicateMerges, previousSnapshot);

    // Cache in SiteAnalyticsCache
    const now = new Date().toISOString();
    if (cachedEntry) {
      await base44.asServiceRole.entities.SiteAnalyticsCache.update(cachedEntry.id, {
        data: coverage,
        last_refreshed: now,
      });
    } else {
      await base44.asServiceRole.entities.SiteAnalyticsCache.create({
        cache_key: COVERAGE_CACHE_KEY,
        data: coverage,
        last_refreshed: now,
      });
    }

    // Store snapshot
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
      });
    } catch (e) {}

    return Response.json({ coverage, cached: false, lastCalculated: now });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}