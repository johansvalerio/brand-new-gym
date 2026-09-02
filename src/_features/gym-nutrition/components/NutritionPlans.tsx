"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Loader2, Plus, ShieldAlert } from "lucide-react"
import type { Tables } from "@/types/database.types"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { useUserNutrition, useCreateNutrition, useDeleteNutrition, useUpdateNutrition, useUpdateFullNutrition, type NutritionPlanRow, type NutritionDayRow } from "../hooks/useNutritionPlans"
import { buildViewer, canCreateNutritionFor, canEditNutrition, dayLabel } from "../hooks/nutrition-helpers"
import { Calendar } from "@/_features/shared/components/Calendar"
import { NutritionFormDialog } from "./nutrition-form/dialog"
import { ConfirmDeleteNutritionDialog } from "./confirm-delete-nutrition-dialog"
import { DayMealsDialog } from "./nutrition-plans/day-meals-dialog"
import { EmptyState } from "./nutrition-plans/empty-state"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

type ProfileRow = Pick<Tables<"users">, "id" | "first_name" | "last_name" | "role" | "coach_id">

export function NutritionPlans({ profile }: { profile: ProfileRow }) {
  const { profile: sessionProfile } = useAuthSession()
  const viewerId = sessionProfile?.id ?? null
  const viewer = buildViewer(sessionProfile)
  const { data: plans = [], isLoading, error } = useUserNutrition(profile.id)
  const createPlan = useCreateNutrition()
  const updateFullPlan = useUpdateFullNutrition()
  const deletePlan = useDeleteNutrition()
  const toggleActive = useUpdateNutrition()
  const toggleShared = useUpdateNutrition()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<NutritionPlanRow | null>(null)
  const [deleting, setDeleting] = useState<NutritionPlanRow | null>(null)
  // Vista de solo-lectura al click en una celda del calendario
  const [viewingDay, setViewingDay] = useState<{ day: NutritionDayRow; planName: string } | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = sectionRef.current
    if (!container || plans.length === 0) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(container.querySelectorAll("[data-plan-card]"), { clearProps: "all" })
      return
    }
    const cards = container.querySelectorAll("[data-plan-card]")
    const tl = gsap.timeline({ scrollTrigger: { trigger: container, start: "top 85%" } })
    tl.fromTo(cards, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power3.out" })
    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [plans.length])

  const canCreate = canCreateNutritionFor(profile.id, viewer, (profile as Tables<"users">).coach_id ?? null)
  const canView = viewer.id === profile.id || viewer.role === "admin" || viewer.role === "coach"

  if (!canView) {
    return (
      <div className="relative flex min-h-[40vh] items-center justify-center px-4">
        <div className="rounded-lg border border-border bg-card px-8 py-10 text-center shadow-sm">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-muted/50">
            <ShieldAlert className="h-6 w-6 text-muted-foreground/60" />
          </span>
          <p className="font-sans text-xl font-black uppercase tracking-tight text-foreground">Acceso restringido</p>
          <p className="mt-2 text-sm text-muted-foreground">Solo el miembro, su coach o un administrador pueden ver esta nutrición.</p>
        </div>
      </div>
    )
  }

  const openCreate = () => {
    if (!canCreate) return
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (plan: NutritionPlanRow) => {
    if (!canEditNutrition(plan, viewer)) return
    setEditing(plan)
    setFormOpen(true)
  }
  const handleSubmit = async ({ metadata, days }: { metadata: import("./nutrition-form/nutrition-form-types").NutritionFormPayload; days: import("./nutrition-form/nutrition-form-types").DayDraft[] }) => {
    if (editing) {
      // full update: metadata + días + comidas (persistNutritionDays delete+recreate, patrón rutinas)
      await updateFullPlan.mutateAsync({
        planId: editing.id,
        metadata,
        days: days.map((d, i) => ({
          day_index: d.day_index || i + 1,
          focus: d.focus,
          meals: d.meals.map((m) => ({ food_id: m.food_id, grams: m.grams, meal: m.meal })),
        })),
      })
    } else {
      if (!sessionProfile?.id) return
      await createPlan.mutateAsync({
        metadata,
        days: days.map((d, i) => ({ focus: d.focus, day_index: d.day_index || i + 1, meals: d.meals.map((m) => ({ food_id: m.food_id, grams: m.grams, meal: m.meal })) })),
        targetUserId: profile.id,
        authorId: sessionProfile.id,
      })
    }
    setFormOpen(false)
    setEditing(null)
  }
  const handleToggleActive = async (plan: NutritionPlanRow) => {
    if (!canEditNutrition(plan, viewer)) return
    await toggleActive.mutateAsync({ id: plan.id, dto: { is_active: !plan.is_active } })
  }
  const handleToggleShared = async (plan: NutritionPlanRow) => {
    if (plan.created_by !== viewer.id) return
    await toggleShared.mutateAsync({ id: plan.id, dto: { is_shared: !plan.is_shared } })
  }
  const handleDelete = async () => {
    if (!deleting) return
    if (!canEditNutrition(deleting, viewer)) return
    await deletePlan.mutateAsync(deleting)
    setDeleting(null)
  }

  if (isLoading)
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando planes…
      </div>
    )
  if (error)
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
        <ShieldAlert className="h-5 w-5" />
        <p>{error instanceof Error ? error.message : "Error al cargar planes"}</p>
      </div>
    )

  // Agrupa días por day_index para el calendario semanal (Drive-style 7 cols)
  const daysByIndex = new Map<number, Array<{ plan: NutritionPlanRow; day: NutritionDayRow }>>()
  for (const p of plans) {
    for (const d of p.nutrition_days) {
      const arr = daysByIndex.get(d.day_index) ?? []
      arr.push({ plan: p, day: d })
      daysByIndex.set(d.day_index, arr)
    }
  }

  return (
    <div ref={sectionRef} className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-end gap-3">
        {canCreate ? (
          <button
            onClick={openCreate}
            className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Nuevo plan
          </button>
        ) : null}
      </div>
      {plans.length === 0 ? (
        <EmptyState isOwn={viewerId === profile.id} />
      ) : (
        <Calendar
          renderDay={(dayIndex) => {
            const entries = daysByIndex.get(dayIndex) ?? []
            if (entries.length === 0) {
              return <span className="flex h-full items-center justify-center font-mono text-[11px] text-muted-foreground/30">—</span>
            }
            return (
              <div className="flex flex-col gap-1.5">
                {entries.map(({ plan, day }) => (
                  <button
                    key={`${plan.id}-${day.id}`}
                    data-plan-card
                    onClick={() => setViewingDay({ day, planName: plan.name })}
                    className="w-full cursor-pointer rounded-md border border-border bg-card px-2 py-1.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 text-xs"
                    title={`${day.focus || dayLabel(day.day_index)} — ${plan.name}`}
                  >
                    <p className="truncate font-sans text-[11px] font-bold uppercase tracking-wide text-foreground">
                      {day.focus?.trim() || dayLabel(day.day_index)}
                    </p>
                    <p className="truncate font-mono text-[10px] text-muted-foreground">
                      {day.nutrition_meals.length} comidas · <span className="text-[9px] uppercase">{plan.name}</span>
                    </p>
                  </button>
                ))}
              </div>
            )
          }}
        />
      )}
      {/* Lista detallada se mantiene colapsada bajo calendario para acciones (activar/compartir/borrar) */}
      {plans.length > 0 && (
        <div className="flex flex-col gap-2">
          {plans.map((plan) => (
            <div key={`actions-${plan.id}`} data-plan-card className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2">
              <span className="truncate font-sans text-xs font-bold text-foreground">{plan.name}</span>
              <span className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleActive(plan)}
                  disabled={!canEditNutrition(plan, viewer) || toggleActive.isPending}
                  className="rounded-md border border-border px-2 py-1 font-mono text-[10px] uppercase text-muted-foreground hover:border-primary/40 hover:text-primary disabled:opacity-50"
                >
                  {plan.is_active ? "Desactivar" : "Activar"}
                </button>
                <button
                  onClick={() => handleToggleShared(plan)}
                  disabled={plan.created_by !== viewer.id || toggleShared.isPending}
                  className="rounded-md border border-border px-2 py-1 font-mono text-[10px] uppercase text-muted-foreground hover:border-primary/40 hover:text-primary disabled:opacity-50"
                >
                  {plan.is_shared ? "Privar" : "Compartir"}
                </button>
                <button
                  onClick={() => canEditNutrition(plan, viewer) && openEdit(plan)}
                  className="rounded-md bg-primary px-2 py-1 font-mono text-[10px] uppercase text-primary-foreground hover:opacity-90"
                >
                  Editar
                </button>
                <button
                  onClick={() => canEditNutrition(plan, viewer) && setDeleting(plan)}
                  className="rounded-md border border-destructive/40 px-2 py-1 font-mono text-[10px] uppercase text-destructive hover:bg-destructive/10"
                >
                  Borrar
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
      <NutritionFormDialog open={formOpen} plan={editing} targetUserId={profile.id} onClose={() => { setFormOpen(false); setEditing(null) }} onSubmit={handleSubmit} />
      <ConfirmDeleteNutritionDialog plan={deleting} onCancel={() => setDeleting(null)} onConfirm={handleDelete} />
      <DayMealsDialog day={viewingDay?.day ?? null} planName={viewingDay?.planName ?? ""} onClose={() => setViewingDay(null)} />
    </div>
  )
}
