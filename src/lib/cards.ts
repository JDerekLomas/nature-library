import type { Entry } from "./types";

/** The few fields a specimen card shows — keeps client payloads small. */
export interface CardData {
  slug: string;
  nl: string;
  common: string;
  scientific: string;
  family?: string;
  edibility?: Entry["edibility"];
  img?: string;
}

export const toCard = (e: Entry): CardData => ({
  slug: e.slug,
  nl: e.nl,
  common: e.common,
  scientific: e.scientific,
  family: e.family,
  edibility: e.edibility,
  img: e.photos?.[0]?.medium ?? e.photos?.[0]?.url ?? e.plates?.[0]?.img,
});
