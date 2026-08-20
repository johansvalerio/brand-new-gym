"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Dumbbell, Activity, Users, Flame } from "lucide-react";

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
    icon: Dumbbell,
    stat: "120+",
    statLabel: "Máquinas Premium",
  },
  {
    index: "02",
    title: "Seguimiento con Datos",
    description:
      "Nuestra app propietaria se sincroniza con nuestro equipo para rastrear cada repetición, serie y récord personal.",
    icon: Activity,
    stat: "100%",
    statLabel: "Precisión de Sincronización",
  },
  {
    index: "03",
    title: "Comunidad Táctica",
    description:
      "Rodéate de personas que exigen más de sí mismas y de ti.",
    icon: Users,
    stat: "24/7",
    statLabel: "Miembros Activos",
  },
  {
    index: "04",
    title: "Acceso 24/7",
    description:
      "El entrenamiento nunca se detiene. Entrena a las 2 AM con nuestro sistema de entrada seguro biométrico.",
    icon: Flame,
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

        // Create a timeline for sequential item changes
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=3000", // More scroll distance for slower transitions
            scrub: 1,
            pin: true,
            pinSpacing: true,
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
         
          <h2 className="font-heading text-4xl md:text-6xl font-black uppercase text-foreground mb-6 leading-[0.95]">
            Why We Are{" "}
            <span className="text-primary relative inline-block">
              Different
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
          <p className="text-muted-foreground max-w-2xl mx-auto font-mono text-lg leading-relaxed">
            This isn&#39;t a social club. This is a facility built for results,
            tracking, and absolute progression.
          </p>
        </div>

        {/* ===== Sequential Feature Display - Aggressive Split Layout ===== */}
        <div className="relative h-[60vh] flex items-center justify-center">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
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
                {/* Dynamic background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradients[idx]} opacity-30`} />

                <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl w-full px-6">
                  {/* Left side - Content */}
                  <div className="space-y-6 md:space-y-8">
                    {/* Icon with glow */}
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-primary/40 blur-2xl rounded-full animate-pulse" />
                      <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-primary/20 border-2 border-primary/50 flex items-center justify-center icon-glow">
                        <Icon
                          className="w-10 h-10 md:w-12 md:h-12 text-primary"
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="feature-title font-heading text-3xl md:text-5xl font-black uppercase tracking-tight text-foreground leading-tight">
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
                        Feature {feature.index}
                      </span>
                    </div>
                  </div>

                  {/* Right side - Giant Stat */}
                  <div className="flex flex-col items-center justify-center relative">
                    {/* Background decorative number */}
                    <div className="absolute -top-10 -right-10 font-heading font-black text-[150px] md:text-[200px] text-border/10 select-none pointer-events-none">
                      {feature.index}
                    </div>

                    {/* Giant stat display */}
                    <div className="relative text-center">
                      <span className="feature-stat font-heading font-black text-7xl md:text-9xl text-primary leading-none block stat-counter">
                        {feature.stat}
                      </span>
                      <span className="feature-label font-mono text-xs md:text-sm uppercase tracking-wider text-muted-foreground block mt-2">
                        {feature.statLabel}
                      </span>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
