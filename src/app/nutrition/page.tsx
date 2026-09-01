import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";
import { NutritionPlans } from "@/_features/gym-nutrition/components/NutritionPlans";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Nutrición | Gymulate",
  description: "Planes de nutrición con comidas, macros y ficha técnica — comparte tus recetas con la comunidad.",
};

export default async function NutritionPage() {
  const breadcrumbItems = [
    { name: "Inicio", item: "https://gymulate.vercel.app" },
    { name: "Nutrición", item: "https://gymulate.vercel.app/nutrition" },
  ];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let profile: { id: string; first_name: string | null; last_name: string | null; role: string | null; coach_id: string | null } | null = null;
  if (user) {
    const { data } = await supabase.from("users").select("id, first_name, last_name, role, coach_id").eq("auth_id", user.id).maybeSingle();
    profile = data as typeof profile;
  }

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="relative min-h-screen py-16 bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
        <div className="opacity-40">
          <ConstellationBackground />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <header className="mb-10">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Nutrición
            </span>
            <h1 className="font-sans text-4xl font-black uppercase leading-[0.95] tracking-tighter text-foreground text-balance md:text-6xl">
              Nutri<span className="text-primary">ción</span>
            </h1>
            <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
              Planes con comidas, gramos de proteína y ficha técnica — como Rutinas. Crea para ti o, si eres admin/coach, para tus miembros.
            </p>
          </header>

          {profile ? (
            <NutritionPlans profile={profile as never} />
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-card/50 px-6 py-12 text-center text-sm text-muted-foreground">
              Inicia sesión para ver y crear planes.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
