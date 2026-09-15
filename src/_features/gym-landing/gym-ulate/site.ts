import type { SiteConfig } from "../shared/site";

export const gymUlateSite: SiteConfig = {
  slug: "gym-ulate",
  name: "Gymulate",
  description:
    "Únete a Gymulate - el centro de entrenamiento táctico de fitness con equipamiento de élite, seguimiento con datos, acceso 24/7 y una comunidad que exige excelencia. Comienza tu transformación hoy.",
  phone: "+506 8888-1111",
  email: "info@gymulate.com",
  footerTitle: ["Gym", "Ulate."],
  address: {
    street: "Av. Central",
    city: "Cañas",
    region: "Guanacaste",
    country: "CR",
  },
  geo: { lat: 9.9326, lng: -84.0827 },
  amenities: [
    "Acceso 24/7",
    "Equipamiento de Élite",
    "Seguimiento con Datos",
    "Entrenamiento Personal",
    "Vestidores",
    "Duchas",
  ],
  priceRange: "$$",
  ogImage: "/og-gym-ulate.jpg",
};
