import { redirect } from "next/navigation";

// La raíz no es de ningún gym: redirige al gym insignia.
// Cada gym vive en /[slug] (landing pública + app privada).
export default function RootPage() {
  redirect("/gym-ulate");
}
