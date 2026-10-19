// Thin server-side helpers over the public iNaturalist API (https://api.inaturalist.org/v1/docs/)
import type { Photo } from "./types";
import { fetchJson } from "./fetch-json";

const API = "https://api.inaturalist.org/v1";

export interface ITaxon {
  id: number;
  name: string;
  rank: string;
  rank_level: number;
  preferred_common_name?: string;
  iconic_taxon_name?: string;
  observations_count: number;
  wikipedia_url?: string | null;
  wikipedia_summary?: string | null;
  default_photo?: { medium_url: string; square_url: string; attribution: string; license_code?: string };
  taxon_photos?: { photo: { url: string; medium_url: string; large_url?: string; square_url: string; attribution: string; license_code?: string } }[];
  ancestors?: ITaxon[];
  ancestor_ids?: number[];
  conservation_status?: { status: string; authority?: string } | null;
  children?: ITaxon[];
  extinct?: boolean;
  complete_species_count?: number | null;
}

export async function getTaxon(id: number, locale = "en"): Promise<ITaxon | null> {
  const j = await fetchJson<{ results?: ITaxon[] }>(`${API}/taxa/${id}?locale=${locale}`);
  return j?.results?.[0] ?? null;
}

export async function getChildren(id: number, perPage = 60, locale = "en"): Promise<ITaxon[]> {
  const j = await fetchJson<{ results?: ITaxon[] }>(`${API}/taxa?parent_id=${id}&is_active=true&per_page=${perPage}&order_by=observations_count&order=desc&locale=${locale}`);
  return j?.results ?? [];
}

export async function searchTaxa(q: string, perPage = 30, locale = "en"): Promise<ITaxon[]> {
  const r = await fetch(`${API}/taxa?q=${encodeURIComponent(q)}&per_page=${perPage}&is_active=true&locale=${locale}`, { next: { revalidate: 86400 } });
  if (!r.ok) return [];
  return (await r.json()).results ?? [];
}

export function photosOf(t: ITaxon, max = 12): Photo[] {
  const list = t.taxon_photos?.length ? t.taxon_photos.map((p) => p.photo) : t.default_photo ? [t.default_photo as never] : [];
  return list.filter((p: { license_code?: string | null }) => p.license_code).slice(0, max).map((p: { url?: string; medium_url: string; large_url?: string; square_url: string; attribution: string; license_code?: string }) => ({
    url: p.large_url || (p.url ? p.url.replace("square", "large") : p.medium_url),
    square: p.square_url,
    attribution: p.attribution,
    license: p.license_code,
    source: "iNaturalist" as const,
  }));
}

export const stripHtml = (s?: string | null) => (s ? s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() : "");

export const RANK_LABEL: Record<string, string> = {
  stateofmatter: "Life",
  kingdom: "Kingdom",
  phylum: "Phylum",
  subphylum: "Subphylum",
  class: "Class",
  subclass: "Subclass",
  order: "Order",
  suborder: "Suborder",
  superfamily: "Superfamily",
  family: "Family",
  subfamily: "Subfamily",
  tribe: "Tribe",
  genus: "Genus",
  species: "Species",
  subspecies: "Subspecies",
  variety: "Variety",
};
