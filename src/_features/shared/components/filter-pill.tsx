"use client"

export function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer rounded-full border px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-wider transition-colors sm:px-3 sm:py-1.5 ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-primary"
      }`}
    >
      {children}
    </button>
  )
}
