"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CalendarRange,
  Clock3,
  Dumbbell,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldAlert,
  Trash2,
  User as UserIcon,
  UserSearch,
  X,
} from "lucide-react"
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession"
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition"
import {
  useDeleteUser,
  useUpdateUser,
  useUser,
  type UserRow,
} from "@/_features/gym-admin/users/hooks/useUsers"
import { useCoaches, coachDisplayName } from "@/_features/gym-admin/users/hooks/useCoaches"
import {
  UserFormDialog,
  type UserFormPayload,
} from "@/_features/gym-admin/users/components/user-form-dialog"
import { ConfirmDeleteDialog } from "@/_features/gym-admin/users/components/confirm-delete-dialog"
import {
  membershipBadgeClasses,
  membershipLabel,
  statusBadgeClasses,
  statusLabel,
} from "@/_features/gym-admin/users/components/utils"

gsap.registerPlugin(ScrollTrigger)

const badgeBase =
  "inline-flex items-center rounded-full border px-2.5 py-1 font-sans text-[10px] font-bold uppercase tracking-wider"

function roleBadgeClasses(role: UserRow["role"]): string {
  switch (role) {
    case "admin":
      return `${badgeBase} border-primary bg-primary text-primary-foreground`
    case "coach":
      return `${badgeBase} border-yellow-500/30 bg-yellow-500/10 text-yellow-500`
    default:
      return `${badgeBase} border-muted-foreground/30 bg-muted/10 text-muted-foreground`
  }
}

function roleLabel(role: UserRow["role"]): string {
  switch (role) {
    case "admin":
      return "Admin"
    case "coach":
      return "Coach"
    default:
      return "Usuario"
  }
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—"
  return new Date(value).toLocaleDateString("es-CR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function UserProfile({ id }: { id: string }) {
  const { data: profile, isLoading: dataLoading, error } = useUser(id)
  const { user: sessionUser, isAdmin, loading: authLoading } = useAuthSession()
  const { data: coaches = [] } = useCoaches()
  const { navigate } = usePageTransition()

  const [formOpen, setFormOpen] = useState(false)
  const [deleting, setDeleting] = useState<UserRow | null>(null)
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()

  const isOwnProfile =
    Boolean(profile?.auth_id) && profile?.auth_id === sessionUser?.id
  const allowed = isAdmin || isOwnProfile
  const loading = authLoading || dataLoading

  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (loading || !allowed || !profile) return
    const container = sectionRef.current
    if (!container) return

    const items = container.querySelectorAll("[data-profile-section]")

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(items, { clearProps: "all" })
      return
    }

    const timeline = gsap.timeline({
      scrollTrigger: { trigger: container, start: "top 80%" },
    })

    timeline.fromTo(
      items,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.18, ease: "power3.out" },
    )

    return () => {
      timeline.scrollTrigger?.kill()
      timeline.kill()
    }
  }, [loading, allowed, profile])

  const handleUpdate = async (payload: UserFormPayload) => {
    if (!profile) return
    await updateUser.mutateAsync({
      id: profile.id,
      dto: {
        first_name: payload.first_name,
        last_name: payload.last_name,
        email: payload.email,
        phone: payload.phone,
        avatar: payload.avatar,
        role: payload.role,
        coach_id: payload.coach_id,
        membership_status: payload.membership_status,
        membership_plan: payload.membership_plan,
      },
    })
    setFormOpen(false)
  }

  const handleDelete = async () => {
    if (!deleting) return
    await deleteUser.mutateAsync(deleting)
    setDeleting(null)
    navigate(isAdmin ? "/users" : "/")
  }

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
        <div className="mt-6 h-8 w-2/3 animate-pulse rounded-md bg-muted" />
        <div className="mt-10 h-64 animate-pulse rounded-lg border border-border bg-card" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="h-40 animate-pulse rounded-lg border border-border bg-card" />
          <div className="h-40 animate-pulse rounded-lg border border-border bg-card" />
          <div className="h-40 animate-pulse rounded-lg border border-border bg-card" />
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <CenteredCard
        icon={<ShieldAlert className="h-10 w-10 text-destructive/60" />}
        title="Error al cargar"
        description={error.message}
      />
    )
  }

  if (!profile) {
    return (
      <CenteredCard
        icon={<UserSearch className="h-10 w-10 text-muted-foreground/40" />}
        title="Miembro no encontrado"
        description="Este perfil no existe o fue eliminado."
        actionLabel="Volver"
        onAction={() => navigate(isAdmin ? "/users" : "/")}
      />
    )
  }

  if (!allowed) {
    return (
      <CenteredCard
        icon={<ShieldAlert className="h-10 w-10 text-muted-foreground/40" />}
        title="Acceso restringido"
        description="Solo puedes ver tu propio perfil. Los perfiles de otros miembros están disponibles para administradores."
        actionLabel="Volver al inicio"
        onAction={() => navigate("/")}
      />
    )
  }

  const fullName =
    `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Miembro"
  const [firstName, ...restName] = fullName.split(" ")
  const lastName = restName.join(" ")

  return (
    <section className="relative overflow-hidden">
      {/* Ambient glows + hairline */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute left-0 right-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div
        ref={sectionRef}
        className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8"
      >
        <button
          onClick={() => navigate(isAdmin ? "/users" : "/")}
          className="flex cursor-pointer items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>

        {/* Header */}
        <header data-profile-section className="mb-10 mt-8">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Perfil de miembro
          </span>
          <h1 className="font-sans text-4xl font-black uppercase leading-[0.95] tracking-tighter text-foreground text-balance md:text-6xl">
            {firstName}{" "}
            {lastName ? <span className="text-primary">{lastName}</span> : null}
          </h1>
          <p className="mt-3 font-mono text-sm text-muted-foreground md:text-base">
            {profile.email ?? "Sin email"}
          </p>
        </header>

        {/* Hero card */}
        <div
          data-profile-section
          className="group relative overflow-hidden rounded-lg border border-border bg-card p-4 sm:p-8"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary">
              {profile.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar}
                  alt={fullName}
                  className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                />
              ) : (
                <UserIcon className="h-14 w-14 text-muted-foreground/40" />
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={roleBadgeClasses(profile.role)}>
                  {roleLabel(profile.role)}
                </span>
                <span
                  className={`${statusBadgeClasses(profile.membership_status ?? "pending")} ${badgeBase}`}
                >
                  {statusLabel(profile.membership_status ?? "pending")}
                </span>
                <span
                  className={`${membershipBadgeClasses(profile.membership_plan ?? "basic")} ${badgeBase}`}
                >
                  {membershipLabel(profile.membership_plan ?? "basic")}
                </span>
              </div>

              <AssignedCoach coachId={profile.coach_id} />

              <dl className="grid grid-cols-1 gap-x-8 gap-y-3 font-mono text-xs sm:grid-cols-2">
                <Meta label="ID interno" value={`#${profile.id.slice(0, 8)}`} />
                <Meta
                  label="Cuenta"
                  value={profile.provider ? profile.provider.charAt(0).toUpperCase() + profile.provider.slice(1) : "—"}
                />
                <Meta label="Miembro desde" value={formatDate(profile.join_date)} />
                <Meta label="Última visita" value={formatDate(profile.last_visit)} />
              </dl>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate(`/users/profile/${profile.id}/routine`)}
                  className="flex cursor-pointer items-center gap-2 rounded-none border border-primary/40 bg-primary/10 px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary transition-all hover:-translate-y-0.5 hover:bg-primary/20"
                >
                  <CalendarRange className="h-4 w-4" />
                  Ver rutina
                </button>

                {isAdmin ? (
                  <>
                    <button
                      onClick={() => setFormOpen(true)}
                      disabled={updateUser.isPending}
                      className="flex cursor-pointer items-center gap-2 rounded-none bg-primary px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {updateUser.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Pencil className="h-4 w-4" />
                      )}
                      Editar miembro
                    </button>
                    <button
                      onClick={() => setDeleting(profile)}
                      disabled={deleteUser.isPending}
                      className="flex cursor-pointer items-center gap-2 rounded-none border border-destructive/40 px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Data grid */}
        <div data-profile-section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <DataCard title="Contacto" icon={<Mail className="h-4 w-4" />}>
            <Meta large label="Email" value={profile.email ?? "—"} />
            <Meta large label="Teléfono" value={profile.phone ?? "Sin teléfono"} />
            <Meta large label="Dirección" value={profile.address ?? "No registrada"} />
          </DataCard>

          <DataCard title="Membresía" icon={<BadgeCheck className="h-4 w-4" />}>
            <Meta large label="Plan" value={membershipLabel(profile.membership_plan ?? "basic")} />
            <Meta large label="Estado" value={statusLabel(profile.membership_status ?? "pending")} />
            <Meta large label="Ingreso" value={formatDate(profile.join_date)} />
          </DataCard>

          <DataCard title="Actividad" icon={<Clock3 className="h-4 w-4" />}>
            <Meta large label="Última visita" value={formatDate(profile.last_visit)} />
            <VerificationRow label="Email verificado" ok={Boolean(profile.email_verified)} />
            <VerificationRow label="Teléfono verificado" ok={Boolean(profile.phone_verified)} />
          </DataCard>
        </div>
      </div>

      <UserFormDialog
        open={formOpen}
        user={profile}
        coaches={coaches}
        onClose={() => setFormOpen(false)}
        onSubmit={handleUpdate}
      />

      <ConfirmDeleteDialog
        user={deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </section>
  )
}

function Meta({
  label,
  value,
  large = false,
}: {
  label: string
  value: string
  large?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`truncate text-foreground ${large ? "text-sm" : "text-sm font-medium"}`}
        title={value}
      >
        {value}
      </dd>
    </div>
  )
}

function DataCard({
  title,
  icon,
  children,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 transition-colors duration-300 hover:border-primary/40">
      <h3 className="mb-4 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
          {icon}
        </span>
        {title}
      </h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function VerificationRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      {ok ? (
        <BadgeCheck className="h-4 w-4 text-primary" aria-label="Verificado" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground/50" aria-label="No verificado" />
      )}
    </div>
  )
}

function AssignedCoach({ coachId }: { coachId: string | null }) {
  // Reutiliza el cache de useCoaches: 0 queries extra, mismo shape.
  const { data: coaches = [], isLoading } = useCoaches()
  const coach = coachId ? coaches.find((c) => c.id === coachId) ?? null : null

  if (!coachId) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-dashed border-border/60 bg-secondary/30 px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
          <Dumbbell className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Coach asignado
          </p>
          <p className="text-sm text-muted-foreground">Sin asignar</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 rounded-md border border-border/60 bg-secondary/30 px-4 py-3">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <p className="font-mono text-xs text-muted-foreground">Cargando coach…</p>
      </div>
    )
  }

  if (!coach || coach.role !== "coach") {
    return (
      <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-destructive/15 text-destructive">
          <ShieldAlert className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-destructive">
            Coach no válido
          </p>
          <p className="text-sm text-foreground">
            El usuario asignado no tiene rol de coach.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 rounded-md border border-primary/30 bg-primary/5 px-4 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-primary/30 bg-secondary">
        {coach.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coach.avatar}
            alt={coachDisplayName(coach)}
            className="h-full w-full object-cover"
          />
        ) : (
          <Dumbbell className="h-4 w-4 text-primary" />
        )}
      </span>
      <div className="min-w-0">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
          Coach asignado
        </p>
        <p className="truncate text-sm font-semibold text-foreground">
          {coachDisplayName(coach)}
        </p>
      </div>
    </div>
  )
}

function CenteredCard({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <section className="relative mx-auto flex max-w-4xl items-center justify-center px-4 py-20 text-center">
      <div className="rounded-lg border border-border bg-card px-8 py-10 shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-muted/50">
          {icon}
        </div>
        <p className="font-sans text-xl font-black uppercase tracking-tight text-foreground">
          {title}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {actionLabel && onAction ? (
          <button
            onClick={onAction}
            className="mt-6 cursor-pointer rounded-none bg-primary px-5 py-2.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </section>
  )
}
