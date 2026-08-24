import { Dashboard } from "@/_features/gym-admin/dashboard/components/Dashboard";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";

export const metadata = {
  title: "Dashboard | Gymulate",
  description:
    "Vista general del gimnasio: miembros, membresías por vencer, solicitudes de pago e ingresos del mes.",
};

export default function DashboardPage() {
  return (
    <main className="relative min-h-screen py-16 bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      <ConstellationBackground />
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Vista general
          </span>
          <h1 className="font-sans text-4xl font-black uppercase leading-[0.95] tracking-tighter text-foreground text-balance md:text-6xl">
            Dash<span className="text-primary">board</span>
          </h1>
          <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
            Miembros, vencimientos próximos, solicitudes de pago e ingresos —
            todo actualizado en tiempo real.
          </p>
        </header>

        <Dashboard />
      </div>
    </main>
  );
}
