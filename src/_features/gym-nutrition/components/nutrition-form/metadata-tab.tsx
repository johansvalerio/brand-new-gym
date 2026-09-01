"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNutritionDispatch, useNutritionState } from "./context"

export function MetadataTab({ errors, firstFieldRef }: { errors: Record<string, string>; firstFieldRef: React.RefObject<HTMLInputElement | null> }) {
  const { metadata } = useNutritionState()
  const dispatch = useNutritionDispatch()
  const set = (field: keyof typeof metadata, v: unknown) => dispatch({ type: "set_metadata_field", field, value: v })

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block font-mono text-xs uppercase tracking-wider text-muted-foreground">Nombre</label>
        <Input ref={firstFieldRef} value={metadata.name} onChange={(e) => set("name", e.target.value)} placeholder="Volumen limpio" />
        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-wider text-muted-foreground">Objetivo</label>
          <Select value={metadata.goal} onValueChange={(v) => set("goal", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="volumen">Volumen</SelectItem>
              <SelectItem value="definicion">Definición</SelectItem>
              <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-wider text-muted-foreground">Kcal objetivo</label>
          <Input type="number" value={metadata.kcal_target ?? ""} onChange={(e) => set("kcal_target", e.target.value ? Number(e.target.value) : null)} placeholder="2500" />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs uppercase tracking-wider text-muted-foreground">Proteína g</label>
          <Input type="number" value={metadata.protein_target ?? ""} onChange={(e) => set("protein_target", e.target.value ? Number(e.target.value) : null)} placeholder="160" />
        </div>
      </div>
    </div>
  )
}
