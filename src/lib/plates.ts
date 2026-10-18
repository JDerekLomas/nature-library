import "server-only";
import raw from "../../data/plates.json";
import type { Plate } from "./types";

// Expands the compact plates table written by scripts/build-codex.mjs. Imported only by the pages that list plates.
const G = "https://images.sourcelibrary.org/gallery/";
const data = raw as unknown as { books: Record<string, [string, string, number | null]>; rows: [string, string, number, string, number, string, string, string, string][] };

export const PLATES: Plate[] = (data.rows ?? []).map(([id, bookId, page, desc, ar, cat, iv, thKind, tv]) => {
  const [title, author, year] = data.books[bookId];
  const img = `${G}${bookId}/${id}.jpg${iv ? `?v=${iv}` : ""}`;
  return {
    id,
    bookId,
    page,
    desc,
    ar: ar || undefined,
    cat,
    title,
    author,
    year,
    img,
    th: thKind ? `${G}${bookId}/${id}-${thKind}.jpg${tv ? `?v=${tv}` : ""}` : img,
  };
});
