"use client"

import { useMemo } from "react"
import {
  Loader2,
  ShieldAlert,
  Flame,
  GraduationCap,
  ShieldCheck,
  User,
  CopyPlus,
  Utensils,
} from "lucide-react"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import {
  useSharedNutrition,
  useToggleNutritionVote,
  useCopySharedNutritionPlan,
  planDailyMacros,
  type SharedNutritionPlan,
  type SharedPlanAuthor,
} from "../hooks/useSharedNutrition"
import { nutritionGoalLabel } from "../hooks/nutrition-helpers"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"

function authorName(plan: SharedNutritionPlan): string {
  const author = plan.author
  if (!author) return "Autor desconocido"
  const name = `${author.first_name ?? ""} ${author.last_name ?? ""}`.trim()
  return name || "Autor sin nombre"
}

function authorInitials(author: SharedPlanAuthor | null): string {
  const value = `${author?.first_name?.[0] ?? ""}${author?.last_name?.[0] ?? ""}`
  return value.toUpperCase() || "?"
}

function AuthorAvatar({ author, className = "h-10 w-10" }: { author: SharedPlanAuthor | null; className?: string }) {
  if (author?.avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={author.avatar} alt="" className={`${className} shrink-0 rounded-full border border-border object-cover`} />
    )
  }
  return (
    <span className={`${className} flex shrink-0 items-center justify-center rounded-full border border-border bg-secondary font-sans text-xs font-black text-muted-foreground`}>
      {authorInitials(author)}
    </span>
  )
}

type Provenance = "self" | "coach" | "admin"

function provenanceOf(plan: SharedNutritionPlan): Provenance {
  if (plan.created_by === plan.user_id) return "self"
  if (plan.author?.role === "coach") return "coach"
  return "admin"
}

const PROVENANCE_META: Record<Provenance, { label: string; icon: typeof User; className: string }> = {
  self: { label: "Hecho por el miembro", icon: User, className: "border-border bg-secondary text-muted-foreground" },
  coach: { label: "Diseñado por coach", icon: GraduationCap, className: "border-primary/40 bg-primary/10 text-primary" },
  admin: { label: "Diseñado por el staff", icon: ShieldCheck, className: "border-border bg-secondary text-foreground" },
}

export function SharedNutrition() {
  const { profile } = useAuthSession()
  const { data: plans = [], isLoading, error } = useSharedNutrition()
  const toggleVote = useToggleNutritionVote()
  const copyPlan = useCopySharedNutritionPlan()
  const { navigate } = usePageTransition()

  const viewerId = profile?.id ?? null

  const handleVote = (plan: SharedNutritionPlan) => {
    if (!viewerId) return
    if (plan.created_by === viewerId) return
    const wasVoted = plan.votes.some((v) => v.user_id === viewerId)
    toggleVote.mutateAsync({ planId: plan.id, voterProfileId: viewerId, wasVoted })
  }

  const handleCopy = async (plan: SharedNutritionPlan) => {
    if (!viewerId) {
      navigate("/auth/login")
      return
    }
    if (copyPlan.isPending) return
    await copyPlan.mutateAsync({ planId: plan.id, viewerId })
    navigate(`/users/profile/${viewerId}/nutrition`)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando planes compartidos…
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
        <ShieldAlert className="h-5 w-5" />
        <p>{error instanceof Error ? error.message : "Error al cargar planes"}</p>
      </div>
    )
  }

  if (plans.length === 0) return <EmptyState />

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex min-w-0 flex-col gap-6">
        {plans.map((plan, index) => (
          <SharedNutritionCard
            key={plan.id}
            plan={plan}
            rank={index + 1}
            viewerId={viewerId}
            onVote={() => handleVote(plan)}
            votePending={toggleVote.isPending}
            onCopy={() => handleCopy(plan)}
            copyPending={copyPlan.isPending}
          />
        ))}
      </div>
      <TopNutritionAside plans={plans} />
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
          Aún no hay planes compartidos
        </h3>
        <p className="font-mono text-sm leading-relaxed text-muted-foreground">
          Cuando un miembro comparta su plan desde Nutrición, aparecerá aquí para que la comunidad lo vote.
        </p>
      </div>
    </div>
  )
}

function SharedNutritionCard({
  plan,
  rank,
  viewerId,
  onVote,
  votePending,
  onCopy,
  copyPending,
}: {
  plan: SharedNutritionPlan
  rank: number
  viewerId: string | null
  onVote: () => void
  votePending: boolean
  onCopy: () => void
  copyPending: boolean
}) {
  const votes = plan.votes.length
  const hasVoted = Boolean(viewerId) && plan.votes.some((v) => v.user_id === viewerId)
  const isOwnPlan = Boolean(viewerId) && plan.created_by === viewerId
  const isViewerOwner = Boolean(viewerId) && plan.user_id === viewerId
  const canVote = Boolean(viewerId) && !isOwnPlan
  const canCopy = !isViewerOwner

  const provenance = provenanceOf(plan)
  const ProvenanceIcon = PROVENANCE_META[provenance].icon
  // Macros reales del plan (suma de foods por 100g), no los targets declarados
  const macros = planDailyMacros(plan)

  return (
    <article
      className={`group relative w-full min-w-0 max-w-full overflow-hidden rounded-lg border transition-colors duration-300 ${
        rank === 1
          ? "border-primary/40 bg-gradient-to-b from-primary/[0.07] to-card shadow-[0_0_40px_-12px_rgba(150,217,6,0.28)]"
          : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl transition-opacity duration-500 ${
          rank === 1 ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      />

      <header className="relative flex items-start gap-2 border-b border-border/60 p-3 sm:gap-4 sm:p-6">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border font-sans text-sm font-black tabular-nums sm:h-10 sm:w-10 sm:text-base ${
            rank === 1
              ? "border-transparent bg-primary text-primary-foreground shadow-[0_0_16px_rgba(150,217,6,0.45)]"
              : rank <= 3
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border bg-secondary text-muted-foreground"
          }`}
          aria-label={`Posición ${rank}`}
        >
          {rank}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2 sm:items-center sm:gap-3">
            <AuthorAvatar author={plan.author} className="h-8 w-8 shrink-0 sm:h-10 sm:w-10" />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-1.5 font-sans text-[13px] font-bold text-foreground sm:gap-2 sm:text-sm">
                <span className="truncate">{authorName(plan)}</span>
                {isViewerOwner && (
                  <span className="shrink-0 rounded-full border border-primary/40 bg-primary/10 px-1.5 py-0.5 font-sans text-[8px] font-black uppercase tracking-wider text-primary sm:px-2 sm:text-[9px]">
                    Es tuyo
                  </span>
                )}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-[10px] text-muted-foreground sm:gap-x-2 sm:text-[11px]">
                <span className={`inline-flex max-w-full items-center gap-1 truncate rounded-full border px-1.5 py-0.5 font-sans text-[8px] font-bold uppercase tracking-wider sm:px-2 sm:text-[9px] ${PROVENANCE_META[provenance].className}`}>
                  <ProvenanceIcon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{PROVENANCE_META[provenance].label}</span>
                </span>
                <span className="shrink-0">
                  {new Date(plan.created_at).toLocaleDateString("es-CR", { year: "numeric", month: "short", day: "numeric" })}
                </span>
              </p>
            </div>
          </div>

          <h2 className="mt-2.5 line-clamp-2 font-sans text-[17px] font-black uppercase leading-tight tracking-tight text-foreground sm:mt-3 sm:truncate sm:text-2xl">
            {plan.name}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider text-muted-foreground sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[10px]">
              <Utensils className="h-3 w-3" />
              {nutritionGoalLabel(plan.goal)}
            </span>
            {/* Macros reales calculados de las comidas (no los targets declarados) */}
            {macros.kcal > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider text-primary sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[10px]">
                ~{macros.kcal} kcal/día
              </span>
            ) : null}
            {macros.protein > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider text-muted-foreground sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-[10px]">
                {macros.protein}g proteína/día
              </span>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={onVote}
          disabled={!canVote || votePending}
          title={
            isOwnPlan
              ? "No puedes votar tu propio plan"
              : !viewerId
                ? "Inicia sesión para votar"
                : hasVoted
                  ? "Quitar voto"
                  : "Votar este plan"
          }
          aria-pressed={hasVoted}
          aria-label={hasVoted ? "Quitar voto" : "Votar este plan"}
          className={`flex w-12 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 self-center rounded-xl border py-2 transition-all duration-200 active:scale-90 disabled:cursor-not-allowed sm:w-16 sm:gap-1 sm:py-2.5 ${
            hasVoted
              ? "border-primary/60 bg-primary/15"
              : "border-border bg-secondary/50 hover:border-primary/50 hover:bg-primary/10"
          } ${!canVote ? "opacity-70" : ""}`}
        >
          <Flame className={`h-4 w-4 transition-colors duration-200 sm:h-5 sm:w-5 ${hasVoted ? "fill-primary text-primary" : "text-muted-foreground group-hover:text-primary/60"}`} />
          <span className={`font-sans text-sm font-black leading-none tabular-nums sm:text-lg ${hasVoted ? "text-primary" : "text-foreground"}`}>
            {votes}
          </span>
        </button>
      </header>

      {plan.notes ? (
        <p className="relative px-5 pb-5 font-mono text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pb-6">
          {plan.notes}
        </p>
      ) : null}

      {canCopy ? (
        <div className="relative border-t border-border/60 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={onCopy}
            disabled={copyPending}
            title={!viewerId ? "Inicia sesión para copiarlo" : "Copiar a mis planes"}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-secondary/50 px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider text-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {copyPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CopyPlus className="h-4 w-4" />}
            {copyPending ? "Copiando..." : "Copiar a mis planes"}
          </button>
        </div>
      ) : null}
    </article>
  )
}

type AuthorScore = {
  id: string
  name: string
  avatar: string | null
  likes: number
  plans: number
}

function useTopNutritionAuthors(plans: SharedNutritionPlan[]): AuthorScore[] {
  return useMemo(() => {
    const map = new Map<string, AuthorScore>()
    for (const plan of plans) {
      if (!plan.author) continue
      const entry = map.get(plan.author.id) ?? { id: plan.author.id, name: authorName(plan), avatar: plan.author.avatar, likes: 0, plans: 0 }
      entry.likes += plan.votes.length
      entry.plans += 1
      map.set(plan.author.id, entry)
    }
    return [...map.values()].sort((a, b) => b.likes - a.likes).slice(0, 5)
  }, [plans])
}

function TopNutritionAside({ plans }: { plans: SharedNutritionPlan[] }) {
  const top = useTopNutritionAuthors(plans)
  const totalVotes = plans.reduce((acc, p) => acc + p.votes.length, 0)

  return (
    <aside className="h-fit space-y-4 lg:sticky lg:top-8">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-card px-4 py-3.5">
          <Utensils className="h-4 w-4 text-muted-foreground" />
          <p className="mt-2.5 font-sans text-2xl font-black leading-none text-foreground tabular-nums">{plans.length}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Planes</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3.5">
          <Flame className="h-4 w-4 fill-primary text-primary" />
          <p className="mt-2.5 font-sans text-2xl font-black leading-none text-primary tabular-nums">{totalVotes}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Votos totales</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <header className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <Flame className="h-4 w-4 text-primary" />
          <h2 className="font-sans text-xs font-black uppercase tracking-widest text-foreground">Top de la comunidad</h2>
        </header>

        {top.length === 0 ? (
          <p className="px-4 py-6 text-center font-mono text-xs text-muted-foreground">Sin votos todavía.</p>
        ) : (
          <ol>
            {top.map((entry, i) => (
              <li
                key={entry.id}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${i < top.length - 1 ? "border-b border-border/40" : ""} ${i === 0 ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-secondary/40"}`}
              >
                <span className={`w-4 shrink-0 text-center font-sans text-xs font-black ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>{i + 1}</span>
                <AuthorAvatar author={plans.find((p) => p.author?.id === entry.id)?.author ?? null} className="h-9 w-9" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-sans text-sm font-bold text-foreground">{entry.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {entry.plans} {entry.plans === 1 ? "plan" : "planes"}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 font-sans text-sm font-black tabular-nums text-primary">
                  <Flame className={`h-3.5 w-3.5 ${i === 0 ? "fill-primary" : ""}`} />
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
