"use client"

import type { ReactNode } from "react"

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

export type CalendarDay = {
  dayIndex: number // 1-7
  label?: string
}

type CalendarProps = {
  days?: CalendarDay[]
  renderDay: (dayIndex: number) => ReactNode
  className?: string
}

export function Calendar({ days, renderDay, className }: CalendarProps) {
  const cols = days ?? DAY_LABELS.map((label, i) => ({ dayIndex: i + 1, label }))

  return (
    <div className={className}>
      {/* Header 7 cols — igual mobile/desktop, Drive style */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {cols.map((d) => (
          <div key={d.dayIndex} className="rounded-lg border border-border bg-card px-1 py-2 text-center sm:px-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{d.label ?? DAY_LABELS[d.dayIndex - 1]}</p>
            <p className="font-sans text-xs font-black text-foreground sm:text-sm">{d.dayIndex}</p>
          </div>
        ))}
      </div>

      {/* Grid 7 cols con contenido por día */}
      <div className="mt-2 grid grid-cols-7 gap-1 sm:mt-3 sm:gap-2">
        {cols.map((d) => (
          <div
            key={d.dayIndex}
            className="min-h-[140px] rounded-xl border border-border bg-card/40 p-1.5 backdrop-blur supports-[backdrop-filter]:bg-card/30 sm:min-h-[180px] sm:p-2"
          >
            {renderDay(d.dayIndex)}
          </div>
        ))}
      </div>
    </div>
  )
}
