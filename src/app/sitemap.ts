import type { MetadataRoute } from "next";

// Landings públicas por gym (/[slug]) + login global. La app privada no se indexa.
const GYM_SLUGS = ["gym-ulate", "zona-fit", "isaac-castro"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://gymulate.vercel.app";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...GYM_SLUGS.map((slug) => ({
      url: `${baseUrl}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
