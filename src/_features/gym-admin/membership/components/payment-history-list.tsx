"use client"

import { CheckCircle2, Loader2, X } from "lucide-react"
import { currency } from "@/_features/gym-admin/products/components/utils"
import {
  useCancelPaymentRequest,
  useDecidePayment,
  type PaymentRow,
} from "@/_features/gym-admin/payments/hooks/usePayments"

function statusLabelEs(status: string): string {
  switch (status) {
    case "pending":
      return "Pendiente"
    case "approved":
      return "Aprobado"
    default:
      return "Rechazado"
  }
}

function statusBadgeCls(status: string): string {
  switch (status) {
    case "approved":
      return "border-primary/30 bg-primary/10 text-primary"
    case "rejected":
      return "border-destructive/30 bg-destructive/10 text-destructive"
    default:
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
  }
}

export function PaymentHistoryList({
  rows,
  loading,
  currentUserId,
  viewerIsAdmin = false,
}: {
  rows: PaymentRow[]
  loading: boolean
  /** Id del perfil del visitante — habilita Cancelar en sus propias pendientes. */
  currentUserId: string | null
  /** El admin ve los flujos de todos (columna Miembro + decidir pendientes ajenas). */
  viewerIsAdmin?: boolean
}) {
  const cancelRequest = useCancelPaymentRequest()
  const decide = useDecidePayment()
  const busy = cancelRequest.isPending || decide.isPending

  const memberName = (payment: PaymentRow) =>
    `${payment.user?.first_name ?? ""} ${payment.user?.last_name ?? ""}`.trim() ||
    "Miembro"

  const headers = [
    ...(viewerIsAdmin ? ["Miembro"] : []),
    "Plan",
    "Monto",
    "Método",
    "Estado",
    "Fecha",
    ...(rows.some((r) => r.status === "pending") ? ["Acciones"] : []),
  ]

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {headers.map((h) => (
                <th
                  key={h}
                  className={`px-4 py-3 font-sans text-[11px] font-bold uppercase tracking-wider text-muted-foreground ${
                    h === "Acciones" ? "text-right" : ""
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-8 text-center text-sm text-muted-foreground"
                >
                  <Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin" />
                  Cargando...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Aún no tienes solicitudes ni pagos registrados.
                </td>
              </tr>
            ) : (
              rows.map((payment) => {
                const isOwn = payment.user_id === currentUserId
                // Admin puede gestionar pendientes de cualquiera; el usuario solo las suyas.
                const canDecidePending =
                  payment.status === "pending" &&
                  (viewerIsAdmin || isOwn) &&
                  !busy
                const canCancel =
                  payment.status === "pending" && isOwn && !busy

                return (
                  <tr
                    key={payment.id}
                    className={`border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40 ${
                      payment.status === "pending" ? "bg-yellow-500/5" : ""
                    }`}
                  >
                    {viewerIsAdmin ? (
                      <td className="px-4 py-3 font-sans text-sm font-semibold text-foreground">
                        {memberName(payment)}
                      </td>
                    ) : null}
                    <td className="px-4 py-3 text-sm text-foreground">
                      {payment.plan?.name ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-sans text-sm font-bold text-primary">
                      {currency(payment.amount)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs uppercase text-muted-foreground">
                      {payment.method}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider ${statusBadgeCls(payment.status)}`}
                      >
                        {statusLabelEs(payment.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                      {new Date(payment.requested_at).toLocaleDateString("es-CR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    {rows.some((r) => r.status === "pending") ? (
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {payment.status === "pending" && viewerIsAdmin ? (
                            <>
                              <button
                                onClick={() =>
                                  void decide.mutateAsync({
                                    id: payment.id,
                                    status: "rejected",
                                  })
                                }
                                disabled={!canDecidePending}
                                aria-label={`Rechazar solicitud de ${memberName(payment)}`}
                                title="Rechazar"
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-destructive/40 text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  void decide.mutateAsync({
                                    id: payment.id,
                                    status: "approved",
                                  })
                                }
                                disabled={!canDecidePending}
                                aria-label={`Aprobar solicitud de ${memberName(payment)}`}
                                title="Aprobar"
                                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-primary/40 bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : null}
                          {canCancel ? (
                            <button
                              onClick={() =>
                                void cancelRequest.mutateAsync({ id: payment.id })
                              }
                              disabled={busy}
                              aria-label="Cancelar solicitud"
                              title="Cancelar mi solicitud"
                              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
