"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { FoodVisual } from "./food-visual"
import { FoodChooser } from "./food-chooser"
import type { FoodRow } from "../hooks/useFoods"

export function FoodPicker({ catalog, value, onSelect }: { catalog: FoodRow[]; value: number; onSelect: (id: number) => void }) {
  const [open, setOpen] = useState(false)
  const selected = catalog.find((f) => f.id === value) ?? null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-foreground outline-none transition-colors hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/30"
      >
        <FoodVisual food={selected} className="h-9 w-9" />
        <span className="min-w-0 flex-1 truncate text-left font-mono text-xs">
          {selected ? (
            <>
              <span className="text-foreground">{selected.name}</span>
              <span className="text-muted-foreground"> · {selected.kcal_100} kcal</span>
            </>
          ) : (
            <span className="text-muted-foreground">Selecciona alimento…</span>
          )}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      <FoodChooser open={open} catalog={catalog} value={value} onSelect={onSelect} onClose={() => setOpen(false)} />
    </>
  )
}
