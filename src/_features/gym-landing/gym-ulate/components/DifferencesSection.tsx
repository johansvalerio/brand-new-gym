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
    title: "Rutinas de tu coach",
    description:
      "Tu coach arma tu entrenamiento día por día — ejercicios, series, reps y descanso — y tú lo sigues desde la app en cada sesión.",
    image:
      "/landing/routines.jpg",
    stat: "7",
    statLabel: "Días planificados por semana",
  },
  {
    index: "02",
    title: "Ranking comunitario",
    description:
      "Comparte tus rutinas, recibe votos de la comunidad y escala en el ranking público. Un voto por persona — sin autofavoritismo.",
    image:
      "/landing/ranking.jpg",
    stat: "#1",
    statLabel: "Te espera en el ranking",
  },
  {
    index: "03",
    title: "Membresía en vivo",
    description:
      "Paga por SINPE o en caja; al confirmarse, tu vigencia se activa sola y tu perfil cuenta atrás días, horas y minutos.",
    image:
      "/landing/historial.jpg",
    stat: "d/h/m",
    statLabel: "Cuenta regresiva en tu perfil",
  },
  {
    index: "04",
    title: "SINPE o Efectivo",
    description:
      "Sin pasarelas ni tarjetas: envías tu SINPE o paga en el gym, el administrador lo confirma y tu campanita suena al instante.",
    image:
      "/landing/membresia.jpg",
    stat: "SINPE",
    statLabel: "Pago directo, verificado",
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

        /* Zoom de entrada: el card aparece reducido y crece con el scroll
           hasta su tamaño exacto cuando arranca la secuencia pineada */
        gsap.fromTo(
          ".diff-zoom",
          { scale: 0.75 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 95%",
              end: "bottom bottom",
              scrub: true,
            },
          },
        );

        /* Entrada del header — cortina en el h2 + descripción, con trigger
           propio para que termine antes de que arranque el pin */
        gsap
          .timeline({
            scrollTrigger: { trigger: section, start: "top 70%" },
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
          gsap.set(item.querySelector(".icon-glow"), { scale: 0.92, rotation: -6 });
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
            scale: 0.92,
            rotation: -6,
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
            ease: "back.out(1.4)",
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

        /* Tabs: el subrayado de cada uno se llena durante su ventana y el
           texto del activo brilla mientras los demás quedan apagados */
        const tabs = gsap.utils.toArray<HTMLElement>(".diff-tab");
        tabs.forEach((tab, i) => {
          timeline.fromTo(
            tab.querySelector(".diff-seg-fill"),
            { scaleX: 0 },
            { scaleX: 1, duration: 1.5, ease: "none" },
            i * 1.5,
          );
          /* GSAP no puede interpolar hsl(var(--x)) — se usan los hex de los
             tokens (--foreground #F8FAFC, --muted-foreground #A1A1AA). */
          timeline.to(tab, { color: "#F8FAFC", duration: 0.3 }, i * 1.5);
          if (i > 0) {
            timeline.to(tabs[i - 1], { color: "#A1A1AA", duration: 0.3 }, i * 1.5);
          }
        });

        /* Glitch RGB ambiental en cada stat — corre siempre, con o sin scroll.
           Solo la card visible lo muestra (las demás están apiladas debajo);
           delays escalonados evitan que destellen sincronizados. */
        items.forEach((item, i) => {
          const glitchA = item.querySelector(".diff-stat-glitch-a");
          const glitchB = item.querySelector(".diff-stat-glitch-b");
          if (!glitchA || !glitchB) return;

          gsap
            .timeline({ repeat: -1, repeatDelay: 2.4, delay: 1 + i * 0.6 })
            .to(glitchA, { autoAlpha: 1, x: -6, duration: 0.06 })
            .to(glitchB, { autoAlpha: 1, x: 6, duration: 0.06 }, "<")
            .to([glitchA, glitchB], { autoAlpha: 0, x: 0, duration: 0.05 }, "+=0.08")
            .to(glitchA, { autoAlpha: 1, x: 4, duration: 0.05 }, "+=0.12")
            .to(glitchB, { autoAlpha: 1, x: -4, duration: 0.05 }, "<")
            .to([glitchA, glitchB], { autoAlpha: 0, x: 0, duration: 0.06 });
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
      className="relative pt-24 pb-10 bg-background px-6 overflow-hidden md:pt-28 md:pb-12"
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
        {/* El stage mide exactamente lo que el card: al pinear, el header
            cortado arriba hace de colchón y el nav nunca tapa el título */}
        <div className="relative h-[440px] sm:h-[500px] flex items-center justify-center">
          {/* Wrapper del zoom: crece con el scroll hasta el inicio del pin */}
          <div className="diff-zoom relative flex h-full w-full items-center justify-center will-change-transform">
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
                {/* Card estilo showcase: título centrado con halo, la imagen
                    llena la parte inferior y se recorta con el card */}
                <div className="relative flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
                  <div className={`absolute inset-0 bg-gradient-to-b ${gradients[idx]} opacity-30 pointer-events-none`} />

                  <div className="relative z-10 px-6 pt-6 text-center sm:px-12">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/80">
                      {feature.index} / 04
                    </p>
                    <h3 className="feature-title mt-2 font-heading text-4xl font-black uppercase tracking-tight text-foreground leading-[0.95] sm:text-5xl md:text-6xl">
                      {feature.title}
                    </h3>
                    <p className="feature-desc mx-auto mt-3 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {feature.description}
                    </p>
                  </div>

                  {/* Imagen — la protagonista: borde limpio, filtros mínimos */}
                  <div className="icon-glow relative mt-4 min-h-0 flex-1 border-t border-border/40 sm:mt-5">
                    <div className="absolute inset-0">
                      <div
                        className="absolute inset-0 bg-cover bg-center grayscale contrast-105"
                        style={{ backgroundImage: `url(${feature.image})` }}
                      />
                      <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
                      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/60 to-transparent" />

                      <div className="absolute bottom-4 right-5 text-right">
                        <span className="feature-stat block font-heading font-black text-6xl text-primary leading-none [text-shadow:0_4px_24px_rgba(0,0,0,0.85)] md:text-7xl">
                          <span className="relative inline-block">
                            <span className="inline-block">{feature.stat}</span>
                            <span
                              aria-hidden="true"
                              className="diff-stat-glitch-a absolute inset-0 text-foreground opacity-0"
                            >
                              {feature.stat}
                            </span>
                            <span
                              aria-hidden="true"
                              className="diff-stat-glitch-b absolute inset-0 text-black/40 opacity-0"
                            >
                              {feature.stat}
                            </span>
                          </span>
                        </span>
                        <span className="feature-label mt-2 block font-mono text-[11px] uppercase tracking-widest text-foreground/90">
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
        </div>

        {/* Tabs de la secuencia: en móvil solo los indicadores (sin texto);
            en desktop, activo brillante + subrayado que se llena */}
        <div className="mt-8 grid grid-cols-4 gap-x-6 md:mt-10 lg:gap-x-8">
          {features.map((feature) => (
            <div
              key={feature.index}
              className="diff-tab relative pb-3 text-muted-foreground/50"
            >
              <p className="hidden font-sans text-sm font-black uppercase tracking-tight lg:block">
                {feature.title}
              </p>
              <p className="mt-1 hidden font-mono text-[11px] leading-snug lg:block">
                {feature.statLabel}
              </p>
              <span className="absolute inset-x-0 bottom-0 h-[2px] overflow-hidden rounded-full bg-border/40">
                <span className="diff-seg-fill block h-full w-full origin-left scale-x-0 bg-primary" />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
