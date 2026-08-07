import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { X, ExternalLink, Share2, Copy, FileText, BookOpen, GraduationCap, Code, BookMarked, Map, Server } from 'lucide-react';
import { getTypeMeta, groupRelatedByType, calculateQualityScore, getRelationshipCount, buildExploreUrl, getDocsUrl, trackExplorerEvent, calculateSimpleCoverage, getRelatedObjects } from '@/lib/knowledgeEngine';
import CoverageBadge from './CoverageBadge';

export default function ObjectDrawer({ object, related, categories, onClose, onExploreConnections, onObjectClick, coverageHealth = 'healthy' }) {
  const meta = getTypeMeta(object.type);
  const categoryName = categories.find(c => c.id === object.categoryId)?.name;
  const relCount = getRelationshipCount(related, object.id);
  const quality = calculateQualityScore(object, relCount);
  const coverageInfo = calculateSimpleCoverage(object, getRelatedObjects(related, object.id));
  const grouped = useMemo(() => groupRelatedByType(related, object.id), [related, object.id]);
  const hasResearch = (grouped['research'] || []).length > 0;
  const hasTutorial = (grouped['learning-path'] || []).length > 0;
  const hasCodeExample = (grouped['code-snippet'] || []).length > 0;

  const slug = object.id.split(':').slice(1).join(':');
  const exploreUrl = buildExploreUrl(object.type, slug);
  const docsUrl = getDocsUrl(object.type, slug);

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}${exploreUrl}`);
    trackExplorerEvent('explorer_link_copied', { uid: object.id });
  };

  const share = () => {
    navigator.share?.({ title: object.title, url: `${window.location.origin}${exploreUrl}` }).catch(() => {});
  };

  const renderGroup = (items, label, Icon) => {
    if (!items?.length) return null;
    return (
      <div className="mb-4">
        <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
          <Icon className="w-3.5 h-3.5" /> {label}
        </h4>
        <div className="space-y-1">
          {items.map(r => (
            <button key={r.uid} onClick={() => onObjectClick(r.uid)}
              className="block w-full text-left p-2 rounded-lg hover:bg-slate-50 transition-colors">
              <p className="text-sm font-medium text-slate-900 hover:text-blue-600">{r.title}</p>
              <p className="text-xs text-slate-400">{getTypeMeta(r.type).label}</p>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: meta.color }}>{meta.label}</span>
            {categoryName && <span className="text-xs text-slate-400">{categoryName}</span>}
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">{object.title}</h2>
          {object.summary && <p className="text-slate-600 leading-relaxed mb-4">{object.summary}</p>}

          <div className="grid grid-cols-2 gap-3 mb-4 p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="text-xs text-slate-400 uppercase mb-0.5">Knowledge ID</p>
              <code className="text-xs font-mono text-slate-700 break-all">{object.id}</code>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase mb-0.5">Relationships</p>
              <p className="text-sm font-semibold text-slate-700">{relCount}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase mb-0.5">Knowledge Quality</p>
              <div className="flex items-center gap-1.5">
                <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${quality}%` }} />
                </div>
                <span className="text-xs font-semibold text-slate-700">{quality}/100</span>
              </div>
            </div>
            {object.tags?.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 uppercase mb-0.5">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {object.tags.slice(0, 4).map(t => <span key={t} className="text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">{t}</span>)}
                </div>
              </div>
            )}
            {coverageInfo && (
              <div>
                <p className="text-xs text-slate-400 uppercase mb-0.5">Knowledge Coverage</p>
                <CoverageBadge score={coverageInfo.score} showLabel health={coverageHealth} />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {object.canonicalUrl && (
              <Link to={object.canonicalUrl} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
                <ExternalLink className="w-4 h-4" /> Open Full Resource
              </Link>
            )}
            <button onClick={() => onExploreConnections(object.id)} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
              <Share2 className="w-4 h-4" /> Explore Connections
            </button>
            <button onClick={copyLink} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
              <Copy className="w-4 h-4" /> Copy Link
            </button>
            <button onClick={share} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <a href={docsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
              <FileText className="w-4 h-4" /> Documentation
            </a>
          </div>

          {relCount > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Related Knowledge</h3>
              {renderGroup(grouped['glossary'], 'Related Concepts', BookOpen)}
              {renderGroup(grouped['article'], 'Related Topics', FileText)}
              {renderGroup(grouped['learning-path'], 'Learn This Topic', Map)}
              {renderGroup(grouped['book'], 'Related Books', BookMarked)}
              {renderGroup(grouped['research'], 'Related Research', GraduationCap)}
              {renderGroup(grouped['resource'], 'Developer Resources', Code)}
              {renderGroup(grouped['code-snippet'], 'Code Examples', Code)}
              {renderGroup(grouped['rpc'], 'RPC Infrastructure', Server)}
            </div>
          )}

          {coverageInfo && coverageInfo.score < 75 && (!hasResearch || !hasTutorial || !hasCodeExample) && (
            <div className="mb-4 p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg text-white">
              <p className="text-xs text-teal-400 font-semibold uppercase tracking-wide mb-1">Help Us Improve This Topic</p>
              <p className="text-sm text-slate-300 mb-3">
                This topic currently has {[
                  !hasResearch && 'limited research coverage',
                  !hasTutorial && 'no tutorials',
                  !hasCodeExample && 'no code examples',
                ].filter(Boolean).join(', ')}.
              </p>
              <Link to="/contribute/knowledge-gaps" className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-400 hover:text-cyan-300">
                Contribute / Suggest Resource →
              </Link>
            </div>
          )}

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Knowledge Quality</strong> measures metadata completeness, relationships, references and structured coverage within The Blockchain Library.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}