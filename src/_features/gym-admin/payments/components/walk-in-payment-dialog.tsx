"use client"

import { useEffect, useMemo, useState } from "react"
import { Banknote, Loader2, Search, Smartphone, X } from "lucide-react"
import { useUsers } from "@/_features/gym-admin/users/hooks/useUsers"
import { usePlans } from "@/_features/gym-admin/users/hooks/usePlans"
import { currency } from "@/_features/gym-admin/products/components/utils"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"
import {
  useCreateWalkInPayment,
  useUpdatePayment,
  type PaymentRow,
} from "../hooks/usePayments"

const inputCls =
  "w-full rounded-md border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/30"

export function WalkInPaymentDialog({
  open,
  onClose,
  /** Presente = modo edición de un pago pendiente (miembro bloqueado). */
  payment = null,
}: {
  open: boolean
  onClose: () => void
  payment?: PaymentRow | null
}) {
  const isEdit = Boolean(payment)
  useBodyScrollLock(open)
  const { data: users = [] } = useUsers()
  const { data: plans = [] } = usePlans()
  const createWalkIn = useCreateWalkInPayment()
  const updatePayment = useUpdatePayment()

  const [search, setSearch] = useState("")
  const [userId, setUserId] = useState<string>("")
  const [planId, setPlanId] = useState<string>("")
  const [method, setMethod] = useState<"sinpe" | "efectivo">("efectivo")
  const [note, setNote] = useState("")

  // Reset/hidratación al abrir
  useEffect(() => {
    if (!open) return
    setSearch("")
    setUserId(payment?.user_id ?? "")
    setPlanId(payment?.plan_id ?? "")
    setMethod(payment?.method ?? "efectivo")
    setNote(payment?.note ?? "")
  }, [open, payment])

  const members = useMemo(() => {
    if (isEdit) return []
    const q = search.trim().toLowerCase()
    const base = users.filter((u) => u.role !== "admin" || u.id === userId)
    if (!q) return base
    return base.filter(
      (u) =>
        `${u.first_name ?? ""} ${u.last_name ?? ""}`.toLowerCase().includes(q) ||
        (u.email ?? "").toLowerCase().includes(q),
    )
  }, [users, search, userId, isEdit])

  const selectedPlan = plans.find((p) => p.id === planId) ?? null
  const memberName = isEdit
    ? `${payment?.user?.first_name ?? ""} ${payment?.user?.last_name ?? ""}`.trim() || "Miembro"
    : ""

  const canSubmit = Boolean(planId) && !(isEdit ? updatePayment.isPending : createWalkIn.isPending)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!planId) return

    if (isEdit && payment) {
      await updatePayment.mutateAsync({
        id: payment.id,
        planId,
        method,
        note,
      })
    } else if (userId) {
      await createWalkIn.mutateAsync({ userId, planId, method, note })
    }
    onClose()
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="walkin-title"
    >
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm"
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Banknote className="h-5 w-5" />
            </span>
            <div>
              <h2 id="walkin-title" className="font-sans text-lg font-black uppercase tracking-tight text-foreground">
                {isEdit ? "Editar pago" : "Registrar pago"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isEdit ? `Miembro: ${memberName}` : "Pago walk-in — se activa al instante"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:h-8 sm:w-8"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {/* Miembro */}
          {isEdit ? (
            <div className="rounded-md border border-border bg-secondary/30 px-3 py-2.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Miembro
              </p>
              <p className="text-sm font-medium text-foreground">{memberName}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="member-search" className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Miembro
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="member-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  aria-label="Buscar miembro"
                  className={`${inputCls} pl-9`}
                />
              </div>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                aria-label="Seleccionar miembro"
                required
                className={`${inputCls} cursor-pointer`}
              >
                <option value="">Selecciona miembro…</option>
                {members.map((u) => {
                  const name = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.email
                  return (
                    <option key={u.id} value={u.id}>
                      {name} · {u.email}
                    </option>
                  )
                })}
              </select>
            </div>
          )}

          {/* Plan */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Plan
            </span>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {plans
                .filter((p) => p.is_active)
                .map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setPlanId(plan.id)}
                    aria-pressed={planId === plan.id}
                    className={`cursor-pointer rounded-md border p-3 text-left transition-colors ${
                      planId === plan.id
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary/30 hover:border-primary/40"
                    }`}
                  >
                    <p className="font-sans text-xs font-bold uppercase tracking-wide text-foreground">
                      {plan.name}
                    </p>
                    <p className="mt-0.5 font-sans text-base font-black text-primary leading-none">
                      {currency(plan.price)}
                    </p>
                  </button>
                ))}
            </div>
          </div>

          {/* Método */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Método de pago
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMethod("sinpe")}
                aria-pressed={method === "sinpe"}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2.5 font-sans text-xs font-semibold uppercase tracking-wider transition-colors ${
                  method === "sinpe"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                <Smartphone className="h-4 w-4" />
                SINPE
              </button>
              <button
                type="button"
                onClick={() => setMethod("efectivo")}
                aria-pressed={method === "efectivo"}
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-md border px-3 py-2.5 font-sans text-xs font-semibold uppercase tracking-wider transition-colors ${
                  method === "efectivo"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                Efectivo
              </button>
            </div>
          </div>

          {/* Nota */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="payment-note" className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Nota (opcional)
            </label>
            <textarea
              id="payment-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Referencia SINPE, observaciones..."
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Resumen */}
          {selectedPlan ? (
            <p className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 font-mono text-xs text-muted-foreground">
              {isEdit ? "Actualizando a " : "Registrando "}
              <span className="text-foreground">{selectedPlan.name}</span> ·{" "}
              <span className="font-bold text-primary">{currency(selectedPlan.price)}</span> vía{" "}
              {method === "sinpe" ? "SINPE" : "Efectivo"}
              {!isEdit && userId ? (
                <>
                  {" "}→ membresía activa al instante.
                </>
              ) : null}
            </p>
          ) : null}
        </div>

        <div className="sticky bottom-0 -mx-4 mt-auto flex items-center justify-end gap-3 border-t border-border bg-card px-4 py-3 sm:-mx-6 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={createWalkIn.isPending || updatePayment.isPending}
            className="cursor-pointer rounded-none border border-border px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {(createWalkIn.isPending || updatePayment.isPending) && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {isEdit ? "Guardar cambios" : "Registrar pago"}
          </button>
        </div>
      </form>
    </div>
  )
}
