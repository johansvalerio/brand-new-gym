"use client"

import { Banknote, Smartphone } from "lucide-react"
import { currency } from "@/_features/gym-admin/products/components/utils"
import type { PlanRow } from "@/_features/gym-admin/users/hooks/usePlans"

export function PlanRequestCards({
  plans,
  currentPlanId,
  hasPendingRequest,
  pending,
  onRequest,
}: {
  plans: PlanRow[]
  currentPlanId: string | null
  hasPendingRequest: boolean
  /** true mientras la mutación de solicitud está en vuelo */
  pending: boolean
  onRequest: (planId: string, method: "sinpe" | "efectivo") => Promise<void>
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {plans
        .filter((plan) => plan.is_active)
        .map((plan) => {
          const isCurrentPlan = currentPlanId === plan.id

          return (
            <article
              key={plan.id}
              className={`relative overflow-hidden rounded-lg border bg-card p-5 transition-colors ${
                isCurrentPlan ? "border-primary/50" : "border-border hover:border-primary/40"
              }`}
            >
              {isCurrentPlan ? (
                <span
                  className={`${badgeBase} absolute right-3 top-3 border-primary/40 bg-primary/10 text-primary`}
                >
                  Actual
                </span>
              ) : null}
              {!isCurrentPlan && hasPendingRequest ? (
                <span
                  className={`${badgeBase} absolute right-3 top-3 border-yellow-500/40 bg-yellow-500/10 text-yellow-500`}
                >
                  Pendiente
                </span>
              ) : null}

              <h3 className="font-sans text-base font-black uppercase tracking-tight text-foreground">
                {plan.name}
              </h3>
              <p className="mt-1 font-sans text-3xl font-black leading-none text-primary">
                {currency(plan.price)}
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {durationLabel(plan.duration_days)}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => void onRequest(plan.id, "sinpe")}
                  disabled={hasPendingRequest || pending || !plan.is_active}
                  aria-label={`Solicitar ${plan.name} vía SINPE`}
                  title={hasPendingRequest ? "Ya tienes una solicitud pendiente" : undefined}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-none border border-primary/40 bg-primary/10 px-3 py-2 font-sans text-xs font-semibold uppercase tracking-wider text-primary transition-all hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  SINPE
                </button>
                <button
                  onClick={() => void onRequest(plan.id, "efectivo")}
                  disabled={hasPendingRequest || pending || !plan.is_active}
                  aria-label={`Solicitar ${plan.name} en efectivo`}
                  title={hasPendingRequest ? "Ya tienes una solicitud pendiente" : undefined}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-none border border-border px-3 py-2 font-sans text-xs font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Efectivo
                </button>
              </div>
            </article>
          )
        })}
    </div>
  )
}

const badgeBase =
  "inline-flex items-center rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider"

function durationLabel(days: number): string {
  switch (days) {
    case 1:
      return "1 día"
    case 7:
      return "1 semana"
    case 30:
      return "1 mes"
    default:
      return `${days} días`
  }
}
