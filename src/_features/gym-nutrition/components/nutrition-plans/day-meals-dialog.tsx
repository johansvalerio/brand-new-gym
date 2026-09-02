"use client"

import { useEffect } from "react"
import { X, Sunrise, Sun, Moon, Cookie } from "lucide-react"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"
import { FoodVisual } from "../food-visual"
import { dayLabel } from "../../hooks/nutrition-helpers"
import type { NutritionDayRow } from "../../hooks/useNutritionPlans"

const MEAL_META: Record<string, { label: string; icon: typeof Sunrise }> = {
  desayuno: { label: "Desayuno", icon: Sunrise },
  almuerzo: { label: "Almuerzo", icon: Sun },
  cena: { label: "Cena", icon: Moon },
  snack: { label: "Snack", icon: Cookie },
}

/**
 * Vista de lectura: al dar click a una celda del calendario muestra las
 * comidas elegidas ese día. NO edita — para editar están los botones de
 * la lista bajo el calendario.
 */
export function DayMealsDialog({
  day,
  planName,
  onClose,
}: {
  day: NutritionDayRow | null
  planName: string
  onClose: () => void
}) {
  useBodyScrollLock(Boolean(day))

  useEffect(() => {
    if (!day) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [day, onClose])

  if (!day) return null

  const meals = [...day.nutrition_meals].sort((a, b) => a.order_index - b.order_index)
  const totals = meals.reduce(
    (acc, m) => {
      acc.kcal += m.food ? (m.food.kcal_100 * m.grams) / 100 : 0
      acc.protein += m.food ? (m.food.protein_100 * m.grams) / 100 : 0
      return acc
    },
    { kcal: 0, protein: 0 },
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="day-meals-title">
      <button aria-label="Cerrar" onClick={onClose} className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm" />

      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">{dayLabel(day.day_index)}</p>
            <h2 id="day-meals-title" className="mt-0.5 font-sans text-lg font-black uppercase tracking-tight text-foreground">
              {day.focus || dayLabel(day.day_index)}
            </h2>
            <p className="truncate font-mono text-[11px] text-muted-foreground">{planName}</p>
            <p className="mt-1 font-mono text-xs text-primary">
              {Math.round(totals.kcal)} kcal · {Math.round(totals.protein)}g proteína
            </p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {meals.length === 0 ? (
            <p className="py-8 text-center font-mono text-xs text-muted-foreground">Sin comidas este día.</p>
          ) : (
            <ol className="flex flex-col gap-2">
              {meals.map((m) => {
                const meta = MEAL_META[m.meal] ?? { label: m.meal, icon: Cookie }
                const MealIcon = meta.icon
                const kcal = m.food ? Math.round((m.food.kcal_100 * m.grams) / 100) : 0
                const protein = m.food ? Math.round((m.food.protein_100 * m.grams) / 100) : 0
                return (
                  <li key={m.id} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-2.5">
                    <FoodVisual food={m.food ?? undefined} className="h-11 w-11" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-sans text-sm font-bold text-foreground">{m.food?.name ?? "Alimento"}</p>
                      <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        <MealIcon className="h-3 w-3" />
                        {meta.label} · {m.grams}g
                      </p>
                    </div>
                    <span className="shrink-0 text-right font-mono text-[10px] text-muted-foreground">
                      <span className="block text-xs font-bold text-foreground">{kcal} kcal</span>
                      {protein}g prot
                    </span>
                  </li>
                )
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  )
}
