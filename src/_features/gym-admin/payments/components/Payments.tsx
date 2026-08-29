"use client"

import { useMemo, useState } from "react"
import { Banknote, CheckCircle2, Loader2, ShieldAlert } from "lucide-react"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { useDecidePayment, usePayments, type PaymentRow } from "../hooks/usePayments"
import { PaymentsStats, type PaymentsStatsData } from "./payments-stats"
import { PendingPaymentCard } from "./pending-payment-card"
import { PaymentsHistory } from "./payments-history"
import {
  defaultPaymentFilters,
  filterPaymentRows,
  PaymentHistoryFilters,
  type PaymentFilters,
} from "./payment-history-filters"
import { WalkInPaymentDialog } from "./walk-in-payment-dialog"
import { usePlans } from "@/_features/gym-admin/plans/hooks/usePlans"

export function Payments() {
  const { isAdmin, loading: authLoading } = useAuthSession()
  const { data: payments = [], isLoading, error } = usePayments()
  const { data: plans = [] } = usePlans()
  const decide = useDecidePayment()
  const [filters, setFilters] = useState<PaymentFilters>(defaultPaymentFilters)
  const [walkInOpen, setWalkInOpen] = useState(false)
  const [editing, setEditing] = useState<PaymentRow | null>(null)

  const stats = useMemo(() => {
    const pendingRows = payments
      .filter((p) => p.status === "pending")
      .sort(
        (a, b) =>
          new Date(a.requested_at).getTime() - new Date(b.requested_at).getTime(),
      )

    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    const approvedThisMonth = payments.filter(
      (p) =>
        p.status === "approved" &&
        p.decided_at &&
        new Date(p.decided_at).getTime() >= monthStart,
    )

    return {
      pendingRows,
      history: filterPaymentRows(
        payments.filter((p) => p.status !== "pending"),
        filters,
      ),
      statsData: {
        pending: pendingRows.length,
        approvedMonth: approvedThisMonth.length,
        revenueMonth: approvedThisMonth.reduce((sum, p) => sum + p.amount, 0),
      } satisfies PaymentsStatsData,
    }
  }, [payments, filters])

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando acceso...
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background">
        <div className="rounded-lg border border-border bg-card px-8 py-10 text-center shadow-sm">
          <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="font-sans text-xl font-black uppercase tracking-tight text-foreground">
            Acceso restringido
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Solo el administrador puede gestionar pagos.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Facturación
          </span>
          <h1 className="font-sans text-4xl font-black uppercase leading-[0.95] tracking-tighter text-foreground text-balance md:text-6xl">
            Pagos &amp; <span className="text-primary">Membresías</span>
          </h1>
          <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
            Verifica las solicitudes de membresía (SINPE o efectivo) y apruébalas
            para activar a los miembros.
          </p>
        </header>

        {/* Acciones */}
        <div className="mb-6 flex items-center justify-end gap-3">
          <button
            onClick={() => setWalkInOpen(true)}
            aria-label="Registrar pago walk-in"
            className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-4 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
          >
            <Banknote className="h-4 w-4" />
            Registrar pago
          </button>
        </div>

        {/* Stats */}
        <PaymentsStats data={stats.statsData} loading={isLoading} />

        {error ? (
          <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : String(error)}
          </div>
        ) : null}

        {/* Cola de pendientes */}
        <h2 className="mb-4 font-sans text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Solicitudes pendientes
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 px-6 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando solicitudes...
          </div>
        ) : stats.pendingRows.length === 0 ? (
          <div className="mb-10 flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 py-12 text-center">
            <CheckCircle2 className="h-8 w-8 text-primary/60" />
            <p className="mt-3 font-sans text-base font-bold text-foreground">
              Sin solicitudes pendientes
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cuando un miembro solicite un plan aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="mb-10 flex flex-col gap-3">
            {stats.pendingRows.map((payment) => (
              <PendingPaymentCard
                key={payment.id}
                payment={payment}
                deciding={decide.isPending}
                onApprove={() =>
                  decide.mutateAsync({ id: payment.id, status: "approved" })
                }
                onReject={() =>
                  decide.mutateAsync({ id: payment.id, status: "rejected" })
                }
                onEdit={() => setEditing(payment)}
              />
            ))}
          </div>
        )}

        {/* Historial */}
        <h2 className="mb-4 font-sans text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Historial
        </h2>
        <PaymentHistoryFilters value={filters} onChange={setFilters} plans={plans} />
        <PaymentsHistory rows={stats.history} />
      </div>

      <WalkInPaymentDialog
        open={walkInOpen || editing !== null}
        payment={editing}
        onClose={() => {
          setWalkInOpen(false)
          setEditing(null)
        }}
      />
    </section>
  )
}
