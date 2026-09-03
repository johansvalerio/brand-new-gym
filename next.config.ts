import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    // Avatares OAuth (Google) + Storage Supabase. product_image/avatar son
    // URLs pegadas por admin (cualquier host) y siguen en <img> a propósito;
    // estos patterns solo habilitan migrar a next/image donde convenga.
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
