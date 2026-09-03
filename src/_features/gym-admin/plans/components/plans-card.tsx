"use client"

import { CreditCard, Pencil, Trash2, MoreVertical } from "lucide-react"
import type { PlanRow } from "../hooks/usePlans"
import { currency } from "@/_features/gym-admin/products/components/utils"
import { durationLabel, statusBadgeClasses, statusLabel } from "./plans-utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function PlansCards({
  plans,
  onEdit,
  onDelete,
}: {
  plans: PlanRow[]
  onEdit: (plan: PlanRow) => void
  onDelete: (plan: PlanRow) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <article
          key={plan.id}
          className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

          <div className="relative flex flex-col p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                <CreditCard className="h-4 w-4" />
              </span>
              <span
                className={`inline-block rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider ${statusBadgeClasses(
                  plan.is_active,
                )}`}
              >
                {statusLabel(plan.is_active)}
              </span>
            </div>

            <h3 className="font-sans text-base font-bold leading-tight text-foreground">
              {plan.name}
            </h3>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              {durationLabel(plan.duration_days)}
            </p>

            <div className="mt-4 flex items-end justify-between">
              <span className="font-sans text-2xl font-black leading-none text-primary">
                {currency(plan.price)}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label={`Más acciones de ${plan.name}`}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:h-9 sm:w-9"
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
          </div>
        </article>
      ))}
    </div>
  )
}