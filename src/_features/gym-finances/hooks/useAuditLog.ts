"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { createClient } from "@/lib/supabase/client"
import { useGym } from "@/app/providers/gym-provider"
import type { Tables } from "@/types/database.types"

export type AuditLogRow = Tables<"audit_log"> & {
  actor: { first_name: string | null; last_name: string | null } | null
}

export type AuditFilter = {
  actor: string
  table: string
  action: string
  search: string
}

export const auditKeys = {
  all: ["audit-log"] as const,
  byGym: (gymId: string) => ["audit-log", gymId] as const,
}

const PAGE = 100

async function fetchAuditLog(gymId: string, limit: number): Promise<AuditLogRow[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("audit_log")
    .select("*, actor:users!audit_log_actor_user_id_fkey(first_name, last_name)")
    .eq("gym_id", gymId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as AuditLogRow[]
}

export function useAuditLog() {
  const gym = useGym()
  const gymId = gym?.id ?? "none"
  const [limit, setLimit] = useState(PAGE)
  const [filter, setFilter] = useState<AuditFilter>({ actor: "", table: "", action: "", search: "" })

  const query = useQuery({
    queryKey: auditKeys.byGym(gymId),
    queryFn: () => fetchAuditLog(gymId, limit),
    enabled: !!gym?.id,
    staleTime: 15_000,
  })

  const filtered = useMemo(() => {
    const rows = (query.data ?? []) as AuditLogRow[]
    let out = rows
    // actorOptions guarda el ID real de actor_user_id (o "system" si es insert de trigger sin usuario)
    if (filter.actor) {
      out = out.filter((r) => (r.actor_user_id ?? "sistema") === filter.actor)
    }
    if (filter.table) out = out.filter((r) => r.table_name === filter.table)
    if (filter.action) out = out.filter((r) => r.action === filter.action)
    const q = filter.search.trim().toLowerCase()
    if (q) {
      out = out.filter((r) => {
        const oldTxt = r.old_data ? JSON.stringify(r.old_data) : ""
        const newTxt = r.new_data ? JSON.stringify(r.new_data) : ""
        return oldTxt.toLowerCase().includes(q) || newTxt.toLowerCase().includes(q)
      })
    }
    return out
  }, [query.data, filter])

  return { ...query, rows: filtered, total: query.data?.length ?? 0, hasMore: (query.data?.length ?? 0) >= limit, loadMore: () => setLimit((n) => n + PAGE), filter, setFilter }
}

const HIDDEN_FIELDS = new Set(["id", "gym_id", "auth_id", "created_at", "updated_at"])

/** Campos que cambiaron entre old→new (solo para mostrar el diff humano). */
export function diffAudit(oldData: Record<string, unknown> | null, newData: Record<string, unknown> | null) {
  const out: { field: string; before: string; after: string }[] = []
  if (!oldData || !newData) return out
  const keys = new Set([...Object.keys(oldData), ...Object.keys(newData)])
  for (const k of keys) {
    if (HIDDEN_FIELDS.has(k)) continue
    const o = oldData[k]
    const n = newData[k]
    if (JSON.stringify(o) !== JSON.stringify(n)) out.push({ field: k, before: String(o ?? "—"), after: String(n ?? "—") })
  }
  return out
}

function pickLabel(data: Record<string, unknown> | null) {
  if (!data) return "—"
  return (
    (data.name as string) ||
    (data.description as string) ||
    (data.product_name as string) ||
    (typeof data.amount !== "undefined" ? `Monto ${data.amount}` : "—")
  )
}

/** Resumen legible del row afectado por tabla. */
export function summarizeAuditRow(table: string, row: AuditLogRow) {
  const data = row.action === "delete" ? (row.old_data as Record<string, unknown>) : (row.new_data as Record<string, unknown>)
  return pickLabel(data)
}
