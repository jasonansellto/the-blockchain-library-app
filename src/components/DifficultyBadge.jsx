import React from 'react';

const styles = {
  beginner: 'bg-teal-50 text-teal-700 ring-teal-600/20',
  intermediate: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  advanced: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  expert: 'bg-rose-50 text-rose-700 ring-rose-600/20',
};

export default function DifficultyBadge({ level, className = '' }) {
  const cls = styles[level] || styles.beginner;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset capitalize ${cls} ${className}`}>
      {level}
    </span>
  );
}