import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    canonical: "https://gymulate.com",
  },
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
    url: "https://gymulate.com",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
