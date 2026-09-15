import { Users } from "@/_features/gym-admin/users/components/Users";
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";
import { SITE_URL } from "@/lib/site-url";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function Home({
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
    "name": "Miembros",
    "item": `${base}/users`
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
