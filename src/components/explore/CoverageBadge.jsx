import React from 'react';

const LEVEL_COLORS = {
  excellent: 'bg-emerald-100 text-emerald-700',
  strong: 'bg-blue-100 text-blue-700',
  needsImprovement: 'bg-amber-100 text-amber-700',
  weak: 'bg-orange-100 text-orange-700',
  sparse: 'bg-red-100 text-red-700',
};
const LEVEL_LABELS = {
  excellent: 'Excellent', strong: 'Strong', needsImprovement: 'Needs Improvement',
  weak: 'Weak', sparse: 'Sparse',
};

function getLevel(score) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'strong';
  if (score >= 60) return 'needsImprovement';
  if (score >= 40) return 'weak';
  return 'sparse';
}

export default function CoverageBadge({ score, showLabel = false }) {
  if (score == null) return null;
  const level = getLevel(score);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${LEVEL_COLORS[level]}`} title="This score reflects structured coverage within The Blockchain Library, including relationships, references and connected educational resources.">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'currentColor' }} />
      {showLabel ? `${LEVEL_LABELS[level]} · ${score}` : `Coverage ${score}`}
    </span>
  );
}