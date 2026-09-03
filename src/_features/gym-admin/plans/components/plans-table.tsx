"use client"

import { Pencil, Trash2, MoreVertical } from "lucide-react"
import type { PlanRow } from "../hooks/usePlans"
import { currency } from "@/_features/gym-admin/products/components/utils"
import { durationLabel, statusBadgeClasses, statusLabel } from "./plans-utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        aria-label={`Más acciones de ${plan.name}`}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:h-8 sm:w-8"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        side="bottom"
                        sideOffset={4}
                        className="z-[60] w-44 rounded-2xl border border-border/80 bg-card/95 p-2 shadow-[0_20px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                      >
                        <DropdownMenuItem
                          onClick={() => onEdit(plan)}
                          className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 font-sans text-sm font-medium text-foreground hover:bg-secondary"
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete(plan)}
                          className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 font-sans text-sm font-medium"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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