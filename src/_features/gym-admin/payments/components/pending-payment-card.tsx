"use client"

import { Banknote, CheckCircle2, Clock3, Pencil, XCircle } from "lucide-react"
import { currency } from "@/_features/gym-admin/products/components/utils"
import type { PaymentRow } from "../hooks/usePayments"

export function PendingPaymentCard({
  payment,
  deciding,
  onApprove,
  onReject,
  onEdit,
}: {
  payment: PaymentRow
  deciding: boolean
  onApprove: () => Promise<void>
  onReject: () => Promise<void>
  onEdit?: () => void
}) {
  const member =
    `${payment.user?.first_name ?? ""} ${payment.user?.last_name ?? ""}`.trim() ||
    "Miembro"

  return (
    <article className="group relative overflow-hidden rounded-lg border border-yellow-500/40 bg-card transition-colors duration-300 hover:border-yellow-500/60">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-yellow-500/5 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary">
            {payment.user?.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={payment.user.avatar}
                alt={member}
                className="h-full w-full object-cover"
              />
            ) : (
              <Banknote className="h-5 w-5 text-muted-foreground" />
            )}
          </span>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-sans text-sm font-bold text-foreground">
                {member}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                <Clock3 className="h-2.5 w-2.5" />
                {timeAgo(payment.requested_at)}
              </span>
            </div>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {payment.plan?.name ?? "Plan"} ·{" "}
              <span className="font-bold text-primary">{currency(payment.amount)}</span>{" "}
              · {payment.method === "sinpe" ? "SINPE" : "Efectivo"}
            </p>
            {payment.note ? (
              <p className="mt-1 truncate font-mono text-xs italic text-muted-foreground">
                “{payment.note}”
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onEdit ? (
            <button
              onClick={onEdit}
              disabled={deciding}
              aria-label={`Editar pago de ${member}`}
              title="Editar pago"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Pencil className="h-4 w-4" />
            </button>
          ) : null}
          <button
            onClick={() => void onReject()}
            disabled={deciding}
            aria-label={`Rechazar solicitud de ${member}`}
            className="flex cursor-pointer items-center gap-1.5 rounded-md border border-destructive/40 px-4 py-2 font-sans text-xs font-semibold uppercase tracking-wider text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" />
            Rechazar
          </button>
          <button
            onClick={() => void onApprove()}
            disabled={deciding}
            aria-label={`Aprobar solicitud de ${member}`}
            className="flex cursor-pointer items-center gap-1.5 rounded-none bg-primary px-4 py-2 font-sans text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            Aprobar
          </button>
        </div>
      </div>
    </article>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60_000)
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`
  return `hace ${Math.floor(hours / 24)}d`
}
