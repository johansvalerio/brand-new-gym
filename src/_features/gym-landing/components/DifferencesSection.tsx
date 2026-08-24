"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register Plugin once
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const features = [
  {
    index: "01",
    title: "Equipamiento de Élite",
    description:
      "No escatimamos en gastos. Experimenta las mejores máquinas biomecánicamente diseñadas de todo el mundo.",
    image:
      "https://images.unsplash.com/photo-1596357395104-14a5ae9cdade?q=80&w=1200&auto=format&fit=crop",
    stat: "120+",
    statLabel: "Máquinas Premium",
  },
  {
    index: "02",
    title: "Seguimiento con Datos",
    description:
      "Nuestra app propietaria se sincroniza con nuestro equipo para rastrear cada repetición, serie y récord personal.",
    image:
      "https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=1200&auto=format&fit=crop",
    stat: "100%",
    statLabel: "Precisión de Sincronización",
  },
  {
    index: "03",
    title: "Comunidad Táctica",
    description:
      "Rodéate de personas que exigen más de sí mismas y de ti.",
    image:
      "https://images.unsplash.com/photo-1534367507873-d2d7e24c7f07?q=80&w=1200&auto=format&fit=crop",
    stat: "24/7",
    statLabel: "Miembros Activos",
  },
  {
    index: "04",
    title: "Acceso 24/7",
    description:
      "El entrenamiento nunca se detiene. Entrena a las 2 AM con nuestro sistema de entrada seguro biométrico.",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop",
    stat: "365",
    statLabel: "Días Abierto",
  },
];

export function DifferencesSection() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Respect prefers-reduced-motion: skip scroll sequence animation
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const section = containerRef.current;
        if (!section) return;

        const items = gsap.utils.toArray<HTMLElement>(".difference-item");
        if (items.length === 0) return;

        /* Entrada del header — cortina en el h2 + descripción, con trigger
           propio para que termine antes de que arranque el pin */
        gsap
          .timeline({
            scrollTrigger: { trigger: section, start: "top 78%" },
            defaults: { ease: "power4.out" },
          })
          .fromTo(
            ".diff-head",
            { clipPath: "inset(0% 0% 100% 0%)", y: 34 },
            { clipPath: "inset(0% 0% -12% 0%)", y: 0, duration: 0.95 },
          )
          .fromTo(
            ".diff-sub",
            { y: 20, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.7 },
            "-=0.55",
          );

        // Create a timeline for sequential item changes
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            // Arranca cuando el FINAL de la sección entra al viewport:
            // la card ya está 100% visible antes de que empiece la secuencia.
            start: "bottom bottom",
            end: "+=3000", // More scroll distance for slower transitions
            scrub: 1,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
          },
        });

        // Set initial state: first item fully visible, others hidden
        gsap.set(items.slice(1), { opacity: 0, scale: 0.95, y: -50 });
        gsap.set(items[0], { opacity: 1, scale: 1, y: 0 });

        // Set first item elements visible immediately
        const firstItem = items[0];
        if (firstItem) {
          gsap.set(firstItem.querySelector(".icon-glow"), { scale: 1, rotation: 0 });
          gsap.set(firstItem.querySelector(".feature-title"), { opacity: 1, y: 0 });
          gsap.set(firstItem.querySelector(".feature-desc"), { opacity: 1, y: 0 });
          gsap.set(firstItem.querySelector(".feature-stat"), { opacity: 1, scale: 1, y: 0 });
          gsap.set(firstItem.querySelector(".feature-label"), { opacity: 1, y: 0 });
        }

        // Set other items' elements hidden
        items.slice(1).forEach((item) => {
          gsap.set(item.querySelector(".icon-glow"), { scale: 0, rotation: -45 });
          gsap.set(item.querySelector(".feature-title"), { opacity: 0, y: -30 });
          gsap.set(item.querySelector(".feature-desc"), { opacity: 0, y: -20 });
          gsap.set(item.querySelector(".feature-stat"), { opacity: 0, scale: 0.5, y: 50 });
          gsap.set(item.querySelector(".feature-label"), { opacity: 0, y: 20 });
        });

        // Create sequential transitions between items with more space between them
        items.forEach((item, index) => {
          if (index === 0) return; // Skip first item (already visible)

          const prevItem = items[index - 1];

          // Fade out previous item elements - aggressive exit downward
          timeline.to(prevItem.querySelector(".icon-glow"), {
            scale: 0,
            rotation: 45,
            duration: 0.5,
            ease: "power2.in",
          }, (index - 1) * 1.5);

          timeline.to(prevItem.querySelector(".feature-title"), {
            opacity: 0,
            y: 30,
            duration: 0.4,
            ease: "power2.in",
          }, (index - 1) * 1.5 + 0.1);

          timeline.to(prevItem.querySelector(".feature-desc"), {
            opacity: 0,
            y: 20,
            duration: 0.4,
            ease: "power2.in",
          }, (index - 1) * 1.5 + 0.2);

          timeline.to(prevItem.querySelector(".feature-stat"), {
            opacity: 0,
            scale: 0.5,
            y: 50,
            duration: 0.5,
            ease: "power2.in",
          }, (index - 1) * 1.5 + 0.3);

          timeline.to(prevItem.querySelector(".feature-label"), {
            opacity: 0,
            y: 20,
            duration: 0.3,
            ease: "power2.in",
          }, (index - 1) * 1.5 + 0.4);

          // Fade out previous item container
          timeline.to(prevItem, {
            opacity: 0,
            scale: 1.05,
            y: 50,
            duration: 0.8,
            ease: "power2.inOut",
          }, (index - 1) * 1.5);

          // Fade in current item container
          timeline.to(item, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.inOut",
          }, (index - 1) * 1.5 + 0.4);

          // Animate current item elements - aggressive entrance from above
          timeline.to(item.querySelector(".icon-glow"), {
            scale: 1,
            rotation: 0,
            duration: 0.8,
            ease: "back.out(1.5)",
          }, (index - 1) * 1.5 + 0.6);

          timeline.to(item.querySelector(".feature-title"), {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          }, (index - 1) * 1.5 + 0.7);

          timeline.to(item.querySelector(".feature-desc"), {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
          }, (index - 1) * 1.5 + 0.8);

          timeline.to(item.querySelector(".feature-stat"), {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            ease: "back.out(1.8)",
          }, (index - 1) * 1.5 + 0.9);

          timeline.to(item.querySelector(".feature-label"), {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
          }, (index - 1) * 1.5 + 1.0);
        });

        /* Segmentos de progreso: cada uno se llena durante su ventana */
        const segments = gsap.utils.toArray<HTMLElement>(".diff-seg-fill");
        segments.forEach((segment, i) => {
          timeline.fromTo(segment, { scaleX: 0 }, {
            scaleX: 1,
            duration: 1.5,
            ease: "none",
          }, i * 1.5);
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef },
  );

  return (
    <section
      id="difference"
      ref={containerRef}
      className="relative py-24 md:py-28 bg-background px-6 overflow-hidden"
    >
      {/* ===== Background Layer System ===== */}
      {/* Ambient glows — primary + accent */}
      <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Gradient ring divider (top) */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* ===== Section Header ===== */}
        <div className="text-center mb-16 md:mb-20">
          <h2
            className="diff-head font-heading text-4xl md:text-6xl font-black uppercase text-foreground mb-6 leading-[0.95]"
          >
            Por Qué Somos{" "}
            <span className="text-primary relative inline-block">
              Diferentes
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-primary/40"
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
          <p className="diff-sub text-muted-foreground max-w-2xl mx-auto font-mono text-lg leading-relaxed">
            Esto no es un club social. Es una instalación construida para
            resultados, seguimiento y progresión absoluta.
          </p>
        </div>

        {/* ===== Sequential Feature Display - Aggressive Split Layout ===== */}
        <div className="relative h-[60vh] flex items-center justify-center">
          {features.map((feature, idx) => {
            const gradients = [
              "from-primary/30 via-transparent to-transparent",
              "from-blue-500/30 via-transparent to-transparent",
              "from-purple-500/30 via-transparent to-transparent",
              "from-orange-500/30 via-transparent to-transparent"
            ];

            return (
              <div
                key={feature.index}
                className={`difference-item absolute inset-0 flex items-center justify-center ${
                  idx === 0 ? "opacity-100" : "opacity-0"
                }`}
              >
                {/* Tarjeta — superficie card (no negro plano), borde y sombra con offset */}
                <div className="relative w-full max-w-5xl rounded-3xl border border-border/60 bg-card/80 overflow-hidden shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradients[idx]} opacity-40 pointer-events-none`} />

                  <div className="relative grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr]">
                    {/* Left — contenido editorial */}
                    <div className="p-8 md:p-12 flex flex-col justify-center gap-5 md:gap-6">
                      {/* Medallón tipográfico — el numeral manda, sin íconos genéricos */}
                      <div className="icon-glow relative inline-flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-primary/15 border border-primary/40">
                        <span className="font-heading font-black text-2xl md:text-3xl text-primary leading-none">
                          {feature.index}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="feature-title font-heading text-3xl md:text-5xl font-black uppercase tracking-tight text-foreground leading-[0.95]">
                        {feature.title}
                      </h3>

                      {/* Description */}
                      <p className="feature-desc text-muted-foreground font-mono text-sm md:text-base leading-relaxed max-w-md">
                        {feature.description}
                      </p>

                      {/* Feature indicator */}
                      <div className="flex items-center gap-2">
                        <div className="h-px w-12 bg-primary/50" />
                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/80">
                          {feature.index} / 04
                        </span>
                      </div>
                    </div>

                    {/* Right — foto duotono con el stat montado */}
                    <div className="relative min-h-[260px] md:min-h-[440px]">
                      <div
                        className="absolute inset-0 bg-cover bg-center grayscale"
                        style={{ backgroundImage: `url(${feature.image})` }}
                      />
                      <div className="absolute inset-0 bg-primary/25 mix-blend-multiply" />
                      <div className="absolute inset-0 bg-gradient-to-r from-card via-card/30 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />

                      <div className="absolute bottom-6 right-6 text-right">
                        <span className="feature-stat block font-heading font-black text-6xl md:text-7xl text-primary leading-none [text-shadow:0_4px_24px_rgba(0,0,0,0.85)]">
                          {feature.stat}
                        </span>
                        <span className="feature-label block font-mono text-xs uppercase tracking-widest text-foreground/90 mt-2">
                          {feature.statLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progreso de la secuencia: 4 segmentos que se llenan con el scroll */}
        <div className="mt-12 flex items-center justify-center gap-3">
          {features.map((feature) => (
            <div
              key={feature.index}
              className="h-[3px] w-14 md:w-20 overflow-hidden rounded-full bg-border/40"
            >
              <div className="diff-seg-fill h-full w-full origin-left scale-x-0 bg-primary" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
