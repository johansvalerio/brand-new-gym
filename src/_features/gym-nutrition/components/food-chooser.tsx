"use client"

import { useMemo, useState } from "react"
import { Check, Search, X } from "lucide-react"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"
import { FoodVisual } from "./food-visual"
import type { FoodRow } from "../hooks/useFoods"

export function FoodChooser({
  open,
  catalog,
  value,
  onSelect,
  onClose,
}: {
  open: boolean
  catalog: FoodRow[]
  value: number
  onSelect: (id: number) => void
  onClose: () => void
}) {
  useBodyScrollLock(open)
  const [query, setQuery] = useState("")
  const [macro, setMacro] = useState<"proteina" | "carbs" | "grasas" | null>(null)

  /** Macro dominante por 100g, igual que muscle_group en ExerciseChooser. */
  const macroOf = (f: FoodRow): "proteina" | "carbs" | "grasas" => {
    if (f.protein_100 >= f.carbs_100 && f.protein_100 >= f.fat_100) return "proteina"
    if (f.carbs_100 >= f.fat_100) return "carbs"
    return "grasas"
  }

  const filtered = useMemo(() => {
    let result = catalog
    if (macro) result = result.filter((f) => macroOf(f) === macro)
    const q = query.trim().toLowerCase()
    if (q) result = result.filter((f) => f.name.toLowerCase().includes(q))
    return result
  }, [catalog, query, macro])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
      <button aria-label="Cerrar" onClick={onClose} className="absolute inset-0 cursor-pointer bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h2 className="font-sans text-lg font-black uppercase tracking-tight text-foreground">
              Elegir <span className="text-primary">alimento</span>
            </h2>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {filtered.length} de {catalog.length} · buscá por nombre
            </p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="shrink-0 border-b border-border/50 px-4 py-3 sm:px-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar alimento (pollo, arroz, huevo…)…"
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-8 text-sm text-foreground outline-none placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            {query ? (
              <button type="button" onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {/* Chips por macro — mismo patrón que chips de muscle_group en ExerciseChooser */}
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {([null, "proteina", "carbs", "grasas"] as const).map((m) => (
              <button
                key={m ?? "todos"}
                type="button"
                onClick={() => setMacro(macro === m ? null : m)}
                className={`cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  macro === m && m !== null
                    ? "border-primary bg-primary text-primary-foreground"
                    : m === null && macro === null
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === null ? "Todos" : m === "proteina" ? "Proteína" : m === "carbs" ? "Carbs" : "Grasas"}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          {filtered.length === 0 ? (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-2 text-center">
              <Search className="h-8 w-8 text-muted-foreground/40" />
              <p className="font-sans text-sm font-bold">Sin resultados para &quot;{query}&quot;</p>
              <p className="font-mono text-xs text-muted-foreground">Probá con otro término.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((food) => {
                const isSel = food.id === value
                return (
                  <button
                    key={food.id}
                    type="button"
                    aria-selected={isSel}
                    onClick={() => {
                      onSelect(food.id)
                      onClose()
                    }}
                    className={`group flex w-full cursor-pointer flex-col overflow-hidden rounded-lg border text-left transition-all duration-200 ${
                      isSel ? "border-primary/70 bg-primary/10" : "border-border bg-background/40 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-secondary/30"
                    }`}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
                      <FoodVisual food={food} className="h-full w-full rounded-none border-0" />
                      {isSel && (
                        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                          <Check className="h-4 w-4" strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <span className="px-2 py-2">
                      <span className="block truncate font-sans text-xs font-bold text-foreground">{food.name}</span>
                      <span className="flex items-center justify-between gap-1">
                        <span className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                          {food.kcal_100} kcal · {food.protein_100}g prot
                        </span>
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
