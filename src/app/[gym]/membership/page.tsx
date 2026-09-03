import { MyMembership } from "@/_features/gym-admin/membership/components/MyMembership";
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";

export const metadata = {
 title: "Mi membresía | Gymulate",
 description:
 "Gestiona tu membresía: solicita planes diarios, semanales o mensuales y sigue tu tiempo restante.",
};

export default function MyMembershipPage() {
  const breadcrumbItems = [
  {
    "name": "Inicio",
    "item": "https://gymulate.vercel.app"
  },
  {
    "name": "Membresía",
    "item": "https://gymulate.vercel.app/membership"
  }
];

 return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="relative min-h-screen py-16 bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
 <div className="opacity-40">
 <ConstellationBackground />
 </div>
 <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
 <header className="mb-10">
 <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
 <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
 Membresía
 </span>
 <h1 className="font-sans text-4xl font-black uppercase leading-[0.95] tracking-tighter text-foreground text-balance md:text-6xl">
 Mi <span className="text-primary">Membresía</span>
 </h1>
 <p className="mt-3 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
 Tu estado actual, el tiempo restante y la solicitud de nuevos
 planes — todo en un solo lugar.
 </p>
 </header>

 <MyMembership />
 </div>
 </main>
    </>
  );
}
