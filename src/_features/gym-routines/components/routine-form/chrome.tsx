"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { hydrateDaysFromRoutine } from "../routine-form-data"
import type { RoutineRow } from "../../hooks/routine-helpers"
import { FormBody } from "./form-body"
import { useWizardDispatch } from "./context"

interface ShellChromeProps {
  routine: RoutineRow | null
  targetUserId: string
  isEdit: boolean
  firstFieldRef: React.RefObject<HTMLInputElement | null>
  onClose: () => void
  onSubmit: (payload: { metadata: import("../routine-form-types").RoutineFormPayload; days: import("../routine-form-types").DayDraft[] }) => Promise<void>
}

export function ShellChrome({
  routine,
  targetUserId,
  isEdit,
  firstFieldRef,
  onClose,
  onSubmit,
}: ShellChromeProps) {
  const dispatch = useWizardDispatch()
  const [hydratedDays, setHydratedDays] = useState<boolean>(false)

  useEffect(() => {
    if (!routine) {
      setHydratedDays(true)
      return
    }
    let cancelled = false
    void hydrateDaysFromRoutine(routine.id).then((d) => {
      if (!cancelled) {
        dispatch({ type: "set_days", days: d })
        setHydratedDays(true)
      }
    })
    return () => {
      cancelled = true
    }
  }, [routine, dispatch])

  if (routine && !hydratedDays) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="routine-form-title"
      >
        <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm" />
        <div className="relative z-10 flex min-w-0 max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
          <div className="flex flex-1 items-center justify-center py-20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando rutina…
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <FormBody
      routine={routine}
      targetUserId={targetUserId}
      isEdit={isEdit}
      firstFieldRef={firstFieldRef}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
