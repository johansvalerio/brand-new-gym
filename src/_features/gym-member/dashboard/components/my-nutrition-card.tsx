"use client"

import { ArrowRight, Loader2, ShieldAlert, Utensils } from "lucide-react"
import { useUserNutrition } from "@/_features/gym-nutrition/hooks/useNutritionPlans"
import { nutritionGoalLabel } from "@/_features/gym-nutrition/hooks/nutrition-helpers"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"

/** Dashboard member: mi plan de nutrición activo con macro del día 1 y link. */
export function MyNutritionCard({ userId }: { userId: string }) {
  const { navigate } = usePageTransition()
  const { data: plans = [], isLoading, error } = useUserNutrition(userId)

  const activePlan = plans.find((p) => p.is_active) ?? plans[0]

  return (
    <section className="relative flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <h3 className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Utensils className="h-4 w-4 text-primary" />
          Mi plan nutricional
        </h3>
        <button
          onClick={() => navigate(`/users/profile/${userId}/nutrition`)}
          aria-label="Ver mi plan de nutrición"
          className="flex cursor-pointer items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
        >
          Ver plan
          <ArrowRight className="h-3 w-3" />
        </button>
      </header>

      <div className="flex flex-1 flex-col justify-center px-4 py-6 sm:px-6">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando...
          </div>
        ) : error ? (
          <p className="flex items-center gap-2 py-4 text-sm text-destructive">
            <ShieldAlert className="h-4 w-4" />
            {error instanceof Error ? error.message : "Error inesperado"}
          </p>
        ) : !activePlan ? (
          <div className="py-2 text-center">
            <Utensils className="mx-auto h-8 w-8 text-muted-foreground/40" />
            <p className="mt-2 font-sans text-sm font-bold text-foreground">Aún no tienes plan de nutrición</p>
            <p className="mt-1 text-xs text-muted-foreground">Pídele uno a tu coach o crea el tuyo en Nutrición.</p>
            <button
              onClick={() => navigate(`/users/profile/${userId}/nutrition`)}
              className="mt-4 cursor-pointer rounded-md border border-primary/40 bg-primary/10 px-4 py-2 font-mono text-[11px] uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Crear plan
            </button>
          </div>
        ) : (
          <>
            <p className="truncate font-sans text-lg font-black uppercase tracking-tight text-foreground">
              {activePlan.name}
            </p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {nutritionGoalLabel(activePlan.goal)} · {activePlan.nutrition_days.length} día{activePlan.nutrition_days.length === 1 ? "" : "s"}
            </p>

            <ul className="mt-4 space-y-2">
              {activePlan.nutrition_days.slice(0, 3).map((day) => (
                <li key={day.id} className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-secondary/30 px-3 py-2">
                  <span className="min-w-0 truncate font-sans text-xs font-semibold text-foreground">{day.focus}</span>
                  <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                    {day.nutrition_meals.length} comida{day.nutrition_meals.length === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
              {activePlan.nutrition_days.length > 3 ? (
                <li className="text-right font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  +{activePlan.nutrition_days.length - 3} días más
                </li>
              ) : null}
            </ul>

            <button
              onClick={() => navigate(`/users/profile/${userId}/nutrition`)}
              className="mt-5 w-full cursor-pointer rounded-md bg-primary py-3 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90"
            >
              Ver plan completo
            </button>
          </>
        )}
      </div>
    </section>
  )
}
