"use client"

import { useEffect, useRef, useState } from "react"
import { X, User } from "lucide-react"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"
import type { Tables } from "@/types/database.types"

/**
 * Auto-edición del perfil propio: SOLO campos seguros (los datos básicos).
 * Sin email (identidad de login), sin rol, sin coach y sin estado de membresía
 * — esos los protege el RLS y los gestiona el admin.
 */
export type OwnProfilePayload = {
  first_name: string
  last_name: string | null
  phone: string | null
  avatar: string | null
  gender: Tables<"users">["gender"]
}

interface OwnProfileDialogProps {
  open: boolean
  profile: Pick<
    Tables<"users">,
    "first_name" | "last_name" | "phone" | "avatar" | "gender"
  >
  onClose: () => void
  onSubmit: (payload: OwnProfilePayload) => Promise<void>
}

type FormState = {
  first_name: string
  last_name: string
  phone: string
  avatar: string
  gender: Tables<"users">["gender"]
}

export function OwnProfileDialog({
  open,
  profile,
  onClose,
  onSubmit,
}: OwnProfileDialogProps) {
  useBodyScrollLock(open)
  const [form, setForm] = useState<FormState>({
    first_name: "",
    last_name: "",
    phone: "",
    avatar: "",
    gender: null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setErrors({})
    setForm({
      first_name: profile.first_name ?? "",
      last_name: profile.last_name ?? "",
      phone: profile.phone ?? "",
      avatar: profile.avatar ?? "",
      gender: profile.gender ?? null,
    })
    const t = setTimeout(() => firstFieldRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [open, profile])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const next: Record<string, string> = {}
    if (!form.first_name.trim()) next.first_name = "El nombre es obligatorio."
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim() || null,
        phone: form.phone.trim() || null,
        avatar: form.avatar.trim() || null,
        gender: form.gender,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="own-profile-form-title"
    >
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm"
      />

      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <User className="h-5 w-5" />
            </span>
            <div>
              <h2
                id="own-profile-form-title"
                className="font-sans text-lg font-black uppercase tracking-tight text-foreground"
              >
                Editar mi perfil
              </h2>
              <p className="text-xs text-muted-foreground">
                Tus datos básicos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:h-8 sm:w-8"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombre" htmlFor="own-first_name" error={errors.first_name}>
              <input
                ref={firstFieldRef}
                id="own-first_name"
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
                placeholder="Carlos"
                className={inputCls(errors.first_name)}
              />
            </Field>

            <Field label="Apellido (opcional)" htmlFor="own-last_name">
              <input
                id="own-last_name"
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
                placeholder="Ramírez"
                className={inputCls()}
              />
            </Field>
          </div>

          <Field label="Teléfono" htmlFor="own-phone">
            <input
              id="own-phone"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+506 8888-1111"
              className={inputCls()}
            />
          </Field>

          <Field label="Género" htmlFor="own-gender">
            <select
              id="own-gender"
              value={form.gender ?? ""}
              onChange={(e) =>
                set(
                  "gender",
                  e.target.value === ""
                    ? null
                    : (e.target.value as Tables<"users">["gender"]),
                )
              }
              className={inputCls()}
            >
              <option value="">Sin especificar</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
            </select>
          </Field>

          <Field label="URL de avatar (opcional)" htmlFor="own-avatar">
            <input
              id="own-avatar"
              value={form.avatar}
              onChange={(e) => set("avatar", e.target.value)}
              placeholder="https://..."
              className={inputCls()}
            />
          </Field>

          <div className="sticky bottom-0 -mx-4 mt-2 flex items-center justify-end gap-3 border-t border-border bg-card px-4 py-3 sm:-mx-6 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-none border border-border px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2 rounded-none bg-primary px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
            >
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="flex flex-col gap-2 text-sm text-foreground"
    >
      <span className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
  )
}

function inputCls(error?: string) {
  return [
    "w-full rounded-md border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60",
    error
      ? "border-destructive focus:border-destructive"
      : "border-border focus:border-primary focus:ring-2 focus:ring-primary/30",
  ].join(" ")
}