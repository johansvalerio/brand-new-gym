"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function FinalCTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const { navigate } = usePageTransition();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
        },
      });

      tl.from(".cta-tag", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
      })
        .from(
          ".cta-title .word",
          {
            y: 80,
            opacity: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: "power4.out",
          },
          "-=0.2",
        )
        .from(
          ".cta-desc",
          {
            y: 30,
            opacity: 0,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.4",
        )
        .from(
          ".cta-btn-wrap",
          {
            scale: 0.85,
            opacity: 0,
            duration: 0.6,
            ease: "back.out(1.8)",
          },
          "-=0.3",
        )
        .from(
          ".cta-underline",
          {
            scaleX: 0,
            duration: 0.8,
            ease: "power3.inOut",
            transformOrigin: "left",
          },
          "-=0.2",
        );

        /* Glitch lento sobre "Forjar" — la cadencia más calmada del sitio
           (el section ya tiene spotlight + pulso + entrada; aquí el glitch
           es susurro, no grito). Capas blanca + negra sobre el verde. */
        const mm = gsap.matchMedia();
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          gsap
            .timeline({ repeat: -1, repeatDelay: 3.8, delay: 2.2 })
            .to(".fc-glitch-main", { skewX: -5, x: 2, duration: 0.06 })
            .to(".fc-glitch-a", { autoAlpha: 1, x: -6, duration: 0.06 }, "<")
            .to(".fc-glitch-b", { autoAlpha: 1, x: 6, duration: 0.06 }, "<")
            .to([".fc-glitch-a", ".fc-glitch-b"], { autoAlpha: 0, x: 0, duration: 0.05 }, "+=0.08")
            .to(".fc-glitch-main", { skewX: 0, x: 0, duration: 0.08 })
            .to(".fc-glitch-a", { autoAlpha: 1, x: 4, duration: 0.05 }, "+=0.14")
            .to(".fc-glitch-b", { autoAlpha: 1, x: -4, duration: 0.05 }, "<")
            .to([".fc-glitch-a", ".fc-glitch-b"], { autoAlpha: 0, x: 0, duration: 0.06 });
        });
        return () => mm.revert();
      },
      { scope: containerRef },
    );

  return (
    <section
      ref={containerRef}
      className="relative rounded-t-[2.5rem] bg-primary py-36 overflow-hidden flex items-center justify-center"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-60 transition-transform duration-1000 ease-out"
        style={{
          background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(0,0,0,0.10) 0%, transparent 50%)`,
        }}
      />

      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-black/10 blur-[140px] rounded-full animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-black/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-black/5 blur-[100px] rounded-full" />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-black/20 to-transparent" />

        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px bg-gradient-to-b from-transparent via-black/10 to-transparent"
            style={{
              left: `${15 + i * 14}%`,
              top: "10%",
              height: "80%",
              opacity: 0.4 + i * 0.1,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-[0.05]">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="cta-grid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="black"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#cta-grid)" />
        </svg>
      </div>

      <div className="cta-content container relative z-10 text-center max-w-5xl px-6">


        <h2 className="cta-title font-heading text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase text-primary-foreground mb-8 leading-[0.9] tracking-tighter">
          <span className="block overflow-hidden">
            <span className="word inline-block">Listo para</span>
          </span>
          <span className="block overflow-hidden mt-2">
            <span className="word inline-block text-primary-foreground relative">
              <span className="relative inline-block">
                <span className="fc-glitch-main inline-block">Forjar</span>
                <span
                  aria-hidden="true"
                  className="fc-glitch-a absolute inset-0 text-white opacity-0"
                >
                  Forjar
                </span>
                <span
                  aria-hidden="true"
                  className="fc-glitch-b absolute inset-0 text-black/40 opacity-0"
                >
                  Forjar
                </span>
              </span>
              <svg
                className="cta-underline absolute -bottom-2 left-0 w-full h-4 text-black/50"
                viewBox="0 0 300 16"
                preserveAspectRatio="none"
              >
                <path
                  d="M2,10 C80,2 160,14 298,6"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </span>
          <span className="block overflow-hidden mt-2">
            <span className="word inline-block">Tu</span>{" "}
            <span className="word inline-block relative">
              <span className="relative z-10">Legado?</span>
              <span className="absolute inset-0 bg-black/10 -skew-x-12 scale-x-110 blur-sm" />
            </span>
          </span>
        </h2>

        <p className="cta-desc text-black/70 font-mono text-lg md:text-xl mb-14 max-w-2xl mx-auto leading-relaxed">
          Deja de excusas. Deja de esperar el lunes.{" "}
          <br className="hidden md:block" />
          <span className="text-black/90">
            Asegura tu lugar y únete a la revolución hoy.
          </span>
        </p>

        <div className="cta-btn-wrap inline-block relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-full opacity-0 group-hover:opacity-60 blur-lg transition-all duration-500 group-hover:duration-300" />
          <Button
            ref={buttonRef}
            size="lg"
            onClick={() => navigate('/auth/login')}
            className="relative bg-primary-foreground text-primary hover:bg-black/90 font-heading tracking-[0.2em] uppercase text-base md:text-lg px-12 md:px-16 h-16 md:h-20 rounded-none ring-2 ring-black ring-offset-4 ring-offset-primary focus-visible:ring-black hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-2xl shadow-black/30"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative z-10 flex items-center gap-3 md:gap-4">
              Comenzar Ahora
              <ArrowRight
                className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={2.5}
              />
            </span>
          </Button>
        </div>

        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 md:gap-12 text-black/70">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-black/80 to-black border-2 border-primary flex items-center justify-center font-heading text-[10px] md:text-xs font-black text-primary"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <span className="font-mono text-xs md:text-sm">
              <span className="text-black font-bold">2,500+</span> Miembros
            </span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-black/40" />
          <div className="flex items-center gap-2 font-mono text-xs md:text-sm">
            <span className="text-black">★★★★★</span>
            <span>
              <span className="text-black font-bold">4.9</span> Calificación
            </span>
          </div>
          <div className="hidden sm:block w-1 h-1 rounded-full bg-black/40" />
          <div className="flex items-center gap-2 font-mono text-xs md:text-sm">
            <svg
              className="w-4 h-4 text-black"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>
              Cancelar <span className="text-black font-bold">Cuando Quieras</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
