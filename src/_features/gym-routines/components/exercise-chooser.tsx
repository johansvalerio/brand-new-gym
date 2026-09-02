"use client"

import { useMemo, useState } from "react"
import { Check, Search, X } from "lucide-react"
import type { Tables } from "@/types/database.types"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"
import { ExerciseVisual } from "./exercise-picker"

type ExerciseRow = Tables<"exercises">

/**
 * Overlay dedicado para elegir un ejercicio: pantalla grande, grid de FOTOS,
 * búsqueda, chips por grupo muscular y filtro por equipo. Se abre encima del
 * wizard (z-[110] > wizard z-[100]) como modal de selección primaria.
 * Goal Operate (impeccable): la foto es la información; nombre+músculo+equipo
 * como meta legendibles; selección con check y cierre inmediato.
 */
export function ExerciseChooser({
  open,
  catalog,
  value,
  onSelect,
  onClose,
}: {
  open: boolean
  catalog: ExerciseRow[]
  value: number
  onSelect: (id: number) => void
  onClose: () => void
}) {
  useBodyScrollLock(open)
  const [query, setQuery] = useState("")
  const [group, setGroup] = useState<string | null>(null)

  const groups = useMemo(
    () => Array.from(new Set(catalog.map((e) => e.muscle_group))).sort(),
    [catalog],
  )

  const filtered = useMemo(() => {
    let result = catalog
    if (group) result = result.filter((e) => e.muscle_group === group)
    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.muscle_group.toLowerCase().includes(q) ||
          (e.equipment ?? "").toLowerCase().includes(q),
      )
    }
    return result
  }, [catalog, query, group])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-chooser-title"
    >
      {/* Overlay */}
      <button
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/80 backdrop-blur-sm"
      />

      {/* Panel */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header sticky */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h2
              id="exercise-chooser-title"
              className="font-sans text-lg font-black uppercase tracking-tight text-foreground"
            >
              Elegir <span className="text-primary">ejercicio</span>
            </h2>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {filtered.length} de {catalog.length} · buscá por nombre, músculo o equipo
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:h-9 sm:w-9"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Búsqueda + chips */}
        <div className="shrink-0 border-b border-border/50 px-4 py-3 sm:px-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar ejercicio (press, espalda, barra…)…"
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-8 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setGroup(null)}
              className={`cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                group === null
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos
            </button>
            {groups.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGroup(group === g ? null : g)}
                className={`cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  group === g
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de fotos */}
        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          {filtered.length === 0 ? (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-2 text-center">
              <Search className="h-8 w-8 text-muted-foreground/40" />
              <p className="font-sans text-sm font-bold text-foreground">
                Sin resultados para &quot;{query}&quot;
              </p>
              <p className="font-mono text-xs text-muted-foreground">
                Probá con otro término o quitá el filtro de grupo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((ex) => {
                const isSel = ex.id === value
                return (
                  <button
                    key={ex.id}
                    type="button"
                    role="option"
                    aria-selected={isSel}
                    onClick={() => {
                      onSelect(ex.id)
                      onClose()
                    }}
                    className={`group flex w-full cursor-pointer flex-col overflow-hidden rounded-lg border text-left transition-all duration-200 ${
                      isSel
                        ? "border-primary/70 bg-primary/10"
                        : "border-border bg-background/40 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-secondary/30"
                    }`}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
                      <ExerciseVisual exercise={ex} className="h-full w-full" />
                      {isSel ? (
                        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                          <Check className="h-4 w-4" strokeWidth={3} />
                        </span>
                      ) : null}
                    </div>
                    <span className="px-2 py-2">
                      <span className="block truncate font-sans text-xs font-bold text-foreground">
                        {ex.name}
                      </span>
                      <span className="flex items-center justify-between gap-1">
                        <span className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {ex.muscle_group}
                        </span>
                        {ex.equipment ? (
                          <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 font-mono text-[8px] uppercase text-muted-foreground">
                            {ex.equipment}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}