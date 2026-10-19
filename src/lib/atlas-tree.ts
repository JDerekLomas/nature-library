// The Atlas filter as a tree of life: kingdoms, then their great branches, then the branches people most often ask about.
// IDs resolved by scripts/build-atlas-tree.mjs against the GBIF backbone (globe) and iNaturalist (species lists).
import tree from "./atlas-tree.json";
import type { Lang } from "@/i18n/config";

interface Raw {
  id: string;
  sci: string;
  en: string;
  es: string;
  gbif: string;
  inat: number;
  children?: Raw[];
}
export interface AtlasLayer {
  id: string;
  sci: string;
  label: string;
  gbif: string;
  inat: number;
  depth: number;
  parent?: string;
  children: string[];
}

const ALL: Record<Lang, string> = { en: "All life", es: "Toda la vida" };

export function atlasTree(lang: Lang): Map<string, AtlasLayer> {
  const m = new Map<string, AtlasLayer>();
  m.set("all", { id: "all", sci: "", label: ALL[lang], gbif: "", inat: 0, depth: 0, children: [] });
  const add = (n: Raw, parent: string, depth: number) => {
    m.set(n.id, { id: n.id, sci: n.sci, label: lang === "es" ? n.es : n.en, gbif: n.gbif, inat: n.inat, depth, parent, children: [] });
    m.get(parent)!.children.push(n.id);
    for (const c of n.children ?? []) add(c, n.id, depth + 1);
  };
  for (const n of tree as Raw[]) add(n, "all", 1);
  return m;
}

/** From the root down to this layer: the rows of chips to show. */
export function pathTo(m: Map<string, AtlasLayer>, id: string): AtlasLayer[] {
  const out: AtlasLayer[] = [];
  for (let n = m.get(id); n; n = n.parent ? m.get(n.parent) : undefined) out.unshift(n);
  return out;
}
