import React, { useRef, useEffect } from 'react';
import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';

// Animated hero background: a subtle neural-network / knowledge graph of
// interconnected nodes and edges, a faint receding perspective grid, slow
// drifting particles, and a radial glow that follows the cursor.
//
// Everything renders on a single <canvas> driven by one requestAnimationFrame
// loop for 60fps. The loop auto-pauses when the hero scrolls out of view
// (IntersectionObserver) and is replaced by a single static frame when the
// user prefers reduced motion. pointer-events:none so it never blocks UI.
export default function NeuralGraph({ className = '' }) {
  const canvasRef = useRef(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0, height = 0;
    let raf = null;
    let visible = true;
    const mouse = { x: -9999, y: -9999, active: false };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width; height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    let nodes = [];
    let particles = [];
    const initNodes = () => {
      const count = Math.max(16, Math.min(42, Math.floor((width * height) / 28000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: (Math.random() - 0.5) * 0.16,
        r: Math.random() * 1.6 + 0.7,
        pulse: Math.random() * Math.PI * 2,
      }));
    };
    const initParticles = () => {
      const count = Math.max(8, Math.min(26, Math.floor(width / 70)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        r: Math.random() * 1.1 + 0.4,
        a: Math.random() * 0.4 + 0.12,
      }));
    };

    const LINK_DIST = 150;

    const drawGrid = () => {
      const horizon = height * 0.6;
      const vanishX = width * 0.5;
      ctx.save();
      ctx.lineWidth = 1;
      const rows = 7;
      for (let i = 1; i <= rows; i++) {
        const p = i / rows;
        const y = horizon + (height - horizon) * (p * p);
        ctx.strokeStyle = `rgba(59,130,246,${0.04 + p * 0.035})`;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
      const cols = 14;
      for (let i = 0; i <= cols; i++) {
        const x = (i / cols) * width;
        ctx.strokeStyle = 'rgba(148,163,184,0.045)';
        ctx.beginPath(); ctx.moveTo(x, height); ctx.lineTo(vanishX, horizon); ctx.stroke();
      }
      ctx.restore();
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, width, height);
      drawGrid();
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = `rgba(59,130,246,${(1 - dist / LINK_DIST) * 0.12})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(37,99,235,0.28)'; ctx.fill();
      }
    };

    const draw = () => {
      if (!visible) { raf = null; return; }
      ctx.clearRect(0, 0, width, height);
      drawGrid();

      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = width; else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height; else if (p.y > height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148,163,184,${p.a * 0.5})`; ctx.fill();
      }

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        n.pulse += 0.01;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = `rgba(59,130,246,${(1 - dist / LINK_DIST) * 0.16})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        const glow = 0.5 + Math.sin(n.pulse) * 0.25;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(37,99,235,${0.32 + glow * 0.22})`; ctx.fill();
      }

      if (mouse.active) {
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 240);
        grad.addColorStop(0, 'rgba(45,212,191,0.10)');
        grad.addColorStop(0.5, 'rgba(59,130,246,0.05)');
        grad.addColorStop(1, 'rgba(59,130,246,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      raf = requestAnimationFrame(draw);
    };

    const onResize = () => { resize(); initNodes(); initParticles(); if (reduced) drawStatic(); };
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
        mouse.x = x; mouse.y = y; mouse.active = true;
      } else {
        mouse.active = false;
      }
    };

    resize(); initNodes(); initParticles();

    if (reduced) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(draw);
      const visIo = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          visible = entry.isIntersecting;
          if (visible && !raf) raf = requestAnimationFrame(draw);
        });
      }, { threshold: 0 });
      visIo.observe(canvas);
      window.addEventListener('resize', onResize);
      window.addEventListener('mousemove', onMove);

      return () => {
        if (raf) cancelAnimationFrame(raf);
        visIo.disconnect();
        window.removeEventListener('resize', onResize);
        window.removeEventListener('mousemove', onMove);
      };
    }
    // reduced-motion cleanup
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [reduced]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 w-full h-full ${className}`}
    />
  );
}