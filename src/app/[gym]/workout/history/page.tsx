import { WorkoutCharts } from "@/_features/gym-workout/components/workout-charts"
import { WorkoutHistory } from "@/_features/gym-workout/components/workout-history"
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground"

export const metadata = {
 title: "Histórico | Gymulate",
 description: "Tu histórico de entrenamientos: volumen, series y progreso.",
}

export default function WorkoutHistoryPage() {
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
    "name": "Historial",
    "item": "https://gymulate.vercel.app/workout/history"
  }
];

 return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="relative min-h-screen bg-background py-16 text-foreground selection:bg-primary/30">
 <div className="opacity-40">
 <ConstellationBackground />
 </div>
 <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-4xl">
 <header className="mb-6 mt-4">
 <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
 <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
 Progreso
 </span>
 <h1 className="font-sans text-4xl font-black uppercase leading-[0.95] tracking-tighter text-foreground md:text-5xl">
 Histó<span className="text-primary">rico</span>
 </h1>
 <p className="mt-2 font-mono text-sm text-muted-foreground">Tus últimos 50 entrenamientos con detalle por ejercicio.</p>
 </header>
 <WorkoutCharts />
 <div className="mt-6">
 <WorkoutHistory />
 </div>
 </div>
 </main>
    </>
  )
}
