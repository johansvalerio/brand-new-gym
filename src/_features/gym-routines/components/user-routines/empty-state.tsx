"use client"

import { ArrowLeft, CalendarRange } from "lucide-react"
import type { Tables } from "@/types/database.types"

type ProfileRow = Pick<Tables<"users">, "id" | "first_name" | "last_name" | "role" | "coach_id">

export function EmptyState({
  profile,
  viewerId,
  navigate,
}: {
  profile: ProfileRow
  viewerId: string | null | undefined
  navigate: (href: string) => void
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-secondary/10 blur-[100px]" />
      </div>
      <div className="relative mx-auto flex max-w-md flex-col items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground">
          <CalendarRange className="h-6 w-6" />
        </span>
        <h3 className="font-sans text-lg font-black uppercase tracking-tight text-foreground">Sin rutinas todavía</h3>
        <p className="font-mono text-sm leading-relaxed text-muted-foreground">
          {viewerId === profile.id ? "Tu coach aún no te ha asignado una rutina. Cuando lo haga, aparecerá aquí." : "Este miembro no tiene rutinas asignadas por ahora."}
        </p>
        <button
          onClick={() => navigate(`/users/profile/${profile.id}`)}
          className="mt-2 flex cursor-pointer items-center gap-2 rounded-none border border-border px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al perfil
        </button>
      </div>
    </div>
  )
}
