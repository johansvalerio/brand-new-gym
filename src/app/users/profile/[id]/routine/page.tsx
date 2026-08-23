import { UserRoutines } from "@/_features/gym-routines/components/user-routines"
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground"
import { createClient } from "@/lib/supabase/server"

export default async function UserRoutinesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Server Component trae el nombre del perfil para el header de la página.
  // Los datos de rutinas los trae el componente client (TanStack) para
  // mantenerse en el cache compartido con el resto del admin.
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("users")
    .select("id, first_name, last_name, role, coach_id")
    .eq("id", id)
    .maybeSingle()

  const displayName = profile
    ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Miembro"
    : "Miembro"

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 py-24">
      <ConstellationBackground />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <h1 className="font-sans text-4xl font-black uppercase leading-[0.95] tracking-tighter text-foreground text-balance md:text-6xl">
            Rutinas de{" "}
            <span className="text-primary">{displayName}</span>
          </h1>
          <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
            Visualiza las rutinas activas del miembro, asignadas por su coach
            o creadas por él mismo.
          </p>
        </header>

        {profile ? (
          <UserRoutines profile={profile} />
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-card/50 px-6 py-12 text-center text-sm text-muted-foreground">
            Miembro no encontrado.
          </div>
        )}
      </div>
    </main>
  )
}
