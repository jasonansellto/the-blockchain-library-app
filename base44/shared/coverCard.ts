// Article cover card (1200x630 SVG) used by generateArticleCovers. Pure function, no I/O.
export const CATEGORY_STYLE = {
  'Blockchain':              { label: 'Blockchain',          accent: '#3b82f6', glow: '#1d4ed8' },
  'Cryptocurrency':          { label: 'Crypto',              accent: '#f59e0b', glow: '#b45309' },
  'Web3':                    { label: 'Web3',                accent: '#8b5cf6', glow: '#6d28d9' },
  'Artificial Intelligence': { label: 'AI',                  accent: '#ec4899', glow: '#be185d' },
  'Technology':              { label: 'Technology',          accent: '#06b6d4', glow: '#0e7490' },
  'Money':                   { label: 'Money',               accent: '#10b981', glow: '#047857' },
  'Affiliate Marketing':     { label: 'Affiliate Marketing', accent: '#f97316', glow: '#c2410c' },
};
const DEFAULT_STYLE = { label: 'Knowledge', accent: '#14b8a6', glow: '#0f766e' };

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Approximate Inter Bold advance widths (em) — good enough for line breaking.
function textWidth(s, size) {
  let w = 0;
  for (const ch of s) {
    if (ch === ' ') w += 0.25;
    else if ('iljI.,:;\'!|’'.includes(ch)) w += 0.27;
    else if ('ftr()-'.includes(ch)) w += 0.38;
    else if ('mwMW'.includes(ch)) w += 0.88;
    else if (ch >= 'A' && ch <= 'Z') w += 0.70;
    else if (ch >= '0' && ch <= '9') w += 0.62;
    else w += 0.57;
  }
  return w * size;
}

function wrap(title, size, maxWidth, maxLines) {
  const words = title.split(/\s+/).filter(Boolean);
  const lines = []; let line = '';
  for (const word of words) {
    const next = line ? line + ' ' + word : word;
    if (textWidth(next, size) <= maxWidth || !line) line = next;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (last.includes(' ') && textWidth(last + '…', size) > maxWidth) last = last.slice(0, last.lastIndexOf(' '));
    kept[maxLines - 1] = last.replace(/[\s,:;–—-]+$/, '') + '…';
    return kept;
  }
  return lines;
}

function layout(title) {
  const maxWidth = 1040;
  for (const [size, maxLines] of [[72, 3], [62, 3], [54, 4], [48, 4]]) {
    const lines = wrap(title, size, maxWidth, 99);
    if (lines.length <= maxLines) {
      // Balance: narrowest width that keeps the same line count (avoids a lone last word).
      let lo = maxWidth * 0.5, hi = maxWidth;
      while (hi - lo > 4) {
        const mid = (lo + hi) / 2;
        if (wrap(title, size, mid, 99).length === lines.length) hi = mid; else lo = mid;
      }
      return { size, lines: wrap(title, size, hi, 99) };
    }
  }
  return { size: 48, lines: wrap(title, 48, maxWidth, 4) };
}

export function buildCoverSvg({ title, categoryName, logoDataUri }) {
  const st = CATEGORY_STYLE[categoryName] || DEFAULT_STYLE;
  const { size, lines } = layout(String(title || '').trim());
  const lh = Math.round(size * 1.16);
  const blockH = lh * lines.length;
  const top = 330 - blockH / 2 + size * 0.8;
  const tspans = lines.map((l, i) => `<tspan x="80" y="${Math.round(top + i * lh)}">${esc(l)}</tspan>`).join('');
  let dots = '';
  for (let r = 0; r < 7; r++) for (let c = 0; c < 13; c++) {
    const x = 640 + c * 48, y = 40 + r * 90 + (c % 2) * 45;
    if (x > 1180) continue;
    dots += `<circle cx="${x}" cy="${y}" r="2.2" fill="#ffffff" fill-opacity="${(0.05 + ((r * 7 + c * 3) % 5) * 0.025).toFixed(3)}"/>`;
  }
  const pillW = Math.round(textWidth(st.label.toUpperCase(), 20) * 1.08 + 44);
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="g1" cx="1050" cy="80" r="620" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${st.glow}" stop-opacity="0.55"/><stop offset="1" stop-color="${st.glow}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="120" cy="640" r="520" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#14b8a6" stop-opacity="0.18"/><stop offset="1" stop-color="#14b8a6" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0b1220"/>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <rect width="1200" height="630" fill="url(#g2)"/>
  ${dots}
  <rect x="0" y="0" width="1200" height="8" fill="${st.accent}"/>
  ${logoDataUri ? `<image x="80" y="58" width="56" height="56" xlink:href="${logoDataUri}"/>` : ''}
  <text x="152" y="95" font-family="Inter" font-weight="600" font-size="24" fill="#e2e8f0" letter-spacing="0.5">The Blockchain Library</text>
  <rect x="80" y="${Math.round(top - size - 52)}" width="${pillW}" height="40" rx="20" fill="${st.accent}" fill-opacity="0.16" stroke="${st.accent}" stroke-opacity="0.6"/>
  <text x="${80 + 22}" y="${Math.round(top - size - 25)}" font-family="Inter" font-weight="700" font-size="20" fill="${st.accent}" letter-spacing="1.5">${esc(st.label.toUpperCase())}</text>
  <text font-family="Inter" font-weight="700" font-size="${size}" fill="#ffffff" letter-spacing="-0.5">${tspans}</text>
  <rect x="80" y="540" width="1040" height="1" fill="#ffffff" fill-opacity="0.12"/>
  <text x="80" y="582" font-family="Inter" font-weight="600" font-size="22" fill="#94a3b8">Jason Ansell</text>
  <text x="1120" y="582" text-anchor="end" font-family="Inter" font-weight="600" font-size="22" fill="#94a3b8">theblockchainlibrary.com</text>
</svg>`;
}
