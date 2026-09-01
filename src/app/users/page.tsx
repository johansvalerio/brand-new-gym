import { Users } from "@/_features/gym-admin/users/components/Users";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";

export default function Home() {
 return (
 <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 py-16">
 <div className="opacity-40">
 <ConstellationBackground />
 </div>
 <Users />
 </main>
 );
}
