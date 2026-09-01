// @ts-nocheck
"use client"

import { useState } from "react"
import { Plus, ShieldAlert, Loader2 } from "lucide-react"
import type { Tables } from "@/types/database.types"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { useUserNutrition, useCreateNutrition, useDeleteNutrition, useUpdateNutrition, type NutritionPlanRow } from "../hooks/useNutritionPlans"
import { buildViewer, canCreateNutritionFor, canEditNutrition } from "../hooks/nutrition-helpers"
import { Calendar } from "@/_features/shared/components/Calendar"
import { NutritionFormDialog } from "./nutrition-form/dialog"
import { ConfirmDeleteNutritionDialog } from "./confirm-delete-nutrition-dialog"

type ProfileRow = Pick<Tables<"users">, "id" | "first_name" | "last_name" | "role" | "coach_id">

export function NutritionPlans({ profile }: { profile: ProfileRow }) {
  const { profile: sessionProfile } = useAuthSession()
  const viewer = buildViewer(sessionProfile)
  const { data: plans = [], isLoading, error } = useUserNutrition(profile.id)
  const createPlan = useCreateNutrition()
  const updatePlan = useUpdateNutrition()
  const deletePlan = useDeleteNutrition()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<NutritionPlanRow | null>(null)
  const [deleting, setDeleting] = useState<NutritionPlanRow | null>(null)

  const canCreate = canCreateNutritionFor(profile.id, viewer, (profile as Tables<"users">).coach_id ?? null)
  const canView = viewer.id === profile.id || viewer.role === "admin" || viewer.role === "coach"

  if (!canView) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <div className="rounded-lg border border-border bg-card px-8 py-10 text-center">
          <ShieldAlert className="mx-auto h-6 w-6 text-muted-foreground" />
          <p className="mt-2 font-sans text-sm font-bold">Acceso restringido</p>
          <p className="text-xs text-muted-foreground">Solo el miembro, su coach o admin pueden ver esta nutrición.</p>
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

  const handleSubmit = async (payload: { metadata: import("./nutrition-form/nutrition-form-types").NutritionFormPayload; days: import("./nutrition-form/nutrition-form-types").DayDraft[] }) => {
    if (editing) {
      await updatePlan.mutateAsync({ id: editing.id, dto: payload.metadata as unknown as Record<string, unknown> })
      // TODO: persist days/meals diff (update nutrition_days/meals) — por ahora solo metadata
    } else {
      if (!sessionProfile?.id) return
      await createPlan.mutateAsync({
        metadata: payload.metadata as never,
        days: payload.days.map((d) => ({ focus: d.focus, meals: d.meals.map((m) => ({ food_id: m.food_id, grams: m.grams, meal: m.meal })) })),
        targetUserId: profile.id,
        authorId: sessionProfile.id,
      })
    }
    setFormOpen(false)
    setEditing(null)
  }

  if (isLoading)
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando planes…
      </div>
    )
  if (error)
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
        <ShieldAlert className="h-5 w-5" />
        <p>{error instanceof Error ? error.message : "Error"}</p>
      </div>
    )

  const daysByIndex = new Map<number, Array<{ plan: NutritionPlanRow; focus: string }>>()
  for (const p of plans) {
    for (const d of p.nutrition_days) {
      const arr = daysByIndex.get(d.day_index) ?? []
      arr.push({ plan: p, focus: d.focus })
      daysByIndex.set(d.day_index, arr)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        {canCreate && (
          <button
            onClick={openCreate}
            className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Nuevo plan
          </button>
        )}
      </div>

      {plans.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card/50 px-6 py-12 text-center">
          <p className="font-sans text-sm font-bold">Sin planes aún</p>
          <p className="text-xs text-muted-foreground">Crea tu primer plan de 7 días.</p>
        </div>
      ) : (
        <>
          <Calendar
            renderDay={(idx) => {
              const entries = daysByIndex.get(idx) ?? []
              if (entries.length === 0) return <span className="flex h-full items-center justify-center text-[11px] text-muted-foreground/30">—</span>
              return (
                <div className="flex flex-col gap-1">
                  {entries.map(({ plan, focus }) => (
                    <button
                      key={`${plan.id}-${idx}-${focus}`}
                      onClick={() => canEditNutrition(plan, viewer) && openEdit(plan)}
                      className="w-full rounded-md border border-border bg-card px-2 py-1 text-left hover:border-primary/40"
                    >
                      <p className="truncate text-[11px] font-bold uppercase">{focus || `Día ${idx}`}</p>
                      <p className="truncate text-[10px] text-muted-foreground">{plan.name} · {plan.goal}</p>
                    </button>
                  ))}
                </div>
              )
            }}
          />
          <div className="flex flex-col gap-2">
            {plans.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card px-3 py-2">
                <span className="truncate text-xs font-bold">{p.name}</span>
                <span className="flex gap-1">
                  <button onClick={() => canEditNutrition(p, viewer) && openEdit(p)} className="rounded-md bg-primary px-2 py-1 text-[10px] uppercase text-primary-foreground">Editar</button>
                  <button onClick={() => canEditNutrition(p, viewer) && setDeleting(p)} className="rounded-md border border-destructive/40 px-2 py-1 text-[10px] uppercase text-destructive">Borrar</button>
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <NutritionFormDialog open={formOpen} plan={editing} onClose={() => { setFormOpen(false); setEditing(null) }} onSubmit={handleSubmit} />
      <ConfirmDeleteNutritionDialog plan={deleting} onCancel={() => setDeleting(null)} onConfirm={async () => { if (deleting) await deletePlan.mutateAsync(deleting); setDeleting(null) }} />
    </div>
  )
}
