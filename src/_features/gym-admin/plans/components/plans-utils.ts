/** Etiquetas y derivados de presentación para planes. */

export function durationLabel(days: number): string {
  if (days === 1) return "1 día"
  if (days === 7) return "1 semana"
  if (days === 30) return "1 mes"
  return `${days} días`
}

export function statusLabel(isActive: boolean): string {
  return isActive ? "Activo" : "Inactivo"
}

export function statusBadgeClasses(isActive: boolean): string {
  return isActive
    ? "border-primary/30 bg-primary/10 text-primary"
    : "border-muted-foreground/30 bg-muted/10 text-muted-foreground"
}

/** Slug legible por URL desde el nombre (para no pedírselo al dueño). */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

/**
 * Slug garantizado no vacío: si el nombre no produce un slug limpio
 * (solo emojis/símbolos), usa un fallback único para no violar NOT NULL/unique.
 */
export function planSlug(name: string): string {
  const base = slugify(name)
  if (base) return base
  return `plan-${Date.now()}`
}