"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";

/*
 * OPCIÓN B — 3D Parallax Unfurling Gallery
 * (inspirado en 3D Parallax Unfurling Gallery de 21st.dev)
 * Grid que se "despliega" con rotación 3D de matrix mientras las columnas
 * viajan a velocidades distintas (parallax offsets). Scroll-linked SIN pin:
 * el progreso mapea ["start end" → "end start"], así que no consume un pin
 * de la landing (ya hay 2: story + differences).
 */

const columns: { images: { src: string; alt: string; label: string }[] }[] = [
  {
    images: [
      {
        src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=900&auto=format&fit=crop",
        alt: "Piso principal del gimnasio",
        label: "Piso Principal",
      },
      {
        src: "https://images.unsplash.com/photo-1596357395104-14a5ae9cdade?q=80&w=900&auto=format&fit=crop",
        alt: "Máquina hack squat",
        label: "Hack Squat",
      },
      {
        src: "https://images.unsplash.com/photo-1581009146115-b3596887cf26?q=80&w=900&auto=format&fit=crop",
        alt: "Entrenamiento con barra",
        label: "Hierro",
      },
    ],
  },
  {
    images: [
      {
        src: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=900&auto=format&fit=crop",
        alt: "Rack de mancuernas",
        label: "Arsenal Libre",
      },
      {
        src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=900&auto=format&fit=crop",
        alt: "Cuerdas de batalla",
        label: "HIIT",
      },
    ],
  },
  {
    images: [
      {
        src: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=900&auto=format&fit=crop",
        alt: "Plataformas olímpicas",
        label: "Plataformas",
      },
      {
        src: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=900&auto=format&fit=crop",
        alt: "Cables y poleas",
        label: "Cables",
      },
      {
        src: "https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=900&auto=format&fit=crop",
        alt: "Deck de cardio",
        label: "Cardio Deck",
      },
    ],
  },
  {
    images: [
      {
        src: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=900&auto=format&fit=crop",
        alt: "Zona de recuperación",
        label: "Recuperación",
      },
      {
        src: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=900&auto=format&fit=crop",
        alt: "Mancuerna en el suelo del gimnasio",
        label: "Detalles",
      },
    ],
  },
];

/** Cada columna viaja a su propia velocidad mientras la matrix se despliega. */
function ParallaxColumn({
  column,
  index,
  progress,
}: {
  column: (typeof columns)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  // Offsets distintos por columna: las de los extremos viajan más que el centro.
  const y = useTransform(
    progress,
    [0, 1],
    [index % 2 === 0 ? 60 + index * 24 : 30 + index * 18, -(60 + index * 24)],
  );
  // Cada columna entra con su propio ángulo Y y se endereza al desplegarse.
  const rotateY = useTransform(progress, [0, 0.45], [(index - 1.5) * 9, 0]);

  return (
    <motion.div style={{ y, rotateY }} className="flex flex-col gap-4">
      {column.images.map((image, i) => (
        <figure
          key={image.label}
          className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-border bg-card"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.alt}
            loading="lazy"
            draggable={false}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
              i % 2 === 0 ? "" : "mt-0 translate-y-0"
            } grayscale-[0.6] group-hover:grayscale-0`}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-0 rounded-xl border border-primary/0 transition-colors duration-300 group-hover:border-primary/50" />
          <figcaption className="absolute inset-x-0 bottom-0 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/90">
              {image.label}
            </p>
          </figcaption>
        </figure>
      ))}
    </motion.div>
  );
}

export function GalleryUnfurling() {
  const sectionRef = useRef<HTMLElement>(null);

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
      id="gallery-unfurling"
      ref={sectionRef}
      className="relative overflow-hidden bg-background px-6 py-28"
    >
      {/* Capas de fondo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-secondary/5 blur-[120px]" />
        <div className="absolute left-0 right-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="container relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Opción B — Unfurling 3D
          </p>
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
            Scrolleá y dejá que la matrix se despliegue frente a vos.
          </p>
        </div>

        {/* Matrix 3D — perspectiva en el contenedor, columnas con parallax */}
        <div style={{ perspective: 1400 }}>
          <motion.div
            style={{ rotateX, scale, opacity, transformStyle: "preserve-3d" }}
            className="grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            {columns.map((column, i) => (
              <ParallaxColumn
                key={i}
                column={column}
                index={i}
                progress={scrollYProgress}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
