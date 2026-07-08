import React from 'react';

export default function GeoSummary({ type, title, summary, keyConcepts = [], relatedLinks = [] }) {
  const lines = [];
  lines.push(`# ${title}`);
  lines.push(`Content type: ${type}`);
  if (summary) {
    const clean = summary.replace(/[#*`]/g, '').replace(/\s+/g, ' ').trim();
    if (clean) lines.push(`Summary: ${clean.substring(0, 500)}`);
  }
  if (keyConcepts.length > 0) {
    lines.push(`Key concepts: ${keyConcepts.slice(0, 15).join(', ')}`);
  }
  if (relatedLinks.length > 0) {
    lines.push('Related resources:');
    relatedLinks.slice(0, 10).forEach(r => {
      lines.push(`- ${r.title} (${r.type}): ${window.location.origin}${r.url}`);
    });
  }

  return (
    <div style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
      {lines.join('\n\n')}
    </div>
  );
}