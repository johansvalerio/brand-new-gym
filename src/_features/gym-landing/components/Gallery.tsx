"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Camera, ChevronLeft, ChevronRight, X } from "lucide-react";

/*
 * Gallery — fusión: animación unfurling 3D (matrix que se despliega con el
 * scroll + columnas con parallax a distintas velocidades) con la ritmica del
 * bento (tiles de alturas desiguales dentro de cada columna). El parallax
 * opera por columna, así que no hay spans cruzados: la desigualdad vive en
 * los aspect-ratios de cada tile.
 *
 * Lightbox: click en un tile → la imagen DESPEGA de la matrix (entra con la
 * inclinación del mundo 3D y vuela al frente enderezándose con spring).
 * Sin layoutId: los tiles viven bajo transforms 3D — el morphing glitchea.
 */

interface Tile {
  src: string;
  alt: string;
  title: string;
  desc: string;
  aspect: string;
}

const columns: Tile[][] = [
  [
    {
      src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1400&auto=format&fit=crop",
      alt: "Interior principal del gimnasio con zona de pesos libres",
      title: "El Piso Principal",
      desc: "5,000 m² de hierro y disciplina",
      aspect: "aspect-[3/4]",
    },
    {
      src: "https://images.unsplash.com/photo-1596357395104-14a5ae9cdade?q=80&w=900&auto=format&fit=crop",
      alt: "Máquina de hack squat",
      title: "Hack Squat",
      desc: "Aislamiento elite",
      aspect: "aspect-[16/10]",
    },
  ],
  [
    {
      src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=900&auto=format&fit=crop",
      alt: "Rack de mancuernas ordenadas por peso",
      title: "Arsenal Libre",
      desc: "Mancuernas de 2 a 60 kg",
      aspect: "aspect-square",
    },
    {
      src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=900&auto=format&fit=crop",
      alt: "Atleta entrenando con cuerdas de batalla",
      title: "Circuito HIIT",
      desc: "Alta intensidad",
      aspect: "aspect-[4/5]",
    },
  ],
  [
    {
      src: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=900&auto=format&fit=crop",
      alt: "Plataformas olímpicas con barras Eleiko",
      title: "Plataformas",
      desc: "Especificación de competencia",
      aspect: "aspect-[16/10]",
    },
    {
      src: "https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=900&auto=format&fit=crop",
      alt: "Deck de cardio con pantallas de datos",
      title: "Cardio Deck",
      desc: "Datos en vivo",
      aspect: "aspect-[4/5]",
    },
  ],
  [
    {
      src: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=900&auto=format&fit=crop",
      alt: "Zona de recuperación y movilidad",
      title: "Recuperación",
      desc: "Hielo y sauna",
      aspect: "aspect-square",
    },
    {
      src: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=900&auto=format&fit=crop",
      alt: "Zona de cables y poleas duales",
      title: "Cables",
      desc: "Precisión dual",
      aspect: "aspect-[4/5]",
    },
  ],
];

/** Tiles aplanados para navegar el lightbox. */
const flatTiles: Tile[] = columns.flat();

/** Columna con velocidad de parallax propia y despliegue en Y propio. */
function ParallaxColumn({
  tiles,
  columnIndex,
  progress,
  onSelect,
}: {
  tiles: Tile[];
  columnIndex: number;
  progress: MotionValue<number>;
  onSelect: (flatIndex: number) => void;
}) {
  // Las columnas externas viajan más que las centrales — offsets desiguales.
  const spread = columnIndex === 0 || columnIndex === columns.length - 1 ? 1.4 : 1;
  const y = useTransform(progress, [0, 1], [70 * spread, -(70 * spread)]);
  // Cada columna entra con su ángulo Y y se endereza al desplegar la matrix.
  const rotateY = useTransform(progress, [0, 0.45], [(columnIndex - 1.5) * 9, 0]);

  return (
    <motion.div style={{ y, rotateY }} className="flex flex-col gap-4">
      {tiles.map((tile, i) => {
        const flatIndex = columns.slice(0, columnIndex).flat().length + i;
        return (
          <figure
            key={tile.title}
            role="button"
            tabIndex={0}
            aria-label={`Ver ${tile.title} en grande`}
            onClick={() => onSelect(flatIndex)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(flatIndex);
              }
            }}
            className={`group relative ${tile.aspect} cursor-zoom-in overflow-hidden rounded-xl border border-border bg-card outline-none focus-visible:ring-2 focus-visible:ring-primary`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tile.src}
              alt={tile.alt}
              loading="lazy"
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover grayscale-[0.6] transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
            <div className="pointer-events-none absolute inset-0 rounded-xl border border-primary/0 transition-colors duration-300 group-hover:border-primary/50" />
            <figcaption className="absolute inset-x-0 bottom-0 p-4">
              <p className="font-sans text-sm font-bold uppercase tracking-wide text-white transition-transform duration-300 group-hover:-translate-y-0.5">
                {tile.title}
              </p>
              <p className="mt-1 font-mono text-xs text-white/0 transition-colors duration-300 group-hover:text-white/70">
                {tile.desc}
              </p>
            </figcaption>
          </figure>
        );
      })}
    </motion.div>
  );
}

/** Lightbox — la imagen despega de la matrix y vuela al frente. */
function Lightbox({
  index,
  onClose,
  onNavigate,
}: {
  index: number;
  onClose: () => void;
  onNavigate: (next: number) => void;
}) {
  const tile = flatTiles[index];
  const prefersReduced = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const total = flatTiles.length;

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % total);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + total) % total);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, total, onClose, onNavigate]);

  const bigSrc = tile.src.replace(/w=\d+/, "w=2000");
  const counter = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  // Despegue: nace con la inclinación del mundo 3D y aterriza plana al frente.
  const takeoff = prefersReduced
    ? { opacity: 0 }
    : { opacity: 0, rotateX: 35, rotateY: -12, scale: 0.55, z: -500 };
  const landing = { opacity: 1, rotateX: 0, rotateY: 0, scale: 1, z: 0 };
  const flyBack = prefersReduced
    ? { opacity: 0 }
    : { opacity: 0, rotateX: 22, rotateY: 8, scale: 0.6, z: -420 };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${tile.title} — vista ampliada`}
      onClick={onClose}
    >
      <motion.figure
        initial={takeoff}
        animate={landing}
        exit={flyBack}
        transition={
          prefersReduced
            ? { duration: 0.2 }
            : { type: "spring", stiffness: 180, damping: 22 }
        }
        style={{ transformPerspective: 1400 }}
        className="relative max-h-[85vh] w-full max-w-4xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-xl border border-primary/50 shadow-[0_0_60px_rgba(150,217,6,0.2)]">
          <motion.img
            key={bigSrc}
            src={bigSrc}
            alt={tile.alt}
            initial={{ opacity: 0.4, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="max-h-[75vh] w-full object-contain bg-black"
            draggable={false}
          />
          {/* Pulso de glow al aterrizar — la firma táctica */}
          {!prefersReduced && (
            <motion.div
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="pointer-events-none absolute inset-0 rounded-xl border-2 border-primary"
            />
          )}
        </div>

        <figcaption className="mt-4 flex items-end justify-between gap-4 px-1">
          <div>
            <p className="font-sans text-base font-bold uppercase tracking-wide text-foreground">
              {tile.title}
            </p>
            <p className="mt-1 font-mono text-sm text-muted-foreground">{tile.desc}</p>
          </div>
          <p className="shrink-0 font-mono text-xs tracking-[0.3em] text-primary">{counter}</p>
        </figcaption>
      </motion.figure>

      {/* Controles */}
      <button
        ref={closeRef}
        type="button"
        aria-label="Cerrar vista ampliada"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-colors hover:border-destructive hover:text-destructive"
      >
        <X className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Foto anterior"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate((index - 1 + total) % total);
        }}
        className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-colors hover:border-primary hover:text-primary md:left-6"
      >
        <ChevronLeft className="size-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Foto siguiente"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate((index + 1) % total);
        }}
        className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-colors hover:border-primary hover:text-primary md:right-6"
      >
        <ChevronRight className="size-5" aria-hidden="true" />
      </button>
    </motion.div>
  );
}

export function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // La matrix se despliega: inclinada y pequeña al entrar → plana y completa.
  const rotateX = useTransform(scrollYProgress, [0, 0.4], [26, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.4], [0.82, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [0.3, 1]);

  return (
    <section
      id="gallery"
      ref={sectionRef}
      className="relative overflow-hidden bg-background px-6 py-28"
    >
      {/* Capas de fondo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute left-1/4 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/5 blur-[120px]" />
        <div className="absolute left-0 right-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto max-w-6xl">
        {/* Header — patrón section: centrado + keyword subrayada, sin chip */}
        <div className="mb-16 text-center">
          <h2 className="mb-6 font-heading text-4xl font-black uppercase leading-[0.95] text-foreground md:text-6xl">
            Recorre Nuestras{" "}
            <span className="relative inline-block text-primary">
              Instalaciones
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
            Scrolleá y dejá que la matrix se despliegue. Hacé click en una foto
            para verla de cerca.
          </p>
        </div>

        {/* Matrix 3D: perspective en el contenedor, columnas con parallax,
            tiles bento de alturas desiguales adentro */}
        <div style={{ perspective: 1400 }}>
          <motion.div
            style={{ rotateX, scale, opacity, transformStyle: "preserve-3d" }}
            className="grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            {columns.map((tiles, i) => (
              <ParallaxColumn
                key={i}
                tiles={tiles}
                columnIndex={i}
                progress={scrollYProgress}
                onSelect={setSelected}
              />
            ))}
          </motion.div>
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Camera className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          Cañas, Guanacaste
        </p>
      </div>

      <AnimatePresence>
        {selected !== null && (
          <Lightbox
            index={selected}
            onClose={() => setSelected(null)}
            onNavigate={setSelected}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
