import "server-only";
import built from "../../data/codex.built.json";
import gerardData from "../../data/gerard.json";
import esData from "../../data/codex.es.json";
import type { Lang } from "@/i18n/config";
import type { Entry, GerardChapter } from "./types";

export const CODEX = built as unknown as Entry[];
export const GERARD = gerardData as unknown as GerardChapter[];
export { GERARD_BOOK, gerardPage, gerardUrl } from "./gerard-urls";

const bySlug = new Map(CODEX.map((e) => [e.slug, e]));
const byInat = new Map(CODEX.filter((e) => e.inatId).map((e) => [e.inatId!, e]));

export const getEntry = (slug: string) => bySlug.get(slug);
export const getByInat = (id: number) => byInat.get(id);
export const onShelf = (shelf: string) => CODEX.filter((e) => e.shelves?.includes(shelf));

export function relatives(e: Entry, n = 6) {
  const fam = CODEX.filter((x) => x.slug !== e.slug && x.family && x.family === e.family);
  const shelf = CODEX.filter(
    (x) => x.slug !== e.slug && !fam.includes(x) && x.kingdom === e.kingdom && x.shelves.some((s) => e.shelves.includes(s))
  );
  return [...fam, ...shelf].slice(0, n);
}

export function searchCodex(q: string, list: Entry[] = CODEX) {
  const t = q.toLowerCase();
  return list.filter(
    (e) =>
      e.common.toLowerCase().includes(t) ||
      e.scientific.toLowerCase().includes(t) ||
      e.family?.toLowerCase().includes(t) ||
      e.otherNames?.some((n) => n.toLowerCase().includes(t)) ||
      e.abilities?.some((a) => a.toLowerCase().includes(t)) ||
      e.medicinal?.uses.some((u) => u.use.toLowerCase().includes(t) || u.tradition.toLowerCase().includes(t))
  );
}

export const coverPhoto = (e: Entry) => e.photos?.[0]?.url ?? e.plates?.[0]?.img;

export const KINGDOM_LABEL: Record<string, string> = {
  Plantae: "Plants",
  Animalia: "Animals",
  Fungi: "Fungi",
  Protista: "Protists",
  Chromista: "Chromists",
};

// ——— localisation ———
const ES = esData as unknown as Record<string, Partial<Entry>>;

/** Deep-merge a translated overlay onto an entry: objects merge, arrays of objects merge by index, other values replace. */
function overlay<T>(base: T, top: unknown): T {
  if (top === undefined || top === null) return base;
  if (Array.isArray(base) && Array.isArray(top)) {
    if (base.length && typeof base[0] === "object") return base.map((b, i) => overlay(b, top[i])) as T;
    return top as T;
  }
  if (base && typeof base === "object" && typeof top === "object") {
    const out = { ...(base as Record<string, unknown>) };
    for (const [k, v] of Object.entries(top as Record<string, unknown>)) out[k] = overlay(out[k], v);
    return out as T;
  }
  return top as T;
}

export function localize(e: Entry, lang: Lang): Entry {
  if (lang === "en") return e;
  const o = ES[e.slug];
  return o ? { ...overlay(e, o), translated: true } as Entry : e;
}
export const codexIn = (lang: Lang) => (lang === "en" ? CODEX : CODEX.map((e) => localize(e, lang)));
export const hasTranslation = (slug: string) => !!ES[slug];
