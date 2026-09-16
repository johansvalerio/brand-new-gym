import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PlatformDashboard } from "@/_features/platform/components/PlatformDashboard";

export const metadata: Metadata = {
  title: "Jaula · Plataforma",
  description: "Vista agregada de todos los gyms: ingresos, miembros y neto por gym.",
  robots: { index: false, follow: false },
};

export default async function PlatformPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("is_platform_admin, gym_id")
    .eq("auth_id", user.id)
    .maybeSingle();

  if (!profile?.is_platform_admin) {
    // No es platform admin → a su gym (o al login si no tiene gym piniado).
    const { data: gym } = profile?.gym_id
      ? await supabase.from("gyms").select("slug").eq("id", profile.gym_id).maybeSingle()
      : { data: null };
    redirect(gym?.slug ? `/${gym.slug}/dashboard` : "/auth/login");
  }

  return <PlatformDashboard />;
}
