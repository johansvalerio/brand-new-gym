"use client"

import type { UserRoutine } from "../../hooks/useUserRoutines"

const DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

export function DayPanel({ day }: { day: UserRoutine["routine_days"][number] }) {
  const dayName = DAY_NAMES[day.day_index - 1] ?? `Día ${day.day_index}`
  return (
    <div className="overflow-hidden rounded-md border border-border/70 bg-secondary/30">
      <header className="flex items-center justify-between border-b border-border/60 bg-secondary/60 px-4 py-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{dayName}</p>
          <h3 className="font-sans text-base font-black uppercase tracking-tight text-foreground">{day.focus}</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {day.routine_exercises.length} ejercicios
        </span>
      </header>
      {day.routine_exercises.length === 0 ? (
        <p className="px-4 py-6 font-mono text-xs text-muted-foreground">Sin ejercicios en este día.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border/40">
                {["Ejercicio", "Sets", "Reps", "Descanso"].map((h) => (
                  <th key={h} className="px-3 py-2 font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {day.routine_exercises.map((item) => (
                <tr key={item.id} className="border-b border-border/30 last:border-0">
                  <td className="px-3 py-2">
                    <p className="font-sans text-sm font-semibold text-foreground">{item.exercise.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {item.exercise.muscle_group}
                      {item.exercise.equipment ? ` · ${item.exercise.equipment}` : ""}
                    </p>
                  </td>
                  <td className="px-3 py-2 font-sans text-sm font-bold text-primary">{item.sets}</td>
                  <td className="px-3 py-2 font-mono text-sm text-foreground">{item.reps}</td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{item.rest_seconds}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
