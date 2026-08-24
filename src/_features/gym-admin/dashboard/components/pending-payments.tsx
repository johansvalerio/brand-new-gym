"use client"

import { ArrowRight, Banknote, CheckCircle2, Loader2, ShieldAlert } from "lucide-react"
import {
  useDecidePayment,
  type PaymentRow,
} from "@/_features/gym-admin/payments/hooks/usePayments"
import { currency } from "@/_features/gym-admin/products/components/utils"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  return `${hours}h`
}

export function PendingPayments({
  rows,
  loading,
  error,
}: {
  rows: PaymentRow[]
  loading: boolean
  error: string | null
}) {
  const decide = useDecidePayment()
  const { navigate } = usePageTransition()

  return (
    <section className="relative overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <h3 className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Banknote className="h-4 w-4 text-primary" />
          Solicitudes de pago
        </h3>
        <button
          onClick={() => navigate("/payments")}
          aria-label="Ver todos los pagos"
          className="flex cursor-pointer items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
        >
          Ver pagos
          <ArrowRight className="h-3 w-3" />
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando...
        </div>
      ) : error ? (
        <p className="flex items-center gap-2 px-4 py-6 text-sm text-destructive">
          <ShieldAlert className="h-4 w-4" />
          {error}
        </p>
      ) : rows.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <CheckCircle2 className="mx-auto h-8 w-8 text-primary/60" />
          <p className="mt-2 font-sans text-sm font-bold text-foreground">
            Sin solicitudes pendientes
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Cuando un miembro solicite un plan aparecerá aquí.
          </p>
        </div>
      ) : (
        <ul>
          {rows.map((payment) => {
            const member =
              `${payment.user?.first_name ?? ""} ${payment.user?.last_name ?? ""}`.trim() ||
              "Miembro"
            return (
              <li
                key={payment.id}
                className="flex items-center justify-between gap-3 border-b border-border/40 px-4 py-3 last:border-0 hover:bg-secondary/30"
              >
                <span className="min-w-0">
                  <span className="block truncate font-sans text-sm font-semibold text-foreground">
                    {member} ·{" "}
                    <span className="text-primary">{currency(payment.amount)}</span>
                  </span>
                  <span className="block truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {payment.plan?.name ?? "Plan"} · {payment.method === "sinpe" ? "SINPE" : "Efectivo"} · hace{" "}
                    {timeAgo(payment.requested_at)}
                  </span>
                </span>

                <button
                  onClick={() =>
                    void decide.mutateAsync({ id: payment.id, status: "approved" })
                  }
                  disabled={decide.isPending}
                  aria-label={`Aprobar solicitud de ${member}`}
                  title="Aprobar pago"
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
