"use client"

import { useEffect, useState } from "react"

/**
 * Timestamp compartido con tick periódico (30s por defecto).
 * Null hasta el mount para ser hydration-safe: los cálculos que dependen
 * de "ahora" deben manejar el caso null (p. ej., omitir el filtro).
 * Mismo contrato que useMembershipClock.
 */
export function useNow(intervalMs = 30_000): number | null {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    // Primer tick diferido (no setState síncrono en el cuerpo del effect).
    const first = setTimeout(() => setNow(Date.now()), 0)
    const timer = setInterval(() => setNow(Date.now()), intervalMs)
    return () => {
      clearTimeout(first)
      clearInterval(timer)
    }
  }, [intervalMs])

  return now
}
