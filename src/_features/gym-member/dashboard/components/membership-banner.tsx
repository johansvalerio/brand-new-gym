"use client"

import { ArrowRight, Banknote, Loader2 } from "lucide-react"
import { useUser } from "@/_features/gym-admin/users/hooks/useUsers"
import { usePayments } from "@/_features/gym-admin/payments/hooks/usePayments"
import {
  MembershipCountdown,
} from "@/_features/gym-admin/users/components/MembershipCountdown"
import { membershipLabel } from "@/_features/gym-admin/users/components/utils"
import { currency } from "@/_features/gym-admin/products/components/utils"
import { useMembershipClock } from "@/_features/gym-admin/users/hooks/useMembershipClock"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"

/**
 * Banner de estado de membresía: la pieza central del dashboard del miembro.
 - Pago pending → "en revisión" (ámbar)
 - Membresía activa → countdown + Renovar si vence en ≤7 días (verde/amarillo)
 - Sin membresía (expired/inactive/clock vencida) → CTA activar (rojo)
 */
export function MembershipBanner({ profileId }: { profileId: string }) {
  const { navigate } = usePageTransition()
  const { data: profileRow, isLoading: profileLoading } = useUser(profileId)
  // RLS: un usuario normal solo recibe las propias; realtime incluido.
  const { data: payments = [] } = usePayments()

  const clock = useMembershipClock(
    profileRow?.membership_start ?? null,
    profileRow?.membership_end ?? null,
  )

  const pendingPayment = payments.find((p) => p.status === "pending")

  if (profileLoading) {
    return (
      <div className="flex min-h-[96px] items-center justify-center gap-2 rounded-lg border border-border bg-card text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando tu membresía...
      </div>
    )
  }

  if (pendingPayment) {
    return (
      <section className="rounded-lg border border-yellow-500/40 bg-yellow-500/5 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-sans text-sm font-bold uppercase tracking-wider text-yellow-500">
              <Banknote className="h-4 w-4 shrink-0" />
              Pago en revisión
            </p>
            <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
              {pendingPayment.plan?.name ?? "Plan"} ·{" "}
              {currency(pendingPayment.amount)} ·{" "}
              {pendingPayment.method === "sinpe" ? "SINPE" : "Efectivo"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              El administrador confirmará tu pago y tu membresía se activará sola.
            </p>
          </div>
          <button
            onClick={() => navigate("/membership")}
            className="flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-yellow-500/40 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-yellow-500 transition-colors hover:bg-yellow-500 hover:text-background"
          >
            Ver mi membresía
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </section>
    )
  }

  if (clock.state === "ok" || clock.state === "urgent") {
    return (
      <section className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-sans text-sm font-bold uppercase tracking-wider text-primary">
              Membresía activa · {membershipLabel(profileRow?.plan ?? null)}
            </p>
            <div className="mt-3 max-w-md">
              <MembershipCountdown
                start={profileRow?.membership_start ?? null}
                end={profileRow?.membership_end ?? null}
              />
            </div>
          </div>

          {clock.state === "urgent" ? (
            <button
              onClick={() => navigate("/membership")}
              className="shrink-0 cursor-pointer rounded-md bg-primary px-5 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
            >
              Renovar ahora
            </button>
          ) : null}
        </div>
      </section>
    )
  }

  // Primer tick del reloj sin resolver: placeholder neutral en vez de "vencida".
  if (clock.state === "loading") {
    return (
      <div className="flex min-h-[96px] items-center justify-center gap-2 rounded-lg border border-border bg-card text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Verificando tu membresía...
      </div>
    )
  }

  // Activa pero sin fecha de fin: verde simple, sin countdown.
  if (profileRow?.membership_status === "active" && clock.state === "no-end") {
    return (
      <section className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-4 sm:px-6 sm:py-5">
        <p className="font-sans text-sm font-bold uppercase tracking-wider text-primary">
          Membresía activa · {membershipLabel(profileRow?.plan ?? null)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Tu membresía no tiene fecha de vencimiento.
        </p>
      </section>
    )
  }

  return (
    <section className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-sans text-sm font-bold uppercase tracking-wider text-destructive">
            Sin membresía activa
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Solicita un plan desde la página de membresía para volver a entrenar.
          </p>
        </div>
        <button
          onClick={() => navigate("/membership")}
          className="shrink-0 cursor-pointer rounded-md bg-destructive px-5 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
        >
          Activar membresía
        </button>
      </div>
    </section>
  )
}
