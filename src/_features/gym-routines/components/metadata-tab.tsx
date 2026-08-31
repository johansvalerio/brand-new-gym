"use client"

import { ROUTINE_GOALS, goalLabel } from "../hooks/routine-helpers"
import { useWizardDispatch, useWizardState } from "./routine-form/context"
import type { RoutineFormPayload } from "./routine-form-types"

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

/** Paso 1 del wizard: metadatos — consume Wizard Context directo. */
export function MetadataTab({
  errors,
  firstFieldRef,
  onEnter,
}: {
  errors: Record<string, string>
  firstFieldRef: React.RefObject<HTMLInputElement | null>
  onEnter: () => void
}) {
  const { metadata } = useWizardState()
  const dispatch = useWizardDispatch()

  const set = <K extends keyof RoutineFormPayload>(key: K, value: RoutineFormPayload[K]) =>
    dispatch({ type: "set_metadata_field", key, value })

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
      <Field label="Nombre de la rutina" htmlFor="routine_name" error={errors.name}>
        <input
          ref={firstFieldRef}
          id="routine_name"
          value={metadata.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Ej: Push · Pull · Pierna"
          className={inputCls(errors.name)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Objetivo" htmlFor="goal" error={errors.goal}>
          <select
            id="goal"
            value={metadata.goal}
            onChange={(e) => set("goal", e.target.value as RoutineFormPayload["goal"])}
            className={inputCls(errors.goal)}
          >
            {ROUTINE_GOALS.map((g) => (
              <option key={g} value={g}>
                {goalLabel(g)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Días por semana" htmlFor="days_per_week" error={errors.days_per_week}>
          <input
            id="days_per_week"
            inputMode="numeric"
            min={1}
            max={7}
            value={metadata.days_per_week}
            onChange={(e) => set("days_per_week", Math.min(7, Math.max(1, Number(e.target.value) || 0)))}
            className={inputCls(errors.days_per_week)}
          />
        </Field>
      </div>

      <Field label="Notas (opcional)" htmlFor="notes">
        <textarea
          id="notes"
          rows={3}
          value={metadata.notes ?? ""}
          onChange={(e) => set("notes", e.target.value || null)}
          placeholder="Enfoque, recomendaciones, instrucciones especiales…"
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
          <p className="font-sans text-sm font-semibold text-foreground">Rutina activa</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            La rutina que el miembro está siguiendo ahora
          </p>
        </div>
      </label>
    </div>
  )
}
