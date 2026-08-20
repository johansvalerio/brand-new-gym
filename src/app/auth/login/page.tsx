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
    { name: "Inicio", item: "https://gymulate.com" },
    { name: "Autenticación", item: "https://gymulate.com/auth" },
    { name: "Iniciar Sesión", item: "https://gymulate.com/auth/login" },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <Login />
    </>
  );
}