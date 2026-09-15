import type { SiteConfig } from "../shared/site";

// TODO dueño zona-fit: reemplazar textos, teléfono, dirección y geo reales.
export const zonaFitSite: SiteConfig = {
  slug: "zona-fit",
  name: "Zona Fit",
  description:
    "Únete a Zona Fit - entrena a tu ritmo con coaching cercano, planes accesibles y una comunidad que te impulsa. Comienza tu transformación hoy.",
  phone: "+506 0000-0000",
  email: "info@zona-fit.com",
  footerTitle: ["Zona", "Fit."],
  address: {
    street: "Calle principal",
    city: "Cañas",
    region: "Guanacaste",
    country: "CR",
  },
  geo: { lat: 10.4303, lng: -84.9957 },
  amenities: [
    "Coaching cercano",
    "Planes accesibles",
    "Entrenamiento Personal",
    "Vestidores",
    "Duchas",
  ],
  priceRange: "$",
  ogImage: "/og-zona-fit.jpg",
};
