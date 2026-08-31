"use client"

import { Plus } from "lucide-react"
import { DayEditor } from "./day-editor"
import { emptyDay } from "./routine-form-types"
import { useWizardDispatch, useWizardState } from "./routine-form/context"

/** Paso 2 del wizard: la lista de días. Lee/escribe directamente del Wizard Context. */
export function StructureTab({ errors }: { errors: Record<string, string> }) {
  const { days } = useWizardState()
  const dispatch = useWizardDispatch()

  const setDays = (next: typeof days) => dispatch({ type: "set_days", days: next })

  const updateDay = (i: number, patch: Partial<(typeof days)[number]>) =>
    setDays(days.map((d, idx) => (idx === i ? { ...d, ...patch } : d)))

  const moveDay = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= days.length) return
    const next = [...days]
    ;[next[i], next[j]] = [next[j], next[i]]
    setDays(next.map((d, idx) => ({ ...d, day_index: idx + 1 })))
  }

  const addDay = () => {
    if (days.length >= 7) return
    setDays([...days, emptyDay(days.length + 1)])
  }

  const removeDay = (i: number) =>
    setDays(days.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, day_index: idx + 1 })))

  return (
    <div className="flex flex-col gap-4">
      {days.length === 0 && (
        <p className="rounded-md border border-dashed border-border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
          Sin días. Agrega el primero abajo.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {days.map((day, i) => (
          <DayEditor
            key={day.id}
            day={day}
            isFirst={i === 0}
            isLast={i === days.length - 1}
            error={errors[`day_${i}_focus`]}
            onUpdate={(patch) => updateDay(i, patch)}
            onMoveUp={() => moveDay(i, -1)}
            onMoveDown={() => moveDay(i, 1)}
            onRemove={() => removeDay(i)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addDay}
        disabled={days.length >= 7}
        className="flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border bg-secondary/30 px-4 py-3 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
        Agregar día
      </button>

      {errors.days ? <p className="text-xs text-destructive">{errors.days}</p> : null}
    </div>
  )
}
