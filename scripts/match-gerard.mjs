// Matches Gerard chapters to codex entries. Exported for build-codex.mjs; run directly to review matches.
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

const norm = (s) => s.toLowerCase().normalize("NFKD").replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
// early-modern spelling: u/v, i/j, doubled letters, final -e
const loose = (s) => norm(s).replace(/v/g, "u").replace(/j/g, "i").replace(/y/g, "i").replace(/(.)\1/g, "$1").replace(/e\b/g, "");
const has = (hay, needle) => needle.length >= 4 && new RegExp(`(^| )${needle}( |$)`).test(hay);

export function matchGerard(entries) {
  const file = path.join(ROOT, "data/raw/gerard/chapters.json");
  if (!fs.existsSync(file)) return new Map();
  const chapters = JSON.parse(fs.readFileSync(file, "utf8")).filter((c) => c.sections.vertues || c.sections.description);
  const prepped = chapters.map((c) => ({ c, title: loose(c.title.replace(/^Of\s+/i, "")), names: loose(c.sections.names || "") }));
  const out = new Map();
  for (const e of entries) {
    if (e.kingdom !== "Plantae" && e.kingdom !== "Fungi") continue;
    const genus = loose(e.scientific.split(" ")[0]);
    const terms = [
      ...(e.historicalNames || []).map((h) => [loose(h), 3]),
      [loose(e.common), 3],
      [loose(e.common.split(" ").at(-1)), 1],
      ...(e.otherNames || []).filter((o) => /english/i.test(o) || !/\(/.test(o)).map((o) => [loose(o.replace(/\(.*?\)/g, "")), 2]),
      [genus, 2],
    ];
    let best = null;
    for (const p of prepped) {
      let s = 0;
      for (const [t, w] of terms) {
        if (!t) continue;
        if (has(p.title, t)) s = Math.max(s, w + 2);
        else if (has(p.names, t)) s = Math.max(s, w);
      }
      if (s >= 4 && (!best || s > best.s)) best = { s, c: p.c };
    }
    if (best) out.set(e.scientific, best);
  }
  return out;
}

if (process.argv[1].endsWith("match-gerard.mjs")) {
  const entries = JSON.parse(fs.readFileSync(path.join(ROOT, "data/codex.built.json"), "utf8"));
  for (const [k, v] of matchGerard(entries)) console.log(String(v.s).padEnd(2), k.padEnd(28), "→", v.c.title, `(p.${v.c.page})`);
}
