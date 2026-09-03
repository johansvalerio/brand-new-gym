import { Login } from "@/_features/auth/components/Login";
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Accede a tu cuenta de Gymulate para rastrear tus entrenamientos, gestionar tu membresía y conectar con la comunidad de fitness táctico.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ gym?: string; next?: string }>;
}) {
  const { gym: gymSlug, next } = await searchParams;

  let gymName: string | null = null;
  if (gymSlug) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("gyms")
      .select("name")
      .eq("slug", gymSlug)
      .eq("is_active", true)
      .maybeSingle();
    gymName = data?.name ?? null;
  }

  const nextPath = next ?? (gymSlug ? `/${gymSlug}/dashboard` : "/gym-ulate/dashboard");

  const breadcrumbItems = [
    { name: "Inicio", item: "https://gymulate.vercel.app" },
    { name: "Autenticación", item: "https://gymulate.vercel.app/auth" },
    { name: "Iniciar Sesión", item: "https://gymulate.vercel.app/auth/login" },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <Login nextPath={nextPath} gymName={gymName} />
    </>
  );
}
