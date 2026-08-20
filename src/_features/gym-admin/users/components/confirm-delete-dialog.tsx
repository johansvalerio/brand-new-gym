"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import type { User as UserType } from "@/_features/gym-admin/users/types"

interface ConfirmDeleteDialogProps {
  user: UserType | null
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDeleteDialog({ user, onCancel, onConfirm }: ConfirmDeleteDialogProps) {
  useEffect(() => {
    if (!user) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [user, onCancel])

  if (!user) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <button aria-label="Cancelar" onClick={onCancel} className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-destructive/15 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 id="confirm-delete-title" className="font-sans text-lg font-black uppercase tracking-tight text-foreground">
          Eliminar miembro
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {'¿Seguro que deseas eliminar '}
          <span className="font-semibold text-foreground">{user.user_first_name} {user.user_last_name}</span>
          {'? Esta acción no se puede deshacer.'}
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-none border border-border px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="cursor-pointer rounded-none bg-destructive px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:opacity-90"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}