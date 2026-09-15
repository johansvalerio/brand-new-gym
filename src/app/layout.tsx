import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { PageTransitionOverlay } from "@/_features/shared/components/PageTransitionOverlay";
import { QueryProvider } from "@/app/providers/query-provider";
import { AppToaster } from "@/app/providers/app-toaster";
import { AuthProvider } from "@/app/providers/auth-provider";
import { GymProvider } from "@/app/providers/gym-provider";
import { FloatingNav } from "@/_features/shared/components/FloatingNav";
import { AppShell } from "@/_features/shared/layout/app-sidebar";
import { PushSubscriber } from "@/_features/shared/components/push-subscriber";
import { createClient } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jaula",
    template: "%s",
  },
  description: "Jaula es la plataforma para gestionar tu gimnasio: socios, membresías, rutinas, nutrición y entrenamientos en un solo lugar.",
  keywords: ["software gimnasios", "gestión gimnasio", "app gimnasio", "membresías", "rutinas entrenamiento", "control acceso gym", "multi-sede"],
  authors: [{ name: "Jaula" }],
  creator: "Jaula",
  publisher: "Jaula",
  alternates: {
    canonical: SITE_URL,
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
    url: SITE_URL,
    title: "Jaula - Software para gimnasios",
    description: "Socios, membresías, rutinas, nutrición y entrenamientos en una sola plataforma.",
    siteName: "Jaula",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jaula - Software para gimnasios",
    description: "Socios, membresías, rutinas, nutrición y entrenamientos en una sola plataforma.",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
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

  // Gym por slug de URL (el proxy lo pone en x-gym-slug). Null en rutas globales (/auth/*).
  const headerList = await headers();
  const gymSlug = headerList.get("x-gym-slug");
  let gym: import("@/types/database.types").Tables<"gyms"> | null = null;
  if (gymSlug) {
    const { data } = await supabase.from("gyms").select("*").eq("slug", gymSlug).eq("is_active", true).maybeSingle();
    gym = data ?? null;
  }

  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col"
        // White-label por gym: todo `bg-primary/text-primary/border-primary` usa var(--primary).
        style={gym?.primary_color ? ({ "--primary": gym.primary_color } as React.CSSProperties) : undefined}
      >
        <AuthProvider initialUser={user} initialProfile={profile}>
          <GymProvider gym={gym}>
          <QueryProvider>
            <FloatingNav />
            <PageTransitionOverlay />
            <AppShell>{children}</AppShell>
            <AppToaster />
            <PushSubscriber />
          </QueryProvider>
          </GymProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
