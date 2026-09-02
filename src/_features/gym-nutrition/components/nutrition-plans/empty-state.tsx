"use client"

import { Salad } from "lucide-react"

export function EmptyState({ isOwn }: { isOwn: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute top-0 left-1/4 h-64 w-64 rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-secondary/10 blur-[100px]" />
      </div>
      <div className="relative mx-auto flex max-w-md flex-col items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-md border border-border bg-secondary text-muted-foreground">
          <Salad className="h-6 w-6" />
        </span>
        <h3 className="font-sans text-lg font-black uppercase tracking-tight text-foreground">Sin planes todavía</h3>
        <p className="font-mono text-sm leading-relaxed text-muted-foreground">
          {isOwn
            ? "Aún no tienes un plan de nutrición. Cuando lo crees con el botón de arriba, aparecerá aquí."
            : "Este miembro no tiene planes de nutrición asignados por ahora."}
        </p>
      </div>
    </div>
  )
}
