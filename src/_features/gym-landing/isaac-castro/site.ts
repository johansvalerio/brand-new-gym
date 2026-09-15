import type { SiteConfig } from "../shared/site";

// TODO dueño isaac-castro: reemplazar textos, teléfono, dirección y geo reales.
export const isaacCastroSite: SiteConfig = {
  slug: "isaac-castro",
  name: "Isaac Castro",
  description:
    "Únete a Isaac Castro - disciplina, fuerza y resultados con programación seria y seguimiento de cerca. Comienza tu transformación hoy.",
  phone: "+506 0000-0000",
  email: "info@isaac-castro.com",
  footerTitle: ["Isaac", "Castro."],
  address: {
    street: "Calle principal",
    city: "Cañas",
    region: "Guanacaste",
    country: "CR",
  },
  geo: { lat: 10.4303, lng: -84.9957 },
  amenities: [
    "Programación de fuerza",
    "Seguimiento cercano",
    "Entrenamiento Personal",
    "Vestidores",
  ],
  priceRange: "$",
  ogImage: "/og-isaac-castro.jpg",
};
