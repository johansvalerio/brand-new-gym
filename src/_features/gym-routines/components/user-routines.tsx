"use client"

// Barrel granularidad MASTER.md:44 - split en user-routines/*
// Este archivo re-exporta para que `app/users/profile/[id]/routine/page.tsx` no rompa.
// Nuevo código importa desde "./user-routines/*"
export { UserRoutines } from "./user-routines/index"
export { EmptyState } from "./user-routines/empty-state"
export { RoutineCard } from "./user-routines/routine-card"
export { DayPanel } from "./user-routines/day-panel"
export { MenuItem, ToggleRow } from "./user-routines/card-menu"
