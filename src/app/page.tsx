import { StoryText2 } from "@/_features/gym-landing/components/StoryText2";
import { DifferencesSection } from "@/_features/gym-landing/components/DifferencesSection";
import { EquipmentCarousel } from "@/_features/gym-landing/components/EquipmentCarousel";
import { CoachesSection } from "@/_features/gym-landing/components/CoachesSection";
import { MembershipSection } from "@/_features/gym-landing/components/MembershipSection";
import { LocationHours } from "@/_features/gym-landing/components/LocationHours";
import { FinalCTA } from "@/_features/gym-landing/components/FinalCTA";
import { Footer } from "@/_features/gym-landing/components/Footer";
import FanDeckCards2 from "@/_features/gym-landing/components/FanDeckCards2";
import { Hero2 } from "@/_features/gym-landing/components/Hero2";
import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicio",
  description: "Únete a Gymulate - el centro de entrenamiento táctico de fitness con equipamiento de élite, seguimiento con datos, acceso 24/7 y una comunidad que exige excelencia. Comienza tu transformación hoy.",
  openGraph: {
    title: "Gymulate - Centro de Entrenamiento Táctico de Fitness",
    description: "Únete a Gymulate - el centro de entrenamiento táctico de fitness con equipamiento de élite, seguimiento con datos, acceso 24/7 y una comunidad que exige excelencia.",
    url: "https://gymulate.com",
    images: [
      {
        url: "https://gymulate.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Gymulate - Centro de Entrenamiento Táctico de Fitness",
      },
    ],
  },
  twitter: {
    title: "Gymulate - Centro de Entrenamiento Táctico de Fitness",
    description: "Únete a Gymulate - el centro de entrenamiento táctico de fitness con equipamiento de élite, seguimiento con datos, acceso 24/7 y una comunidad que exige excelencia.",
    images: ["https://gymulate.com/og-image.jpg"],
  },
};

// JSON-LD Schema for LocalBusiness/Gym
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "GymOrFitnessCenter",
  name: "Gymulate",
  description: "Centro de entrenamiento táctico de fitness con equipamiento de élite, seguimiento con datos y acceso 24/7",
  url: "https://gymulate.com",
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
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "247",
  },
};

export default function Home() {
  const breadcrumbItems = [
    { name: "Inicio", item: "https://gymulate.com" },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
        <Hero2 />
        <StoryText2 />
        <DifferencesSection />
        <EquipmentCarousel />
        <FanDeckCards2 />
        <CoachesSection />
        <MembershipSection />
        <LocationHours />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}
