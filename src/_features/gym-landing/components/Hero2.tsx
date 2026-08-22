'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Dumbbell, HeartPulse } from 'lucide-react';
import { usePageTransition } from '@/_features/shared/hooks/usePageTransition';


if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const zones = [
  { label: 'Fuerza', icon: Dumbbell },
  { label: 'Intensidad', icon: Zap },
  { label: 'Recuperación', icon: HeartPulse },
];

export function Hero2() {
  const containerRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const { navigate } = usePageTransition();

  const { contextSafe } = useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Watermark parallax — recedes slower than the page on scroll.
        gsap.to('.hero2-mark', {
          yPercent: -18,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        });

        // One authored entrance: each line ignites via clip-path, then
        // the geometric accents sweep in.
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        tl.from('.hero2-line', {
          clipPath: 'inset(0 100% 0 0)',
          duration: 0.9,
          stagger: 0.12,
        })
          .from(
            '.hero2-accent',
            { scaleX: 0, transformOrigin: 'left', duration: 0.7 },
            '-=0.5',
          )
          .from(
            '.hero2-zone, .hero2-copy, .hero2-cta, .hero2-foot',
            { y: 22, opacity: 0, duration: 0.6, stagger: 0.08 },
            '-=0.3',
          );
      });

      return () => mm.revert();
    },
    { scope: containerRef },
  );

  // Scroll progress — a thin neon rail down the left edge.
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const p = total > 0 ? window.scrollY / total : 0;
      el.style.transform = `scaleY(${Math.min(1, p)})`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToMembership = contextSafe(() => {
    document
      .querySelector('#membership')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });


  return (
    <section
      id="home"
      ref={containerRef}
      className="relative min-h-[100svh] overflow-hidden bg-background flex flex-col"
    >
      {/* ░░ Massive watermark type — the room's voice ░░ */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <span
          aria-hidden="true"
          className="hero2-mark absolute -right-[4%] top-1/2 -translate-y-1/2 font-heading font-black uppercase leading-[0.8] tracking-[-0.04em] text-[22vw] text-transparent"
          style={{
            WebkitTextStroke: '1px hsl(var(--primary) / 0.16)',
          }}
        >
          Forja
        </span>
      </div>

      {/* ░░ Background — same loved image, bolder blend ░░ */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat opacity-25 filter grayscale mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-background/50" />
      </div>

      {/* ░░ Block accents — geometric neon slabs ░░ */}
      <div className="absolute top-0 right-0 z-0 pointer-events-none">
        <div className="hero2-accent w-[38vw] h-px md:h-[2px] bg-gradient-to-l from-primary to-transparent" />
      </div>
      <div className="absolute bottom-0 left-0 z-0 pointer-events-none">
        <div className="hero2-accent w-[42vw] h-px md:h-[2px] bg-gradient-to-r from-primary to-transparent" />
      </div>
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 -right-16 w-72 h-72 bg-primary/8 blur-[120px] rounded-full" />
      </div>

      {/* ░░ Neon progress rail (left edge) ░░ */}
      <div className="absolute left-0 top-0 bottom-0 z-0 w-[3px] bg-muted/40">
        <div
          ref={progressRef}
          className="w-full h-full origin-top bg-primary"
          style={{ transform: 'scaleY(0)' }}
        />
      </div>

      {/* ░░ Content — bold left block, watermark behind ░░ */}
      <div className="relative z-10 container mx-auto px-6 flex-1 flex items-center pt-28">
        <div className="max-w-[52rem]">
          <h1 className="font-heading font-black uppercase leading-[0.85] tracking-[-0.03em] text-[clamp(3.25rem,9vw,5.5rem)]">
            <span className="hero2-line block text-foreground">Construye Tu</span>
            <span className="hero2-line block pl-[0.4em] text-primary">
              Futuro.
            </span>
            <span className="hero2-line block text-foreground/90">Forja</span>
            <span className="hero2-line block pl-[0.8em] text-foreground">
              Tu Historia.
            </span>
          </h1>

          <p className="hero2-copy mt-8 text-foreground/75 text-base md:text-lg leading-relaxed max-w-[44ch]">
            Entrenamiento de élite, hierro pesado y una comunidad que no se conforma.
            Entra. Hazte más fuerte. Sal diferente.
          </p>

          <div className="hero2-cta mt-10 flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/auth/login')}
              className="bg-primary text-primary-foreground hover:bg-primary/95 font-heading tracking-wider uppercase text-base px-9 h-14 rounded-sm ring-2 ring-primary ring-offset-2 ring-offset-background focus-visible:ring-primary hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
            >
              <span className="flex items-center gap-3">
                Comenzar Ahora
                <ArrowRight
                  className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
                  strokeWidth={2.5}
                />
              </span>
            </Button>
            <Button
              size="lg"
              onClick={scrollToMembership}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 font-heading tracking-wider uppercase text-base px-9 h-14 rounded-sm border border-primary/40 focus-visible:ring-primary hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
            >
              Ver Planes
            </Button>
          </div>

          {/* Floating zone chips */}
          <div className="hero2-zone mt-10 flex flex-wrap gap-3">
            {zones.map(({ label, icon: Icon }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-primary/30 bg-primary/5 font-mono text-[11px] uppercase tracking-[0.2em] text-primary"
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ░░ Bottom foot — muted, functional ░░ */}
      <div className="relative z-10 container mx-auto px-6 pb-8">
        <div className="hero2-foot flex items-center justify-between gap-6 border-t border-border/60 pt-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Lunes/Sábado · 5,000 m² · 2 Entrenadores
          </p>
          <p className="hidden md:block font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
            Cañas, Guanacaste, Costa Rica
          </p>
        </div>
      </div>
    </section>
  );
}