export type Edibility = "edible" | "edible-with-care" | "not-edible" | "toxic" | "deadly";

export interface Photo {
  url: string; // large
  medium?: string;
  square?: string;
  attribution: string;
  license?: string;
  source: "iNaturalist" | "Wikimedia";
}

export interface Plate {
  id: string;
  img: string;
  th: string;
  title: string; // book title
  author: string;
  year: number | null;
  page: number;
  bookId: string;
  desc: string;
  long?: string;
  ar?: number;
  cat?: string; // plants | fungi | birds | fish | animals
  m?: "named" | "relative"; // how the plate was matched to a codex entry
}

export interface Ancestor {
  id: number;
  name: string;
  rank: string;
  common?: string;
}

export interface Entry {
  slug: string;
  nl: string; // accession number, e.g. NL·0042
  scientific: string;
  common: string;
  otherNames?: string[];
  kingdom: string;
  form?: string;
  family?: string;
  shelves: string[];
  summary: string;
  nativeRange?: string;
  regions?: string[];
  biomes?: string[];
  abilities?: string[];
  edibility?: Edibility;
  edibleParts?: string[];
  edibilityNote?: string;
  medicinal?: {
    uses: { tradition: string; use: string }[];
    compounds?: string[];
    evidence?: "strong" | "moderate" | "traditional";
    cautions?: string;
  };
  fruit?: { type?: string; season?: string; description?: string };
  seed?: { description?: string; size?: string; dispersal?: string; germination?: string };
  grow?: {
    zones?: string;
    climates?: string[];
    sun?: string;
    water?: string;
    soil?: string;
    propagation?: string;
    timeToHarvest?: string;
    steps?: string[];
  };
  animal?: {
    diet?: string;
    habitat?: string;
    lifespan?: string;
    size?: string;
    behaviour?: string;
    fieldMarks?: string[];
    voice?: string;
    lookalikes?: string;
    whereToSee?: string;
    season?: string;
    order?: string;
  };
  iucn?: string;
  lore?: string;
  historicalNames?: string[];
  funFact?: string;
  // enrichment
  inatId?: number;
  observations?: number;
  photos?: Photo[];
  ancestors?: Ancestor[];
  gbifKey?: number;
  wiki?: { url: string; extract?: string };
  plates?: Plate[];
  seedPhotos?: CommonsPhoto[];
  gerard?: GerardRef;
  fruitPhotos?: CommonsPhoto[];
}

export interface CommonsPhoto {
  url: string;
  page: string;
  title: string;
  attribution: string;
}

export interface Shelf {
  id: string;
  title: string;
  numeral: string;
  blurb: string;
}

export interface GerardRef {
  id: string;
  title: string;
  chap: number;
  book: string;
  page: number;
  printed: number | null;
  names?: string;
  place?: string;
  time?: string;
  temperature?: string;
  vertues?: string;
}

export interface GerardChapter {
  id: string;
  title: string;
  chap: number;
  book: string;
  page: number;
  printed: number | null;
  bookId: string;
  codex?: string;
  sections: Partial<Record<"intro" | "kindes" | "description" | "place" | "time" | "names" | "temperature" | "vertues" | "danger", string>>;
}
