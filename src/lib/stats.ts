import "server-only";
import fs from "node:fs";
import path from "node:path";
import { CODEX, GERARD } from "./codex";
import { SHELVES } from "./shelves";
import { EXHIBITIONS } from "./exhibitions";
import { COUNTRY_CODES } from "./countries";
import { correctionLogs } from "./corrections";

const pub = (p: string) => path.join(process.cwd(), "public", p);

/** How many species the in-browser identifier can recognise (core + per-group tiers). */
function identifierSpecies() {
  let n = 0;
  try {
    n += JSON.parse(fs.readFileSync(pub("identify/labels.json"), "utf8")).count ?? 0;
    const dir = pub("identify/ext");
    for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) if (f.endsWith(".json")) n += JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")).count ?? 0;
  } catch {}
  return n;
}

const inClass = (name: string) => CODEX.filter((e) => e.ancestors?.some((a) => a.name === name)).length;

export function libraryStats() {
  return {
    codex: CODEX.length,
    plants: CODEX.filter((e) => e.kingdom === "Plantae").length,
    fungi: CODEX.filter((e) => e.kingdom === "Fungi").length,
    animals: CODEX.filter((e) => e.kingdom === "Animalia").length,
    birds: CODEX.filter((e) => e.form === "Bird" || e.ancestors?.some((a) => a.name === "Aves")).length,
    mammals: inClass("Mammalia"),
    fish: inClass("Actinopterygii") + inClass("Elasmobranchii") + inClass("Sarcopterygii"),
    herps: inClass("Reptilia") + inClass("Amphibia"),
    inverts: CODEX.filter((e) => e.kingdom === "Animalia" && !e.ancestors?.some((a) => a.name === "Chordata")).length,
    medicinal: CODEX.filter((e) => e.shelves.includes("medicinal")).length,
    gerard: GERARD.length,
    gerardLinked: GERARD.filter((c) => c.codex).length,
    shelves: SHELVES.length,
    exhibitions: EXHIBITIONS.length,
    countries: COUNTRY_CODES.length,
    corrections: correctionLogs().reduce((s, l) => s + l.changes.length, 0),
    identify: identifierSpecies(),
    withPlates: CODEX.filter((e) => e.plates?.length).length,
    withSeeds: CODEX.filter((e) => e.seedPhotos?.length).length,
  };
}
