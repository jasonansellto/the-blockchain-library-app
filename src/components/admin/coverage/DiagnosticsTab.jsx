import React, { useState, useMemo } from 'react';
import { Activity, AlertTriangle, CheckCircle2, XCircle, Search, ChevronDown, ChevronUp, Download } from 'lucide-react';

const HEALTH_ICONS = { healthy: CheckCircle2, warning: AlertTriangle, failed: XCircle };
const HEALTH_COLORS = {
  healthy: 'text-emerald-600 bg-emerald-50',
  warning: 'text-amber-600 bg-amber-50',
  failed: 'text-red-600 bg-red-50',
};

export default function DiagnosticsTab({ coverage, onExportDiagnostics }) {
  const [inspectorUid, setInspectorUid] = useState('');
  const [showWarnings, setShowWarnings] = useState(false);

  const d = coverage.diagnostics || {};
  const health = coverage.health || {};
  const anomalies = coverage.anomalies || [];

  // Find object for relationship inspector
  const inspectorObj = useMemo(() => {
    if (!inspectorUid || !coverage.objects) return null;
    return coverage.objects.find((o) => o.canonicalUid === inspectorUid || o.title.toLowerCase() === inspectorUid.toLowerCase()) || null;
  }, [inspectorUid, coverage.objects]);

  const summaryItems = [
    { label: 'Canonical Objects', value: d.totalObjects || coverage.summary?.totalCanonicalObjects },
    { label: 'Coverage-Eligible Objects', value: d.coverageEligibleObjects || coverage.summary?.totalObjects },
    { label: 'Resolved Categories', value: d.resolvedCategories },
    { label: 'Unresolved Categories', value: d.unresolvedCategories },
    { label: 'Resolved Relationships', value: d.resolvedRelationships },
    { label: 'Unresolved Relationships', value: d.unresolvedRelationships },
    { label: 'Resolved References', value: d.resolvedReferences },
    { label: 'Objects With No Relationships', value: d.objectsWithNoRelationships },
    { label: 'Objects With No Category', value: d.objectsWithNoCategory },
    { label: 'Objects With No References', value: d.objectsWithNoReferences },
  ];

  const resourceCounts = d.resourceResolutionCounts || {};

  const healthChecks = [
    { key: 'categoryResolution', label: 'Category Resolution' },
    { key: 'relationshipResolution', label: 'Relationship Resolution' },
    { key: 'referenceResolution', label: 'Reference Resolution' },
    { key: 'resourceMapping', label: 'Resource Mapping' },
    { key: 'priorityCalculation', label: 'Priority Calculation' },
    { key: 'pageRankHealth', label: 'PageRank Health' },
    { key: 'coveragePopulation', label: 'Coverage Population' },
  ];

  const prDiag = d.pageRankDiagnostics || {};

  return (
    <div className="space-y-6">
      {/* Version Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Coverage Engine Version</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><p className="text-xs text-slate-400">Engine Version</p><p className="font-semibold text-slate-900">v{coverage.coverageEngineVersion}</p></div>
          <div><p className="text-xs text-slate-400">Scoring Schema</p><p className="font-semibold text-slate-900">v{coverage.scoringSchemaVersion}</p></div>
          <div><p className="text-xs text-slate-400">Resolution Version</p><p className="font-semibold text-slate-900">v{coverage.resolutionVersion}</p></div>
        </div>
        {coverage.baselineReset && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700"><strong>Scoring Baseline Reset.</strong> {coverage.baselineResetReason}</p>
          </div>
        )}
      </div>

      {/* Health Checks */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Health Checks</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {healthChecks.map((h) => {
            const status = health[h.key] || 'healthy';
            const Icon = HEALTH_ICONS[status];
            return (
              <div key={h.key} className={`p-3 rounded-lg ${HEALTH_COLORS[status]}`}>
                <Icon className="w-5 h-5 mb-1" />
                <p className="text-xs font-semibold capitalize">{status}</p>
                <p className="text-xs text-slate-600 mt-0.5">{h.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Anomaly Detection */}
      {anomalies.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Coverage Mapping Warnings</h3>
          <div className="space-y-2">
            {anomalies.map((a, i) => (
              <div key={i} className={`p-3 rounded-lg flex items-start gap-2 ${a.severity === 'failed' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
                <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${a.severity === 'failed' ? 'text-red-500' : 'text-amber-500'}`} />
                <div>
                  <p className="text-sm font-medium text-slate-900">{a.type}</p>
                  <p className="text-xs text-slate-600">{a.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Diagnostics Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Resolution Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {summaryItems.map((s) => (
            <div key={s.label} className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className="text-lg font-bold text-slate-900">{(s.value || 0).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Coverage Population */}
      {coverage.coveragePopulation && (() => {
        const pop = coverage.coveragePopulation;
        return (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Coverage Population</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-400">Canonical Objects</p>
                <p className="text-lg font-bold text-slate-900">{pop.totalCanonical.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <p className="text-xs text-slate-400">Coverage Eligible</p>
                <p className="text-lg font-bold text-emerald-700">{pop.totalEligible.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-slate-400">Coverage Evaluated</p>
                <p className="text-lg font-bold text-blue-700">{pop.totalEvaluated.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg">
                <p className="text-xs text-slate-400">Coverage Excluded</p>
                <p className="text-lg font-bold text-amber-700">{pop.totalExcluded.toLocaleString()}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-400 uppercase">
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 px-4 text-right">Canonical</th>
                    <th className="py-2 px-4 text-right">Eligible</th>
                    <th className="py-2 px-4 text-right">Evaluated</th>
                    <th className="py-2 px-4 text-right">Excluded</th>
                    <th className="py-2 pl-4">Exclusion Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {pop.types.map((t) => (
                    <tr key={t.type} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-mono text-slate-700">{t.type}</td>
                      <td className="py-2 px-4 text-right text-slate-900">{t.canonicalCount.toLocaleString()}</td>
                      <td className="py-2 px-4 text-right text-emerald-600">{t.eligibleCount.toLocaleString()}</td>
                      <td className="py-2 px-4 text-right text-blue-600">{t.evaluatedCount.toLocaleString()}</td>
                      <td className="py-2 px-4 text-right text-amber-600">{t.excludedCount.toLocaleString()}</td>
                      <td className="py-2 pl-4 text-xs text-slate-500">{t.exclusionReason || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Priority Diagnostics */}
      {coverage.priorityDiagnostics && (() => {
        const pd = coverage.priorityDiagnostics;
        return (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Priority Score Diagnostics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-4">
              <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-400">Objects Evaluated</p><p className="text-lg font-bold text-slate-900">{pd.objectsEvaluated.toLocaleString()}</p></div>
              <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-400">Priority &gt; 0</p><p className="text-lg font-bold text-slate-900">{pd.objectsWithPriorityGreaterThanZero.toLocaleString()}</p></div>
              <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-400">Average</p><p className="text-lg font-bold text-slate-900">{pd.averagePriority}</p></div>
              <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-400">Median</p><p className="text-lg font-bold text-slate-900">{pd.medianPriority}</p></div>
              <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-400">Maximum</p><p className="text-lg font-bold text-slate-900">{pd.maximumPriority}</p></div>
              <div className="p-3 bg-orange-50 rounded-lg"><p className="text-xs text-slate-400">Priority ≥ 75</p><p className="text-lg font-bold text-orange-600">{pd.priorityGte75.toLocaleString()}</p></div>
              <div className="p-3 bg-amber-50 rounded-lg"><p className="text-xs text-slate-400">Priority ≥ 50</p><p className="text-lg font-bold text-amber-600">{pd.priorityGte50.toLocaleString()}</p></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg"><p className="text-xs text-slate-400">Priority ≥ 25</p><p className="text-lg font-bold text-blue-600">{pd.priorityGte25.toLocaleString()}</p></div>
            </div>

            {pd.top20.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Top 20 Priority Objects — Component Contributions</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-400 uppercase">
                        <th className="py-2 pr-3">#</th>
                        <th className="py-2 px-3">Title</th>
                        <th className="py-2 px-3">Type</th>
                        <th className="py-2 px-3 text-right">Priority</th>
                        <th className="py-2 px-3 text-right">Coverage</th>
                        <th className="py-2 px-3 text-right" title="Coverage Gap">Cov Gap</th>
                        <th className="py-2 px-3 text-right" title="Graph Centrality">Centrality</th>
                        <th className="py-2 px-3 text-right" title="Required Resource Gaps">Req Gaps</th>
                        <th className="py-2 px-3 text-right" title="Recommended Resource Gaps">Rec Gaps</th>
                        <th className="py-2 px-3 text-right" title="Relationship Problems">Rel Prob</th>
                        <th className="py-2 px-3 text-right" title="Missing Concept References">Miss Refs</th>
                        <th className="py-2 px-3 text-right" title="Editorial Relevance">Editorial</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pd.top20.map((o, i) => {
                        const c = o.components || {};
                        return (
                          <tr key={o.canonicalUid} className="border-b border-slate-100">
                            <td className="py-2 pr-3 text-slate-400">{i + 1}</td>
                            <td className="py-2 px-3 font-medium text-slate-900 max-w-[160px] truncate" title={o.title}>{o.title}</td>
                            <td className="py-2 px-3 text-slate-500">{o.type}</td>
                            <td className="py-2 px-3 text-right font-bold text-orange-600">{o.priorityScore}</td>
                            <td className="py-2 px-3 text-right text-slate-600">{o.coverageScore}</td>
                            <td className="py-2 px-3 text-right text-slate-600">{c.coverageGap ?? '—'}</td>
                            <td className="py-2 px-3 text-right text-slate-600">{c.graphCentrality ?? '—'}</td>
                            <td className="py-2 px-3 text-right text-slate-600">{c.requiredResourceGaps ?? '—'}</td>
                            <td className="py-2 px-3 text-right text-slate-600">{c.recommendedResourceGaps ?? '—'}</td>
                            <td className="py-2 px-3 text-right text-slate-600">{c.relationshipProblems ?? '—'}</td>
                            <td className="py-2 px-3 text-right text-slate-600">{c.missingConceptReferences ?? '—'}</td>
                            <td className="py-2 px-3 text-right text-slate-600">{c.editorialRelevance ?? '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Resource Resolution Counts */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Resource Resolution Counts</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries({
            'Objects with Research': resourceCounts.objectsWithResearch,
            'Objects with Books': resourceCounts.objectsWithBooks,
            'Objects with Learning Paths': resourceCounts.objectsWithLearningPaths,
            'Objects with Code Examples': resourceCounts.objectsWithCodeExamples,
            'Objects with Developer Resources': resourceCounts.objectsWithDeveloperResources,
            'Objects with References': resourceCounts.objectsWithReferences,
          }).map(([label, value]) => (
            <div key={label} className="p-3 bg-blue-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{(value || 0).toLocaleString()}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PageRank Diagnostics */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">PageRank Diagnostics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-400">Node Count</p><p className="text-lg font-bold text-slate-900">{prDiag.nodeCount?.toLocaleString()}</p></div>
          <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-400">Edge Count</p><p className="text-lg font-bold text-slate-900">{prDiag.edgeCount?.toLocaleString()}</p></div>
          <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-400">Non-zero PR</p><p className="text-lg font-bold text-slate-900">{prDiag.nodesWithNonZeroPageRank?.toLocaleString()}</p></div>
          <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-400">Min PR</p><p className="text-lg font-bold text-slate-900">{prDiag.minPageRank?.toFixed(2)}</p></div>
          <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-400">Max PR</p><p className="text-lg font-bold text-slate-900">{prDiag.maxPageRank?.toFixed(2)}</p></div>
          <div className="p-3 bg-slate-50 rounded-lg"><p className="text-xs text-slate-400">Median PR</p><p className="text-lg font-bold text-slate-900">{prDiag.medianPageRank?.toFixed(2)}</p></div>
        </div>
        {prDiag.failed && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700"><strong>PageRank computation failed.</strong> Fell back to degree centrality.</p>
          </div>
        )}
      </div>

      {/* Mapping Warnings */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <button onClick={() => setShowWarnings(!showWarnings)} className="flex items-center justify-between w-full">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Mapping Warnings ({Object.keys(d.mappingWarningCounts || {}).length} types, {Object.values(d.mappingWarningCounts || {}).reduce((a, b) => a + b, 0)} total)</h3>
          {showWarnings ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        {showWarnings && (
          <div className="mt-4 space-y-2">
            {Object.entries(d.mappingWarningCounts || {}).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                <code className="text-xs font-mono text-slate-700">{type}</code>
                <span className="text-sm font-semibold text-slate-900">{count}</span>
              </div>
            ))}
            {Object.keys(d.mappingWarningCounts || {}).length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No mapping warnings detected.</p>
            )}
          </div>
        )}
      </div>

      {/* Relationship Inspector */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Relationship Inspector</h3>
        <div className="relative max-w-md mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={inspectorUid} onChange={(e) => setInspectorUid(e.target.value)}
            placeholder="Enter canonical UID or title (e.g. glossary:hd-wallet)…"
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {inspectorUid && !inspectorObj && (
          <p className="text-sm text-slate-400">No coverage-eligible object found for "{inspectorUid}".</p>
        )}
        {inspectorObj && (
          <div className="space-y-4">
            {/* Object Diagnostics */}
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-3">{inspectorObj.title}</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div><p className="text-xs text-slate-400">Canonical UID</p><code className="text-xs font-mono text-slate-700 break-all">{inspectorObj.canonicalUid}</code></div>
                <div><p className="text-xs text-slate-400">Source Type</p><p className="font-medium text-slate-700">{inspectorObj.diagnostics.sourceType}</p></div>
                <div><p className="text-xs text-slate-400">Category Resolution</p><p className="font-medium text-slate-700">{inspectorObj.category.name}</p><p className="text-xs text-slate-400">Source: {inspectorObj.category.source}</p></div>
                <div><p className="text-xs text-slate-400">Unique Relationships</p><p className="font-medium text-slate-700">{inspectorObj.diagnostics.uniqueRelationships}</p></div>
                <div><p className="text-xs text-slate-400">Inbound</p><p className="font-medium text-slate-700">{inspectorObj.diagnostics.inboundRelationships}</p></div>
                <div><p className="text-xs text-slate-400">Outbound</p><p className="font-medium text-slate-700">{inspectorObj.diagnostics.outboundRelationships}</p></div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Resolved Resources</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  {Object.entries(inspectorObj.resolvedResources).filter(([k]) => k !== 'total').map(([k, v]) => (
                    <span key={k} className={`px-2 py-0.5 rounded ${v > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{k}: {v}</span>
                  ))}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Coverage Calculation</p>
                <p className="text-xs text-slate-600">Requirement Fulfillment: {inspectorObj.diagnostics.coverageCalculation.requirementFulfillment} · Dimension Average: {inspectorObj.diagnostics.coverageCalculation.dimensionAverage} → <strong>Final: {inspectorObj.diagnostics.coverageCalculation.final}</strong></p>
              </div>
              <div className="mt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Priority Calculation</p>
                <p className="text-xs text-slate-600">Coverage Gap: {inspectorObj.diagnostics.priorityCalculation.coverageGap} · Centrality: {inspectorObj.diagnostics.priorityCalculation.centrality} · Resource Gap: {inspectorObj.diagnostics.priorityCalculation.resourceGap} → <strong>Final Priority: {inspectorObj.diagnostics.priorityCalculation.final}</strong></p>
              </div>
              <div className="mt-2 p-2 bg-blue-50 rounded">
                <p className="text-xs text-blue-700"><strong>Why this score:</strong> {inspectorObj.whyThisScore}</p>
              </div>
            </div>

            {/* References */}
            {inspectorObj.references?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Detected References</p>
                <div className="space-y-1">
                  {inspectorObj.references.map((ref, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded text-xs">
                      <code className="font-mono text-slate-700 truncate flex-1">{ref.value}</code>
                      <span className="text-slate-500">{ref.type}</span>
                      <span className="text-slate-400">{ref.source}</span>
                      <span className="text-emerald-600 font-medium">{ref.counts ? '✓' : '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export Diagnostics */}
      <div className="flex justify-end">
        <button onClick={onExportDiagnostics} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg">
          <Download className="w-4 h-4" /> Export Diagnostics JSON
        </button>
      </div>
    </div>
  );
}