"use client"

import { useState } from "react"
import { Check, Search, X } from "lucide-react"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"
import { FoodVisual } from "./food-visual"
import type { FoodRow } from "../hooks/useFoods"

type MultiProps = {
  open: boolean
  catalog: FoodRow[]
  /** Selección inicial al abrir (ids ya agregados van en excludeIds). */
  initialSelected?: number[]
  /** Ids ya agregados: se muestran deshabilitados con badge "Agregado". */
  excludeIds?: number[]
  onConfirm: (ids: number[]) => void
  onClose: () => void
  value?: never
  onSelect?: never
}

type SingleProps = {
  open: boolean
  catalog: FoodRow[]
  value: number
  onSelect: (id: number) => void
  onClose: () => void
  initialSelected?: never
  excludeIds?: never
  onConfirm?: never
}

/**
 * Mirror de ExerciseChooser para alimentos: grid de FOTOS, búsqueda y chips
 * por macro dominante. Mismo z-[110] sobre el wizard y mismos dos modos:
 * - single (value + onSelect, ej. FoodPicker por fila): click elige y cierra.
 * - multi (onConfirm, ej. DayEditor bulk): toggle con check + footer
 *   "Agregar N" confirma sin cerrar por cada click.
 */
export function FoodChooser(props: MultiProps | SingleProps) {
  useBodyScrollLock(props.open)

  if (!props.open) return null

  return <FoodChooserInner key="open" {...props} />
}

function FoodChooserInner(props: MultiProps | SingleProps) {
  const { catalog, onClose } = props
  const multi = typeof props.onConfirm === "function"

  const [query, setQuery] = useState("")
  const [macro, setMacro] = useState<"proteina" | "carbs" | "grasas" | null>(null)
  const [selected, setSelected] = useState<number[]>(() =>
    multi ? (props.initialSelected ?? []) : [],
  )

  const excluded = new Set(multi ? (props.excludeIds ?? []) : [])
  const selectedSet = new Set(selected)

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  /** Macro dominante por 100g, igual que muscle_group en ExerciseChooser. */
  const macroOf = (f: FoodRow): "proteina" | "carbs" | "grasas" => {
    if (f.protein_100 >= f.carbs_100 && f.protein_100 >= f.fat_100) return "proteina"
    if (f.carbs_100 >= f.fat_100) return "carbs"
    return "grasas"
  }

  let filtered = catalog
  if (macro) filtered = filtered.filter((f) => macroOf(f) === macro)
  const q = query.trim().toLowerCase()
  if (q) filtered = filtered.filter((f) => f.name.toLowerCase().includes(q))

  const handleCardClick = (food: FoodRow) => {
    if (!multi) {
      props.onSelect(food.id)
      onClose()
      return
    }
    if (excluded.has(food.id)) return
    toggle(food.id)
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
      <button aria-label="Cerrar" onClick={onClose} className="absolute inset-0 cursor-pointer bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h2 className="font-sans text-lg font-black uppercase tracking-tight text-foreground">
              Elegir <span className="text-primary">alimento</span>
              {multi && selected.length > 0 ? (
                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 align-middle font-mono text-[11px] text-primary-foreground">
                  {selected.length}
                </span>
              ) : null}
            </h2>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {filtered.length} de {catalog.length} · buscá por nombre
              {multi ? " · tocá varios y confirmá abajo" : null}
            </p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-secondary">
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
                const isSel = multi
                  ? selectedSet.has(food.id)
                  : food.id === (props as SingleProps).value
                const isExcluded = excluded.has(food.id)
                return (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => handleCardClick(food)}
                    disabled={isExcluded}
                    className={`group flex w-full flex-col overflow-hidden rounded-lg border text-left transition-all duration-200 ${
                      isExcluded
                        ? "cursor-not-allowed border-border bg-background/20 opacity-40 grayscale"
                        : isSel
                          ? "cursor-pointer border-primary/70 bg-primary/10"
                          : "cursor-pointer border-border bg-background/40 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-secondary/30"
                    }`}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
                      <FoodVisual food={food} className="h-full w-full rounded-none border-0" />
                      {isSel && (
                        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                          <Check className="h-4 w-4" strokeWidth={3} />
                        </span>
                      )}
                      {isExcluded && (
                        <span className="absolute right-2 top-2 rounded-full bg-secondary px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                          Agregado
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

        {/* Footer multi: limpiar + confirmar N */}
        {multi ? (
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-secondary/30 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setSelected([])}
              disabled={selected.length === 0}
              className="cursor-pointer rounded-none px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              Limpiar
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-none border border-border px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={selected.length === 0}
                onClick={() => {
                  props.onConfirm(selected)
                  onClose()
                }}
                className="cursor-pointer rounded-none bg-primary px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
              >
                Agregar {selected.length > 0 ? `(${selected.length})` : ""}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
