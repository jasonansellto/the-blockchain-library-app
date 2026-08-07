import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Compass, Search as SearchIcon, Share2, Code, FlaskConical, Loader2, AlertCircle } from 'lucide-react';
import Seo from '@/components/Seo';
import { buildBreadcrumbSchema } from '@/lib/seoSchemas';
import {
  fetchManifest, loadSearchIndex, loadRelated,
  getTypeMeta, parseExploreUrl, getObjectByUid,
  trackExplorerEvent, GITHUB_REPO_URL,
} from '@/lib/knowledgeEngine';
import DiscoverMode from '@/components/explore/DiscoverMode';
import SearchMode from '@/components/explore/SearchMode';
import GraphMode from '@/components/explore/GraphMode';
import ObjectDrawer from '@/components/explore/ObjectDrawer';
import ReleaseStatus from '@/components/explore/ReleaseStatus';

export default function Explore() {
  const { urlType, slug: urlSlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [manifest, setManifest] = useState(null);
  const [searchIndex, setSearchIndex] = useState(null);
  const [related, setRelated] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingCache, setUsingCache] = useState(false);
  const [selectedUid, setSelectedUid] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [researchMode, setResearchMode] = useState(false);
  const [coverageHealth, setCoverageHealth] = useState('healthy');

  const mode = searchParams.get('mode') || 'discover';
  const query = searchParams.get('q') || '';
  const filterType = searchParams.get('type') || '';
  const filterCategory = searchParams.get('category') || '';
  const graphConcept = searchParams.get('concept') || '';

  useEffect(() => {
    (async () => {
      try {
        const m = await fetchManifest();
        setManifest(m);
        localStorage.setItem('tbl-knowledge-buildid', m.buildId);
        const [si, rel] = await Promise.all([loadSearchIndex(m.buildId), loadRelated(m.buildId)]);
        setSearchIndex(si);
        setRelated(rel);
      } catch (e) {
        const lastBuildId = localStorage.getItem('tbl-knowledge-buildid');
        if (lastBuildId) {
          try {
            const [si, rel] = await Promise.all([loadSearchIndex(lastBuildId), loadRelated(lastBuildId)]);
            setSearchIndex(si);
            setRelated(rel);
            setUsingCache(true);
          } catch (e2) {}
        }
      }
      setLoading(false);
      try {
        const res = await base44.entities.Category.list('-updated_date', 100);
        setCategories(res.results || res || []);
      } catch (e) {}
      // Fetch coverage health for badge gating
      try {
        const covRes = await base44.functions.invoke('calculateCoverage', {});
        const cov = covRes.data?.coverage || covRes.coverage;
        if (cov?.health) {
          const failedCount = Object.values(cov.health).filter((s) => s === 'failed').length;
          setCoverageHealth(failedCount > 0 ? 'failed' : 'healthy');
        }
      } catch (e) {}
    })();
  }, []);

  useEffect(() => { trackExplorerEvent('explorer_opened', { mode }); }, [mode]);

  useEffect(() => {
    if (urlType && urlSlug && searchIndex) {
      const parsed = parseExploreUrl(urlType, urlSlug);
      if (parsed) {
        setSelectedUid(parsed.uid);
        setDrawerOpen(true);
        trackExplorerEvent('explorer_object_opened', { uid: parsed.uid, type: parsed.type });
      }
    }
  }, [urlType, urlSlug, searchIndex]);

  const setMode = useCallback((newMode) => {
    const params = new URLSearchParams(searchParams);
    if (newMode === 'discover') params.delete('mode');
    else params.set('mode', newMode);
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleObjectClick = useCallback((uid) => {
    const obj = getObjectByUid(searchIndex, uid);
    if (!obj) return;
    setSelectedUid(uid);
    setDrawerOpen(true);
    trackExplorerEvent('explorer_object_opened', { uid, type: obj.type });
  }, [searchIndex]);

  const handleDrawerClose = useCallback(() => {
    setDrawerOpen(false);
    if (urlType && urlSlug) navigate('/explore');
  }, [urlType, urlSlug, navigate]);

  const handleExploreConnections = useCallback((uid) => {
    const params = new URLSearchParams(searchParams);
    params.set('mode', 'graph');
    params.set('concept', uid);
    setSearchParams(params, { replace: true });
    setDrawerOpen(false);
  }, [searchParams, setSearchParams]);

  const handleTypeFilter = useCallback((type) => {
    const params = new URLSearchParams(searchParams);
    params.set('mode', 'search');
    if (type) params.set('type', type); else params.delete('type');
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleCategoryFilter = useCallback((categoryId) => {
    const params = new URLSearchParams(searchParams);
    params.set('mode', 'search');
    params.set('category', categoryId);
    setSearchParams(params, { replace: true });
  }, [searchParams, setSearchParams]);

  const selectedObject = selectedUid ? getObjectByUid(searchIndex, selectedUid) : null;

  const seoTitle = selectedObject ? selectedObject.title : 'Blockchain Knowledge Explorer';
  const seoDesc = selectedObject
    ? (selectedObject.summary || `Explore ${selectedObject.title} in the Blockchain Knowledge Explorer.`)
    : 'Explore thousands of connected blockchain concepts, definitions, books, research papers, developer resources, learning paths and technical resources through The Blockchain Library Knowledge Graph.';
  const seoRobots = selectedObject ? 'noindex, follow' : 'index, follow';

  const schemas = selectedObject
    ? [buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Explore', url: '/explore' },
        { name: getTypeMeta(selectedObject.type).label },
        { name: selectedObject.title },
      ])]
    : [buildBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Explore', url: '/explore' },
      ])];

  return (
    <div className="min-h-full bg-slate-50">
      <Seo title={seoTitle} description={seoDesc} robots={seoRobots} schemas={schemas} />

      <div className="border-b border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container-tbl py-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Explore Blockchain Knowledge</h1>
          <p className="text-slate-300 max-w-2xl text-base sm:text-lg leading-relaxed">
            Discover how blockchain concepts connect across technology, cryptography, wallets, infrastructure, Web3, DeFi, artificial intelligence, enterprise systems, research and development.
          </p>
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <div className="inline-flex items-center gap-1 p-1 bg-white/10 rounded-lg">
              {[
                { id: 'discover', label: 'Discover', icon: Compass },
                { id: 'search', label: 'Search', icon: SearchIcon },
                { id: 'graph', label: 'Graph', icon: Share2 },
              ].map(t => (
                <button key={t.id} onClick={() => setMode(t.id)} aria-label={`${t.label} mode`}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === t.id ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'}`}>
                  <t.icon className="w-4 h-4" /> {t.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setDevMode(!devMode)} aria-pressed={devMode}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors ${devMode ? 'bg-cyan-500 text-white' : 'bg-white/10 text-slate-300 hover:text-white'}`}>
                <Code className="w-3.5 h-3.5" /> Developer
              </button>
              <button onClick={() => setResearchMode(!researchMode)} aria-pressed={researchMode}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors ${researchMode ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-300 hover:text-white'}`}>
                <FlaskConical className="w-3.5 h-3.5" /> Research
              </button>
            </div>
          </div>
        </div>
      </div>

      {usingCache && !loading && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="container-tbl py-2.5 flex items-center gap-2 text-sm text-amber-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Knowledge Explorer is temporarily using the last synchronized knowledge release.
          </div>
        </div>
      )}

      <div className="container-tbl py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-slate-500">Loading Knowledge Engine…</p>
          </div>
        ) : !searchIndex ? (
          <div className="text-center py-32">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-2">Unable to load the Knowledge Engine.</p>
            <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">View on GitHub →</a>
          </div>
        ) : (
          <>
            {mode === 'discover' && (
              <DiscoverMode manifest={manifest} searchIndex={searchIndex} related={related}
                categories={categories} onObjectClick={handleObjectClick}
                onTypeFilter={handleTypeFilter} onCategoryFilter={handleCategoryFilter}
                devMode={devMode} researchMode={researchMode} />
            )}
            {mode === 'search' && (
              <SearchMode searchIndex={searchIndex} related={related} categories={categories}
                query={query} filterType={filterType} filterCategory={filterCategory}
                searchParams={searchParams} setSearchParams={setSearchParams}
                onObjectClick={handleObjectClick} devMode={devMode} researchMode={researchMode} />
            )}
            {mode === 'graph' && (
              <GraphMode searchIndex={searchIndex} related={related} concept={graphConcept}
                searchParams={searchParams} setSearchParams={setSearchParams}
                onObjectClick={handleObjectClick} />
            )}
          </>
        )}
      </div>

      {drawerOpen && selectedObject && (
        <ObjectDrawer object={selectedObject} related={related} categories={categories}
          onClose={handleDrawerClose} onExploreConnections={handleExploreConnections}
          onObjectClick={handleObjectClick} coverageHealth={coverageHealth} />
      )}

      {!loading && manifest && <ReleaseStatus manifest={manifest} />}
    </div>
  );
}