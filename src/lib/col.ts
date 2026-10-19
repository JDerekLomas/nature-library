// The current Catalogue of Life (the latest annual/monthly release, via ChecklistBank: https://api.checklistbank.org).
// The GBIF backbone the catalogue pages are built on dates from 2023; species described or re-split since then live here.
// COL ids are stable across releases, so /col/<id> links keep working as new editions appear.
import { fetchJson } from "./fetch-json";

const API = "https://api.checklistbank.org/dataset/3LR";
const R = 604800; // a week: COL publishes monthly

export interface ColName {
  scientificName: string;
  authorship?: string;
  rank: string;
  genus?: string;
  specificEpithet?: string;
}
export interface ColUsage {
  id: string;
  parentId?: string;
  status: string; // accepted | provisionally accepted | synonym | ...
  extinct?: boolean;
  environments?: string[];
  link?: string;
  name: ColName;
  accepted?: { id: string; name: ColName };
}
export interface ColNode {
  id: string;
  name: string;
  rank: string;
  authorship?: string;
  count?: number;
  childCount?: number;
  extinct?: boolean;
}
export interface ColInfo {
  usage: ColUsage;
  classification?: { id: string; name: string; rank: string }[];
  vernacularNames?: { name: string; language?: string }[];
  distributions?: { area?: { name?: string; globalId?: string }; status?: string }[];
  synonyms?: { homotypic?: { name: ColName }[]; heterotypic?: { name: ColName }[] };
  references?: Record<string, { citation?: string; year?: number }>;
}

export const colInfo = (id: string) => fetchJson<ColInfo>(`${API}/taxon/${encodeURIComponent(id)}/info`, { revalidate: R });

export async function colChildren(id: string, offset = 0, limit = 100) {
  const j = await fetchJson<{ total?: number; result?: ColNode[]; last?: boolean }>(`${API}/tree/${encodeURIComponent(id)}/children?limit=${limit}&offset=${offset}`, { revalidate: R });
  return { total: j?.total ?? 0, items: j?.result ?? [], last: j?.last ?? true };
}

export async function colRoots() {
  const j = await fetchJson<{ result?: ColNode[] }>(`${API}/tree?limit=20`, { revalidate: R });
  return j?.result ?? [];
}

/** Accepted species in COL under a taxon. */
export async function colSpeciesCount(id: string) {
  const j = await fetchJson<{ total?: number }>(`${API}/nameusage/search?TAXON_ID=${encodeURIComponent(id)}&rank=species&status=accepted&limit=0`, { revalidate: R });
  return j?.total ?? 0;
}

export interface ColHit {
  id: string;
  name: string;
  authorship?: string;
  rank: string;
  status: string;
  acceptedId?: string;
  path: string; // kingdom › class › family, for orientation
}
export async function colSearch(q: string, limit = 20): Promise<ColHit[]> {
  try {
    const j = await fetchJson<{ result?: { usage: ColUsage; classification?: { name: string; rank: string }[] }[] }>(
      `${API}/nameusage/search?q=${encodeURIComponent(q)}&content=SCIENTIFIC_NAME&content=VERNACULAR_NAME&limit=${limit}&sortBy=RELEVANCE`,
      { revalidate: 86400, tries: 2 }
    );
    return (j?.result ?? []).map(({ usage, classification }) => ({
      id: usage.id,
      name: usage.name.scientificName,
      authorship: usage.name.authorship,
      rank: usage.name.rank,
      status: usage.status,
      acceptedId: usage.accepted?.id,
      path: (classification ?? []).filter((c) => ["kingdom", "class", "family"].includes(c.rank)).map((c) => c.name).join(" › "),
    }));
  } catch {
    return [];
  }
}

/** ISO 639-2 codes COL uses for vernacular names. */
export const COL_LANG: Record<string, string> = { en: "eng", es: "spa" };
export const colWebUrl = (id: string) => `https://www.catalogueoflife.org/data/taxon/${encodeURIComponent(id)}`;
