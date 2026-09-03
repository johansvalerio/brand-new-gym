import { Plans } from "@/_features/gym-admin/plans/components/Plans";
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";

export default function PlansPage() {
  const breadcrumbItems = [
  {
    "name": "Inicio",
    "item": "https://gymulate.vercel.app"
  },
  {
    "name": "Planes",
    "item": "https://gymulate.vercel.app/plans"
  }
];

 return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="relative min-h-screen py-16 bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
 <div className="opacity-40">
 <ConstellationBackground />
 </div>
 <Plans />
 </main>
    </>
  );
}