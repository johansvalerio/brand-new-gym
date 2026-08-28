"use client"

import { ArrowRight, Banknote, CheckCircle2, Clock3, Loader2, ShieldAlert, XCircle } from "lucide-react"
import { usePayments } from "@/_features/gym-admin/payments/hooks/usePayments"
import { currency } from "@/_features/gym-admin/products/components/utils"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"

export function MyPaymentStatus() {
  const { navigate } = usePageTransition()
  const {
    data: payments = [],
    isLoading,
    error,
  } = usePayments()

  const latest = [...payments].sort(
    (a, b) =>
      new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime(),
  )[0]

  return (
    <section className="relative overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <h3 className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Banknote className="h-4 w-4 text-primary" />
          Mi último pago
        </h3>
        <button
          onClick={() => navigate("/membership")}
          aria-label="Ir a mi membresía"
          className="flex cursor-pointer items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
        >
          Membresía
          <ArrowRight className="h-3 w-3" />
        </button>
      </header>

      <div className="px-4 py-6 sm:px-6">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando...
          </div>
        ) : error ? (
          <p className="flex items-center gap-2 text-sm text-destructive">
            <ShieldAlert className="h-4 w-4" />
            {error instanceof Error ? error.message : "Error inesperado"}
          </p>
        ) : !latest ? (
          <div className="py-2 text-center">
            <Banknote className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 font-sans text-sm font-bold text-foreground">
              Sin solicitudes de pago
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Cuando solicites un plan, su estado aparecerá aquí.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider ${
                  latest.status === "approved"
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : latest.status === "pending"
                      ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
                      : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
              >
                {latest.status === "approved" ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : latest.status === "pending" ? (
                  <Clock3 className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {latest.status === "approved"
                  ? "Aprobado"
                  : latest.status === "pending"
                    ? "En revisión"
                    : "Rechazado"}
              </span>
              <span className="font-sans text-sm font-black text-foreground">
                {currency(latest.amount)}
              </span>
            </div>

            <p className="mt-2 truncate font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {latest.plan?.name ?? "Plan"} ·{" "}
              {latest.method === "sinpe" ? "SINPE" : "Efectivo"} ·{" "}
              {new Date(latest.requested_at).toLocaleDateString("es-CR", {
                day: "numeric",
                month: "short",
              })}
            </p>

            {latest.status === "rejected" && latest.note ? (
              <p className="mt-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                Nota del admin: {latest.note}
              </p>
            ) : null}

            {latest.status === "pending" ? (
              <button
                onClick={() => navigate("/membership")}
                className="mt-3 cursor-pointer font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
              >
                Cancelar solicitud desde Mi membresía →
              </button>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
