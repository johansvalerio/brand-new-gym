"use client"

import { Loader2, ShieldAlert, Sparkles, Flame } from "lucide-react"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import {
  useSharedRoutines,
  useToggleVote,
  type SharedRoutine,
} from "../hooks/useSharedRoutines"
import { goalLabel } from "../hooks/routine-helpers"

function authorName(routine: SharedRoutine): string {
  const author = routine.author
  if (!author) return "Autor desconocido"
  const name = `${author.first_name ?? ""} ${author.last_name ?? ""}`.trim()
  return name || "Autor sin nombre"
}

export function SharedRoutines() {
  const { profile } = useAuthSession()
  const { data: routines = [], isLoading, error } = useSharedRoutines()
  const toggleVote = useToggleVote()

  const viewerId = profile?.id ?? null

  const handleVote = (routine: SharedRoutine) => {
    if (!viewerId) return
    // La RLS rechaza el autovoto; aquí ni lo intentamos.
    if (routine.created_by === viewerId) return

    const wasVoted = routine.votes.some((v) => v.user_id === viewerId)
    toggleVote.mutateAsync({
      routineId: routine.id,
      voterProfileId: viewerId,
      wasVoted,
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando rutinas compartidas…
        </div>
      ) : error ? (
        <div className="flex min-h-[40vh] items-center justify-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
          <ShieldAlert className="h-5 w-5" />
          <p>{error instanceof Error ? error.message : "Error al cargar rutinas"}</p>
        </div>
      ) : routines.length === 0 ? (
        <EmptyState />
      ) : (
        routines.map((routine, index) => (
          <SharedRoutineCard
            key={routine.id}
            routine={routine}
            rank={index + 1}
            viewerId={viewerId}
            onVote={() => handleVote(routine)}
            votePending={toggleVote.isPending}
          />
        ))
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="relative overflow-hidden rounded-lg border border-dashed border-border bg-card/50 px-6 py-20 text-center">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-secondary/10 blur-[100px]" />
      </div>
      <div className="relative mx-auto flex max-w-md flex-col items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground">
          <Flame className="h-6 w-6" />
        </span>
        <h3 className="font-sans text-lg font-black uppercase tracking-tight text-foreground">
          Aún no hay rutinas compartidas
        </h3>
        <p className="font-mono text-sm leading-relaxed text-muted-foreground">
          Cuando un miembro comparta su rutina desde su perfil, aparecerá aquí
          para que la comunidad la vote.
        </p>
      </div>
    </div>
  )
}

function SharedRoutineCard({
  routine,
  rank,
  viewerId,
  onVote,
  votePending,
}: {
  routine: SharedRoutine
  rank: number
  viewerId: string | null
  onVote: () => void
  votePending: boolean
}) {
  const votes = routine.votes.length
  const hasVoted =
    Boolean(viewerId) && routine.votes.some((v) => v.user_id === viewerId)
  const isOwnRoutine = Boolean(viewerId) && routine.created_by === viewerId
  // Sin sesión o viendo tu propia rutina → el like no es clickeable.
  const canVote = Boolean(viewerId) && !isOwnRoutine

  return (
    <article className="group relative overflow-hidden rounded-lg border border-border bg-card transition-colors duration-300 hover:border-primary/40">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

      <header className="relative flex flex-wrap items-center gap-4 border-b border-border/60 p-4 sm:p-6">
        {/* Ranking */}
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md border font-sans text-base font-black ${
            rank <= 3
              ? "border-primary/50 bg-primary/15 text-primary"
              : "border-border bg-secondary text-muted-foreground"
          }`}
          aria-label={`Posición ${rank}`}
        >
          {rank}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              {goalLabel(routine.goal)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {routine.days_per_week} días/semana
            </span>
          </div>
          <h2 className="mt-1 font-sans text-xl font-black uppercase leading-tight tracking-tight text-foreground line-clamp-2 sm:truncate sm:text-2xl">
            {routine.name}
          </h2>
          <p className="font-mono text-xs text-muted-foreground">
            Creada por{" "}
            <span className="text-foreground">{authorName(routine)}</span>
            {" · "}
            {new Date(routine.created_at).toLocaleDateString("es-CR", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Like estilo red social: flame relleno si ya voté */}
        <button
          type="button"
          onClick={onVote}
          disabled={!canVote || votePending}
          title={
            isOwnRoutine
              ? "No puedes votar tu propia rutina"
              : !viewerId
                ? "Inicia sesión para votar"
                : hasVoted
                  ? "Quitar voto"
                  : "Votar esta rutina"
          }
          aria-pressed={hasVoted}
          aria-label={hasVoted ? "Quitar voto" : "Votar esta rutina"}
          className={`flex cursor-pointer items-center gap-2 rounded-md border px-3.5 py-2 transition-all duration-200 disabled:cursor-not-allowed ${
            hasVoted
              ? "border-primary/60 bg-primary/15"
              : "border-border bg-secondary/50 hover:border-primary/50 hover:bg-primary/10"
          } ${!canVote ? "opacity-70" : ""}`}
        >
          <Flame
            className={`h-5 w-5 transition-colors duration-200 ${
              hasVoted
                ? "fill-primary text-primary"
                : "text-muted-foreground group-hover:text-primary/60"
            }`}
          />
          <span
            className={`font-sans text-sm font-black tabular-nums ${
              hasVoted ? "text-primary" : "text-foreground"
            }`}
          >
            {votes}
          </span>
        </button>
      </header>

      {routine.notes ? (
        <p className="relative px-5 pb-5 font-mono text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pb-6">
          {routine.notes}
        </p>
      ) : null}
    </article>
  )
}
