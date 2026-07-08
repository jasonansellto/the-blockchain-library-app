import React, { useRef, useEffect, useState } from 'react';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';

// Fade-and-slide-up reveal on scroll into view. Honors reduced motion
// (children render immediately, no transition). Use `delay` (ms) for a
// hand-tuned stagger, or wrap a grid in <StaggerGroup> for auto-stagger.
export default function Reveal({ children, delay = 0, className = '', threshold = 0.15 }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const [visible, setVisible] = useState(reduced);

  useEffect(() => {
    if (reduced) { setVisible(true); return; }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(entry.target);
        }
      });
    }, { threshold, rootMargin: '0px 0px -40px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, threshold]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
}