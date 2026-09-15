import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import { UserProfile } from "@/_features/gym-admin/profile/components/UserProfile";
import { SITE_URL } from "@/lib/site-url";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ gym: string; id: string }>;
}) {
  const { gym, id } = await params;
  const base = `${SITE_URL}/${gym}`;
  const breadcrumbItems = [
    { name: "Inicio", item: base },
    { name: "Miembros", item: `${base}/users` },
    { name: "Perfil", item: `${base}/users/profile/${id}` },
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
