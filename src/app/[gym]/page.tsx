import { StoryText2 } from "@/_features/gym-landing/components/StoryText2";
import { DifferencesSection } from "@/_features/gym-landing/components/DifferencesSection";
import FanDeckCards2 from "@/_features/gym-landing/components/FanDeckCards2";
import { CoachesSection } from "@/_features/gym-landing/components/CoachesSection";
import { MembershipSection } from "@/_features/gym-landing/components/MembershipSection";
import { LocationHours } from "@/_features/gym-landing/components/LocationHours";
import { FaqSection } from "@/_features/gym-landing/components/FaqSection";
import { FinalCTA } from "@/_features/gym-landing/components/FinalCTA";
import { Footer } from "@/_features/gym-landing/components/Footer";
import { Hero5 } from "@/_features/gym-landing/components/Hero5";
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import type { Metadata } from "next";
import { Gallery } from "@/_features/gym-landing/components/Gallery";

export const metadata: Metadata = {
  title: "Inicio",
  description: "Únete a Gymulate - el centro de entrenamiento táctico de fitness con equipamiento de élite, seguimiento con datos, acceso 24/7 y una comunidad que exige excelencia. Comienza tu transformación hoy.",
  openGraph: {
    title: "Gymulate - Centro de Entrenamiento Táctico de Fitness",
    description: "Únete a Gymulate - el centro de entrenamiento táctico de fitness con equipamiento de élite, seguimiento con datos, acceso 24/7 y una comunidad que exige excelencia.",
    url: "https://gymulate.vercel.app",
    images: [
      {
        url: "https://gymulate.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Gymulate - Centro de Entrenamiento Táctico de Fitness",
      },
    ],
  },
  twitter: {
    title: "Gymulate - Centro de Entrenamiento Táctico de Fitness",
    description: "Únete a Gymulate - el centro de entrenamiento táctico de fitness con equipamiento de élite, seguimiento con datos, acceso 24/7 y una comunidad que exige excelencia.",
    images: ["https://gymulate.vercel.app/og-image.jpg"],
  },
};

// JSON-LD Schema for LocalBusiness/Gym
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "GymOrFitnessCenter",
  name: "Gymulate",
  description: "Centro de entrenamiento táctico de fitness con equipamiento de élite, seguimiento con datos y acceso 24/7",
  url: "https://gymulate.vercel.app",
  telephone: "+506 8888-1111",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Av. Central",
    addressLocality: "Cañas",
    addressRegion: "Guanacaste",
    addressCountry: "CR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 9.9326,
    longitude: -84.0827,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "05:00",
      closes: "22:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "05:00",
      closes: "12:00",
    },
  ],
  priceRange: "$$",
  amenityFeature: [
    "Acceso 24/7",
    "Equipamiento de Élite",
    "Seguimiento con Datos",
    "Entrenamiento Personal",
    "Vestidores",
    "Duchas",
  ],
};

export default function Home() {
  const breadcrumbItems = [
    { name: "Inicio", item: "https://gymulate.vercel.app" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="min-h-screen bg-background text-foreground overflow-x-clip selection:bg-primary/30">
        <Hero5 />

        {/* Cortina: el contenido sube tapando el hero sticky. Sin bg acá:
            el redondeo vive en StoryText2 para que las esquinas dejen
            ver el hero detrás (mismo lenguaje que la cortina del FinalCTA) */}
        <div className="relative z-10">
          <StoryText2 />
          <FanDeckCards2 />
          <DifferencesSection />

          {/* Aire después de la secuencia pineada (no afecta la geometría del pin) */}
          <div aria-hidden="true" className="h-16 md:h-24 bg-background" />

          <Gallery />
          <CoachesSection />
          <MembershipSection />
          <FaqSection />
          <LocationHours />

          {/* Pausa antes de la cortina: el mapa sticky se queda fijo mientras
              el usuario recorre este tramo extra */}
          <div aria-hidden="true" className="hidden lg:block h-[28vh] bg-background" />

          {/* Cortina final: el muro verde del CTA sube tapando el mapa sticky.
              Sin bg en el wrapper para que las esquinas del rounded-t
              (pintadas por FinalCTA) dejen ver el mapa detrás. */}
          <div className="relative z-10 shadow-[0_-24px_60px_rgba(0,0,0,0.55)]">
            <FinalCTA />
            <Footer />
          </div>
        </div>
      </main>
    </>
  );
}
