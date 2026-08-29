import { Plans } from "@/_features/gym-admin/plans/components/Plans";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";

export default function PlansPage() {
  return (
    <main className="relative min-h-screen py-16 bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      <ConstellationBackground />
      <Plans />
    </main>
  );
}