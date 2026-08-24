import type { Tables } from "@/types/database.types"

type MembershipStatus = NonNullable<Tables<"users">["membership_status"]>

/** Referencia mínima al plan embebido en las queries de usuarios. */
export type PlanRef = { id: string; slug: string; name: string }

export function statusBadgeClasses(status: MembershipStatus): string {
  const base = "rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider"
  switch (status) {
    case "active":
      return `${base} border-primary/30 bg-primary/10 text-primary`
    case "inactive":
      return `${base} border-muted-foreground/30 bg-muted/10 text-muted-foreground`
    case "pending":
      return `${base} border-yellow-500/30 bg-yellow-500/10 text-yellow-500`
    case "expired":
      return `${base} border-destructive/30 bg-destructive/10 text-destructive`
    default:
      return `${base} border-border bg-card text-muted-foreground`
  }
}

export function statusLabel(status: MembershipStatus): string {
  switch (status) {
    case "active":
      return "Activo"
    case "inactive":
      return "Inactivo"
    case "pending":
      return "Pendiente"
    case "expired":
      return "Expirado"
    default:
      return status
  }
}

export function membershipBadgeClasses(plan: PlanRef | null | undefined): string {
  const base = "rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider"
  switch (plan?.slug) {
    case "mensual":
      return `${base} border-primary/30 bg-primary/10 text-primary`
    case "semanal":
      return `${base} border-yellow-500/30 bg-yellow-500/10 text-yellow-500`
    case "diario":
      return `${base} border-muted-foreground/30 bg-muted/10 text-muted-foreground`
    default:
      return `${base} border-border bg-card text-muted-foreground`
  }
}

export function membershipLabel(plan: PlanRef | null | undefined): string {
  return plan?.name ?? "Sin plan"
}