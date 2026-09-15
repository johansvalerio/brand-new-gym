import { Login } from "@/_features/auth/components/Login";
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site-url";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Accede a Jaula para gestionar tu gimnasio: socios, membresías, rutinas, nutrición y entrenamientos.",
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
    { name: "Inicio", item: SITE_URL },
    { name: "Autenticación", item: `${SITE_URL}/auth` },
    { name: "Iniciar Sesión", item: `${SITE_URL}/auth/login` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <Login nextPath={nextPath} gymName={gymName} />
    </>
  );
}
