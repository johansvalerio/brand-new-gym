import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PageTransitionOverlay } from "@/_features/shared/components/PageTransitionOverlay";
import { QueryProvider } from "@/app/providers/query-provider";
import { AppToaster } from "@/app/providers/app-toaster";
import { AuthProvider } from "@/app/providers/auth-provider";
import { FloatingNav } from "@/_features/shared/components/FloatingNav";
import { AppShell } from "@/_features/shared/layout/app-sidebar";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Gymulate - Centro de Entrenamiento Táctico de Fitness",
    template: "%s | Gymulate"
  },
  description: "Gymulate es un centro de entrenamiento táctico de fitness con equipamiento de élite, seguimiento con datos y acceso 24/7. Transforma tu cuerpo con nuestros programas de entrenamiento inspirados en el ejército.",
  keywords: ["gym", "fitness", "entrenamiento táctico", "entrenamiento personal", "gym 24/7", "equipamiento de élite", "seguimiento de datos", "entrenamiento de fuerza", "crossfit", "fitness funcional"],
  authors: [{ name: "Gymulate" }],
  creator: "Gymulate",
  publisher: "Gymulate",
  alternates: {
    canonical: "https://gymulate.vercel.app",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_CR",
    url: "https://gymulate.vercel.app",
    title: "Gymulate - Centro de Entrenamiento Táctico de Fitness",
    description: "Transforma tu cuerpo con equipamiento de élite, seguimiento con datos y acceso 24/7 en Gymulate.",
    siteName: "Gymulate",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gymulate - Centro de Entrenamiento Táctico de Fitness",
    description: "Transforma tu cuerpo con equipamiento de élite, seguimiento con datos y acceso 24/7 en Gymulate.",
    creator: "@gymulate",
  },
  verification: {
    google: "google-site-verification-code",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient()
  // getUser() valida el JWT contra Auth server — getSession() viene de cookies sin verificar
  const {
    data: { user },
  } = await supabase.auth.getUser()
  let profile: import("@/types/database.types").Tables<"users"> | null = null
  if (user?.id) {
    const { data } = await supabase.from("users").select("*").eq("auth_id", user.id).maybeSingle()
    profile = data ?? null
  }

  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider initialUser={user} initialProfile={profile}>
          <QueryProvider>
            <FloatingNav />
            <PageTransitionOverlay />
            <AppShell>{children}</AppShell>
            <AppToaster />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
