import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";
import { RankingTabs } from "./ranking-tabs";

export const metadata = {
  title: "Ranking | Gymulate",
  description:
    "Las rutinas y rutinas + planes de nutrición mejor puntuadas por la comunidad de Gymulate, compartidas por sus propios miembros.",
};

export default function RankingPage() {
  const breadcrumbItems = [
    { name: "Inicio", item: "https://gymulate.vercel.app" },
    { name: "Ranking", item: "https://gymulate.vercel.app/ranking" },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="relative min-h-screen overflow-x-hidden bg-background py-16 text-foreground selection:bg-primary/30">
        <div className="opacity-40">
          <ConstellationBackground />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <header className="mb-10">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Comunidad
            </span>
            <h1 className="font-sans text-4xl font-black uppercase leading-[0.95] tracking-tighter text-foreground text-balance md:text-6xl">
              Ranking <span className="text-primary">Comunidad</span>
            </h1>
            <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
              Rutinas y planes de nutrición que la comunidad creó y compartió, ordenados por los votos de los miembros. Vota tus favoritas con fuego.
            </p>
          </header>

          <RankingTabs />
        </div>
      </main>
    </>
  );
}
