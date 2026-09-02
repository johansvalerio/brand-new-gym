"use client"

import { Trash2 } from "lucide-react"
import { FoodPicker } from "../food-picker"
import { useFoods } from "../../hooks/useFoods"
import type { MealDraft } from "./nutrition-form-types"

export function MealEditor({ meal, onUpdate, onRemove }: { meal: MealDraft; onUpdate: (p: Partial<MealDraft>) => void; onRemove: () => void }) {
  const { data: foods = [] } = useFoods()

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border/60 bg-background/40 p-2">
      <FoodPicker catalog={foods} value={meal.food_id} onSelect={(id) => onUpdate({ food_id: id })} />

      <div className="grid grid-cols-4 items-center gap-2 sm:grid-cols-12">
        <div className="col-span-1 flex flex-col gap-1 sm:col-span-3">
          <label className="text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Gramos</label>
          <input
            type="number"
            min={10}
            value={meal.grams}
            onChange={(e) => onUpdate({ grams: Number(e.target.value) || 0 })}
            className={microInputCls("text-primary")}
          />
        </div>

        <div className="col-span-1 flex flex-col gap-1 sm:col-span-3">
          <label className="text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Toma</label>
          <select
            value={meal.meal}
            onChange={(e) => onUpdate({ meal: e.target.value as MealDraft["meal"] })}
            className={microInputCls("text-foreground")}
          >
            <option value="desayuno">Desayuno</option>
            <option value="almuerzo">Almuerzo</option>
            <option value="cena">Cena</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        <div className="col-span-1 flex flex-col gap-1 sm:col-span-3">
          <label className="text-center font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Macro</label>
          <div className="flex h-[38px] items-center justify-center rounded-md border border-border bg-background px-1 text-center font-mono text-xs text-muted-foreground sm:h-7">
            {(() => {
              const f = foods.find((x) => x.id === meal.food_id)
              if (!f) return "—"
              const kcal = Math.round((f.kcal_100 * meal.grams) / 100)
              const prot = Math.round((f.protein_100 * meal.grams) / 100)
              return `${kcal} kcal · ${prot}g`
            })()}
          </div>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="col-span-1 flex h-[38px] w-full cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive sm:col-span-3 sm:h-7"
          aria-label="Quitar comida"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

function microInputCls(color: string) {
  return ["w-full min-w-0 rounded-md border border-border bg-background px-1 py-2 text-center font-mono text-xs", "outline-none transition-colors focus:border-primary", color].join(" ")
}
