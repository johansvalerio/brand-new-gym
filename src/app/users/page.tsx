
import { Users } from "@/_features/gym-admin/users/components/Users";

export default function Home() {    
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
     <Users />
    </main>
  );
}
