import { Payments } from "@/_features/gym-admin/payments/components/Payments";
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";
import { SITE_URL } from "@/lib/site-url";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MembershipsPage({
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
    "name": "Membresías",
    "item": `${base}/memberships`
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
