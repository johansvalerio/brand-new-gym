"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import type { ExpenseRow } from "../hooks/useExpenses"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"

interface ExpenseConfirmDeleteDialogProps {
  expense: ExpenseRow | null
  onCancel: () => void
  onConfirm: () => Promise<void>
}

export function ExpenseConfirmDeleteDialog({
  expense,
  onCancel,
  onConfirm,
}: ExpenseConfirmDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!expense) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [expense, onCancel])

  useBodyScrollLock(Boolean(expense))

  if (!expense) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-expense-title"
    >
      <button aria-label="Cancelar" onClick={onCancel} className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-lg border border-border bg-card p-4 shadow-2xl sm:p-6">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-destructive/15 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 id="confirm-delete-expense-title" className="font-sans text-lg font-black uppercase tracking-tight text-foreground">
          Eliminar egreso
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {"¿Seguro que deseas eliminar "}
          <span className="font-semibold text-foreground">{expense.description}</span>
          {"? Esta acción no se puede deshacer."}
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
            className="cursor-pointer bg-destructive px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-white hover:bg-destructive/90 disabled:opacity-50"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  )
}
