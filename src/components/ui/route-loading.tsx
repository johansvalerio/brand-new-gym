import { Skeleton } from "@/components/ui/skeleton";

/** Fallback de Suspense por ruta: respeta el shell (py-16, max-w-6xl). */
export function RouteLoading({ rows = 6 }: { rows?: number }) {
  return (
    <main className="relative min-h-screen bg-background py-16 text-foreground">
      <div className="relative z-10 mx-auto max-w-6xl animate-pulse px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-2 h-4 w-80" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
