import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }], sitemap: base ? `${base}/sitemap.xml` : undefined };
}
