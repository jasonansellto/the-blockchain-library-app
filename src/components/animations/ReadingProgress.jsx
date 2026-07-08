import React, { useState, useEffect } from 'react';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';

// Thin 3px gradient bar pinned to the very top of the viewport that fills
// as the user scrolls through the page. Designed for long-form content pages
// (article, glossary, book, research). Reduced-motion: no width transition
// (still tracks scroll — it's informational, not decorative motion).
export default function ReadingProgress({ className = '' }) {
  const [progress, setProgress] = useState(0);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-[60] h-[3px] pointer-events-none ${className}`} aria-hidden="true">
      <div
        className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500"
        style={{ width: `${progress * 100}%`, transition: reduced ? 'none' : 'width 0.08s linear' }}
      />
    </div>
  );
}