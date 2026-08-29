"use client"

import { Pencil, Trash2 } from "lucide-react"
import type { PlanRow } from "../hooks/usePlans"
import { currency } from "@/_features/gym-admin/products/components/utils"
import { durationLabel, statusBadgeClasses, statusLabel } from "./plans-utils"

export function PlansTable({
  plans,
  onEdit,
  onDelete,
}: {
  plans: PlanRow[]
  onEdit: (plan: PlanRow) => void
  onDelete: (plan: PlanRow) => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              {["Plan", "Duración", "Precio", "Estado", ""].map((h, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 font-sans text-[11px] font-bold uppercase tracking-wider text-muted-foreground ${
                    i === 2 ? "text-right" : ""
                  } ${i === 4 ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr
                key={plan.id}
                className="group border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/40"
              >
                <td className="whitespace-nowrap px-4 py-3">
                  <p className="font-sans text-sm font-semibold text-foreground">
                    {plan.name}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {plan.slug}
                  </p>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">
                  {durationLabel(plan.duration_days)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-sans text-sm font-bold text-primary">
                  {currency(plan.price)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider ${statusBadgeClasses(
                      plan.is_active,
                    )}`}
                  >
                    {statusLabel(plan.is_active)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onEdit(plan)}
                      aria-label={`Editar ${plan.name}`}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:h-8 sm:w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(plan)}
                      aria-label={`Eliminar ${plan.name}`}
                      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive sm:h-8 sm:w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}