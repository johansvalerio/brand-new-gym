import { UserProfile } from "@/_features/gym-admin/profile/components/user-profile";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 py-20 sm:py-24">
      <UserProfile id={id} />
    </main>
  );
}
