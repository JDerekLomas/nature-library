import type { MetadataRoute } from "next";

// AI crawlers are refused (Cloudflare "Block AI bots", and a 403 on the server: deploy/server/Caddyfile).
// This list says so in robots.txt too; keep it in step with the Caddyfile.
const AI_CRAWLERS = [
  "GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-Web", "anthropic-ai", "CCBot", "Bytespider",
  "Amazonbot", "PerplexityBot", "Perplexity-User", "meta-externalagent", "meta-externalfetcher", "FacebookBot",
  "Google-Extended", "Google-CloudVertexBot", "Applebot-Extended", "cohere-ai", "cohere-training-data-crawler",
  "Diffbot", "ImagesiftBot", "Omgilibot", "Timpibot", "YouBot", "AI2Bot", "img2dataset",
];

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "");
  return {
    rules: [
      { userAgent: AI_CRAWLERS, disallow: "/" },
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
    ],
    sitemap: base ? `${base}/sitemap.xml` : undefined,
  };
}
