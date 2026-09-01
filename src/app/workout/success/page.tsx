import { WorkoutSuccess } from "@/_features/gym-workout/components/workout-success"
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground"

export const metadata = {
 title: "¡Guardado! | Gymulate",
 description: "Tu entrenamiento se guardó correctamente.",
}

export default function WorkoutSuccessPage() {
  const breadcrumbItems = [
  {
    "name": "Inicio",
    "item": "https://gymulate.vercel.app"
  },
  {
    "name": "Entrenar",
    "item": "https://gymulate.vercel.app/workout"
  },
  {
    "name": "Éxito",
    "item": "https://gymulate.vercel.app/workout/success"
  }
];

 return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="relative min-h-screen bg-background py-16 text-foreground selection:bg-primary/30">
 <div className="opacity-40">
 <ConstellationBackground />
 </div>
 <div className="relative z-10 mx-auto max-w-lg px-4 sm:px-6">
 <WorkoutSuccess />
 </div>
 </main>
    </>
  )
}
