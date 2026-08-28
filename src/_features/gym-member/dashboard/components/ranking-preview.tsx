"use client"

import { ArrowRight, Flame, Loader2, ShieldAlert, Trophy } from "lucide-react"
import { useSharedRoutines } from "@/_features/gym-routines/hooks/useSharedRoutines"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"

export function RankingPreview() {
  const { navigate } = usePageTransition()
  const {
    data: routines = [],
    isLoading,
    error,
  } = useSharedRoutines()

  const top = routines.slice(0, 3)

  return (
    <section className="relative overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <h3 className="flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Trophy className="h-4 w-4 text-primary" />
          Top del ranking
        </h3>
        <button
          onClick={() => navigate("/routines")}
          aria-label="Ver ranking completo"
          className="flex cursor-pointer items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-primary"
        >
          Ver ranking
          <ArrowRight className="h-3 w-3" />
        </button>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando...
        </div>
      ) : error ? (
        <p className="flex items-center gap-2 px-4 py-6 text-sm text-destructive">
          <ShieldAlert className="h-4 w-4" />
          {error instanceof Error ? error.message : "Error inesperado"}
        </p>
      ) : top.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <Trophy className="mx-auto h-8 w-8 text-muted-foreground/40" />
          <p className="mt-2 font-sans text-sm font-bold text-foreground">
            Aún no hay rutinas compartidas
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Comparte la tuya y aparece en el ranking.
          </p>
        </div>
      ) : (
        <ul>
          {top.map((routine, index) => {
            const author =
              `${routine.author?.first_name ?? ""} ${routine.author?.last_name ?? ""}`.trim() ||
              "Autor desconocido"
            return (
              <li
                key={routine.id}
                className="border-b border-border/40 last:border-0 hover:bg-secondary/30"
              >
                <button
                  onClick={() => navigate("/routines")}
                  aria-label={`Ver ${routine.name} en el ranking`}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left"
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border font-mono text-xs font-black ${
                      index === 0
                        ? "border-primary/40 bg-primary/15 text-primary"
                        : "border-border bg-secondary text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-sans text-sm font-semibold text-foreground">
                      {routine.name}
                    </span>
                    <span className="block truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      por {author}
                    </span>
                  </span>

                  <span className="inline-flex shrink-0 items-center gap-1 font-mono text-xs tabular-nums text-primary">
                    <Flame className="h-3.5 w-3.5 fill-primary" />
                    {routine.votes.length}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
