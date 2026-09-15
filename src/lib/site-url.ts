/**
 * URL base canónica del sitio (una sola fuente).
 * Se lee de `NEXT_PUBLIC_SITE_URL` con fallback al deploy de producción.
 * Usar en metadata canónica, Open Graph, sitemap, robots y breadcrumbs —
 * nunca hardcodear el dominio en otro archivo.
 */
export const SITE_URL: string = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gymulate.vercel.app"
).replace(/\/$/, "");
