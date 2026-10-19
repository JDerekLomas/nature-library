import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import { CODEX, GERARD } from "@/lib/codex";
import { SHELVES } from "@/lib/shelves";
import { EXHIBITIONS } from "@/lib/exhibitions";
import { COUNTRY_CODES } from "@/lib/countries";
import { birdFamilies } from "@/lib/birds";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export default function sitemap(): MetadataRoute.Sitemap {
  // every page in English, with its Spanish twin declared as an alternate
  const u = (p: string, priority = 0.5): MetadataRoute.Sitemap[number] => ({
    url: `${BASE}${p}`,
    priority,
    alternates: { languages: { en: `${BASE}${p}`, es: `${BASE}/es${p === "/" ? "" : p}` } },
  });
  const rooms = ["/", "/atlas", "/wheel", "/catalogue", "/shelves", "/bestiary", "/aviary", "/plates", "/herball", "/identify", "/col", "/checklists", "/checklists/fishes", "/checklists/mammals", "/checklists/reptiles", "/checklists/amphibians", "/herbarium", "/aviary/checklist", "/grow", "/exhibitions", "/about"].map((p) => u(p, 0.9));
  // most-observed species from the identifier's label table (≈10,000)
  let top: MetadataRoute.Sitemap = [];
  try {
    const meta = JSON.parse(fs.readFileSync(path.join(process.cwd(), "public/identify/labels.json"), "utf8"));
    const codexIds = new Set(CODEX.map((e) => e.inatId));
    top = (meta.labels as [number][]).filter(([id]) => !codexIds.has(id)).map(([id]) => u(`/taxon/${id}`, 0.4));
  } catch {}
  return [
    ...rooms,
    ...CODEX.map((e) => u(`/species/${e.slug}`, 0.8)),
    ...SHELVES.map((s) => u(`/shelves/${s.id}`, 0.6)),
    ...EXHIBITIONS.map((x) => u(`/exhibitions/${x.slug}`, 0.6)),
    ...GERARD.map((c) => u(`/herball/${c.id}`, 0.5)),
    ...COUNTRY_CODES.map((c) => u(`/catalogue/country/${c.toLowerCase()}`, 0.5)),
    ...birdFamilies("en").map((f) => u(`/aviary/checklist/${f.slug}`, 0.5)),
    ...top,
  ];
}
