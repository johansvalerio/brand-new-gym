"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { Session, User as SupabaseUser } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types/database.types"

type AuthContextValue = {
  session: Session | null
  user: SupabaseUser | null
  profile: Tables<"users"> | null
  role: Tables<"users">["role"]
  isAdmin: boolean
  isCoach: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  profile: null,
  role: null,
  isAdmin: false,
  isCoach: false,
  loading: true,
})

export function AuthProvider({
  children,
  initialUser,
  initialProfile,
  // compat: si alguien aún pasa initialSession, lo aceptamos pero no lo usamos para auth
  initialSession,
}: {
  children: React.ReactNode
  initialUser?: SupabaseUser | null
  initialProfile: Tables<"users"> | null
  initialSession?: Session | null
}) {
  // Prioriza initialUser (getUser validado) sobre initialSession legacy
  const resolvedInitialUser = (initialUser as SupabaseUser | null) ?? initialSession?.user ?? null
  const [session, setSession] = useState<Session | null>(initialSession ?? null)
  const [user, setUser] = useState<SupabaseUser | null>(resolvedInitialUser)
  const [profile, setProfile] = useState<Tables<"users"> | null>(initialProfile)
  const [loading, setLoading] = useState(!resolvedInitialUser && !initialProfile)

  useEffect(() => {
    const supabase = createClient()

    const syncProfile = async (authId: string | undefined) => {
      if (!authId) {
        setProfile(null)
        return
      }
      const { data: row } = await supabase.from("users").select("*").eq("auth_id", authId).maybeSingle()
      setProfile(row ?? null)
    }

    // onAuthStateChange expone session.user desde storage sin validar — re-validamos con getUser()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession)
      // valida contra Auth server antes de confiar en el user
      const { data: { user: validatedUser } } = await supabase.auth.getUser()
      setUser(validatedUser)
      await syncProfile(validatedUser?.id)
      setLoading(false)
    })

    // Fallback solo si server no dio user (ej. proxy no refrescó) — usa getUser validado
    if (!resolvedInitialUser) {
      supabase.auth.getUser().then(async ({ data: { user: u } }) => {
        setUser(u)
        setSession(null)
        await syncProfile(u?.id)
        setLoading(false)
      })
    } else {
      // si ya tenemos user validado del server, solo asegura perfil
      void syncProfile(resolvedInitialUser.id)
      setLoading(false)
    }

    return () => subscription.unsubscribe()
  }, [resolvedInitialUser])

  const value: AuthContextValue = {
    session,
    user,
    profile,
    role: profile?.role ?? null,
    isAdmin: profile?.role === "admin",
    isCoach: profile?.role === "coach",
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  return useContext(AuthContext)
}
