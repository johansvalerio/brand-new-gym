"use client";

import { createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import type { Tables } from "@/types/database.types";

export type Gym = Tables<"gyms">;

const GymContext = createContext<Gym | null>(null);

export function GymProvider({ gym, children }: { gym: Gym | null; children: React.ReactNode }) {
  return <GymContext value={gym}>{children}</GymContext>;
}

/** Gym resuelto por slug en el layout raíz. Null en rutas globales (/auth/*). */
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
