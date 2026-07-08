// Duration parsing & formatting helpers for learning paths.
// A path's displayed total is derived from the sum of its lesson durations,
// so the card, detail hero, filters, and SEO schema always agree with the
// actual lesson list — no more hand-edited totals that drift from reality.

// Parse a free-text duration string ("12 min", "1 hour", "1h 30m",
// "5-6 hours" -> upper bound) into total minutes.
export function parseDurationToMinutes(str) {
  if (!str) return 0;
  const lower = String(str).toLowerCase();
  // Collapse range separators ("5-6 hours" -> "5 6 hours") so the regex
  // grabs the upper-bound number.
  const normalized = lower.replace(/\s*[-–—]\s*/g, ' ').replace(/\s+to\s+/g, ' ');
  let minutes = 0;
  const hourRe = /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\b/g;
  let hm;
  while ((hm = hourRe.exec(normalized)) !== null) minutes += Math.round(parseFloat(hm[1]) * 60);
  const minRe = /(\d+)\s*(?:minutes?|mins?|m)\b/g;
  let mm;
  while ((mm = minRe.exec(normalized)) !== null) minutes += parseInt(mm[1], 10);
  return minutes;
}

// Format a minute count as a clean, consistent label.
export function formatMinutes(minutes) {
  if (!minutes || minutes <= 0) return '';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (rem === 0) return hours === 1 ? '1 hour' : `${hours} hours`;
  return `${hours}h ${rem}m`;
}

// Sum all lesson durations for a path into total minutes.
export function pathTotalMinutes(path) {
  if (!path?.lessons?.length) return 0;
  return path.lessons.reduce((sum, l) => sum + parseDurationToMinutes(l?.duration), 0);
}

// Human-readable estimated time for a path: derived from lesson durations,
// falling back to the stored estimated_time only when lessons have no
// parseable durations.
export function pathEstimatedTime(path) {
  const total = pathTotalMinutes(path);
  if (total > 0) return formatMinutes(total);
  return path?.estimated_time || '';
}