"use client"

import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types/database.types"

export type NotificationRow = Tables<"notifications">

export const notificationKeys = {
  all: ["notifications"] as const,
}

async function fetchNotifications(): Promise<NotificationRow[]> {
  const supabase = createClient()
  // RLS: cada usuario solo ve las suyas
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) throw error
  return data ?? []
}

/**
 * Notificaciones en tiempo real vía Supabase Realtime (postgres_changes).
 * Carga inicial con TanStack Query + canal que parchea el cache en vivo.
 * RLS garantiza que cada usuario reciba únicamente las suyas.
 */
export function useNotifications(enabled: boolean) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: notificationKeys.all,
    queryFn: fetchNotifications,
    enabled,
  })

  useEffect(() => {
    if (!enabled) return
    const supabase = createClient()

    const channel = supabase
      .channel("notifications-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          queryClient.setQueryData<NotificationRow[]>(
            notificationKeys.all,
            (old) => [payload.new as NotificationRow, ...(old ?? [])],
          )
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "notifications" },
        (payload) => {
          const updated = payload.new as NotificationRow
          queryClient.setQueryData<NotificationRow[]>(
            notificationKeys.all,
            (old) =>
              old?.map((n) => (n.id === updated.id ? updated : n)) ?? old,
          )
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [enabled, queryClient])

  return query
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      const supabase = createClient()
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", id)

      if (error) throw error
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })
      const previous = queryClient.getQueryData<NotificationRow[]>(notificationKeys.all)
      queryClient.setQueryData<NotificationRow[]>(notificationKeys.all, (old) =>
        old?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? old,
      )
      return { previous }
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationKeys.all, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const supabase = createClient()
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("read", false)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
    onError: (error) => {
      toast.error("No se pudieron marcar como leídas", { description: error.message })
    },
  })
}
