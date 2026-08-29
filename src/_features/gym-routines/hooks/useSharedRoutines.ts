"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
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
}

async function fetchSharedRoutines(): Promise<SharedRoutine[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("routines")
    .select(
      "*, author:users!routines_created_by_fkey(id, first_name, last_name, avatar, role), votes:routine_votes(user_id)",
    )
    .eq("is_shared", true)

  if (error) throw error

  // Ranking: más votos arriba; desempate por más recientes.
  return ((data ?? []) as unknown as SharedRoutine[]).sort((a, b) => {
    const diff = b.votes.length - a.votes.length
    if (diff !== 0) return diff
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
}

export function useSharedRoutines() {
  return useQuery({
    queryKey: sharedKeys.all,
    queryFn: fetchSharedRoutines,
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

  return useMutation({
    mutationFn: async ({ routineId, voterProfileId, wasVoted }: ToggleVoteInput): Promise<void> => {
      const supabase = createClient()

      if (wasVoted) {
        const { error } = await supabase
          .from("routine_votes")
          .delete()
          .eq("routine_id", routineId)

        if (error) throw error
        return
      }

      // La RLS exige que user_id sea el perfil del votante autenticado.
      const { error } = await supabase
        .from("routine_votes")
        .insert({ routine_id: routineId, user_id: voterProfileId })

      if (error) throw error
    },
    onMutate: async ({ routineId, voterProfileId, wasVoted }) => {
      await queryClient.cancelQueries({ queryKey: sharedKeys.all })
      const previous = queryClient.getQueryData<SharedRoutine[]>(sharedKeys.all)

      queryClient.setQueryData<SharedRoutine[]>(sharedKeys.all, (old) =>
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
        queryClient.setQueryData(sharedKeys.all, context.previous)
      }
      toast.error("No se pudo registrar tu voto", {
        description: error instanceof Error ? error.message : String(error),
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: sharedKeys.all })
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
      viewerId,
    }: {
      routineId: number
      viewerId: string
    }): Promise<Tables<"routines">> => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc("copy_shared_routine", {
        source_routine_id: routineId,
      })
      if (error) throw error
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
