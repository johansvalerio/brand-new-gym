"use client"

import { useMemo, useState } from "react"
import { Loader2, LogIn, Banknote } from "lucide-react"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { usePlans } from "@/_features/gym-admin/users/hooks/usePlans"
import type { PlanRef } from "@/_features/gym-admin/users/components/utils"
import {
  useCreatePaymentRequest,
  usePayments,
} from "@/_features/gym-admin/payments/hooks/usePayments"
import {
  defaultPaymentFilters,
  filterPaymentRows,
  PaymentHistoryFilters,
  type PaymentFilters,
} from "@/_features/gym-admin/payments/components/payment-history-filters"
import { MembershipStatusCard } from "./membership-status-card"
import { PlanRequestCards } from "./plan-request-cards"
import { PaymentHistoryList } from "./payment-history-list"

export function MyMembership() {
  const { profile, user, isAdmin, loading: authLoading } = useAuthSession()
  const { data: plans = [] } = usePlans()
  const { data: payments = [], isLoading: paymentsLoading } = usePayments()
  const createRequest = useCreatePaymentRequest()

  const hasPendingRequest = useMemo(
    () => payments.some((p) => p.status === "pending"),
    [payments],
  )

  const [filters, setFilters] = useState<PaymentFilters>(defaultPaymentFilters)
  const filteredHistory = useMemo(
    () => filterPaymentRows(payments, filters),
    [payments, filters],
  )

  // El perfil de sesión no trae embed: derivamos el plan actual del cache de planes.
  const currentPlan: PlanRef | null = useMemo(
    () =>
      plans
        .filter((p) => p.id === profile?.plan_id)
        .map((p) => ({ id: p.id, slug: p.slug, name: p.name }))[0] ?? null,
    [plans, profile?.plan_id],
  )

  const handleRequest = async (planId: string, method: "sinpe" | "efectivo") => {
    if (!profile?.id) return
    await createRequest.mutateAsync({
      planId,
      method,
      requesterProfileId: profile.id,
    })
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando membresía...
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="rounded-lg border border-border bg-card px-8 py-10 text-center shadow-sm">
          <LogIn className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40" />
          <p className="font-sans text-xl font-black uppercase tracking-tight text-foreground">
            Inicia sesión
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Necesitas una cuenta para gestionar tu membresía.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <MembershipStatusCard
        status={profile.membership_status}
        plan={currentPlan}
        start={profile.membership_start}
        end={profile.membership_end}
        hasPendingRequest={hasPendingRequest}
      />

      <section>
        <h2 className="mb-4 flex items-center gap-2 font-sans text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <Banknote className="h-4 w-4 text-primary" />
          Solicitar un plan
        </h2>

        <PlanRequestCards
          plans={plans}
          currentPlanId={profile.plan_id}
          hasPendingRequest={hasPendingRequest}
          pending={createRequest.isPending}
          onRequest={handleRequest}
        />

        <p className="mt-3 font-mono text-xs leading-relaxed text-muted-foreground">
          Cómo funciona: elige plan y método → envía el SINPE o paga en caja →
          el administrador confirma y tu membresía se activa automáticamente.
        </p>
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 font-sans text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Mi historial
        </h2>
        <PaymentHistoryFilters value={filters} onChange={setFilters} plans={plans} />
        <PaymentHistoryList
          rows={filteredHistory}
          loading={paymentsLoading}
          currentUserId={profile.id}
          viewerIsAdmin={isAdmin}
        />
      </section>
    </div>
  )
}
