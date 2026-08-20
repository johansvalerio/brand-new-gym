import { SignUp } from "@/_features/auth/components/SignUp";
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrarse",
  description: "Únete a Gymulate hoy y comienza tu transformación de fitness táctico. Obtén acceso a equipamiento de élite, seguimiento con datos y nuestra comunidad.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignUpPage() {
  const breadcrumbItems = [
    { name: "Inicio", item: "https://gymulate.com" },
    { name: "Autenticación", item: "https://gymulate.com/auth" },
    { name: "Registrarse", item: "https://gymulate.com/auth/signup" },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbItems} />
      <SignUp />
    </>
  );
}