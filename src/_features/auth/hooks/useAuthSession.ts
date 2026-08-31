"use client"

import { useAuthContext } from "@/app/providers/auth-provider"

// Wrapper compat: mantiene la misma API para Dashboard/Users/UserRoutines etc.
// Ahora es sync vía AuthProvider (SSR initialSession en layout) → sin flash "Acceso restringido"
export function useAuthSession() {
  return useAuthContext()
}
