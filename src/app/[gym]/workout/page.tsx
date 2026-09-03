import { WorkoutSession } from "@/_features/gym-workout/components/WorkoutSession";
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";

export default function WorkoutPage() {
  const breadcrumbItems = [
  {
    "name": "Inicio",
    "item": "https://gymulate.vercel.app"
  },
  {
    "name": "Entrenar",
    "item": "https://gymulate.vercel.app/workout"
  }
];

 return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 py-16">
 <div className="opacity-40">
 <ConstellationBackground />
 </div>
 <WorkoutSession />
 </main>
    </>
  );
}