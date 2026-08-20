import type { MembershipStatus, MembershipPlan } from "../types"

export function statusBadgeClasses(status: MembershipStatus): string {
  const base = "rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider"
  switch (status) {
    case "active":
      return `${base} border-primary/30 bg-primary/10 text-primary`
    case "inactive":
      return `${base} border-muted-foreground/30 bg-muted-10 text-muted-foreground`
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

export function membershipBadgeClasses(plan: MembershipPlan): string {
  const base = "rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider"
  switch (plan) {
    case "elite":
      return `${base} border-primary/30 bg-primary/10 text-primary`
    case "premium":
      return `${base} border-primary/30 bg-primary/10 text-primary`
    case "basic":
      return `${base} border-muted-foreground/30 bg-muted/10 text-muted-foreground`
    case "day-pass":
      return `${base} border-yellow-500/30 bg-yellow-500/10 text-yellow-500`
    default:
      return `${base} border-border bg-card text-muted-foreground`
  }
}

export function membershipLabel(plan: MembershipPlan): string {
  switch (plan) {
    case "elite":
      return "Elite"
    case "premium":
      return "Premium"
    case "basic":
      return "Básico"
    case "day-pass":
      return "Day Pass"
    default:
      return plan
  }
}