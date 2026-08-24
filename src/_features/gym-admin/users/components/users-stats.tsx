"use client"

export function UsersStats({
  total,
  active,
  expired,
}: {
  total: number
  active: number
  expired: number
}) {
  return (
    <div className="mb-8 grid grid-cols-1 gap-3 sm:max-w-xl sm:grid-cols-3">
      <Stat label="Total" value={total} />
      <Stat label="Activos" value={active} />
      <Stat label="Vencidos" value={expired} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-sans text-xl font-black text-foreground">{value}</p>
    </div>
  )
}
