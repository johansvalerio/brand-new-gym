'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { usePageTransition } from '@/_features/shared/hooks/usePageTransition';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const BAND_PHRASE = 'Fuerza // Fierros // Light Weight // Sudor // Coaching // Energía // Resultados // Sin Excusas // No Pain No Gain //';

function BandTrack() {
  return (
    <div className="h5-band-track flex w-max will-change-transform">
      <span className="whitespace-nowrap">{BAND_PHRASE}</span>
      <span className="whitespace-nowrap" aria-hidden="true">
        {BAND_PHRASE}
      </span>
    </div>
  );
}

export function Hero5() {
  const containerRef = useRef<HTMLElement>(null);
  const { navigate } = usePageTransition();

  const scrollToMembership = () =>
    document
      .querySelector('#membership')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        /* Authored entrance: massive type slams up through masks */
        gsap.timeline({ defaults: { ease: 'power4.out' } })
          .from('.h5-word-inner', {
            yPercent: 112,
            duration: 0.9,
            stagger: 0.13,
          })
          .from(
            '.h5-band',
            { scaleX: 0, transformOrigin: 'left center', duration: 0.7, ease: 'power3.inOut', stagger: 0.12 },
            '-=0.55',
          )
          .from('.h5-cta, .h5-foot', { y: 18, autoAlpha: 0, duration: 0.5 }, '-=0.35');

        /* Infinite marquees — opposite directions */
        gsap.fromTo(
          '.h5-band-a .h5-band-track',
          { xPercent: 0 },
          { xPercent: -50, duration: 26, ease: 'none', repeat: -1 },
        );
        gsap.fromTo(
          '.h5-band-b .h5-band-track',
          { xPercent: -50 },
          { xPercent: 0, duration: 30, ease: 'none', repeat: -1 },
        );

        /* Signature moment: scroll velocity shears the type bands */
        const proxy = { skew: 0 };
        const skewSetter = gsap.quickSetter('.h5-band-track', 'skewY', 'deg');
        const clampSkew = gsap.utils.clamp(-7, 7);

        ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate(self) {
            const skew = clampSkew(self.getVelocity() / -350);
            if (Math.abs(skew) > Math.abs(proxy.skew)) {
              proxy.skew = skew;
              gsap.to(proxy, {
                skew: 0,
                duration: 0.75,
                ease: 'power3.out',
                overwrite: true,
                onUpdate: () => skewSetter(proxy.skew),
              });
            }
          },
        });
        /* Glitch autónomo en "DURO" — ráfaga RGB cada ~1.2s, sin hover */
        gsap
          .timeline({ repeat: -1, repeatDelay: 1.2, delay: 0.5 })
          .to('.h5-glitch-main', { opacity: 0.25, duration: 0.06 })
          .to(['.h5-glitch-a', '.h5-glitch-b'], { autoAlpha: 1, duration: 0.04 }, '<')
          .to('.h5-glitch-a', { x: -16, duration: 0.08 })
          .to('.h5-glitch-b', { x: 16, duration: 0.08 }, '<')
          .to('.h5-glitch-main', { x: 8, skewX: -8, opacity: 1, duration: 0.08 }, '<')
          .to(['.h5-glitch-a', '.h5-glitch-b'], { autoAlpha: 0, x: 0, duration: 0.06 }, '+=0.07')
          .to('.h5-glitch-main', { x: 0, skewX: 0, duration: 0.09 })
          .to('.h5-glitch-a', { autoAlpha: 1, x: 12, duration: 0.05 }, '+=0.1')
          .to('.h5-glitch-b', { autoAlpha: 1, x: -12, duration: 0.05 }, '<')
          .to(['.h5-glitch-a', '.h5-glitch-b'], { autoAlpha: 0, x: 0, duration: 0.06 }, '+=0.08')
          .to('.h5-glitch-main', { skewX: -4, duration: 0.05 }, '<')
          .to('.h5-glitch-main', { skewX: 0, duration: 0.07 });
      });

      return () => mm.revert();
    },
    { scope: containerRef },
  );

  return (
    <section
      id="/"
      ref={containerRef}
      className="relative z-0 min-h-[100svh] bg-background overflow-hidden flex flex-col justify-center py-24 lg:sticky lg:top-0 lg:py-28"
    >
      {/* ░░ Background photo — gym oscuro visible en todo el section ░░ */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-[0.30] grayscale contrast-125" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background/85" />
      </div>

      {/* ░░ Faint watermark keeps brand voice without stealing focus ░░ */}
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none select-none">
        <span className="absolute left-[-6%] bottom-[8%] font-heading font-black uppercase leading-none text-[24vw] text-transparent opacity-40" style={{ WebkitTextStroke: '1px hsl(var(--primary) / 0.14)' }}>
          Gym
        </span>
      </div>

      <h1 aria-label="Entrena duro, sal diferente" className="relative z-10">
        {/* ENTRENA — solid */}
        <div className="overflow-hidden">
          <span aria-hidden="true" className="h5-word block font-heading font-black uppercase leading-[0.82] tracking-[-0.03em] text-[clamp(4rem,17vw,12.5rem)] lg:text-[length:min(14vw,18vh)] text-foreground cursor-default transition-colors duration-300 hover:text-primary">
            <span className="h5-word-inner block">Entrena</span>
          </span>
        </div>

        {/* Band A */}
        <div className="h5-band h5-band-a my-3 md:my-4 lg:my-2 -mx-[2%] w-[104%] -rotate-1 border-y border-border/60 bg-secondary/70 py-2.5 md:py-3 lg:py-3 overflow-hidden">
          <div aria-hidden="true" className="font-mono uppercase text-xs md:text-sm tracking-[0.32em] text-primary">
            <BandTrack />
          </div>
        </div>

        {/* DURO — outline */}
        <div className="overflow-hidden">
          <span
            aria-hidden="true"
            className="h5-word block pl-[6%] font-heading font-black uppercase leading-[0.82] tracking-[-0.02em] text-[clamp(4rem,17vw,12.5rem)] lg:text-[min(14vw,18vh)] text-transparent cursor-default transition-all duration-300 hover:text-primary [-webkit-text-stroke:2px_hsl(var(--foreground))] hover:[-webkit-text-stroke-color:hsl(var(--primary))]"
          >
            <span className="h5-word-inner block">
              <span className="relative inline-block">
                <span className="h5-glitch-main inline-block">Duro</span>
                <span
                  aria-hidden="true"
                  className="h5-glitch-a absolute inset-0 text-primary opacity-0"
                >
                  Duro
                </span>
                <span
                  aria-hidden="true"
                  className="h5-glitch-b absolute inset-0 text-white opacity-0"
                >
                  Duro
                </span>
              </span>
            </span>
          </span>
        </div>

        {/* Band B — counter-direction */}
        <div className="h5-band h5-band-b my-3 md:my-4 lg:my-2 -mx-[2%] w-[104%] rotate-1 border-y border-border/60 bg-secondary/70 py-2.5 md:py-3 lg:py-3 overflow-hidden">
          <div aria-hidden="true" className="font-mono uppercase text-xs md:text-sm tracking-[0.32em] text-primary">
            <BandTrack />
          </div>
        </div>

        {/* SAL DIFERENTE — solid neon */}
        <div className="overflow-hidden">
          <span aria-hidden="true" className="h5-word block font-heading font-black uppercase leading-[0.85] tracking-[-0.03em] text-[clamp(2.6rem,10.5vw,8rem)] lg:text-[min(9vw,13vh)] pl-[3%] text-primary cursor-default transition-colors duration-300 hover:text-foreground">
            <span className="h5-word-inner block">Sal Diferente</span>
          </span>
        </div>
      </h1>

      {/* ░░ CTAs ░░ */}
      <div className="h5-cta relative z-10 container mx-auto px-6 mt-12 lg:mt-6 flex flex-col sm:flex-row gap-4">
        <Button
          size="lg"
          onClick={() => navigate('/auth/login')}
          className="bg-primary text-primary-foreground hover:bg-primary/95 font-heading tracking-wider uppercase text-base px-9 h-14 rounded-sm ring-2 ring-primary ring-offset-2 ring-offset-background focus-visible:ring-primary hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer sm:self-start"
        >
          <span className="flex items-center gap-3">
            Comenzar Ahora
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
          </span>
        </Button>
        <Button
          size="lg"
          onClick={scrollToMembership}
          className="bg-secondary text-secondary-foreground hover:bg-secondary/80 font-heading tracking-wider uppercase text-base px-9 h-14 rounded-sm border border-primary/40 focus-visible:ring-primary hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer sm:self-start"
        >
          Ver Planes
        </Button>
      </div>

      {/* ░░ Foot ░░ */}
      <div className="h5-foot relative z-10 container mx-auto px-6 mt-10 lg:mt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-muted-foreground border-t border-border/60 pt-5">
          Cañas, Guanacaste · Lun–Sáb · 5,000 m² de hierro
        </p>
      </div>
    </section>
  );
}
