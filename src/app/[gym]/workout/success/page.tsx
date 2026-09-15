import { WorkoutSuccess } from "@/_features/gym-workout/components/workout-success"
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground"
import { SITE_URL } from "@/lib/site-url";

export const metadata = {
 title: "¡Guardado! | Jaula",
 description: "Tu entrenamiento se guardó correctamente.",
 robots: {
   index: false,
   follow: false,
 },
}

export default async function WorkoutSuccessPage({
  params,
}: {
  params: Promise<{ gym: string }>;
}) {
  const { gym } = await params;
  const base = `${SITE_URL}/${gym}`;
  const breadcrumbItems = [
  {
    "name": "Inicio",
    "item": base
  },
  {
    "name": "Entrenar",
    "item": `${base}/workout`
  },
  {
    "name": "Éxito",
    "item": `${base}/workout/success`
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
