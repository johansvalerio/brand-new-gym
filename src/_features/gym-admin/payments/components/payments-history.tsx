"use client"

import type { PaymentRow } from "../hooks/usePayments"
import { currency } from "@/_features/gym-admin/products/components/utils"

export function PaymentsHistory({ rows }: { rows: PaymentRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {["Miembro", "Plan", "Monto", "Método", "Estado", "Fecha"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 font-sans text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((payment) => {
              const member =
                `${payment.user?.first_name ?? ""} ${payment.user?.last_name ?? ""}`.trim() ||
                "Miembro"
              return (
                <tr
                  key={payment.id}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40"
                >
                  <td className="px-4 py-3 font-sans text-sm font-semibold text-foreground">
                    {member}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
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
                      className={`inline-block rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider ${
                        payment.status === "approved"
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-destructive/30 bg-destructive/10 text-destructive"
                      }`}
                    >
                      {payment.status === "approved" ? "Aprobado" : "Rechazado"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                    {payment.decided_at
                      ? new Date(payment.decided_at).toLocaleDateString("es-CR", {
                          day: "numeric",
                          month: "short",
                        })
                      : "—"}
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Aún no hay pagos decididos.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
