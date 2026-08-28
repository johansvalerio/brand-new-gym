"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
  type MotionValue,
} from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";


interface Slide {
  image: string;
  title: string;
  description: string;
  badge: string;
}

const slides: Slide[] = [
  {
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200&auto=format&fit=crop",
    title: "Zona de Fuerza",
    description: "Pesos libres y hierro pesado para ganancias serias.",
    badge: "Fuerza",
  },
  {
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop",
    title: "Circuito HIIT",
    description: "Intervalos de alta intensidad que queman calorías rápido.",
    badge: "Intensidad",
  },
  {
    image:
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200&auto=format&fit=crop",
    title: "Arena de Cardio",
    description: "Caminadoras, bicicletas y remo para resistencia.",
    badge: "Cardio",
  },
  {
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop",
    title: "Power Lifting",
    description: "Racks de sentadilla y plataformas construidas para levantamientos pesados.",
    badge: "Potencia",
  },
  {
    image:
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1200&auto=format&fit=crop",
    title: "Laboratorio de Recuperación",
    description: "Estira, moviliza y recupera como un profesional.",
    badge: "Recuperación",
  },
];

interface CarouselConfig {
  distanceDivisor: number;
  velocityDivisor: number;
  sensitivity: number;
  xMultiplier: number;
  yMultiplier: number;
  rotationMultiplier: number;
  scaleReduction: number;
}

const getCarouselConfig = (width: number): CarouselConfig => {
  if (width < 640) {
    return {
      distanceDivisor: 120,
      velocityDivisor: 900,
      sensitivity: 180,
      xMultiplier: 90,
      yMultiplier: 20,
      rotationMultiplier: 8,
      scaleReduction: 0.06,
    };
  }
  if (width < 1024) {
    return {
      distanceDivisor: 160,
      velocityDivisor: 1100,
      sensitivity: 220,
      xMultiplier: 130,
      yMultiplier: 30,
      rotationMultiplier: 10,
      scaleReduction: 0.09,
    };
  }
  return {
    distanceDivisor: 200,
    velocityDivisor: 1300,
    sensitivity: 250,
    xMultiplier: 170,
    yMultiplier: 40,
    rotationMultiplier: 12,
    scaleReduction: 0.12,
  };
};

const CarouselStacked = () => {
  const scrollProgress = useMotionValue(0);
  const startProgress = React.useRef(0);
  const [windowWidth, setWindowWidth] = React.useState(0);
  const [activeIdx, setActiveIdx] = React.useState(0);

  const total = slides.length;

  /* Índice de la tarjeta del centro — alimenta el caption inferior */
  React.useEffect(() => {
    return scrollProgress.on("change", (v) => {
      const idx = ((Math.round(v) % total) + total) % total;
      setActiveIdx((prev) => (prev === idx ? prev : idx));
    });
  }, [scrollProgress, total]);

  React.useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const config = React.useMemo(
    () => getCarouselConfig(windowWidth),
    [windowWidth],
  );

  const handleDragStart = () => {
    startProgress.current = scrollProgress.get();
  };

  const moveByCard = (direction: number) => {
    const current = Math.round(scrollProgress.get());
    animate(scrollProgress, current + direction, {
      type: "spring",
      stiffness: 150,
      damping: 26,
      mass: 0.85,
    });
  };

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const dragDistance = info.offset.x;
    const velocity = info.velocity.x;

    const distanceShift = -dragDistance / config.distanceDivisor;
    const velocityShift = -velocity / config.velocityDivisor;

    let totalShift = Math.round(distanceShift + velocityShift);
    const maxShift = total - 1;
    totalShift = Math.max(-maxShift, Math.min(maxShift, totalShift));

    const target = Math.round(startProgress.current) + totalShift;

    animate(scrollProgress, target, {
      type: "spring",
      stiffness: 150,
      damping: 26,
      mass: 0.85,
    });
  };

  return (
    <section id="equipment" className="relative py-28 bg-background overflow-hidden select-none">
      {/* Background Layer System */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent/5 blur-[100px] rounded-full" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Arsenal
            </span>
          </div>
          <h2 className="font-heading text-4xl md:text-6xl font-black uppercase text-foreground mb-6 leading-[0.95]">
            Desliza por{" "}
            <span className="text-primary relative inline-block">
              El Deck
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-primary/40"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
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
            Desliza o arrastra para recorrer cada rincón de nuestras instalaciones.
          </p>
        </div>

        {/* Stacked Carousel */}
        <div className="relative w-full h-80 sm:h-112 lg:h-128 flex items-center justify-center">
          <button
            type="button"
            aria-label="Ver tarjeta anterior"
            onClick={() => moveByCard(-1)}
            className="absolute left-4 lg:left-10 z-[60] hidden lg:flex size-12 items-center justify-center rounded-full border border-border/70 bg-background/80 text-foreground shadow-lg backdrop-blur-md transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronLeft className="size-6" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Ver siguiente tarjeta"
            onClick={() => moveByCard(1)}
            className="absolute right-4 lg:right-10 z-[60] hidden lg:flex size-12 items-center justify-center rounded-full border border-border/70 bg-background/80 text-foreground shadow-lg backdrop-blur-md transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ChevronRight className="size-6" aria-hidden="true" />
          </button>

          {/* Transparent Drag Surface */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDrag={(_, info) => {
              const dragProgress = -info.offset.x / config.sensitivity;
              const maxProgress = total - 1;
              const controlledProgress = Math.max(
                -maxProgress,
                Math.min(maxProgress, dragProgress),
              );
              scrollProgress.set(startProgress.current + controlledProgress);
            }}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing"
          />

          {slides.map((slide, i) => (
            <Card
              key={i}
              slide={slide}
              index={i}
              total={total}
              progress={scrollProgress}
              config={config}
            />
          ))}
        </div>

        {/* Caption — como en el coverflow: el texto vive debajo del mazo
            y cambia con fade cuando la tarjeta activa gira */}
        <div className="mt-12 min-h-[92px] px-6 text-center">
          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <p className="font-heading text-lg font-bold uppercase tracking-wide text-foreground">
              {slides[activeIdx].title}
            </p>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              {slides[activeIdx].description}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

interface CardProps {
  slide: Slide;
  index: number;
  total: number;
  progress: MotionValue<number>;
  config: CarouselConfig;
}

const Card = ({ slide, index, total, progress, config }: CardProps) => {
  const offset = useTransform(progress, (p) => {
    let diff = (index - p) % total;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  });

  const x = useTransform(offset, (o) => o * config.xMultiplier);
  const rotate = useTransform(offset, (o) => {
    const absO = Math.abs(o);
    if (absO < 0.05) return 0;
    return o * config.rotationMultiplier;
  });
  const y = useTransform(offset, (o) => {
    const absO = Math.abs(o);
    if (absO < 0.05) return 0;
    return absO * config.yMultiplier;
  });
  const scale = useTransform(
    offset,
    (o) => 1 - Math.abs(o) * config.scaleReduction,
  );
  const opacity = useTransform(
    offset,
    [-total / 2, -total / 2 + 0.5, 0, total / 2 - 0.5, total / 2],
    [0, 1, 1, 1, 0],
  );
  const zIndex = useTransform(offset, (o) =>
    Math.round(100 - Math.abs(o) * 10),
  );

  return (
    <motion.div
      style={{
        x,
        rotate,
        y,
        scale,
        opacity,
        zIndex,
      }}
      className={cn(
        "absolute rounded-2xl overflow-hidden bg-muted group pointer-events-none",
        "w-56 h-72 sm:w-72 sm:h-96 lg:w-80 lg:h-[30rem]",
      )}
    >
      <img
        src={slide.image}
        alt={slide.title}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-110"
      />

      <motion.div
        style={{
          opacity: useTransform(
            offset,
            [-2, -0.5, 0, 0.5, 2],
            [0.5, 0.2, 0, 0.2, 0.5],
          ),
        }}
        className="absolute inset-0 bg-black pointer-events-none"
      />

      <span className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-7 lg:right-7 rounded-full bg-white/95 px-3 py-1 sm:px-4 sm:py-1.5 text-sm sm:text-base font-bold uppercase tracking-widest text-black backdrop-blur-md">
        {slide.badge}
      </span>
    </motion.div>
  );
};

export default CarouselStacked;
