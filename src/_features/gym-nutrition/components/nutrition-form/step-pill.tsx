"use client"

/** Pill del indicador de paso del wizard (Datos → Estructura). */
export function StepPill({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors ${
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border text-muted-foreground/60"
      }`}
    >
      {active ? <span className="h-1.5 w-1.5 rounded-full bg-primary" /> : null}
      {label}
    </span>
  )
}
