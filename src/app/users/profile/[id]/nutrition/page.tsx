import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import { NutritionPlans } from "@/_features/gym-nutrition/components/NutritionPlans";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";
import { createClient } from "@/lib/supabase/server";

export default async function UserNutritionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("users").select("id, first_name, last_name, role, coach_id").eq("id", id).maybeSingle();
  const displayName = profile ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() || "Miembro" : "Miembro";
  const breadcrumbItems = [
    { name: "Inicio", item: "https://gymulate.vercel.app" },
    { name: "Miembros", item: "https://gymulate.vercel.app/users" },
    { name: "Perfil", item: `https://gymulate.vercel.app/users/profile/${id}` },
    { name: "Nutrición", item: `https://gymulate.vercel.app/users/profile/${id}/nutrition` },
  ];
  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 py-16">
        <div className="opacity-40">
          <ConstellationBackground />
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <header className="mb-10">
            <h1 className="font-sans text-4xl font-black uppercase leading-[0.95] tracking-tighter text-foreground text-balance md:text-6xl">
              Nutrición de <span className="text-primary">{displayName}</span>
            </h1>
            <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground md:text-base">Planes por días con comidas y macros — admin y coach pueden crear para sus miembros.</p>
          </header>
          {profile ? <NutritionPlans profile={profile} /> : <div className="rounded-lg border border-dashed border-border bg-card/50 px-6 py-12 text-center text-sm text-muted-foreground">Miembro no encontrado.</div>}
        </div>
      </main>
    </>
  );
}
