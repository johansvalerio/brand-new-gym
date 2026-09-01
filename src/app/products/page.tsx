import { Products } from "@/_features/gym-admin/products/components/Products";
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";

export default function Home() {
  const breadcrumbItems = [
  {
    "name": "Inicio",
    "item": "https://gymulate.vercel.app"
  },
  {
    "name": "Productos",
    "item": "https://gymulate.vercel.app/products"
  }
];

 return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="relative min-h-screen py-16 bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
 <div className="opacity-40">
 <ConstellationBackground />
 </div>
 <Products />
 </main>
    </>
  );
}
