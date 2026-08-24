"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import type { UserRow } from "@/_features/gym-admin/users/hooks/useUsers"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"

interface ConfirmDeleteDialogProps {
  user: UserRow | null
  onCancel: () => void
  onConfirm: () => Promise<void>
}

export function ConfirmDeleteDialog({ user, onCancel, onConfirm }: ConfirmDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!user) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [user, onCancel])

  useBodyScrollLock(Boolean(user))

  if (!user) return null

  const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "este miembro"

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <button aria-label="Cancelar" onClick={onCancel} className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-lg border border-border bg-card p-4 shadow-2xl sm:p-6">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-destructive/15 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 id="confirm-delete-title" className="font-sans text-lg font-black uppercase tracking-tight text-foreground">
          Eliminar miembro
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {'¿Seguro que deseas eliminar '}
          <span className="font-semibold text-foreground">{fullName}</span>
          {'? Esta acción no se puede deshacer.'}
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="cursor-pointer disabled:opacity-50 border border-border px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-foreground hover:bg-secondary"
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