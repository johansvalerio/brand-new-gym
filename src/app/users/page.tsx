
import { Users } from "@/_features/gym-admin/users/components/Users";
import { FloatingNav } from "@/_features/gym-landing/components/FloatingNav";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 py-16">
      <FloatingNav />
      <Users />
    </main>
  );
}
