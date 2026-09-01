import { Users } from "@/_features/gym-admin/users/components/Users";
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";

export default function Home() {
  const breadcrumbItems = [
  {
    "name": "Inicio",
    "item": "https://gymulate.vercel.app"
  },
  {
    "name": "Miembros",
    "item": "https://gymulate.vercel.app/users"
  }
];

 return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 py-16">
 <div className="opacity-40">
 <ConstellationBackground />
 </div>
 <Users />
 </main>
    </>
  );
}
