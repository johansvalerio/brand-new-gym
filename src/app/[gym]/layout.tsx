import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * Layout del tenant: /[gym]/...
 * - Slug inválido/inactivo → 404.
 * - Landing (/[slug]) es pública para todos (compartir por WhatsApp).
 * - Cualquier ruta más profunda exige pertenecer al gym: mismatch → tu dashboard.
 * - Perfil sin gym (primer login) se asigna al gym del slug (first-join pin, una sola vez).
 */
export default async function GymLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gym: string }>;
}) {
  const { gym: slug } = await params;
  const supabase = await createClient();

  const { data: gym } = await supabase
    .from("gyms")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!gym) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? `/${slug}`;
  const isLanding = pathname === `/${slug}` || pathname === `/${slug}/`;

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("id, gym_id, role")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (profile && !profile.gym_id) {
      // First-join: el trigger dejó gym_id NULL, la app lo fija una sola vez.
      await supabase.from("users").update({ gym_id: gym.id }).eq("id", profile.id);
    } else if (profile?.gym_id && profile.gym_id !== gym.id && !isLanding) {
      const { data: ownGym } = await supabase
        .from("gyms")
        .select("slug")
        .eq("id", profile.gym_id)
        .maybeSingle();
      redirect(`/${ownGym?.slug ?? "gym-ulate"}/dashboard`);
    }
  }

  return <>{children}</>;
}
