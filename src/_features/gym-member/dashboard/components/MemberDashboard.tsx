"use client"

import { MembershipBanner } from "./membership-banner"
import { MyRoutineCard } from "./my-routine-card"
import { MyPaymentStatus } from "./my-payment-status"
import { RecentNotifications } from "./recent-notifications"
import { RankingPreview } from "./ranking-preview"
import { CheckInCard } from "@/_features/gym-checkin/components/check-in-card"

/**
 * "Mi espacio": membresía al centro, entrenar como acción principal.
 * Todas las consultas son own-row (RLS) o públicas (ranking).
 */
export function MemberDashboard({ profileId }: { profileId: string }) {
  return (
    <div className="flex flex-col gap-6">
      <CheckInCard userId={profileId} />
      <MembershipBanner profileId={profileId} />

      <MyRoutineCard userId={profileId} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MyPaymentStatus />
        <RecentNotifications />
      </div>

      <RankingPreview />
    </div>
  )
}
