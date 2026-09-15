import { BreadcrumbSchema } from "@/_features/shared/components/Breadcrumbs";
import { getLanding } from "@/_features/gym-landing/shared/registry";
import { SITE_URL } from "@/lib/site-url";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gym: string }>;
}): Promise<Metadata> {
  const { gym } = await params;
  const { site } = getLanding(gym);
  const url = `${SITE_URL}/${site.slug}`;
  const ogImage = `${SITE_URL}${site.ogImage ?? "/og-image.jpg"}`;
  return {
    title: `${site.name} - Centro de Entrenamiento`,
    description: site.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${site.name} - Centro de Entrenamiento`,
      description: site.description,
      url,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${site.name} - Centro de Entrenamiento`,
        },
      ],
    },
    twitter: {
      title: `${site.name} - Centro de Entrenamiento`,
      description: site.description,
      images: [ogImage],
    },
  };
}

export default async function GymHome({ params }: { params: Promise<{ gym: string }> }) {
  const { gym } = await params;
  const { site, sections } = getLanding(gym);
  const url = `${SITE_URL}/${site.slug}`;

  // JSON-LD Schema for LocalBusiness/Gym — datos del site.ts de cada gym.
  // openingHours (formato texto schema.org) y sameAs solo se emiten si el gym los define.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GymOrFitnessCenter",
    name: site.name,
    description: site.description,
    url,
    telephone: site.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    priceRange: site.priceRange,
    amenityFeature: site.amenities,
    ...(site.hours && site.hours.length > 0 ? { openingHours: site.hours } : {}),
    ...(site.sameAs && site.sameAs.length > 0 ? { sameAs: site.sameAs } : {}),
  };

  const breadcrumbItems = [{ name: "Inicio", item: url }];
  const {
    hero: Hero,
    story: Story,
    fanDeck: FanDeck,
    differences: Differences,
    gallery: Gallery,
    coaches: Coaches,
    membership: Membership,
    faq: Faq,
    location: Location,
    finalCta: FinalCta,
    footer: Footer,
  } = sections;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BreadcrumbSchema items={breadcrumbItems} />
      {/* key por gym: sin esto, navegar entre slugs reutiliza las instancias de
          Location/FinalCTA (mismo tipo) con ScrollTriggers medidos en el gym
          anterior → línea congelada y CTA sin aparición. */}
      <main key={site.slug} className="min-h-screen bg-background text-foreground overflow-x-clip selection:bg-primary/30">
        <Hero />

        {/* Cortina: el contenido sube tapando el hero sticky. Sin bg acá:
            el redondeo vive en el story para que las esquinas dejen
            ver el hero detrás (mismo lenguaje que la cortina del FinalCTA) */}
        <div className="relative z-10">
          <Story />
          <FanDeck />
          <Differences />

          {/* Aire después de la secuencia pineada (no afecta la geometría del pin) */}
          <div aria-hidden="true" className="h-16 md:h-24 bg-background" />

          <Gallery />
          <Coaches />
          <Membership />
          <Faq />
          <Location />

          {/* Pausa antes de la cortina: el mapa sticky se queda fijo mientras
              el usuario recorre este tramo extra */}
          <div aria-hidden="true" className="hidden lg:block h-[28vh] bg-background" />

          {/* Cortina final: el muro verde del CTA sube tapando el mapa sticky.
              Sin bg en el wrapper para que las esquinas del rounded-t
              (pintadas por FinalCTA) dejen ver el mapa detrás. */}
          <div className="relative z-10 shadow-[0_-24px_60px_rgba(0,0,0,0.55)]">
            <FinalCta />
            <Footer />
          </div>
        </div>
      </main>
    </>
  );
}
