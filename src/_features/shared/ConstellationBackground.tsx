"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  connectTo: number[];
  twinkleSpeed: number;
  twinkleOffset: number;
}

export default function ConstellationBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resolveHSL = (
      varName: string,
      fallback: { h: number; s: number; l: number },
    ) => {
      try {
        const raw = getComputedStyle(document.documentElement)
          .getPropertyValue(varName)
          .trim();
        if (!raw) return fallback;
        if (raw.startsWith("#")) {
          const hex = raw.replace("#", "");
          const r = parseInt(hex.substring(0, 2), 16) / 255;
          const g = parseInt(hex.substring(2, 4), 16) / 255;
          const b = parseInt(hex.substring(4, 6), 16) / 255;
          const max = Math.max(r, g, b),
            min = Math.min(r, g, b);
          let h = 0,
            s = 0;
          const l = (max + min) / 2;
          if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
              case g:
                h = ((b - r) / d + 2) / 6;
                break;
              case b:
                h = ((r - g) / d + 4) / 6;
                break;
            }
          }
          return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100),
          };
        }
        const match = raw.match(/(\d+\.?\d*)/g);
        if (match && match.length >= 3) {
          return {
            h: parseFloat(match[0]),
            s: parseFloat(match[1]),
            l: parseFloat(match[2]),
          };
        }
      } catch (_) {
        /* noop */
      }
      return fallback;
    };

    const primaryHSL = resolveHSL("--primary", { h: 25, s: 95, l: 54 });
    const hsla = (a: number) =>
      `hsla(${primaryHSL.h}, ${primaryHSL.s}%, ${primaryHSL.l}%, ${a})`;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const PARTICLE_COUNT = 60;

    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const connectTo: number[] = [];
      const connectCount = 1 + Math.floor(Math.random() * 2);
      for (let c = 0; c < connectCount; c++) {
        let target = Math.floor(Math.random() * PARTICLE_COUNT);
        let attempts = 0;
        while (target === i || connectTo.includes(target)) {
          target = Math.floor(Math.random() * PARTICLE_COUNT);
          attempts++;
          if (attempts > 10) break;
        }
        if (target !== i && !connectTo.includes(target)) {
          connectTo.push(target);
        }
      }

      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: 0.8 + Math.random() * 2.2,
        opacity: 0.15 + Math.random() * 0.45,
        connectTo,
        twinkleSpeed: 0.5 + Math.random() * 1.5,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
    particlesRef.current = particles;

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      timeRef.current += 0.016;

      ctx.clearRect(0, 0, w, h);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        p.x = Math.max(0, Math.min(w, p.x));
        p.y = Math.max(0, Math.min(h, p.y));
      }

      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        const x1 = p1.x;
        const y1 = p1.y;
        for (const j of p1.connectTo) {
          if (j <= i) continue;
          const p2 = particles[j];
          const x2 = p2.x;
          const y2 = p2.y;
          const dx = x2 - x1;
          const dy = y2 - y1;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = Math.min(w, h) * 0.22;
          if (dist < maxDist) {
            const alpha =
              (1 - dist / maxDist) * 0.12 * Math.min(p1.opacity, p2.opacity);
            const twinkle =
              0.6 +
              0.4 *
                Math.sin(
                  timeRef.current *
                    ((p1.twinkleSpeed + p2.twinkleSpeed) / 2 +
                      (p1.twinkleOffset + p2.twinkleOffset) / 2),
                );
            ctx.strokeStyle = hsla(alpha * twinkle);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const x = p.x;
        const y = p.y;
        const twinkle =
          0.5 +
          0.5 * Math.sin(timeRef.current * p.twinkleSpeed + p.twinkleOffset);
        const finalOpacity = p.opacity * (0.55 + 0.45 * twinkle);

        const glowSize = p.size * 3.5;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        gradient.addColorStop(0, hsla(finalOpacity * 0.9));
        gradient.addColorStop(0.4, hsla(finalOpacity * 0.3));
        gradient.addColorStop(1, hsla(0));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(140, 100%, 92%, ${Math.min(1, finalOpacity * 1.6)})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size * (0.8 + 0.2 * twinkle), 0, Math.PI * 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-[1]"
      style={{ opacity: 0.85 }}
    />
  );
}