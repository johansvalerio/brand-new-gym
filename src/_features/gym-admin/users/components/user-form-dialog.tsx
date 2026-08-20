"use client"

import { useEffect, useRef, useState } from "react"
import { X, User } from "lucide-react"
import type { CreateUserDto, User as UserType } from "@/_features/gym-admin/users/types"

interface UserFormDialogProps {
  open: boolean
  /** When present, the dialog is in "edit" mode and pre-fills its fields. */
  user?: UserType | null
  onClose: () => void
  onSubmit: (dto: CreateUserDto) => void
}

type FormState = {
  user_first_name: string
  user_last_name: string
  user_email: string
  user_phone: string
  user_membership_status: string
  user_membership_plan: string
  user_avatar: string
}

const emptyForm: FormState = {
  user_first_name: "",
  user_last_name: "",
  user_email: "",
  user_phone: "",
  user_membership_status: "active",
  user_membership_plan: "basic",
  user_avatar: "",
}

export function UserFormDialog({ open, user, onClose, onSubmit }: UserFormDialogProps) {
  const isEdit = Boolean(user)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const firstFieldRef = useRef<HTMLInputElement>(null)

  // Sync form with the user being edited whenever the dialog opens.
  useEffect(() => {
    if (!open) return
    setErrors({})
    if (user) {
      setForm({
        user_first_name: user.user_first_name,
        user_last_name: user.user_last_name,
        user_email: user.user_email,
        user_phone: user.user_phone,
        user_membership_status: user.user_membership_status,
        user_membership_plan: user.user_membership_plan,
        user_avatar: user.user_avatar ?? "",
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

  const set = (key: keyof FormState, value: string) => setForm((f) => ({ ...f, [key]: value }))

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.user_first_name.trim()) next.user_first_name = "El nombre es obligatorio."
    if (!form.user_last_name.trim()) next.user_last_name = "El apellido es obligatorio."
    if (!form.user_email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.user_email))
      next.user_email = "Ingresa un email válido."
    if (!form.user_phone.trim()) next.user_phone = "El teléfono es obligatorio."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      user_first_name: form.user_first_name.trim(),
      user_last_name: form.user_last_name.trim(),
      user_email: form.user_email.trim(),
      user_phone: form.user_phone.trim(),
      user_membership_status: form.user_membership_status as any,
      user_membership_plan: form.user_membership_plan as any,
      user_join_date: new Date().toISOString(),
      user_last_visit: new Date().toISOString(),
      user_avatar: form.user_avatar.trim() || null,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
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
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        {/* accent glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
              <User className="h-5 w-5" />
            </span>
            <div>
              <h2 id="user-form-title" className="font-sans text-lg font-black uppercase tracking-tight text-foreground">
                {isEdit ? "Editar miembro" : "Nuevo miembro"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEdit ? `ID #${user?.user_id}` : "Agregar al gimnasio"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative flex flex-col gap-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre" htmlFor="user_first_name" error={errors.user_first_name}>
              <input
                ref={firstFieldRef}
                id="user_first_name"
                value={form.user_first_name}
                onChange={(e) => set("user_first_name", e.target.value)}
                placeholder="Carlos"
                className={inputCls(errors.user_first_name)}
              />
            </Field>
            <Field label="Apellido" htmlFor="user_last_name" error={errors.user_last_name}>
              <input
                id="user_last_name"
                value={form.user_last_name}
                onChange={(e) => set("user_last_name", e.target.value)}
                placeholder="Ramírez"
                className={inputCls(errors.user_last_name)}
              />
            </Field>
          </div>

          <Field label="Email" htmlFor="user_email" error={errors.user_email}>
            <input
              id="user_email"
              type="email"
              value={form.user_email}
              onChange={(e) => set("user_email", e.target.value)}
              placeholder="carlos@email.com"
              className={inputCls(errors.user_email)}
            />
          </Field>

          <Field label="Teléfono" htmlFor="user_phone" error={errors.user_phone}>
            <input
              id="user_phone"
              value={form.user_phone}
              onChange={(e) => set("user_phone", e.target.value)}
              placeholder="+506 8888-1111"
              className={inputCls(errors.user_phone)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Estado" htmlFor="user_membership_status">
              <select
                id="user_membership_status"
                value={form.user_membership_status}
                onChange={(e) => set("user_membership_status", e.target.value)}
                className={inputCls()}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="pending">Pendiente</option>
                <option value="expired">Expirado</option>
              </select>
            </Field>
            <Field label="Plan" htmlFor="user_membership_plan">
              <select
                id="user_membership_plan"
                value={form.user_membership_plan}
                onChange={(e) => set("user_membership_plan", e.target.value)}
                className={inputCls()}
              >
                <option value="basic">Básico</option>
                <option value="premium">Premium</option>
                <option value="elite">Elite</option>
                <option value="day-pass">Day Pass</option>
              </select>
            </Field>
          </div>

          <Field label="URL de avatar (opcional)" htmlFor="user_avatar">
            <input
              id="user_avatar"
              value={form.user_avatar}
              onChange={(e) => set("user_avatar", e.target.value)}
              placeholder="https://..."
              className={inputCls()}
            />
          </Field>

          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer rounded-none border border-border px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
            >
              {isEdit ? "Guardar cambios" : "Crear miembro"}
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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  )
}

function inputCls(error?: string) {
  return [
    "w-full rounded-md border bg-secondary px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60",
    "outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30",
    error ? "border-destructive" : "border-border",
  ].join(" ")
}