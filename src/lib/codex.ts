import "server-only";
import built from "../../data/codex.built.json";
import gerardData from "../../data/gerard.json";
import type { Entry, GerardChapter } from "./types";

export const CODEX = built as unknown as Entry[];
export const GERARD = gerardData as unknown as GerardChapter[];
export const GERARD_BOOK = "6957ebcc57a4c14a9879ab9c";
export const gerardPage = (page: number) => `https://images.sourcelibrary.org/pages/${GERARD_BOOK}/${String(page).padStart(4, "0")}.jpg`;
export const gerardUrl = (page: number) => `https://sourcelibrary.org/book/the-herball-or-generall-historie-of-plantes-gerard?page=${page}`;

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

export function searchCodex(q: string) {
  const t = q.toLowerCase();
  return CODEX.filter(
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
