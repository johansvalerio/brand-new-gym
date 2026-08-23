"use client"

import { useEffect, useRef, useState } from "react"
import { X, User } from "lucide-react"
import type { Tables } from "@/types/database.types"

export type UserFormPayload = {
  first_name: string
  last_name: string | null
  email: string
  phone: string | null
  avatar: string | null
  role: NonNullable<Tables<"users">["role"]>
  coach_id: string | null
  membership_status: NonNullable<Tables<"users">["membership_status"]>
  membership_plan: NonNullable<Tables<"users">["membership_plan"]>
}

interface UserFormDialogProps {
  open: boolean
  user?: Tables<"users"> | null
  coaches?: { id: string; first_name: string | null; last_name: string | null }[]
  onClose: () => void
  onSubmit: (dto: UserFormPayload) => Promise<void>
}

type FormState = {
  first_name: string
  last_name: string
  email: string
  phone: string
  role: UserFormPayload["role"]
  coach_id: string
  membership_status: UserFormPayload["membership_status"]
  membership_plan: UserFormPayload["membership_plan"]
  avatar: string
}

const emptyForm: FormState = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  role: "user",
  coach_id: "",
  membership_status: "active",
  membership_plan: "basic",
  avatar: "",
}

export function UserFormDialog({ open, user, coaches = [], onClose, onSubmit }: UserFormDialogProps) {
  const isEdit = Boolean(user)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  // Sync form with the user being edited whenever the dialog opens.
  useEffect(() => {
    if (!open) return
    setErrors({})
    if (user) {
      setForm({
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
        role: user.role ?? "user",
        coach_id: user.coach_id ?? "",
        membership_status: user.membership_status ?? "active",
        membership_plan: user.membership_plan ?? "basic",
        avatar: user.avatar ?? "",
      })
    } else {
      setForm(emptyForm)
    }
    // Focus the first field for keyboard users.
    const t = setTimeout(() => firstFieldRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [open, user])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const validate = () => {
    const next: Record<string, string> = {}

    if (!form.first_name.trim()) next.first_name = "El nombre es obligatorio."
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Ingresa un email válido."
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim() || null,
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        avatar: form.avatar.trim() || null,
        role: form.role,
        coach_id: form.coach_id || null,
        membership_status: form.membership_status as UserFormPayload["membership_status"],
        membership_plan: form.membership_plan as UserFormPayload["membership_plan"],
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
      aria-labelledby="user-form-title"
    >
      {/* Overlay */}
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        {/* accent glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <User className="h-5 w-5" />
            </span>
            <div>
              <h2 id="user-form-title" className="font-sans text-lg font-black uppercase tracking-tight text-foreground">
                {isEdit ? "Editar miembro" : "Nuevo miembro"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEdit ? `ID #${user?.id}` : "Agregar al gimnasio"}
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

        <form onSubmit={handleSubmit} className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Nombre" htmlFor="first_name" error={errors.first_name}>
              <input
                ref={firstFieldRef}
                id="first_name"
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
                placeholder="Carlos"
                className={inputCls(errors.first_name)}
              />
            </Field>

            <Field label="Apellido (opcional)" htmlFor="last_name" error={errors.last_name}>
              <input
                id="last_name"
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
                placeholder="Ramírez"
                className={inputCls(errors.last_name)}
              />
            </Field>
          </div>

          <Field label="Email" htmlFor="email" error={errors.email}>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="carlos@email.com"
              className={inputCls(errors.email)}
            />
          </Field>

          <Field label="Teléfono" htmlFor="phone">
            <input
              id="phone"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+506 8888-1111"
              className={inputCls()}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Rol" htmlFor="role">
              <select
                id="role"
                value={form.role}
                onChange={(e) => set("role", e.target.value as UserFormPayload["role"])}
                className={inputCls()}
              >
                <option value="user">Usuario</option>
                <option value="coach">Coach</option>
                <option value="admin">Admin</option>
              </select>
            </Field>

            <Field label="Estado" htmlFor="membership_status">
              <select
                id="membership_status"
                value={form.membership_status}
                onChange={(e) => set("membership_status", e.target.value as UserFormPayload["membership_status"])}
                className={inputCls()}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="pending">Pendiente</option>
                <option value="expired">Expirado</option>
              </select>
            </Field>

            <Field label="Plan" htmlFor="membership_plan">
              <select
                id="membership_plan"
                value={form.membership_plan}
                onChange={(e) => set("membership_plan", e.target.value as UserFormPayload["membership_plan"])}
                className={inputCls()}
              >
                <option value="basic">Básico</option>
                <option value="premium">Premium</option>
                <option value="elite">Elite</option>
                <option value="day-pass">Day Pass</option>
              </select>
            </Field>
          </div>

          <Field label="Coach asignado (opcional)" htmlFor="coach_id">
            <select
              id="coach_id"
              value={form.coach_id}
              onChange={(e) => set("coach_id", e.target.value)}
              className={inputCls()}
            >
              <option value="">Sin coach</option>
              {coaches.map((coach) => {
                const name = `${coach.first_name ?? ""} ${coach.last_name ?? ""}`.trim() || "Coach"
                return (
                  <option key={coach.id} value={coach.id}>
                    {name}
                  </option>
                )
              })}
            </select>
          </Field>

          <Field label="URL de avatar (opcional)" htmlFor="avatar">
            <input
              id="avatar"
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
              {isSubmitting ? "Guardando..." : (isEdit ? "Guardar cambios" : "Crear miembro")}
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
    <label htmlFor={htmlFor} className="flex flex-col gap-2 text-sm text-foreground">
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
    error ? "border-destructive focus:border-destructive" : "border-border focus:border-primary focus:ring-2 focus:ring-primary/30",
  ].join(" ")
}