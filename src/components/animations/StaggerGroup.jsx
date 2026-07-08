import React, { useRef, useEffect, useState } from 'react';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';

// Wraps a grid/list and auto-staggers the reveal of its direct children via
// CSS nth-child delays — no per-child delay props needed. Reduced-motion users
// see everything immediately. Render it as the grid container (pass grid
// classes via className).
export default function StaggerGroup({ children, className = '', threshold = 0.1 }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [inView, setInView] = useState(reduced);

  useEffect(() => {
    if (reduced) { setInView(true); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.unobserve(entry.target);
        }
      });
    }, { threshold, rootMargin: '0px 0px -40px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, threshold]);

  return (
    <div ref={ref} className={`stagger-children ${inView ? 'in-view' : ''} ${className}`}>
      {children}
    </div>
  );
}