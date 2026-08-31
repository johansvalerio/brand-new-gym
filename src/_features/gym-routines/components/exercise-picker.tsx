"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import type { Tables } from "@/types/database.types"
import { MuscleIcon } from "./muscle-icon"
import { ExerciseChooser } from "./exercise-chooser"

type ExerciseRow = Tables<"exercises">

/**
 * Trigger del selector de ejercicios (abre el overlay ExerciseChooser).
 * El trigger muestra foto mini + nombre + músculo; el chooser es la pantalla
 * grande de selección. Sin lógica de persistencia adentro.
 */
export function ExercisePicker({
  catalog,
  value,
  onSelect,
}: {
  catalog: ExerciseRow[]
  value: number
  onSelect: (id: number) => void
}) {
  const [open, setOpen] = useState(false)
  const selected = catalog.find((e) => e.id === value) ?? null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-foreground outline-none transition-colors hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/30"
      >
        <ExerciseVisual exercise={selected} className="h-9 w-9" />
        <span className="min-w-0 flex-1 truncate text-left font-mono text-xs">
          {selected ? (
            <>
              <span className="text-foreground">{selected.name}</span>
              <span className="text-muted-foreground">
                {" "}· {selected.muscle_group}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">Selecciona ejercicio…</span>
          )}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      <ExerciseChooser
        open={open}
        catalog={catalog}
        value={value}
        onSelect={onSelect}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

/** Foto real si image_url existe; si no, icono de músculo como fallback. */
export function ExerciseVisual({
  exercise,
  className = "h-9 w-9",
}: {
  exercise: Tables<"exercises"> | null | undefined
  className?: string
}) {
  if (exercise?.image_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={exercise.image_url}
        alt={exercise.name}
        className={`${className} shrink-0 rounded-md border border-border bg-secondary object-cover`}
      />
    )
  }
  return (
    <span
      className={`${className} flex shrink-0 items-center justify-center rounded-md border border-border bg-primary/10 text-primary`}
    >
      <MuscleIcon group={exercise?.muscle_group ?? ""} className="h-5 w-5" />
    </span>
  )
}