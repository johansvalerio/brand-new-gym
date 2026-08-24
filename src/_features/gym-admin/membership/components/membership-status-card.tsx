"use client"

import { CalendarRange } from "lucide-react"
import { MembershipCountdown } from "@/_features/gym-admin/users/components/MembershipCountdown"
import {
  membershipBadgeClasses,
  type PlanRef,
} from "@/_features/gym-admin/users/components/utils"

const badgeBase =
  "inline-flex items-center rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider"

export function MembershipStatusCard({
  status,
  plan,
  start,
  end,
  hasPendingRequest,
}: {
  status: string | null | undefined
  plan: PlanRef | null
  start: string | null
  end: string | null
  hasPendingRequest: boolean
}) {
  return (
    <section className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative flex flex-wrap items-center gap-2">
        <span className={`${badgeBase} ${membershipBadgeClasses(plan)}`}>
          {plan?.name ?? "Sin plan"}
        </span>
        <span className={`${badgeBase} ${statusBadgeClasses(status)}`}>
          {statusText(status)}
        </span>
        {hasPendingRequest ? (
          <span className={`${badgeBase} border-yellow-500/40 bg-yellow-500/10 text-yellow-500`}>
            Solicitud pendiente
          </span>
        ) : null}
      </div>

      <div className="relative mt-4 max-w-md">
        {end ? (
          <MembershipCountdown start={start} end={end} />
        ) : (
          <div className="flex items-center gap-3 rounded-md border border-dashed border-border/60 bg-secondary/30 px-3 py-3">
            <CalendarRange className="h-5 w-5 shrink-0 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {plan
                ? "Pide al administrador que active tu período."
                : "Solicita un plan abajo para empezar a entrenar."}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

function statusBadgeClasses(status: string | null | undefined): string {
  switch (status) {
    case "active":
      return "border-primary/30 bg-primary/10 text-primary"
    case "expired":
      return "border-destructive/30 bg-destructive/10 text-destructive"
    case "pending":
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
    default:
      return "border-muted-foreground/30 bg-muted/10 text-muted-foreground"
  }
}

function statusText(status: string | null | undefined): string {
  switch (status) {
    case "active":
      return "Activa"
    case "expired":
      return "Vencida"
    case "pending":
      return "Pendiente"
    default:
      return "Inactiva"
  }
}
