"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"
import type { WorkoutWithSets } from "../hooks/useWorkoutHistory"

interface WorkoutDeleteDialogProps {
  workout: WorkoutWithSets | null
  onCancel: () => void
  onConfirm: () => Promise<void>
}

export function WorkoutDeleteDialog({ workout, onCancel, onConfirm }: WorkoutDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!workout) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [workout, onCancel])

  useBodyScrollLock(Boolean(workout))

  if (!workout) return null

  const date = new Date(workout.started_at).toLocaleDateString("es-CR", { day: "numeric", month: "short", year: "numeric" })

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="confirm-delete-workout-title">
      <button aria-label="Cancelar" onClick={onCancel} className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-lg border border-border bg-card p-4 shadow-2xl sm:p-6">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-destructive/15 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 id="confirm-delete-workout-title" className="font-sans text-lg font-black uppercase tracking-tight text-foreground">
          Borrar entrenamiento
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          ¿Seguro que deseas borrar el entrenamiento del <span className="font-semibold text-foreground">{date}</span> ({workout.routines?.name ?? "Libre"})? Se borrarán también sus {workout.set_logs.length} series. Podrás rehacerlo luego.
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="cursor-pointer rounded-none border border-border px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            disabled={isDeleting}
            onClick={async () => {
              setIsDeleting(true)
              try {
                await onConfirm()
              } finally {
                setIsDeleting(false)
              }
            }}
            className="flex cursor-pointer items-center gap-2 rounded-none bg-destructive px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-white transition-all hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Borrando…
              </>
            ) : (
              "Borrar"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
