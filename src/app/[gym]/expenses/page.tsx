import { Expenses } from "@/_features/gym-finances/components/Expenses";
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";
import { SITE_URL } from "@/lib/site-url";

export const metadata = {
  title: "Egresos | Jaula",
  description:
  "Egresos del gym: renta, salarios, servicios y gastos operativos.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ExpensesPage({
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
    "name": "Egresos",
    "item": `${base}/expenses`
  }
];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="relative min-h-screen py-16 bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
  <div className="opacity-40">
  <ConstellationBackground />
  </div>
  <Expenses />
  </main>
    </>
  );
}
