'use client';

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  CoverflowCarousel,
  type CoverflowSlide,
} from "@/components/ui/coverflow-carousel";

gsap.registerPlugin(ScrollTrigger);

const machines: CoverflowSlide[] = [
  {
    src: 'https://images.unsplash.com/photo-1596357395104-14a5ae9cdade?q=80&w=2070&auto=format&fit=crop',
    alt: 'Máquina Sentadilla Hack Squat',
    title: 'Sentadilla Hack Squat',
    subtitle: 'Aislamiento perfecto. Cero carga en la columna vertebral.',
  },
  {
    src: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=2070&auto=format&fit=crop',
    alt: 'Plataformas de levantamiento olímpico con barras Eleiko',
    title: 'Plataformas Olímpicas',
    subtitle: 'Barras y topos Eleiko de especificación de competencia.',
  },
  {
    src: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop',
    alt: 'Zona de cables sectorizados con poleas duales',
    title: 'Cables Sectorizados',
    subtitle: 'Precisión suave y poleas duales ajustables.',
  },
  {
    src: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=1974&auto=format&fit=crop',
    alt: 'Deck de cardio avanzado con pantallas de datos',
    title: 'Deck de Cardio Avanzado',
    subtitle: 'Rastrea macros directamente en tus datos de sprint.',
  },
  {
    src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    alt: 'Zona de recuperación con baños de hielo y sauna',
    title: 'Zona de Recuperación',
    subtitle: 'Baños de hielo, saunas infrarrojas.',
  },
];

export function EquipmentCarousel() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const items = section.querySelectorAll('[data-eq-reveal]');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(items, { clearProps: 'all' });
      return;
    }

    const timeline = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top 78%' },
    });

    timeline.fromTo(
      items,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' },
    );

    return () => {
      timeline.scrollTrigger?.kill();
      timeline.kill();
    };
  }, []);

  return (
    <section
      id="equipment"
      ref={sectionRef}
      className="relative overflow-hidden border-y border-border bg-card px-6 py-24"
    >
      {/* Capas de fondo: glows ambientales + hairline superior */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute left-0 right-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl">
        {/* Header — sin chip/pill, centrado con subrayado SVG (patrón FanDeck) */}
        <div data-eq-reveal className="mb-20 text-center">
          <h2 className="mb-6 font-heading text-4xl font-black uppercase leading-[0.95] text-foreground md:text-6xl">
            Arsenal{" "}
            <span className="text-primary relative inline-block">
              de Élite
              <svg
                className="absolute -bottom-2 left-0 h-3 w-full text-primary/40"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M0,8 Q50,0 100,6 T200,4"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>
          <p className="mx-auto max-w-2xl font-mono text-lg leading-relaxed text-muted-foreground">
            Desliza por nuestro equipo seleccionado de clase mundial, diseñado
            para máxima tensión mecánica y progreso fisiológico.
          </p>
        </div>

        <div data-eq-reveal className="relative">
          <CoverflowCarousel
            slides={machines}
            cardWidth="clamp(260px, 32vw, 400px)"
            cardRatio={1.25}
            showCaption
            showNavigation
            showPagination
            label="Arsenal de máquinas de Gymulate"
            cardClassName="border border-border/60 grayscale-[0.7] transition-[filter,border-color,box-shadow] duration-300 data-[active]:grayscale-0 data-[active]:border-primary/60 data-[active]:shadow-[0_0_35px_rgba(150,217,6,0.25)]"
          />
        </div>
      </div>
    </section>
  );
}
