"use client"

/**
 * Icono SVG por grupo muscular — ilustraciones de trazo propias (sin imágenes
 * de terceros). Self-hosted y en currentColor para adaptarse al tema neón.
 * Es el FALLBACK visual del picker mientras image_url sea NULL.
 */
export function MuscleIcon({
  group,
  className = "h-5 w-5",
}: {
  group: string
  className?: string
}) {
  const key = group.toLowerCase()
  const paths = MUSCLE_PATHS[key] ?? MUSCLE_PATHS.default

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}

const MUSCLE_PATHS: Record<string, string[]> = {
  // Pecho: silueta de pectoral (dos arcos convergentes + cintura)
  pecho: [
    "M4 6c0-1.5 1-2.5 2.5-2.5S9 4.5 9 6v2",
    "M20 6c0-1.5-1-2.5-2.5-2.5S15 4.5 15 6v2",
    "M9 8h6",
    "M12 11c-2.8 0-4.5 2.2-4.5 5-0.6 0-1-.4-1-1V9",
    "M12 11c2.8 0 4.5 2.2 4.5 5 .6 0 1-.4 1-1V9",
  ],
  // Espalda: espalda ancha (trapecio + dorsales en V)
  espalda: [
    "M6 14c-1.3.8-2 2-1.4 3.4",
    "M18 14c1.3.8 2 2 1.4 3.4",
    "M9 9c-1 0-1.6-.7-1.6-1.7V6",
    "M15 9c1 0 1.6-.7 1.6-1.7V6",
    "M6.5 7h11",
    "M8 20h8",
  ],
  // Piernas: muslos y pantorrillas (dos columnas)
  piernas: [
    "M9 4l1 4 1 2 1 4 1 4-1 2L10 18",
    "M15 4l-1 4-1 2-1 4-1 4 1 2 1-2",
  ],
  // Hombros: cápsula deltoidea (dos arcos)
  hombros: [
    "M4 12c2-1.6 5-1.6 7 0 2-1.6 5-1.6 7 0",
    "M12 12v3",
    "M9.5 11c-.4 1.2-1.4 2-2.8 2",
    "M14.5 11c.4 1.2 1.4 2 2.8 2",
  ],
  // Brazos: bíceps flexionado (curva + antebrazo)
  brazos: [
    "M7 5c-1.2 2-.6 4.5 1.5 6.5",
    "M16.5 12.5c-2-1-3.8-.8-5 0",
    "M17 11v2.5c0 2-1.2 4-3 5.5",
    "M7 8.5c1.8 0 3-.6 4-1.5",
  ],
  // Core: abdomen (hexágono con líneas)
  core: [
    "M9 4h6l2.5 3-2.5 12.5L12 21l-3-1.5L6.5 7 9 4Z",
    "M8 8h8",
    "M8 12h8",
    "M8.5 16h7",
  ],
  // Fallback: mancuerna genérica
  default: [
    "M6.5 7v10",
    "M17.5 7v10",
    "M6.5 9h-3v6h3",
    "M17.5 9h3v6h-3",
    "M6.5 12h11",
  ],
}