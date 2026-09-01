"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { NutritionPlanRow } from "../hooks/useNutritionPlans"

export function ConfirmDeleteNutritionDialog({ plan, onCancel, onConfirm }: { plan: NutritionPlanRow | null; onCancel: () => void; onConfirm: () => void }) {
  if (!plan) return null
  return (
    <Dialog open={Boolean(plan)} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogTitle>Eliminar {plan.name}?</DialogTitle>
        <p className="text-sm text-muted-foreground">Se borrarán sus días y comidas.</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm}>Eliminar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
