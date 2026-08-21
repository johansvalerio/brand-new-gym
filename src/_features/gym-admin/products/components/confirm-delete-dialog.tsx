"use client"

import { useEffect, useState } from "react"
import { AlertTriangle } from "lucide-react"
import type { ProductRow } from "@/_features/gym-admin/products/hooks/useProducts"

interface ConfirmDeleteDialogProps {
  product: ProductRow | null
  onCancel: () => void
  onConfirm: () => Promise<void>
}

export function ConfirmDeleteDialog({ product, onCancel, onConfirm }: ConfirmDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!product) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [product, onCancel])

  if (!product) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-24"
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
          Eliminar producto
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {'¿Seguro que deseas eliminar '}
          <span className="font-semibold text-foreground">{product.product_name}</span>
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
