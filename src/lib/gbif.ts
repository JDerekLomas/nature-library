// Server helpers over the GBIF species & occurrence APIs (https://techdocs.gbif.org/en/openapi/)
// GBIF's backbone taxonomy lists every accepted species catalogued by the world's museums, herbaria and checklists.

const API = "https://api.gbif.org/v1";
import { fetchJson } from "./fetch-json";

export const BACKBONE = "d7dddbf4-2cf0-4f39-9b2a-bb099caae36c";

// secondary lookups (names, images, counts) degrade quietly; the taxon itself must not
async function get<T>(path: string, revalidate = 2592000): Promise<T | null> {
  try {
    return await fetchJson<T>(`${API}${path}`, { revalidate, tries: 2 });
  } catch {
    return null;
  }
}

export interface GTaxon {
  key: number;
  scientificName: string;
  canonicalName?: string;
  authorship?: string;
  rank: string;
  taxonomicStatus?: string;
  acceptedKey?: number;
  kingdom?: string;
  phylum?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  kingdomKey?: number;
  phylumKey?: number;
  classKey?: number;
  orderKey?: number;
  familyKey?: number;
  genusKey?: number;
  vernacularName?: string;
  numDescendants?: number;
  extinct?: boolean;
  publishedIn?: string;
}

/** The taxon itself: throws on an outage rather than letting the page cache a "not found". */
export const gbifTaxon = (key: number) => fetchJson<GTaxon>(`${API}/species/${key}`, { revalidate: 2592000 });
export const gbifTaxonQuiet = (key: number) => get<GTaxon>(`/species/${key}`);
export const gbifParents = (key: number) => get<GTaxon[]>(`/species/${key}/parents`);

export async function gbifChildren(key: number, offset = 0, limit = 100) {
  return get<{ results: GTaxon[]; endOfRecords: boolean; offset: number }>(`/species/${key}/children?limit=${limit}&offset=${offset}`);
}

export async function gbifVernacular(key: number) {
  const r = await get<{ results: { vernacularName: string; language?: string }[] }>(`/species/${key}/vernacularNames?limit=200`);
  const seen = new Set<string>();
  const out: { name: string; lang?: string }[] = [];
  for (const v of r?.results ?? []) {
    const k = `${v.language}|${v.vernacularName.toLowerCase()}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ name: v.vernacularName, lang: v.language });
  }
  return out;
}

/** The English name most of GBIF's source checklists agree on (skipping banding codes and stray transliterations). */
/** The most-attested common name in a language (ISO 639-2: "eng", "spa"), voted across GBIF's checklists. */
export async function gbifEnglishName(key: number, language = "eng") {
  const r = await get<{ results: { vernacularName: string; language?: string }[] }>(`/species/${key}/vernacularNames?limit=200`);
  const votes = new Map<string, { n: number; name: string }>();
  for (const v of r?.results ?? []) {
    if (v.language !== language) continue;
    const name = v.vernacularName.trim();
    if (/^[A-Z]{3,6}$/.test(name) || name.length < 3) continue;
    const k = name.toLowerCase().replace(/[-\s]+/g, " ");
    const cur = votes.get(k) ?? { n: 0, name };
    cur.n++;
    // keep the nicest-cased spelling
    if (/^[A-Z]/.test(name) && !/^[A-Z]/.test(cur.name)) cur.name = name;
    votes.set(k, cur);
  }
  const best = [...votes.values()].sort((a, b) => b.n - a.n)[0];
  return best?.name;
}

export async function gbifIucn(key: number) {
  const r = await get<{ code?: string; category?: string }>(`/species/${key}/iucnRedListCategory`);
  return r?.code;
}

export async function gbifDescriptions(key: number) {
  const r = await get<{ results: { type?: string; description: string; language?: string; source?: string }[] }>(`/species/${key}/descriptions?limit=20`);
  return (r?.results ?? []).filter((d) => (!d.language || d.language === "eng" || d.language === "en") && d.description?.length > 60);
}

export interface GImage {
  url: string;
  title?: string;
  creator?: string;
  license?: string;
  publisher?: string;
  occurrence: number;
  basis?: string;
  country?: string;
  year?: number;
}

/** Photographs and specimen images attached to occurrence records: herbarium sheets, museum drawers, field photos. */
export async function gbifImages(key: number, limit = 12): Promise<GImage[]> {
  const r = await get<{ results: { key: number; basisOfRecord?: string; country?: string; year?: number; publisher?: string; media?: { type?: string; identifier?: string; title?: string; creator?: string; license?: string; rightsHolder?: string }[] }[] }>(
    `/occurrence/search?taxonKey=${key}&mediaType=StillImage&limit=${limit * 2}`
  );
  const out: GImage[] = [];
  for (const o of r?.results ?? []) {
    const m = o.media?.find((x) => x.type === "StillImage" && x.identifier && /creativecommons|publicdomain|cc0|cc-by/i.test(x.license ?? ""));
    if (!m) continue;
    out.push({
      url: `https://api.gbif.org/v1/image/cache/500x/occurrence/${o.key}/media/${hash(m.identifier!)}`,
      title: m.title,
      creator: m.creator || m.rightsHolder,
      license: m.license,
      publisher: o.publisher,
      occurrence: o.key,
      basis: o.basisOfRecord,
      country: o.country,
      year: o.year,
    });
    if (out.length >= limit) break;
  }
  return out;
}

// GBIF's image cache addresses media by the MD5 of the original URL
import { createHash } from "node:crypto";
function hash(s: string) {
  return createHash("md5").update(s).digest("hex");
}

/** Every species recorded in a country, most-recorded first, via GBIF occurrence facets. */
export async function speciesInCountry(iso2: string, offset = 0, limit = 60, taxonKey?: number, language = "eng") {
  const r = await get<{ count: number; facets: { counts: { name: string; count: number }[] }[] }>(
    `/occurrence/search?country=${iso2}${taxonKey ? `&taxonKey=${taxonKey}` : ""}&limit=0&facet=speciesKey&speciesKey.facetLimit=${limit}&speciesKey.facetOffset=${offset}`,
    604800
  );
  const counts = r?.facets?.[0]?.counts ?? [];
  const [taxa, english] = await Promise.all([
    Promise.all(counts.map((c) => gbifTaxonQuiet(Number(c.name)))),
    Promise.all(counts.map((c) => gbifEnglishName(Number(c.name), language))),
  ]);
  return {
    records: r?.count ?? 0,
    // how many species this page of the facet held, before any failed lookups were dropped (decides whether there is a next page)
    pageSize: counts.length,
    species: counts
      .map((c, i) => ({ key: Number(c.name), records: c.count, n: offset + i + 1, t: taxa[i] ? { ...taxa[i]!, vernacularName: english[i] ?? (language === "eng" ? taxa[i]!.vernacularName : undefined) } : null }))
      .filter((x) => x.t),
  };
}

export async function gbifSearch(q: string, limit = 20) {
  const r = await get<{ results: GTaxon[] }>(`/species/search?q=${encodeURIComponent(q)}&datasetKey=${BACKBONE}&status=ACCEPTED&limit=${limit}`, 86400);
  return r?.results ?? [];
}

export async function occurrenceCount(key: number) {
  const r = await get<{ count: number }>(`/occurrence/search?taxonKey=${key}&limit=0`, 604800);
  return r?.count ?? 0;
}

/** A Commons image for a GBIF taxon via Wikidata (P846 = GBIF taxon ID, P18 = image). Also returns the Wikidata item. */
export async function wikidataImage(key: number): Promise<{ url: string; page: string; item: string } | null> {
  const q = `SELECT ?t ?img WHERE { ?t wdt:P846 "${key}". OPTIONAL { ?t wdt:P18 ?img } } LIMIT 1`;
  try {
    const r = await fetch(`https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(q)}`, {
      headers: { "User-Agent": "NatureLibrary/0.1 (educational; https://thenaturelibrary.org)", Accept: "application/sparql-results+json" },
      next: { revalidate: 2592000 },
      signal: AbortSignal.timeout(8000),
    });
    const b = (await r.json()).results?.bindings?.[0];
    if (!b?.img) return null;
    const file = decodeURIComponent(b.img.value.split("/Special:FilePath/")[1]);
    return { url: `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=900`, page: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`, item: b.t.value };
  } catch {
    return null;
  }
}
