"use client"

import { useEffect, useRef, useState } from "react"
import { Timer, X, SkipForward } from "lucide-react"

export function RestTimerBar({
  seconds,
  onDone,
  onClose,
}: {
  seconds: number | null
  onDone?: () => void
  onClose: () => void
}) {
  const [remaining, setRemaining] = useState<number>(seconds ?? 0)
  const intervalRef = useRef<number | null>(null)
  // Reset al cambiar seconds: prevState pattern en vez de setState en effect
  const [prevSeconds, setPrevSeconds] = useState(seconds)
  if (seconds !== prevSeconds) {
    setPrevSeconds(seconds)
    if (seconds !== null) setRemaining(seconds)
  }

  useEffect(() => {
    if (seconds === null || seconds === undefined) return
    if (intervalRef.current) window.clearInterval(intervalRef.current)
    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) window.clearInterval(intervalRef.current)
          // vibra + beep suave en iPhone/Android si está disponible
          try {
            if ("vibrate" in navigator) navigator.vibrate([200, 100, 200])
          } catch {}
          onDone?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [seconds, onDone])

  if (seconds === null) return null

  const pct = seconds > 0 ? (remaining / seconds) * 100 : 0
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6 lg:max-w-4xl">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Timer className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
              Descanso
              {remaining === 0 ? <span className="ml-2 text-primary">¡Listo!</span> : null}
            </p>
            <p className="font-sans text-lg font-black tabular-nums text-primary">
              {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </p>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Cerrar timer"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <X className="h-4 w-4" />
        </button>
        <button
          onClick={onClose}
          className="hidden cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-sans text-xs font-bold uppercase tracking-wider text-black hover:opacity-90 sm:flex"
        >
          <SkipForward className="h-4 w-4" /> Saltar
        </button>
      </div>
    </div>
  )
}
