"use client"

import { useEffect, useRef, useState } from "react"
import { X, Receipt, ShieldCheck } from "lucide-react"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"
import type { ExpenseRow } from "../hooks/useExpenses"
import { useSalaryStaff, staffDisplayName } from "../hooks/useSalaryStaff"
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  expenseFormSchema,
  zodToFormErrors,
  type ExpenseCategory,
} from "../lib/expense.schema"

export type ExpenseFormPayload = {
  category: ExpenseCategory
  description: string
  amount: number
  expense_date: string
  paid_to_user_id: string | null
}

interface ExpenseFormDialogProps {
  open: boolean
  expense?: ExpenseRow | null
  onClose: () => void
  onSubmit: (dto: ExpenseFormPayload) => Promise<void>
}

type FormState = {
  category: ExpenseCategory
  description: string
  amount: string
  expense_date: string
  paid_to_user_id: string
}

function todayIso(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const emptyForm = (): FormState => ({ category: "otros", description: "", amount: "", expense_date: todayIso(), paid_to_user_id: "" })

export function ExpenseFormDialog(props: ExpenseFormDialogProps) {
  const { open, expense, onClose, onSubmit } = props
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

  return <ExpenseFormInner key={expense?.id ?? "new"} expense={expense ?? null} onClose={onClose} onSubmit={onSubmit} />
}

function ExpenseFormInner({
  expense,
  onClose,
  onSubmit,
}: Omit<ExpenseFormDialogProps, "open"> & { expense: ExpenseRow | null }) {
  const isEdit = Boolean(expense)
  const [form, setForm] = useState<FormState>(() =>
    expense
      ? {
          category: (expense.category as ExpenseCategory) ?? "otros",
          description: expense.description,
          amount: String(expense.amount),
          expense_date: expense.expense_date,
          paid_to_user_id: expense.paid_to_user_id ?? "",
        }
      : emptyForm(),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const { data: staffList = [] } = useSalaryStaff()

  useEffect(() => {
    const t = setTimeout(() => firstFieldRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [])

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const validate = () => {
    const parsed = expenseFormSchema.safeParse(form)
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
        expense_date: form.expense_date,
        paid_to_user_id: form.paid_to_user_id || null,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="expense-form-title">
      <button aria-label="Cerrar" onClick={onClose} className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm" />
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Receipt className="h-5 w-5" />
            </span>
            <div>
              <h2 id="expense-form-title" className="font-sans text-lg font-black uppercase tracking-tight text-foreground">
                {isEdit ? "Editar egreso" : "Nuevo egreso"}
              </h2>
              <p className="text-xs text-muted-foreground">{isEdit ? "Actualiza los datos del egreso" : "Registra un gasto del gym"}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:h-8 sm:w-8">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="relative flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <Field label="Categoría" htmlFor="expense_category" error={errors.category}>
            <select
              id="expense_category"
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

          {/* Picker de beneficiario: solo para salarios (coach + recepción). */}
          {form.category === "salarios" ? (
            <Field label="Recibe el pago" htmlFor="expense_paid_to" error={errors.paid_to_user_id}>
              <div className="relative">
                <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  id="expense_paid_to"
                  value={form.paid_to_user_id}
                  onChange={(e) => set("paid_to_user_id", e.target.value)}
                  className={`${inputCls(errors.paid_to_user_id)} pl-9`}
                >
                  <option value="">Seleccioná al beneficiario…</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {staffDisplayName(s)} — {s.role === "coach" ? "Coach" : "Recepción"}
                    </option>
                  ))}
                </select>
              </div>
              {staffList.length === 0 ? (
                <p className="font-mono text-[10px] text-muted-foreground">
                  Sin coaches ni recepción registrados en tu gym.
                </p>
              ) : null}
            </Field>
          ) : null}
          <Field label="Descripción" htmlFor="expense_description" error={errors.description}>
            <input
              ref={firstFieldRef}
              id="expense_description"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Renta del local"
              maxLength={200}
              className={inputCls(errors.description)}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Monto (₡)" htmlFor="expense_amount" error={errors.amount}>
              <input
                id="expense_amount"
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                placeholder="150000"
                className={inputCls(errors.amount)}
              />
            </Field>
            <Field label="Fecha" htmlFor="expense_date" error={errors.expense_date}>
              <input
                id="expense_date"
                type="date"
                value={form.expense_date}
                onChange={(e) => set("expense_date", e.target.value)}
                className={inputCls(errors.expense_date)}
              />
            </Field>
          </div>
          <div className="sticky bottom-0 -mx-4 mt-2 flex items-center justify-end gap-3 border-t border-border bg-card px-4 py-3 sm:-mx-6 sm:px-6">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="cursor-pointer rounded-none border border-border px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
              {isSubmitting ? "Guardando..." : isEdit ? "Guardar cambios" : "Registrar egreso"}
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
