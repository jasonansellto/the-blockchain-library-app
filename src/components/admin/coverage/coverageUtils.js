// Shared coverage utility functions for the admin UI

export function getCoverageLevel(score) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'strong';
  if (score >= 60) return 'needsImprovement';
  if (score >= 40) return 'weak';
  return 'sparse';
}

export function getCoverageLevelLabel(level) {
  return {
    excellent: 'Excellent', strong: 'Strong', needsImprovement: 'Needs Improvement',
    weak: 'Weak', sparse: 'Sparse',
  }[level] || level;
}

export function getCoverageLevelColor(level) {
  return {
    excellent: 'text-emerald-600 bg-emerald-50',
    strong: 'text-blue-600 bg-blue-50',
    needsImprovement: 'text-amber-600 bg-amber-50',
    weak: 'text-orange-600 bg-orange-50',
    sparse: 'text-red-600 bg-red-50',
  }[level] || 'text-slate-600 bg-slate-50';
}

export function getPriorityLabel(score) {
  if (score >= 80) return 'critical';
  if (score >= 65) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

export function getPriorityColor(priority) {
  return {
    critical: 'text-red-600 bg-red-50',
    high: 'text-orange-600 bg-orange-50',
    medium: 'text-amber-600 bg-amber-50',
    low: 'text-blue-600 bg-blue-50',
  }[priority] || 'text-slate-600 bg-slate-50';
}