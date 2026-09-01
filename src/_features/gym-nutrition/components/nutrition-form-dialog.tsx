// @ts-nocheck
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { NutritionPlanRow } from "../hooks/useNutritionPlans"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"

type Props = {
  open: boolean
  plan: NutritionPlanRow | null
  onClose: () => void
  onSubmit: (payload: { name: string; goal: string; kcal_target: number | null; protein_target: number | null; notes: string | null }) => Promise<void>
}

export function NutritionFormDialog({ open, plan, onClose, onSubmit }: Props) {
  const [name, setName] = useState(plan?.name ?? "")
  const [goal, setGoal] = useState(plan?.goal ?? "mantenimiento")
  const [pending, setPending] = useState(false)
  useBodyScrollLock(open)

  const handle = async () => {
    setPending(true)
    try {
      await onSubmit({ name, goal, kcal_target: null, protein_target: null, notes: null })
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogTitle className="font-sans uppercase">{plan ? "Editar plan" : "Nuevo plan"}</DialogTitle>
        <div className="flex flex-col gap-3">
          <Input placeholder="Nombre (ej: Volumen Limpio)" value={name} onChange={(e) => setName(e.target.value)} />
          <Select value={goal} onValueChange={setGoal}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="volumen">Volumen</SelectItem>
              <SelectItem value="definicion">Definición</SelectItem>
              <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handle} disabled={pending || !name.trim()}>{pending ? "Guardando…" : "Guardar"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
