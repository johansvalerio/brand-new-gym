"use client"

import { useEffect, useRef, useState } from "react"
import { X, StickyNote } from "lucide-react"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"
import type { WorkoutWithSets } from "../hooks/useWorkoutHistory"

interface WorkoutNoteDialogProps {
  open: boolean
  workout: WorkoutWithSets | null
  onClose: () => void
  onSubmit: (notes: string | null) => Promise<void>
}

export function WorkoutNoteDialog({ open, workout, onClose, onSubmit }: WorkoutNoteDialogProps) {
  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open || !workout) return null

  return <WorkoutNoteInner key={workout.id} workout={workout} onClose={onClose} onSubmit={onSubmit} />
}

function WorkoutNoteInner({
  workout,
  onClose,
  onSubmit,
}: Omit<WorkoutNoteDialogProps, "open"> & { workout: WorkoutWithSets }) {
  const [notes, setNotes] = useState(() => workout.notes ?? "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const firstFieldRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const t = setTimeout(() => firstFieldRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(notes.trim() || null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="workout-note-title">
      <button aria-label="Cerrar" onClick={onClose} className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <StickyNote className="h-5 w-5" />
            </span>
            <div>
              <h2 id="workout-note-title" className="font-sans text-lg font-black uppercase tracking-tight text-foreground">
                Editar nota
              </h2>
              <p className="text-xs text-muted-foreground">
                {new Date(workout.started_at).toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" })} · {workout.routines?.name ?? "Libre"}
              </p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:h-8 sm:w-8">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="workout_notes" className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Nota del entrenamiento
            </label>
            <textarea
              ref={firstFieldRef}
              id="workout_notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Cómo te sentiste, qué mejorar..."
              className="w-full resize-none rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="sticky bottom-0 -mx-4 mt-2 flex items-center justify-end gap-3 border-t border-border bg-card px-4 py-3 sm:-mx-6 sm:px-6">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="cursor-pointer rounded-none border border-border px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              {isSubmitting ? "Guardando..." : "Guardar nota"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
