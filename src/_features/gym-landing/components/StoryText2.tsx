"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PHRASES = [
  "GYM ULATE",
  "EL DOLOR ES TEMPORAL.",
  "EL ORGULLO ES PARA SIEMPRE.",
  "ROMPE TUS LÍMITES.",
  "FORJA TU LEGADO.",
];

export function StoryText2() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const phrases = gsap.utils.toArray<HTMLElement>(".phrase");
        const totalPhrases = phrases.length;

        // Set initial states: first phrase visible, rest off-screen.
        phrases.forEach((phrase, i) => {
          const words = phrase.querySelectorAll<HTMLElement>(".word");
          if (i === 0) {
            gsap.set(phrase, { x: "0%", opacity: 1 });
            gsap.set(words, { color: "#ffffff", scale: 1, filter: "blur(0px)" });
          } else {
            gsap.set(phrase, { x: "-120%", opacity: 0 });
            gsap.set(words, { color: "#ffffff", scale: 1.4, filter: "blur(14px)" });
          }
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: `+=${totalPhrases * 900}`,
            scrub: 1.2,
            pin: true,
            pinSpacing: true,
          },
        });

        phrases.forEach((phrase, i) => {
          const words = phrase.querySelectorAll<HTMLElement>(".word");
          const isLast = i === totalPhrases - 1;

          if (i === 0) {
            // First phrase: words slam in with force (scale + blur → sharp).
            tl.to(words, {
              scale: 1,
              filter: "blur(0px)",
              color: "#96D906",
              stagger: 0.06,
              duration: 0.5,
              ease: "power4.out",
            });
            // A hard "punch" — the whole phrase overshoots then settles.
            tl.to(phrase, {
              scale: 0.97,
              duration: 0.12,
              ease: "power2.in",
            });
            tl.to(phrase, {
              scale: 1,
              duration: 0.35,
              ease: "back.out(2.5)",
            });
            tl.to({}, { duration: 0.4 });
            tl.to(phrase, { x: "120%", opacity: 0, duration: 0.35, ease: "power2.in" });
          } else if (isLast) {
            // Last phrase: slam in and hold.
            tl.to(phrase, { x: "0%", opacity: 1, duration: 0.3, ease: "power2.out" });
            tl.to(words, {
              scale: 1,
              filter: "blur(0px)",
              color: "#96D906",
              stagger: 0.06,
              duration: 0.5,
              ease: "power4.out",
            });
            tl.to(phrase, {
              scale: 0.97,
              duration: 0.12,
              ease: "power2.in",
            });
            tl.to(phrase, {
              scale: 1,
              duration: 0.35,
              ease: "back.out(2.5)",
            });
            tl.to({}, { duration: 0.8 });
          } else {
            tl.to(phrase, { x: "0%", opacity: 1, duration: 0.3, ease: "power2.out" });
            tl.to(words, {
              scale: 1,
              filter: "blur(0px)",
              color: "#96D906",
              stagger: 0.06,
              duration: 0.5,
              ease: "power4.out",
            });
            tl.to(phrase, {
              scale: 0.97,
              duration: 0.12,
              ease: "power2.in",
            });
            tl.to(phrase, {
              scale: 1,
              duration: 0.35,
              ease: "back.out(2.5)",
            });
            tl.to({}, { duration: 0.4 });
            tl.to(phrase, { x: "120%", opacity: 0, duration: 0.35, ease: "power2.in" });
            tl.set(phrase, { x: "-120%", opacity: 0 });
          }
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef },
  );

  return (
    <section ref={containerRef} className="relative bg-black overflow-hidden">
      <div className="h-screen flex flex-col items-center justify-center relative">
        <ConstellationBackground />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-0">
          <div className="w-[60vw] h-[40vh] rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <div className="pointer-events-none absolute inset-0 z-0 opacity-50">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#000_75%)]" />
        </div>

        {/* Franja a altura completa: cada frase centra su bloque (1..N líneas)
            en el medio real de la pantalla — antes el wrapper medía 0px de alto
            y las frases multilínea se apilaban hacia abajo del centro. */}
        <div className="pointer-events-none absolute inset-0 z-20 px-4 sm:px-8">
          {PHRASES.map((phrase, i) => (
            <div
              key={i}
              className="phrase absolute inset-0 flex flex-wrap items-center justify-center content-center text-center"
              aria-label={phrase}
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              {phrase.split(" ").map((word, wi) => (
                <span
                  key={wi}
                  className="word inline-block font-heading font-black uppercase leading-[0.95] whitespace-nowrap mx-2 sm:mx-3"
                  style={{
                    fontSize: "clamp(2.5rem, 8vw, 7.5rem)",
                    color: "#ffffff",
                    textShadow: "0 0 40px rgba(150, 217, 6, 0.08)",
                  }}
                >
                  {word}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}