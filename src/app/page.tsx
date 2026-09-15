import { redirect } from "next/navigation";
import type { Metadata } from "next";

// La raíz redirige por tenant (cada gym tiene su /[slug]).
// La landing pública de cada gym muestra el producto; /en-codigo-abierto no existe.
// pricing/features en /auth/register y /[gym] para crear cuenta.
export const metadata: Metadata = {
  title: {
    default: "Jaula — Software para gimnasios",
    template: "%s",
  },
  description:
    "Gestión multi-gym: socios, membresías, rutinas, productos y auditoría en tiempo real. Configuración lista en 5 minutos.",
};

export default function RootPage() {
  redirect("/gym-ulate");
}
