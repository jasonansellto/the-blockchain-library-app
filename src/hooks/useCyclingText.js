import { useState, useEffect } from 'react';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';

// Cycles through a list of placeholder suggestions on an interval.
// Pass a STABLE array (module-scope constant) so the effect doesn't resubscribe.
// Reduced-motion users get a single static suggestion.
export default function useCyclingText(items, interval = 2800) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || !items?.length) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), interval);
    return () => clearInterval(id);
  }, [reduced, items, interval]);

  return items?.[index] || '';
}