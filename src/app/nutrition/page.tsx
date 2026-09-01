import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";
import { NutritionClient } from "./NutritionClient";

export const metadata = {
  title: "Nutrición | Gymulate",
  description: "Planes de nutrición con comidas, macros y ficha técnica — comparte tus recetas con la comunidad.",
};

export default function NutritionPage() {
  const breadcrumbItems = [
    { name: "Inicio", item: "https://gymulate.vercel.app" },
    { name: "Nutrición", item: "https://gymulate.vercel.app/nutrition" },
  ];

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

          <NutritionClient />
        </div>
      </main>
    </>
  );
}
