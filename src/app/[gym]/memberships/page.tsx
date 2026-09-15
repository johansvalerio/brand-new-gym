import { Payments } from "@/_features/gym-admin/payments/components/Payments";
import { Income } from "@/_features/gym-finances/components/Income";
import { Expenses } from "@/_features/gym-finances/components/Expenses";
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SITE_URL } from "@/lib/site-url";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function MembershipsPage({
  params,
}: {
  params: Promise<{ gym: string }>;
}) {
  const { gym } = await params;
  const breadcrumbItems = [
    { name: "Inicio", item: `${SITE_URL}/${gym}` },
    { name: "Membresías", item: `${SITE_URL}/${gym}/memberships` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="relative min-h-screen py-16 bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
        <div className="opacity-40">
          <ConstellationBackground />
        </div>
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="membresias">
            <TabsList>
              <TabsTrigger value="membresias">Membresías</TabsTrigger>
              <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
              <TabsTrigger value="egresos">Egresos</TabsTrigger>
            </TabsList>
            <TabsContent value="membresias" className="mt-4">
              <Payments />
            </TabsContent>
            <TabsContent value="ingresos" className="mt-4">
              <Income />
            </TabsContent>
            <TabsContent value="egresos" className="mt-4">
              <Expenses />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
