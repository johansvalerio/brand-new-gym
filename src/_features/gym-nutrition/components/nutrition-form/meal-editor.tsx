"use client"

import { Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useFoods } from "../../hooks/useFoods"
import type { MealDraft } from "./nutrition-form-types"

export function MealEditor({ meal, onUpdate, onRemove }: { meal: MealDraft; onUpdate: (p: Partial<MealDraft>) => void; onRemove: () => void }) {
  const { data: foods = [] } = useFoods()
  const food = foods.find((f) => f.id === meal.food_id)
  const kcal = food ? Math.round((food.kcal_100 * meal.grams) / 100) : 0
  const protein = food ? Math.round((food.protein_100 * meal.grams) / 100) : 0

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-card p-2 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Alimento</label>
        <Select value={String(meal.food_id || "")} onValueChange={(v) => onUpdate({ food_id: Number(v) })}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Elige" />
          </SelectTrigger>
          <SelectContent>
            {foods.map((f) => (
              <SelectItem key={f.id} value={String(f.id)}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-20">
        <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">g</label>
        <Input type="number" className="h-8" value={meal.grams} onChange={(e) => onUpdate({ grams: Number(e.target.value) || 0 })} />
      </div>
      <div className="w-28">
        <label className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Toma</label>
        <Select value={meal.meal} onValueChange={(v) => onUpdate({ meal: v as MealDraft["meal"] })}>
          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="desayuno">Desayuno</SelectItem>
            <SelectItem value="almuerzo">Almuerzo</SelectItem>
            <SelectItem value="cena">Cena</SelectItem>
            <SelectItem value="snack">Snack</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="hidden w-24 text-center sm:block">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Macro</p>
        <p className="font-mono text-xs text-foreground">{kcal} kcal · {protein}g</p>
      </div>
      <button type="button" onClick={onRemove} className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:border-destructive">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
