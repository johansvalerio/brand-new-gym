import { WorkoutSuccess } from "@/_features/gym-workout/components/workout-success"
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground"

export const metadata = {
  title: "¡Guardado! | Gymulate",
  description: "Tu entrenamiento se guardó correctamente.",
}

export default function WorkoutSuccessPage() {
  return (
    <main className="relative min-h-screen bg-background py-20 sm:py-24 pt-28 sm:pt-32 text-foreground selection:bg-primary/30">
      <div className="opacity-40">
        <ConstellationBackground />
      </div>
      <div className="relative z-10 mx-auto max-w-lg px-4 sm:px-6">
        <WorkoutSuccess />
      </div>
    </main>
  )
}
