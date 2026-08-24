"use client"

import { useEffect } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/types/database.types"

export type PaymentRow = Tables<"payments"> & {
  user: {
    id: string
    first_name: string | null
    last_name: string | null
    avatar: string | null
  } | null
  plan: { id: string; slug: string; name: string } | null
}

export const paymentKeys = {
  all: ["payments"] as const,
}

async function fetchPayments(): Promise<PaymentRow[]> {
  const supabase = createClient()
  // RLS: el admin ve todas, el resto solo las propias
  const { data, error } = await supabase
    .from("payments")
    .select(
      "*, user:users!payments_user_id_fkey(id, first_name, last_name, avatar), plan:plans(id, slug, name)",
    )
    .order("requested_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as unknown as PaymentRow[]
}

export function usePayments() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: paymentKeys.all,
    queryFn: fetchPayments,
  })

  // Realtime: nuevas solicitudes / decisiones del admin se reflejan solas.
  // El payload de postgres_changes no trae los embeds (usuario/plan), así que
  // invalidamos y refetchamos con joins — imperceptible para el usuario.
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("payments-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "payments" },
        () => {
          void queryClient.invalidateQueries({ queryKey: paymentKeys.all })
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [queryClient])

  return query
}

export function useCreatePaymentRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      planId,
      method,
      requesterProfileId,
    }: {
      planId: string
      method: "sinpe" | "efectivo"
      requesterProfileId: string
    }): Promise<void> => {
      const supabase = createClient()
      const { error } = await supabase.from("payments").insert({
        user_id: requesterProfileId,
        plan_id: planId,
        method,
      })

      if (error) throw error
    },
    onSuccess: () => {
      toast.success("Solicitud enviada", {
        description: "Realiza el pago y espera la confirmación del administrador.",
      })
      queryClient.invalidateQueries({ queryKey: paymentKeys.all })
    },
    onError: (error) => {
      toast.error("No se pudo enviar la solicitud", { description: error.message })
    },
  })
}

/** El usuario cancela su propia solicitud pendiente (RLS: delete propio-pending). */
export function useCancelPaymentRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string }): Promise<void> => {
      const supabase = createClient()
      const { error } = await supabase.from("payments").delete().eq("id", id)

      if (error) throw error
    },
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: paymentKeys.all })
      const previous = queryClient.getQueryData<PaymentRow[]>(paymentKeys.all)
      queryClient.setQueryData<PaymentRow[]>(paymentKeys.all, (old) =>
        old?.filter((p) => p.id !== id) ?? old,
      )
      return { previous }
    },
    onError: (error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(paymentKeys.all, context.previous)
      }
      toast.error("No se pudo cancelar la solicitud", { description: error.message })
    },
    onSuccess: () => {
      toast.success("Solicitud cancelada")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all })
    },
  })
}

/** Admin edita un pago pendiente (plan/método/nota). RLS: update solo admin. */
export function useUpdatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      planId,
      method,
      note,
    }: {
      id: string
      planId: string
      method: "sinpe" | "efectivo"
      note?: string
    }): Promise<void> => {
      const supabase = createClient()
      // El trigger de DB re-fija el amount si cambia el plan
      const { error } = await supabase
        .from("payments")
        .update({ plan_id: planId, method, note: note || null })
        .eq("id", id)

      if (error) throw error
    },
    onSuccess: () => {
      toast.success("Pago actualizado")
      queryClient.invalidateQueries({ queryKey: paymentKeys.all })
    },
    onError: (error) => {
      toast.error("No se pudo actualizar el pago", { description: error.message })
    },
  })
}

/**
 * Pago walk-in registrado por el admin (la persona ya pagó en caja o SINPE):
 * entra directo como approved → el trigger de DB activa la membresía al instante.
 * RLS permite al admin insertar pagos de cualquier usuario.
 */
export function useCreateWalkInPayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      planId,
      method,
      note,
    }: {
      userId: string
      planId: string
      method: "sinpe" | "efectivo"
      note?: string
    }): Promise<void> => {
      const supabase = createClient()
      const { error } = await supabase.from("payments").insert({
        user_id: userId,
        plan_id: planId,
        method,
        status: "approved",
        note: note || null,
      })

      if (error) throw error
    },
    onSuccess: () => {
      toast.success("Pago registrado — membresía activada")
      queryClient.invalidateQueries({ queryKey: paymentKeys.all })
      // La activación cambia users (plan/fechas/status)
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (error) => {
      toast.error("No se pudo registrar el pago", { description: error.message })
    },
  })
}

export function useDecidePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: "approved" | "rejected"
    }): Promise<void> => {
      const supabase = createClient()
      // El trigger de DB activa la membresía y sella decided_at/decided_by
      const { data, error } = await supabase
        .from("payments")
        .update({ status })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      void data
    },
    onSuccess: (_data, vars) => {
      toast.success(
        vars.status === "approved"
          ? "Pago aprobado — membresía activada"
          : "Solicitud rechazada",
      )
      queryClient.invalidateQueries({ queryKey: paymentKeys.all })
      // La aprobación cambia users (plan/fechas/status)
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
    onError: (error) => {
      toast.error("No se pudo procesar la decisión", { description: error.message })
    },
  })
}
