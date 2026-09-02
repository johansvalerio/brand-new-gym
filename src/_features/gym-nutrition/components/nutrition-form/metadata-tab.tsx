"use client"

import { NUTRITION_GOALS, nutritionGoalLabel } from "../../hooks/nutrition-helpers"
import { useNutritionDispatch, useNutritionState } from "./context"
import type { NutritionFormPayload } from "./nutrition-form-types"

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {children}
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  )
}

function inputCls(error?: string) {
  return [
    "w-full rounded-md border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60",
    "outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30",
    error ? "border-destructive" : "border-border",
  ].join(" ")
}

/** Paso 1 del wizard: metadatos — consume el contexto directo. */
export function MetadataTab({
  errors,
  firstFieldRef,
  onEnter,
}: {
  errors: Record<string, string>
  firstFieldRef: React.RefObject<HTMLInputElement | null>
  onEnter: () => void
}) {
  const { metadata } = useNutritionState()
  const dispatch = useNutritionDispatch()

  const set = <K extends keyof NutritionFormPayload>(key: K, value: NutritionFormPayload[K]) =>
    dispatch({ type: "set_metadata_field", field: key, value })

  return (
    <div
      className="flex flex-col gap-4"
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
          e.preventDefault()
          onEnter()
        }
      }}
    >
      <Field label="Nombre del plan" htmlFor="plan_name" error={errors.name}>
        <input
          ref={firstFieldRef}
          id="plan_name"
          value={metadata.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Ej: Volumen limpio"
          className={inputCls(errors.name)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Objetivo" htmlFor="goal" error={errors.goal}>
          <select
            id="goal"
            value={metadata.goal}
            onChange={(e) => set("goal", e.target.value as NutritionFormPayload["goal"])}
            className={inputCls(errors.goal)}
          >
            {NUTRITION_GOALS.map((g) => (
              <option key={g} value={g}>
                {nutritionGoalLabel(g)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Kcal objetivo" htmlFor="kcal_target" error={errors.kcal_target}>
          <input
            id="kcal_target"
            inputMode="numeric"
            min={800}
            max={6000}
            value={metadata.kcal_target ?? ""}
            onChange={(e) => set("kcal_target", e.target.value ? Number(e.target.value) : null)}
            placeholder="2500"
            className={inputCls(errors.kcal_target)}
          />
        </Field>
        <Field label="Proteína g" htmlFor="protein_target" error={errors.protein_target}>
          <input
            id="protein_target"
            inputMode="numeric"
            min={30}
            max={400}
            value={metadata.protein_target ?? ""}
            onChange={(e) => set("protein_target", e.target.value ? Number(e.target.value) : null)}
            placeholder="160"
            className={inputCls(errors.protein_target)}
          />
        </Field>
      </div>

      <Field label="Notas (opcional)" htmlFor="notes">
        <textarea
          id="notes"
          rows={3}
          value={metadata.notes ?? ""}
          onChange={(e) => set("notes", e.target.value || null)}
          placeholder="Suplementación, restricciones, horarios recomendados…"
          className={`${inputCls()} resize-none`}
        />
      </Field>

      <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-secondary/30 px-4 py-3">
        <input
          type="checkbox"
          checked={metadata.is_active}
          onChange={(e) => set("is_active", e.target.checked)}
          className="h-4 w-4 cursor-pointer accent-primary"
        />
        <div>
          <p className="font-sans text-sm font-semibold text-foreground">Plan activo</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            El plan que el miembro está siguiendo ahora
          </p>
        </div>
      </label>
    </div>
  )
}
