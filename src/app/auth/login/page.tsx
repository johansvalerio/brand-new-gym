import { Login } from "@/_features/auth/components/Login";
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión",
  description: "Accede a tu cuenta de Gymulate para rastrear tus entrenamientos, gestionar tu membresía y conectar con la comunidad de fitness táctico.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  const breadcrumbItems = [
    { name: "Inicio", item: "https://gymulate.vercel.app" },
    { name: "Autenticación", item: "https://gymulate.vercel.app/auth" },
    { name: "Iniciar Sesión", item: "https://gymulate.vercel.app/auth/login" },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <Login />
    </>
  );
}