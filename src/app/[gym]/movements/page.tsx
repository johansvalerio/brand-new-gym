import { Movements } from "@/_features/gym-finances/components/Movements";
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";
import { SITE_URL } from "@/lib/site-url";

export const metadata = {
  title: "Movimientos | Jaula",
  description:
    "Bitácora inmutable: quién insertó, editó o eliminó qué — solo administrador.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MovementsPage({
  params,
}: {
  params: Promise<{ gym: string }>;
}) {
  const { gym } = await params;
  const base = `${SITE_URL}/${gym}`;
  const breadcrumbItems = [
  {
    "name": "Inicio",
    "item": base
  },
  {
    "name": "Movimientos",
    "item": `${base}/movements`
  }
];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="relative min-h-screen py-16 bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
  <div className="opacity-40">
  <ConstellationBackground />
  </div>
  <Movements />
  </main>
    </>
  );
}
