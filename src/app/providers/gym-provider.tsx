"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Tables } from "@/types/database.types";
import { createClient } from "@/lib/supabase/client";

export type Gym = Tables<"gyms">;

const GymContext = createContext<Gym | null>(null);

const GLOBAL_FIRST = new Set(["auth", "api"]);

function slugFromPath(pathname: string): string | null {
  const segs = pathname.split("/").filter(Boolean);
  if (segs.length === 0 || GLOBAL_FIRST.has(segs[0])) return null;
  return segs[0];
}

/**
 * Gym del slug de la URL, con sync en cliente: el RootLayout (server) no
 * re-ejecuta al navegar entre slugs sin recarga total, así que si el slug
 * del pathname no coincide con el gym inicial se re-resuelve por cliente
 * (tabla `gyms` legible por anon y autenticados). Sin esto, cruzar de
 * /zona-fit a /gym-ulate dejaba marca, links y color del gym anterior.
 */
export function GymProvider({
  gym: initialGym,
  children,
}: {
  gym: Gym | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [gym, setGym] = useState<Gym | null>(initialGym);
  // Slug derivado en render (no estado): las rutas globales (/auth/*) exponen
  // gym null sin setState — el sync solo re-resuelve entre slugs de gyms.
  const slug = slugFromPath(pathname);

  useEffect(() => {
    if (!slug || slug === gym?.slug) return;
    let cancelled = false;
    createClient()
      .from("gyms")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setGym(data ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, gym?.slug]);

  // White-label vivo: el --primary del body sigue al gym actual.
  useEffect(() => {
    if (gym?.primary_color) document.body.style.setProperty("--primary", gym.primary_color);
  }, [gym?.primary_color]);

  return <GymContext value={slug === null ? null : gym}>{children}</GymContext>;
}

/** Gym resuelto por slug en el layout raíz (+ sync cliente). Null en rutas globales (/auth/*). */
export function useGym() {
  return useContext(GymContext);
}

/** Prefija un path de app con el slug actual: gymHref("/dashboard") → "/zona-fit/dashboard". */
export function useGymHref() {
  const gym = useContext(GymContext);
  return (path: string) => (gym ? `/${gym.slug}${path === "/" ? "" : path}` : path);
}

/**
 * Pathname sin el slug del gym: "/zona-fit/dashboard" → "/dashboard",
 * "/zona-fit" → "/", "/auth/login" → "/auth/login" (ruta global intacta).
 * Para comparar rutas de app sin importar en qué gym estás.
 */
export function useInGymPath() {
  const pathname = usePathname();
  const segs = pathname.split("/").filter(Boolean);
  if (segs.length === 0 || segs[0] === "auth" || segs[0] === "api") return pathname;
  return `/${segs.slice(1).join("/")}`;
}
