"use client";

import { MapPin, Clock, Navigation, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function LocationHours() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);

    const onFocus = () => setNow(new Date());
    window.addEventListener("focus", onFocus);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const hours = [
    {
      days: "Lunes - Viernes",
      hours: ["5:00 AM - 10:00 AM", "3:00 PM - 9:00 PM"],
    },
    { days: "Sábado", hours: ["5:00 AM - 11:00 AM"] },
    { days: "Domingo", hours: ["CERRADO (Recuperación)"], isClosed: true },
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const routeLineRef = useRef<SVGPathElement>(null);
  const locationPinRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const section = sectionRef.current;
    const mapContainer = mapContainerRef.current;
    const routeLine = routeLineRef.current;
    const locationPin = locationPinRef.current;

    if (!section || !mapContainer || !routeLine || !locationPin) return;

    // Animate route line drawing with pin
    const routeLength = routeLine.getTotalLength();
    routeLine.style.strokeDasharray = String(routeLength);
    routeLine.style.strokeDashoffset = String(routeLength);

    const mainTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 100%",
        end: "bottom 50%",
        scrub: 1,
      },
    });

    // Phase 1: Draw the route line
    mainTimeline.to(routeLine, {
      strokeDashoffset: 0,
      duration: 1,
      ease: "power2.inOut",
    });

    // Phase 2: Show location pin with bounce
    mainTimeline.to(
      locationPin,
      {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "back.out(1.7)",
      },
      "-=0.3"
    );

    // Set initial states
    gsap.set(locationPin, { scale: 0, opacity: 0 });

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  const WEEKDAYS: readonly string[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getCostaRicaTime = (date: Date) => {
    // Nunca parsear strings de fecha: Chromium rechaza "2026-8-21" (sin
    // zero-padding) con Invalid Date. El día sale directo del formatter.
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Costa_Rica",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });

    const parts = formatter.formatToParts(date);
    const values = Object.fromEntries(
      parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
    ) as Record<string, string>;

    return {
      dayIndex: WEEKDAYS.indexOf(values.weekday),
      totalMinutes: Number(values.hour) * 60 + Number(values.minute),
    };
  };

  const currentCostaRicaTime = getCostaRicaTime(now);

  const isOpenNow = (() => {
    const { dayIndex, totalMinutes } = currentCostaRicaTime;

    if (dayIndex === 0) return false;

    if (dayIndex >= 1 && dayIndex <= 5) {
      return (
        (totalMinutes >= 5 * 60 && totalMinutes < 10 * 60) ||
        (totalMinutes >= 15 * 60 && totalMinutes < 21 * 60)
      );
    }

    if (dayIndex === 6) {
      return totalMinutes >= 5 * 60 && totalMinutes < 11 * 60;
    }

    return false;
  })();

  const statusClasses = isOpenNow
    ? "border-primary/40 bg-background/80 text-primary"
    : "border-red-500/40 bg-red-500/5 text-red-500";

  const statusDotClasses = isOpenNow ? "bg-primary" : "bg-red-500";
  const statusLabel = isOpenNow ? "Abierto Ahora" : "Cerrado Ahora";

  return (
    <section
      id="location"
      ref={sectionRef}
      className="relative z-0 py-28 bg-background px-6 overflow-hidden border-t border-border/60 lg:min-h-[100svh] lg:flex lg:flex-col lg:justify-center lg:py-14"
    >
      {/* ░░ Background — a soft "beacon" spotlight, no grid ░░ */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Central beacon glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-125 bg-primary/6 blur-[140px] rounded-full" />
        {/* Two faint corner washes for depth */}
        <div className="absolute top-0 left-1/4 w-100 h-100 bg-secondary/6 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-100 h-100 bg-accent/6 blur-[120px] rounded-full" />
        {/* Top hairline divider */}
        <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* ░░ Section header (site pattern: chip + H2 + SVG underline + desc) ░░ */}
        <div className="text-center mb-20 lg:mb-10">

          <h2 className="font-heading text-4xl md:text-6xl font-black uppercase text-foreground mb-6 leading-[0.95]">
            Encuéntranos{" "}
            <span className="text-primary relative inline-block">
              Aquí
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
            Estratégicamente ubicado para máxima accesibilidad. Nuestra instalación es una
            fortaleza de disciplina.
          </p>
        </div>

        <div className="relative w-full h-[70vh] lg:h-[52vh] rounded-2xl overflow-hidden bg-card border border-border">
          {/* Map/Visual with animated route - full section */}
          <div
            ref={mapContainerRef}
            className="absolute inset-0 w-full h-full"
          >
            {/* Image overlay */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524813686514-a57563d77965?q=80&w=2232&auto=format&fit=crop')] bg-cover bg-center grayscale opacity-30 group-hover:opacity-40 group-hover:grayscale-0 transition-all duration-700" />

            {/* Map grid overlay — a real map canvas, so a grid reads as a blueprint */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
                backgroundSize: "32px 32px",
                mixBlendMode: "overlay",
              }}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

            {/* Animated Route Line SVG */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 800 600"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Route line - Monster Energy Green */}
              <path
                ref={routeLineRef}
                d="M 100 500 Q 200 400 300 350 T 500 200"
                stroke="#96D906"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                filter="url(#glow)"
                style={{ opacity: 0.9 }}
              />
              {/* Route dots */}
              <circle cx="100" cy="500" r="6" fill="#96D906" opacity="0.6" />
              <circle cx="300" cy="350" r="6" fill="#96D906" opacity="0.6" />
              <circle cx="500" cy="200" r="6" fill="#96D906" opacity="0.6" />
            </svg>

            {/* Location Pin - animated appearance */}
            <div
              ref={locationPinRef}
              className="absolute top-[33%] right-[37%] flex flex-col items-center pointer-events-none"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/50 blur-xl rounded-full animate-pulse" />
                <div className="relative bg-primary p-3 rounded-full shadow-2xl shadow-primary/40">
                  <MapPin className="w-6 h-6 text-black" strokeWidth={2.5} />
                </div>
              </div>
              {/* Pulse rings */}
              <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
            </div>

            {/* Open-now status pill */}
            <div
              className={`absolute top-5 left-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border ${statusClasses}`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isOpenNow ? "animate-ping bg-primary" : "animate-ping bg-red-500"
                    }`}
                />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${statusDotClasses}`} />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
                {statusLabel}
              </span>
            </div>

            {/* Location card - static - desktop only */}
            <div className="absolute bottom-6 left-6 p-6 rounded-xl bg-background/90 backdrop-blur-md border border-primary/30 shadow-2xl shadow-primary/20 group-hover:border-primary/60 group-hover:shadow-primary/30 transition-all duration-500 max-w-sm lg:block hidden">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  <MapPin className="w-6 h-6" strokeWidth={2} />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-2xl uppercase tracking-widest text-foreground mb-2">
                    Gym Ulate
                  </h3>
                  <p className="font-mono text-muted-foreground text-sm leading-relaxed">
                    Av. Central
                    <br />
                    Cañas, Guanacaste, Costa Rica
                  </p>
                </div>
                <div className="hidden sm:block">
                  <a
                    href="#"
                    className="p-3 rounded-xl bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 border border-secondary-foreground/30 transition-all duration-300 group/btn"
                    aria-label="Get directions"
                  >
                    <Navigation
                      className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform duration-300"
                      strokeWidth={2}
                    />
                  </a>
                </div>
              </div>
            </div>

            {/* Hover glow */}
            <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-all duration-700 bg-primary/40" />

            {/* Static Hours Panel - positioned on the right side - desktop only */}
            <div className="hidden lg:block absolute top-6 right-6 bottom-6 w-72 bg-background/95 backdrop-blur-md border border-primary/30 rounded-xl p-6 shadow-2xl shadow-primary/20 overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/20 text-primary">
                  <Clock className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg uppercase tracking-widest text-foreground">
                    Horarios
                  </h3>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    Entrena cuando te convenga
                  </p>
                </div>
              </div>

              <ul className="space-y-3 font-mono text-xs">
                {hours.map((item, idx) => (
                  <li
                    key={idx}
                    className={`flex flex-col justify-between py-2 border-b border-border/20 last:border-0 ${item.isClosed ? "text-primary" : ""
                      }`}
                  >
                    <span
                      className={`font-medium ${item.isClosed ? "font-bold opacity-70" : "text-muted-foreground"
                        }`}
                    >
                      {item.days}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      {item.hours.map((hour, hIdx) => (
                        <span
                          key={hIdx}
                          className={`${item.isClosed ? "font-bold" : "text-foreground font-medium"
                            }`}
                        >
                          {hour}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-4 pt-4 border-t border-border/20 flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                <Zap className="w-3 h-3 text-primary" strokeWidth={2} />
                <span>Acceso Premium 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Cards - below map */}
        <div className="lg:hidden mt-6 flex flex-col gap-4">
          {/* Location card */}
          <div className="p-6 rounded-xl bg-background/95 backdrop-blur-md border border-primary/30 shadow-2xl shadow-primary/20 overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/20 text-primary">
                <MapPin className="w-6 h-6" strokeWidth={2} />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-2xl uppercase tracking-widest text-foreground mb-2">
                  Gym Ulate
                </h3>
                <p className="font-mono text-muted-foreground text-sm leading-relaxed">
                  123 Iron Avenue
                  <br />
                  Industrial District, Sector 7
                </p>
              </div>
            </div>
          </div>

          {/* Hours card */}
          <div className="p-6 rounded-xl bg-background/95 backdrop-blur-md border border-primary/30 shadow-2xl shadow-primary/20 overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/20 text-primary">
                <Clock className="w-5 h-5" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg uppercase tracking-widest text-foreground">
                  Horarios
                </h3>
                <p className="font-mono text-[10px] text-muted-foreground">
                  Entrena cuando te convenga
                </p>
              </div>
            </div>

            <ul className="space-y-3 font-mono text-xs">
              {hours.map((item, idx) => (
                <li
                  key={idx}
                  className={`flex flex-col justify-between py-2 border-b border-border/20 last:border-0 ${item.isClosed ? "text-primary" : ""
                    }`}
                >
                  <span
                    className={`font-medium ${item.isClosed ? "font-bold opacity-70" : "text-muted-foreground"
                      }`}
                  >
                    {item.days}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {item.hours.map((hour, hIdx) => (
                      <span
                        key={hIdx}
                        className={`${item.isClosed ? "font-bold" : "text-foreground font-medium"
                          }`}
                      >
                        {hour}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-border/20 flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
              <Zap className="w-3 h-3 text-primary" strokeWidth={2} />
              <span>24/7 Premium Access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}