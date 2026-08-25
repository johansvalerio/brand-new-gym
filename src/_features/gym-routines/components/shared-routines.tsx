"use client"

import { useMemo } from "react"
import {
  Loader2,
  ShieldAlert,
  Sparkles,
  Flame,
  GraduationCap,
  ShieldCheck,
  User,
} from "lucide-react"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import {
  useSharedRoutines,
  useToggleVote,
  type SharedRoutine,
  type SharedRoutineAuthor,
} from "../hooks/useSharedRoutines"
import { goalLabel } from "../hooks/routine-helpers"

function authorName(routine: SharedRoutine): string {
  const author = routine.author
  if (!author) return "Autor desconocido"
  const name = `${author.first_name ?? ""} ${author.last_name ?? ""}`.trim()
  return name || "Autor sin nombre"
}

function authorInitials(author: SharedRoutineAuthor | null): string {
  const value = `${author?.first_name?.[0] ?? ""}${author?.last_name?.[0] ?? ""}`
  return value.toUpperCase() || "?"
}

function AuthorAvatar({
  author,
  className = "h-10 w-10",
}: {
  author: SharedRoutineAuthor | null
  className?: string
}) {
  if (author?.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={author.avatar}
        alt=""
        className={`${className} shrink-0 rounded-full border border-border object-cover`}
      />
    )
  }
  return (
    <span
      className={`${className} flex shrink-0 items-center justify-center rounded-full border border-border bg-secondary font-sans text-xs font-black text-muted-foreground`}
    >
      {authorInitials(author)}
    </span>
  )
}

/**
 * Procedencia de la rutina: el dueño la hizo él mismo (self) o se la
 * diseñó un coach / el staff (created_by ≠ user_id).
 */
type Provenance = "self" | "coach" | "admin"

function provenanceOf(routine: SharedRoutine): Provenance {
  if (routine.created_by === routine.user_id) return "self"
  if (routine.author?.role === "coach") return "coach"
  return "admin"
}

const PROVENANCE_META: Record<
  Provenance,
  { label: string; icon: typeof User; className: string }
> = {
  self: {
    label: "Hecha por el miembro",
    icon: User,
    className: "border-border bg-secondary text-muted-foreground",
  },
  coach: {
    label: "Diseñada por coach",
    icon: GraduationCap,
    className: "border-primary/40 bg-primary/10 text-primary",
  },
  admin: {
    label: "Diseñada por el staff",
    icon: ShieldCheck,
    className: "border-border bg-secondary text-foreground",
  },
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

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando rutinas compartidas…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
        <ShieldAlert className="h-5 w-5" />
        <p>{error instanceof Error ? error.message : "Error al cargar rutinas"}</p>
      </div>
    )
  }

  if (routines.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex min-w-0 flex-col gap-6">
        {routines.map((routine, index) => (
          <SharedRoutineCard
            key={routine.id}
            routine={routine}
            rank={index + 1}
            viewerId={viewerId}
            onVote={() => handleVote(routine)}
            votePending={toggleVote.isPending}
          />
        ))}
      </div>

      <TopCommunityAside routines={routines} />
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
  const isViewerOwner = Boolean(viewerId) && routine.user_id === viewerId
  // Sin sesión o viendo tu propia rutina → el like no es clickeable.
  const canVote = Boolean(viewerId) && !isOwnRoutine

  const provenance = provenanceOf(routine)
  const ProvenanceIcon = PROVENANCE_META[provenance].icon

  return (
    <article className="group relative overflow-hidden rounded-lg border border-border bg-card transition-colors duration-300 hover:border-primary/40">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

      <header className="relative flex items-start gap-3 border-b border-border/60 p-4 sm:gap-4 sm:p-6">
        {/* Ranking */}
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border font-sans text-base font-black sm:h-10 sm:w-10 ${
            rank === 1
              ? "border-primary bg-primary/20 text-primary"
              : rank <= 3
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border bg-secondary text-muted-foreground"
          }`}
          aria-label={`Posición ${rank}`}
        >
          {rank}
        </span>

        <div className="min-w-0 flex-1 pr-14 sm:pr-0">
          {/* Autor: avatar + nombre + procedencia + fecha */}
          <div className="flex items-center gap-3">
            <AuthorAvatar author={routine.author} className="h-9 w-9 sm:h-10 sm:w-10" />
            <div className="min-w-0">
              <p className="flex items-center gap-2 truncate font-sans text-sm font-bold text-foreground">
                {authorName(routine)}
                {isViewerOwner && (
                  <span className="shrink-0 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 font-sans text-[9px] font-black uppercase tracking-wider text-primary">
                    Es tuya
                  </span>
                )}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted-foreground">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider ${PROVENANCE_META[provenance].className}`}
                >
                  <ProvenanceIcon className="h-3 w-3" />
                  {PROVENANCE_META[provenance].label}
                </span>
                <span>
                  {new Date(routine.created_at).toLocaleDateString("es-CR", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </p>
            </div>
          </div>

          <h2 className="mt-3 font-sans text-xl font-black uppercase leading-tight tracking-tight text-foreground line-clamp-2 sm:truncate sm:text-2xl">
            {routine.name}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              {goalLabel(routine.goal)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {routine.days_per_week} días/semana
            </span>
          </div>
        </div>

        {/* Like estilo red social: flame relleno si ya voté. En móvil flota en
            la esquina para que el header nunca dependa del ancho disponible. */}
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
          className={`absolute right-4 top-4 flex shrink-0 cursor-pointer flex-col items-center gap-1 rounded-md border px-3 py-2 transition-all duration-200 disabled:cursor-not-allowed sm:static sm:px-3.5 ${
            hasVoted
              ? "border-primary/60 bg-primary/15"
              : "border-border bg-secondary/50 hover:border-primary/50 hover:bg-primary/10"
          } ${!canVote ? "opacity-70" : ""}`}
        >
          <Flame
            className={`h-4 w-4 transition-colors duration-200 sm:h-5 sm:w-5 ${
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

type AuthorScore = {
  id: string
  name: string
  avatar: string | null
  likes: number
  routines: number
}

/** Agrega votos por autor (el creador recibe el crédito de cada rutina). */
function useTopAuthors(routines: SharedRoutine[]): AuthorScore[] {
  return useMemo(() => {
    const map = new Map<string, AuthorScore>()
    for (const routine of routines) {
      if (!routine.author) continue
      const entry = map.get(routine.author.id) ?? {
        id: routine.author.id,
        name: authorName(routine),
        avatar: routine.author.avatar,
        likes: 0,
        routines: 0,
      }
      entry.likes += routine.votes.length
      entry.routines += 1
      map.set(routine.author.id, entry)
    }
    return [...map.values()].sort((a, b) => b.likes - a.likes).slice(0, 5)
  }, [routines])
}

function TopCommunityAside({ routines }: { routines: SharedRoutine[] }) {
  const top = useTopAuthors(routines)
  const totalVotes = routines.reduce((acc, r) => acc + r.votes.length, 0)

  return (
    <aside className="h-fit space-y-4 lg:sticky lg:top-8">
      {/* Stats del ranking */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="font-sans text-2xl font-black leading-none text-foreground tabular-nums">
            {routines.length}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Rutinas
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <p className="font-sans text-2xl font-black leading-none text-primary tabular-nums">
            {totalVotes}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Votos totales
          </p>
        </div>
      </div>

      {/* Top autores por votos recibidos */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <header className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <Flame className="h-4 w-4 text-primary" />
          <h2 className="font-sans text-xs font-black uppercase tracking-widest text-foreground">
            Top de la comunidad
          </h2>
        </header>

        {top.length === 0 ? (
          <p className="px-4 py-6 text-center font-mono text-xs text-muted-foreground">
            Sin votos todavía.
          </p>
        ) : (
          <ol>
            {top.map((entry, i) => (
              <li
                key={entry.id}
                className={`flex items-center gap-3 px-4 py-3 ${
                  i < top.length - 1 ? "border-b border-border/40" : ""
                } ${i === 0 ? "bg-primary/5" : ""}`}
              >
                <span
                  className={`w-4 shrink-0 text-center font-sans text-xs font-black ${
                    i === 0 ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <AuthorAvatar
                  author={
                    routines.find((r) => r.author?.id === entry.id)?.author ??
                    null
                  }
                  className="h-9 w-9"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-sm font-bold text-foreground">
                    {entry.name}
                  </p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {entry.routines}{" "}
                    {entry.routines === 1 ? "rutina" : "rutinas"}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 font-sans text-sm font-black tabular-nums text-primary">
                  <Flame
                    className={`h-3.5 w-3.5 ${
                      i === 0 ? "fill-primary" : ""
                    }`}
                  />
                  {entry.likes}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  )
}
