"use client"

import { useEffect, useRef, useState } from "react"
import { X, Repeat } from "lucide-react"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"
import type { RecurringIncomeRow } from "../hooks/useRecurringIncomes"
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  type ExpenseCategory,
} from "../lib/expense.schema"
import { recurringIncomeFormSchema, zodToFormErrors } from "../lib/recurring-income.schema"

export type RecurringIncomeFormPayload = {
  category: ExpenseCategory
  description: string
  amount: number
  is_active: boolean
}

interface RecurringIncomeDialogProps {
  open: boolean
  income?: RecurringIncomeRow | null
  onClose: () => void
  onSubmit: (dto: RecurringIncomeFormPayload) => Promise<void>
}

type FormState = {
  category: ExpenseCategory
  description: string
  amount: string
  is_active: boolean
}

const emptyForm: FormState = { category: "otros", description: "", amount: "", is_active: true }

export function RecurringIncomeDialog(props: RecurringIncomeDialogProps) {
  const { open, income, onClose, onSubmit } = props
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

  return <RecurringIncomeInner key={income?.id ?? "new"} income={income ?? null} onClose={onClose} onSubmit={onSubmit} />
}

function RecurringIncomeInner({
  income,
  onClose,
  onSubmit,
}: Omit<RecurringIncomeDialogProps, "open"> & { income: RecurringIncomeRow | null }) {
  const isEdit = Boolean(income)
  const [form, setForm] = useState<FormState>(() =>
    income
      ? {
          category: (income.category as ExpenseCategory) ?? "otros",
          description: income.description,
          amount: String(income.amount),
          is_active: income.is_active,
        }
      : emptyForm,
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => firstFieldRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const validate = () => {
    const parsed = recurringIncomeFormSchema.safeParse(form)
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
      await onSubmit({
        category: form.category,
        description: form.description.trim(),
        amount: Number(form.amount),
        is_active: form.is_active,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="recurring-form-title">
      <button aria-label="Cerrar" onClick={onClose} className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Repeat className="h-5 w-5" />
            </span>
            <div>
              <h2 id="recurring-form-title" className="font-sans text-lg font-black uppercase tracking-tight text-foreground">
                {isEdit ? "Editar renta" : "Nueva renta fija"}
              </h2>
              <p className="text-xs text-muted-foreground">Cuenta en cada mes mientras esté activa</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:h-8 sm:w-8">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <Field label="Categoría" htmlFor="rent_category" error={errors.category}>
            <select
              id="rent_category"
              value={form.category}
              onChange={(e) => set("category", e.target.value as ExpenseCategory)}
              className={inputCls(errors.category)}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {EXPENSE_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Concepto" htmlFor="rent_description" error={errors.description}>
            <input
              ref={firstFieldRef}
              id="rent_description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Alquiler del salón para eventos"
              maxLength={200}
              className={inputCls(errors.description)}
            />
          </Field>
          <Field label="Monto mensual (₡)" htmlFor="rent_amount" error={errors.amount}>
            <input
              id="rent_amount"
              inputMode="decimal"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              placeholder="80000"
              className={inputCls(errors.amount)}
            />
          </Field>
          <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-secondary/30 px-4 py-3">
            <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="h-4 w-4 cursor-pointer accent-primary" />
            <div>
              <p className="font-sans text-sm font-semibold text-foreground">Renta activa</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Pausada no suma en los meses</p>
            </div>
          </label>
          <div className="sticky bottom-0 -mx-4 mt-2 flex items-center justify-end gap-3 border-t border-border bg-card px-4 py-3 sm:-mx-6 sm:px-6">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="cursor-pointer rounded-none border border-border px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              {isSubmitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear renta"}
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
