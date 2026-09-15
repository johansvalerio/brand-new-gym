"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Dumbbell, Loader2 } from "lucide-react"
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground"
import { createClient } from "@/lib/supabase/client"

// Mismo estilo oscuro / Monster que Login — la huella visual no se rompe.
export function RegisterForm({ nextPath, gymSlug }: { nextPath?: string; gymSlug?: string | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [field, setField] = useState({ firstName: "", lastName: "", email: "", password: "", phone: "" })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Auth signup con metadata; el trigger handle_new_user crea el perfil
      // y la Edge Function `register` lo pachea con gym_id + phone.
      // (La función también valida duplicados.)
      const { error: signUpError } = await supabase.auth.signUp({
        email: field.email.trim().toLowerCase(),
        password: field.password,
        options: {
          data: { first_name: field.firstName.trim(), last_name: field.lastName.trim() },
          emailRedirectTo: nextPath ?? "/auth/login",
        },
      })
      if (signUpError) throw new Error(signUpError.message)

      // Si hay slug de gym esperando (el usuario digitó tu landing y quiso unirse),
      // pinearlo. El gym por defecto es gym-ulate si viene vacío (first-join).
      if (gymSlug) {
        const { data: gymRow } = await supabase
          .from("gyms")
          .select("id")
          .eq("slug", gymSlug)
          .eq("is_active", true)
          .maybeSingle()
        if (gymRow) {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from("users").update({
              gym_id: gymRow.id,
              phone: field.phone.trim() || null,
            }).eq("auth_id", user.id)
          }
        }
      }

      router.push(`/auth/login?gym=${gymSlug ?? ""}&next=${encodeURIComponent(nextPath ?? "/dashboard")}&registered=1`)
      return
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo registrar. Intentalo de nuevo.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
      <ConstellationBackground />
      {/* Background Layer System */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/8 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/8 blur-[140px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(150, 217, 6, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(150, 217, 6, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#000_70%)]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="bg-primary/10 p-3 rounded-xl border border-primary/30">
              <Dumbbell className="w-8 h-8 text-primary" strokeWidth={2} />
            </div>
            <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-foreground">
              JAULA
            </h1>
          </div>
          <p className="font-mono text-muted-foreground text-sm">
            CREA TU CUENTA — EL GYM ES TUYO
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="reg-first" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Nombre
              </label>
              <input
                id="reg-first"
                required
                minLength={2}
                value={field.firstName}
                onChange={(e) => setField((f) => ({ ...f, firstName: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60"
                placeholder="Juan"
              />
            </div>
            <div>
              <label htmlFor="reg-last" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Apellido
              </label>
              <input
                id="reg-last"
                required
                minLength={2}
                value={field.lastName}
                onChange={(e) => setField((f) => ({ ...f, lastName: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60"
                placeholder="Perez"
              />
            </div>
            <div>
              <label htmlFor="reg-email" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={field.email}
                onChange={(e) => setField((f) => ({ ...f, email: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60"
                placeholder="juan@ejemplo.com"
              />
            </div>
            <div>
              <label htmlFor="reg-password" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Contraseña
              </label>
              <input
                id="reg-password"
                type="password"
                required
                minLength={8}
                value={field.password}
                onChange={(e) => setField((f) => ({ ...f, password: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div>
              <label htmlFor="reg-phone" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Teléfono (opcional)
              </label>
              <input
                id="reg-phone"
                type="tel"
                value={field.phone}
                onChange={(e) => setField((f) => ({ ...f, phone: e.target.value }))}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/60"
                placeholder="+506 8888-1111"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="font-mono text-xs text-destructive text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex cursor-pointer items-center justify-center gap-2 rounded-md border border-primary bg-primary/10 px-5 py-3.5 font-sans text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>Crear cuenta</>
              )}
            </button>
          </form>

          <p className="mt-6 pt-6 border-t border-border/40 text-center font-mono text-xs text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link href={`/auth/login?gym=${gymSlug ?? ""}`} className="text-primary hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>

        <div className="mt-8 flex justify-center gap-6 opacity-30">
          <div className="h-px w-16 bg-primary" />
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
            <div className="w-1.5 h-1.5 bg-primary animate-pulse delay-100" />
            <div className="w-1.5 h-1.5 bg-primary animate-pulse delay-200" />
          </div>
          <div className="h-px w-16 bg-primary" />
        </div>
      </div>
    </div>
  )
}
