// World checklists of the vertebrates, one per specialist authority (built by background pulls into data/checklists/):
// fishes from FishBase, mammals / reptiles / amphibians from the current Catalogue of Life (MDD, Reptile Database, ASW).
// Birds have their own room (the eBird/Clements checklist in the Aviary).
import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Lang } from "@/i18n/config";

export type GroupId = "fishes" | "mammals" | "reptiles" | "amphibians";
export const GROUPS: GroupId[] = ["fishes", "mammals", "reptiles", "amphibians"];

export interface Sp {
  sci: string;
  author: string;
  en: string;
  family: string;
  order: string;
  cls: string;
  gbif: number;
  col: string;
  habitat: string; // fishes: letters F (fresh), B (brackish), M (marine)
  climate: string; // fishes: tropical, subtropical, temperate, boreal, polar, deep-water
  zone: string; // fishes: reef, pelagic, demersal, ...
  iucn: string; // mammals (MDD)
  countries: string; // mammals (MDD)
  extinct: boolean;
}
export interface Fam {
  family: string;
  slug: string;
  order: string;
  cls: string;
  common: string;
}
interface Group {
  source: string;
  fetched: string;
  families: Fam[];
  species: Sp[];
}

const cache = new Map<GroupId, Group | null>();
const FILES: Record<GroupId, string> = {
  fishes: path.join(/*turbopackIgnore: true*/ process.cwd(), "data/checklists/fishes.json"),
  mammals: path.join(/*turbopackIgnore: true*/ process.cwd(), "data/checklists/mammals.json"),
  reptiles: path.join(/*turbopackIgnore: true*/ process.cwd(), "data/checklists/reptiles.json"),
  amphibians: path.join(/*turbopackIgnore: true*/ process.cwd(), "data/checklists/amphibians.json"),
};
export const familySlug = (f: string) => f.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export function loadGroup(g: GroupId): Group | null {
  if (cache.has(g)) return cache.get(g)!;
  let out: Group | null = null;
  try {
    const j = JSON.parse(fs.readFileSync(FILES[g], "utf8"));
    if (g === "fishes") {
      const fam = new Map<string, Fam>((j.families as string[][]).map(([family, order, cls, common]) => [family, { family, slug: familySlug(family), order, cls, common: common ?? "" }]));
      const species: Sp[] = (j.fishes as (string | number)[][]).map(([sci, author, en, family, habitat, climate, zone, gbif, col]) => ({
        sci: String(sci), author: String(author ?? ""), en: String(en ?? ""), family: String(family), order: fam.get(String(family))?.order ?? "", cls: fam.get(String(family))?.cls ?? "",
        gbif: Number(gbif) || 0, col: String(col ?? ""), habitat: String(habitat ?? ""), climate: String(climate ?? ""), zone: String(zone ?? ""),
        iucn: "", countries: "", extinct: false,
      }));
      out = { source: j.source, fetched: j.fetched, families: [...fam.values()], species };
    } else {
      const fam = new Map<string, Fam>((j.families as string[][]).map(([family, order]) => [family, { family, slug: familySlug(family), order, cls: "", common: "" }]));
      const species: Sp[] = (j.species as (string | number)[][]).map(([sci, author, en, family, order, col, gbif, iucn, countries, extinct]) => {
        if (!fam.has(String(family))) fam.set(String(family), { family: String(family), slug: familySlug(String(family)), order: String(order), cls: "", common: "" });
        return {
          sci: String(sci), author: String(author ?? ""), en: String(en ?? ""), family: String(family), order: String(order), cls: "", gbif: Number(gbif) || 0, col: String(col ?? ""),
          habitat: "", climate: "", zone: "", iucn: String(iucn ?? ""), countries: String(countries ?? ""), extinct: !!extinct,
        };
      });
      out = { source: j.source, fetched: j.fetched, families: [...fam.values()], species };
    }
  } catch {
    out = null;
  }
  cache.set(g, out);
  return out;
}

export interface FishFilter {
  h?: "marine" | "fresh" | "brackish";
  c?: "tropical";
  z?: "reef";
}
export const fishMatch = (s: Sp, f: FishFilter) =>
  (!f.h || (f.h === "marine" ? s.habitat.includes("M") : f.h === "fresh" ? s.habitat.includes("F") : s.habitat.includes("B"))) &&
  (!f.c || s.climate === "tropical") &&
  (!f.z || s.zone === "reef");

/** The fish filter read from the address (?h=marine|fresh|brackish, ?c=tropical, ?z=reef), and written back. */
export const filterOf = (sp: { h?: string; c?: string; z?: string }): FishFilter => ({
  h: sp.h === "marine" || sp.h === "fresh" || sp.h === "brackish" ? sp.h : undefined,
  c: sp.c === "tropical" ? "tropical" : undefined,
  z: sp.z === "reef" ? "reef" : undefined,
});
export const qsOf = (f: FishFilter) => {
  const u = new URLSearchParams();
  if (f.h) u.set("h", f.h);
  if (f.c) u.set("c", f.c);
  if (f.z) u.set("z", f.z);
  const s = u.toString();
  return s ? `?${s}` : "";
};

/** Where a species opens: its GBIF page (which hands on to iNaturalist), else its Catalogue of Life page, else search. */
// and when neither knows it under this name (a recent split or genus move), the checklist's own page for it
export const speciesHref = (g: GroupId, s: Sp) => (s.gbif ? `/gbif/${s.gbif}` : s.col ? `/col/${encodeURIComponent(s.col)}` : `/checklists/${g}/s/${encodeURIComponent(s.sci.replace(/ /g, "_"))}`);
export const findSpecies = (g: GroupId, name: string) => loadGroup(g)?.species.find((s) => s.sci === name);

export const GROUP_LATIN: Record<GroupId, string> = { fishes: "Pisces", mammals: "Mammalia", reptiles: "Reptilia", amphibians: "Amphibia" };
export const groupTitle = (g: GroupId, lang: Lang) =>
  (lang === "es" ? { fishes: "Peces", mammals: "Mamíferos", reptiles: "Reptiles", amphibians: "Anfibios" } : { fishes: "Fishes", mammals: "Mammals", reptiles: "Reptiles", amphibians: "Amphibians" })[g];
