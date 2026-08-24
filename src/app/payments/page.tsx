import { Payments } from "@/_features/gym-admin/payments/components/Payments";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";

export default function PaymentsPage() {
  return (
    <main className="relative min-h-screen py-16 bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      <ConstellationBackground />
      <Payments />
    </main>
  );
}
