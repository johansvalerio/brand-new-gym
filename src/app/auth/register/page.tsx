import { RegisterForm } from "@/_features/auth/components/RegisterForm";
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Crea tu cuenta en Jaula y gestiona tu gimnasio: miembros, membresías, rutinas y finanzas.",
  robots: { index: false, follow: false },
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ gym?: string; next?: string }>;
}) {
  const { gym, next } = await searchParams;
  const breadcrumbItems = [
    { name: "Inicio", item: "https://jaula.vercel.app" },
    { name: "Autenticación", item: "https://jaula.vercel.app/auth" },
    { name: "Crear cuenta", item: "https://jaula.vercel.app/auth/register" },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <RegisterForm nextPath={next} gymSlug={gym} />
    </>
  );
}
