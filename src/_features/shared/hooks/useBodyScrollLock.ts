"use client"

import { useEffect } from "react"

/**
 * Congela el scroll del body mientras `locked` sea true (diálogos abiertos).
 * Restaura el overflow previo al desmontar/cerrar.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [locked])
}
