"use client"

export function MenuItem({
  icon,
  label,
  onClick,
  variant = "default",
  disabled,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  variant?: "default" | "destructive"
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 font-sans text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        variant === "destructive" ? "text-destructive hover:bg-destructive/10" : "text-foreground hover:bg-primary hover:text-primary-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

export function ToggleRow({ label, checked, disabled, onToggle }: { label: string; checked: boolean; disabled?: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      onClick={onToggle}
      disabled={disabled}
      className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 font-sans text-sm font-medium text-foreground transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span
        aria-hidden="true"
        className={`relative inline-flex h-4 w-8 shrink-0 items-center rounded-full border transition-colors duration-200 ${checked ? "border-primary bg-primary" : "border-border bg-secondary"}`}
      >
        <span className={`absolute h-3 w-3 rounded-full shadow transition-all duration-200 ${checked ? "translate-x-[17px] bg-primary-foreground" : "translate-x-[2px] bg-muted-foreground"}`} />
      </span>
      {label}
    </button>
  )
}
