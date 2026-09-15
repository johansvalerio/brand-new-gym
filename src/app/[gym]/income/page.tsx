import { Income } from "@/_features/gym-finances/components/Income";
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";
import { SITE_URL } from "@/lib/site-url";

export const metadata = {
  title: "Ingresos | Jaula",
  description:
  "Ingresos del gym: membresías aprobadas, ventas de mostrador y rentas fijas.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function IncomePage({
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
    "name": "Ingresos",
    "item": `${base}/income`
  }
];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="relative min-h-screen py-16 bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
  <div className="opacity-40">
  <ConstellationBackground />
  </div>
  <Income />
  </main>
    </>
  );
}
