"use client"

import { useEffect, useRef, useState } from "react"
import { X, CreditCard } from "lucide-react"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"
import type { PlanRow } from "../hooks/usePlans"
import { planFormSchema, zodToFormErrors } from "../../lib/plan.schema"

export type PlanFormPayload = {
  name: string
  duration_days: number
  price: number
  is_active: boolean
}

interface PlanFormDialogProps {
  open: boolean
  plan?: PlanRow | null
  onClose: () => void
  onSubmit: (dto: PlanFormPayload) => Promise<void>
}

type FormState = {
  name: string
  duration_days: string
  price: string
  is_active: boolean
}

const emptyForm: FormState = {
  name: "",
  duration_days: "30",
  price: "",
  is_active: true,
}

export function PlanFormDialog(props: PlanFormDialogProps) {
  const { open, plan, onClose, onSubmit } = props
  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return <PlanFormInner key={plan?.id ?? "new"} plan={plan ?? null} onClose={onClose} onSubmit={onSubmit} />
}

function PlanFormInner({ plan, onClose, onSubmit }: Omit<PlanFormDialogProps, "open"> & { plan: PlanRow | null }) {
  const isEdit = Boolean(plan)
  const [form, setForm] = useState<FormState>(() =>
    plan ? { name: plan.name, duration_days: String(plan.duration_days), price: String(plan.price), is_active: plan.is_active } : emptyForm,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => firstFieldRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [key]: value }))

  const validate = () => {
    const parsed = planFormSchema.safeParse({ name: form.name, duration_days: form.duration_days, price: form.price, is_active: form.is_active })
    if (!parsed.success) {
      setErrors(zodToFormErrors(parsed.error))
      return false
    }
    setErrors({})
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      await onSubmit({ name: form.name.trim(), duration_days: Number(form.duration_days), price: Number(form.price), is_active: form.is_active })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="plan-form-title">
      <button aria-label="Cerrar" onClick={onClose} className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <h2 id="plan-form-title" className="font-sans text-lg font-black uppercase tracking-tight text-foreground">
                {isEdit ? "Editar plan" : "Nuevo plan"}
              </h2>
              <p className="text-xs text-muted-foreground">{isEdit ? `ID ${plan?.slug}` : "Agregar un plan de membresía"}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:h-8 sm:w-8">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <Field label="Nombre" htmlFor="plan_name" error={errors.name}>
            <input ref={firstFieldRef} id="plan_name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Mensual" className={inputCls(errors.name)} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Duración (días)" htmlFor="plan_duration" error={errors.duration_days}>
              <input id="plan_duration" inputMode="numeric" value={form.duration_days} onChange={(e) => set("duration_days", e.target.value)} placeholder="30" className={inputCls(errors.duration_days)} />
            </Field>
            <Field label="Precio (₡)" htmlFor="plan_price" error={errors.price}>
              <input id="plan_price" inputMode="decimal" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="15000" className={inputCls(errors.price)} />
            </Field>
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-secondary/30 px-4 py-3">
            <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="h-4 w-4 cursor-pointer accent-primary" />
            <div>
              <p className="font-sans text-sm font-semibold text-foreground">Plan activo</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Visible para que los miembros lo elijan</p>
            </div>
          </label>
          <div className="sticky bottom-0 -mx-4 mt-2 flex items-center justify-end gap-3 border-t border-border bg-card px-4 py-3 sm:-mx-6 sm:px-6">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed rounded-none border border-border px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2 rounded-none bg-primary px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90">
              {isSubmitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: React.ReactNode }) {
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
  return ["w-full rounded-md border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60", "outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30", error ? "border-destructive" : "border-border"].join(" ")
}
