"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useGym } from "@/app/providers/gym-provider"
import type { Tables } from "@/types/database.types"

export type SharedRoutineAuthor = Pick<
  Tables<"users">,
  "id" | "first_name" | "last_name" | "avatar" | "role"
>

export type SharedRoutine = Tables<"routines"> & {
  author: SharedRoutineAuthor | null
  /** Filas de votos (solo user_id) para derivar count y "ya voté" client-side. */
  votes: { user_id: string }[]
}

export const sharedKeys = {
  all: ["routines", "shared"] as const,
  /** Ranking por gym: sin gym en la key, el caché anónimo mezclaría gyms. */
  byGym: (gymId: string) => ["routines", "shared", gymId] as const,
}

async function fetchSharedRoutines(gymId: string): Promise<SharedRoutine[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("routines")
    .select(
      "*, author:users!routines_created_by_fkey(id, first_name, last_name, avatar, role), votes:routine_votes(user_id)",
    )
    .eq("is_shared", true)
    .eq("gym_id", gymId)

  if (error) throw new Error(error.message)

  // Ranking: más votos arriba; desempate por más recientes.
  return ((data ?? []) as unknown as SharedRoutine[]).sort((a, b) => {
    const diff = b.votes.length - a.votes.length
    if (diff !== 0) return diff
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

export function useSharedRoutines() {
  const gym = useGym()
  const gymId = gym?.id ?? "none"
  return useQuery({
    queryKey: sharedKeys.byGym(gymId),
    queryFn: () => fetchSharedRoutines(gymId),
    enabled: !!gym?.id,
  })
}

type ToggleVoteInput = {
  routineId: number
  voterProfileId: string
  /** true si el usuario YA había votado (esta llamada quita el voto). */
  wasVoted: boolean
}

/**
 * Like estilo red social: actualización optimista siguiendo el patrón
 * snapshot → update → rollback. Sin toast de éxito (un like que toaste
 * cada click es ruido); solo errores.
 */
export function useToggleVote() {
  const queryClient = useQueryClient()
  const gym = useGym()
  const key = sharedKeys.byGym(gym?.id ?? "none")

  return useMutation({
    mutationFn: async ({ routineId, voterProfileId, wasVoted }: ToggleVoteInput): Promise<void> => {
      const supabase = createClient()

      if (wasVoted) {
        const { error } = await supabase
          .from("routine_votes")
          .delete()
          .eq("routine_id", routineId)

        if (error) throw new Error(error.message)
        return
      }

      // La RLS exige que user_id sea el perfil del votante autenticado.
      const { error } = await supabase
        .from("routine_votes")
        .insert({ routine_id: routineId, user_id: voterProfileId })

      if (error) throw new Error(error.message)
    },
    onMutate: async ({ routineId, voterProfileId, wasVoted }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<SharedRoutine[]>(key)

      queryClient.setQueryData<SharedRoutine[]>(key, (old) =>
        old?.map((routine) => {
          if (routine.id !== routineId) return routine
          return {
            ...routine,
            votes: wasVoted
              ? routine.votes.filter((v) => v.user_id !== voterProfileId)
              : [...routine.votes, { user_id: voterProfileId }],
          }
        }) ?? old,
      )

      return { previous }
    },
    onError: (error, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous)
      }
      toast.error("No se pudo registrar tu voto", {
        description: error instanceof Error ? error.message : String(error),
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: key })
    },
  })
}

/**
 * Copia una rutina compartida del ranking a la lista personal del viewer.
 * La copy la hace el RPC `copy_shared_routine` (SECURITY DEFINER: bypassa RLS
 * para leer los días/ejercicios ajenos, pero fija el destino al perfil del
 * llamante). Tras copiar, invalida ["users", viewerId, "routines"].
 */
export function useCopySharedRoutine() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      routineId,
    }: {
      routineId: number
      viewerId: string
    }): Promise<Tables<"routines">> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("copy_shared_routine", {
        source_routine_id: routineId,
      })
      if (error) throw new Error(error.message)
      return data as Tables<"routines">
    },
    onSuccess: (routine, { viewerId }) => {
      toast.success(`Rutina "${routine.name}" copiada a tus rutinas`)
      queryClient.invalidateQueries({
        queryKey: ["users", viewerId, "routines"],
      })
    },
    onError: (error) => {
      toast.error("No se pudo copiar la rutina", {
        description: error.message,
      })
    },
  })
}
