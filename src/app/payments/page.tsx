import { Payments } from "@/_features/gym-admin/payments/components/Payments";
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";

export default function PaymentsPage() {
  const breadcrumbItems = [
  {
    "name": "Inicio",
    "item": "https://gymulate.vercel.app"
  },
  {
    "name": "Pagos",
    "item": "https://gymulate.vercel.app/payments"
  }
];

 return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="relative min-h-screen py-16 bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
 <div className="opacity-40">
 <ConstellationBackground />
 </div>
 <Payments />
 </main>
    </>
  );
}
