import { WorkoutSession } from "@/_features/gym-workout/components/workout-session";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";

export default function WorkoutPage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 py-20 sm:py-24">
      <div className="opacity-40">
        <ConstellationBackground />
      </div>
      <WorkoutSession />
    </main>
  );
}