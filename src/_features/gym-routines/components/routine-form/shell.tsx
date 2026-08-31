"use client"

import { useRef } from "react"
import type { RoutineRow } from "../../hooks/routine-helpers"
import type { DayDraft, RoutineFormPayload } from "../routine-form-types"
import { emptyDay } from "../routine-form-types"
import { ShellChrome } from "./chrome"
import { RoutineFormProvider } from "./context"

const EMPTY_METADATA: RoutineFormPayload = {
  name: "",
  goal: "hipertrofia",
  days_per_week: 3,
  notes: null,
  is_active: true,
}

const createEmptyDays = (): DayDraft[] => [emptyDay(1), emptyDay(2), emptyDay(3)]

interface RoutineFormShellProps {
  routine: RoutineRow | null
  targetUserId: string
  onClose: () => void
  onSubmit: (payload: { metadata: RoutineFormPayload; days: DayDraft[] }) => Promise<void>
}

export function RoutineFormShell({ routine, targetUserId, onClose, onSubmit }: RoutineFormShellProps) {
  const isEdit = Boolean(routine)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  return (
    <RoutineFormProvider
      initialMetadata={() =>
        routine
          ? {
              name: routine.name,
              goal: routine.goal,
              days_per_week: routine.days_per_week,
              notes: routine.notes,
              is_active: routine.is_active,
            }
          : EMPTY_METADATA
      }
      initialDays={() => createEmptyDays()}
    >
      <ShellChrome
        routine={routine ?? null}
        targetUserId={targetUserId}
        isEdit={isEdit}
        firstFieldRef={firstFieldRef}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </RoutineFormProvider>
  )
}
