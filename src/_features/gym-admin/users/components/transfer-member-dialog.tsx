"use client"

import { useEffect, useState } from "react"
import { z } from "zod"
import { ArrowLeftRight } from "lucide-react"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"

const transferEmailSchema = z.string().trim().email("Ingresa un email válido.")

interface TransferMemberDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (email: string) => Promise<void>
}

export function TransferMemberDialog({ open, onClose, onConfirm }: TransferMemberDialogProps) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  useBodyScrollLock(open)

  if (!open) return null

  const handleConfirm = async () => {
    const parsed = transferEmailSchema.safeParse(email)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Email inválido")
      return
    }
    setError(null)
    setIsSubmitting(true)
    try {
      await onConfirm(parsed.data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-member-title"
    >
      <button aria-label="Cancelar" onClick={onClose} className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-lg border border-border bg-card p-4 shadow-2xl sm:p-6">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary/15 text-primary">
          <ArrowLeftRight className="h-6 w-6" />
        </div>
        <h2 id="transfer-member-title" className="font-sans text-lg font-black uppercase tracking-tight text-foreground">
          Transferir miembro
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Ingresa el email del miembro de otro gym. Se moverá a tu gym con
          membresía pendiente y datos desde cero.
        </p>
        <label htmlFor="transfer-member-email" className="mt-4 block font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Email del miembro
        </label>
        <input
          id="transfer-member-email"
          type="email"
          value={email}
          autoFocus
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError(null)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleConfirm()
          }}
          placeholder="miembro@ejemplo.com"
          className={`mt-2 w-full rounded-md border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/30 ${error ? "border-destructive" : "border-border"}`}
        />
        {error ? (
          <p className="mt-2 text-xs text-destructive">{error}</p>
        ) : null}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer disabled:opacity-50 border border-border px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-foreground hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            disabled={isSubmitting}
            onClick={() => void handleConfirm()}
            className="cursor-pointer bg-primary px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground disabled:opacity-50 hover:opacity-90"
          >
            {isSubmitting ? "Transfiriendo..." : "Transferir"}
          </button>
        </div>
      </div>
    </div>
  )
}
