"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import type { PlanRow } from "../hooks/usePlans"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"

export function PlanConfirmDeleteDialog({
  plan,
  onCancel,
  onConfirm,
}: {
  plan: PlanRow | null
  onCancel: () => void
  onConfirm: () => Promise<void>
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!plan) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [plan, onCancel])

  useBodyScrollLock(Boolean(plan))

  if (!plan) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="plan-confirm-delete-title"
    >
      <button
        aria-label="Cancelar"
        onClick={onCancel}
        className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm"
      />
      <div className="relative z-10 max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-lg border border-border bg-card p-4 shadow-2xl sm:p-6">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-destructive/15 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 id="plan-confirm-delete-title" className="font-sans text-lg font-black uppercase tracking-tight text-foreground">
          Eliminar plan
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {'¿Seguro que deseas eliminar '}
          <span className="font-semibold text-foreground">{plan.name}</span>
          {'? Esta acción no se puede deshacer y podría afectar a miembros con este plan.'}
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="cursor-pointer border border-border px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-foreground hover:bg-secondary disabled:opacity-50"
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
            className="cursor-pointer bg-destructive px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-white disabled:opacity-50 hover:bg-destructive/90"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  )
}