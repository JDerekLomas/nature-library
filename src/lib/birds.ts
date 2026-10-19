// The eBird/Clements checklist of the world's birds (built by scripts/build-birds.mjs), matched to pages in this library.
import data from "../../data/birds.json";
import type { Lang } from "@/i18n/config";

type Row = [sci: string, en: string, es: string, code: string, family: string, order: string, inat: number, gbif: number, extinct: number];
type Fam = [sci: string, en: string, order: string, es: string];

const D = data as unknown as { source: string; fetched: string; families: Fam[]; birds: Row[] };

export interface Bird {
  sci: string;
  name: string;
  code: string;
  family: string;
  order: string;
  inat?: number;
  gbif?: number;
  extinct: boolean;
}
export interface BirdFamily {
  sci: string;
  slug: string;
  name: string;
  order: string;
  count: number;
}

const bird = (r: Row, lang: Lang): Bird => ({
  sci: r[0],
  name: lang === "es" ? r[2] : r[1],
  code: r[3],
  family: r[4],
  order: r[5],
  inat: r[6] || undefined,
  gbif: r[7] || undefined,
  extinct: !!r[8],
});

export const BIRD_COUNT = D.birds.length;
export const BIRDS_FETCHED = D.fetched;
export const familySlug = (sci: string) => sci.toLowerCase();

const counts = new Map<string, number>();
for (const r of D.birds) counts.set(r[4], (counts.get(r[4]) ?? 0) + 1);

export function birdFamilies(lang: Lang): BirdFamily[] {
  return D.families.map((f) => ({ sci: f[0], slug: familySlug(f[0]), name: lang === "es" ? f[3] : f[1], order: f[2], count: counts.get(f[0]) ?? 0 }));
}
export function birdsInFamily(slug: string, lang: Lang): Bird[] {
  return D.birds.filter((r) => familySlug(r[4]) === slug).map((r) => bird(r, lang));
}

const bySci = new Map(D.birds.map((r) => [r[0].toLowerCase(), r]));
const byInat = new Map(D.birds.filter((r) => r[6]).map((r) => [r[6], r]));
/** The eBird entry for a bird, by iNaturalist id or scientific name. */
export function ebirdFor(sci?: string, inat?: number, lang: Lang = "en"): Bird | undefined {
  const r = (inat && byInat.get(inat)) || (sci && bySci.get(sci.toLowerCase()));
  return r ? bird(r, lang) : undefined;
}
