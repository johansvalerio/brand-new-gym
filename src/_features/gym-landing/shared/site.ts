/** Config del sitio por gym: alimenta metadata, JSON-LD y datos de contacto de la landing. */

export interface SiteAddress {
  street: string;
  city: string;
  region: string;
  country: string;
}

export interface SiteConfig {
  slug: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  /** Dos líneas del sign-off gigante del footer: ["Gym", "Ulate."]. */
  footerTitle: [string, string];
  address: SiteAddress;
  geo: { lat: number; lng: number };
  amenities: string[];
  priceRange: string;
  /** OG image del gym (path en /public). Si no se setea, la page usa /og-image.jpg. */
  ogImage?: string;
  /** Horarios en formato schema.org (ej. "Mo-Fr 05:00-22:00"). Solo se emite en el JSON-LD si existe. */
  hours?: string[];
  /** Redes/perfiles del gym. Solo se emite en el JSON-LD como sameAs si existe. */
  sameAs?: string[];
}
