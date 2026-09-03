import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import { UserProfile } from "@/_features/gym-admin/profile/components/UserProfile";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const breadcrumbItems = [
    { name: "Inicio", item: "https://gymulate.vercel.app" },
    { name: "Miembros", item: "https://gymulate.vercel.app/users" },
    { name: "Perfil", item: `https://gymulate.vercel.app/users/profile/${id}` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 py-16">
        <UserProfile id={id} />
      </main>
    </>
  );
}
