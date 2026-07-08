import React, { useRef, useEffect, useState } from 'react';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';

// Counts up from 0 to `end` once when first scrolled into view.
// Reduced-motion users see the final value immediately.
export default function CountUp({ end, duration = 1600, prefix = '', suffix = '', className = '' }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(reduced ? end : 0);
  const [started, setStarted] = useState(reduced);

  useEffect(() => {
    if (reduced) { setValue(end); setStarted(true); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setStarted(true);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, end]);

  useEffect(() => {
    if (!started || reduced) return;
    let raf = null;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setValue(end * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [started, reduced, end, duration]);

  const display = Number.isInteger(end) ? Math.round(value).toLocaleString() : Math.round(value).toLocaleString();
  return <span ref={ref} className={className}>{prefix}{display}{suffix}</span>;
}