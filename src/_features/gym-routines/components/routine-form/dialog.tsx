"use client"

import { useEffect } from "react"
import { useBodyScrollLock } from "@/_features/shared/hooks/useBodyScrollLock"
import type { RoutineRow } from "../../hooks/routine-helpers"
import { RoutineFormShell } from "./shell"

interface RoutineFormDialogProps {
  open: boolean
  routine?: RoutineRow | null
  targetUserId: string
  onClose: () => void
  onSubmit: (payload: { metadata: import("../routine-form-types").RoutineFormPayload; days: import("../routine-form-types").DayDraft[] }) => Promise<void>
}

/**
 * Wizard de rutina (2 pasos: datos → estructura).
 * Sin <form> nativo: todo botón es type="button" con handler propio.
 * Sin setState en effects: el `key` remonta el body.
 */
export function RoutineFormDialog(props: RoutineFormDialogProps) {
  const { open, routine, targetUserId, onClose, onSubmit } = props
  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <RoutineFormShell
      key={routine?.id ?? "new"}
      routine={routine ?? null}
      targetUserId={targetUserId}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  )
}
