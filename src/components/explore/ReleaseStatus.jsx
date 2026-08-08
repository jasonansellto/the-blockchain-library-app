import React from 'react';
import { GitBranch, ExternalLink } from 'lucide-react';
import { GITHUB_REPO_URL } from '@/lib/knowledgeEngine';

export default function ReleaseStatus({ manifest }) {
  if (!manifest) return null;
  const totals = manifest.totals || {};
  // New contract: platformVersion, knowledgeReleaseVersion, compilerVersion, schemaVersion, buildId
  // Backward compat: knowledgeReleaseVersion falls back to deprecated releaseVersion
  const knowledgeRelease = manifest.knowledgeReleaseVersion || manifest.releaseVersion || '—';
  return (
    <div className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="container-tbl py-8">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Knowledge Engine</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-500 uppercase mb-0.5">Platform Version</p>
            <p className="font-mono text-white">{manifest.platformVersion || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase mb-0.5">Knowledge Release</p>
            <p className="font-mono text-white">{knowledgeRelease}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase mb-0.5">Compiler Version</p>
            <p className="font-mono text-white">{manifest.compilerVersion || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase mb-0.5">Build ID</p>
            <p className="font-mono text-white text-xs">{manifest.buildId || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase mb-0.5">Canonical Objects</p>
            <p className="font-semibold text-white">{totals.canonicalObjects?.toLocaleString() || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase mb-0.5">Relationships</p>
            <p className="font-semibold text-white">{totals.edges?.toLocaleString() || '—'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 text-sm">
          <div>
            <p className="text-xs text-slate-500 uppercase mb-0.5">Last Updated</p>
            <p className="text-white text-xs">{manifest.generatedAt ? new Date(manifest.generatedAt).toLocaleDateString() : '—'}</p>
          </div>
          <div>
            <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300">
              GitHub Knowledge Engine <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}