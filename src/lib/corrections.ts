import "server-only";
import fs from "node:fs";
import path from "node:path";

export interface Correction {
  species: string;
  field: string;
  was: string;
  now: string;
  sources: string[];
}
export interface CorrectionLog {
  file: string;
  title: string;
  summary: string;
  method: string;
  changes: Correction[];
}

const DIR = path.join(process.cwd(), "data/factcheck");

const clean = (t: string) => t.replace(/\*\*/g, "").replace(/`/g, "").trim();

function parse(file: string): CorrectionLog {
  const text = fs.readFileSync(path.join(DIR, file), "utf8");
  const lines = text.split("\n");
  const title = (lines.find((l) => l.startsWith("# ")) ?? file).replace(/^#\s*/, "");
  const summary = lines.find((l) => /^(Entries checked|Checked )/i.test(l)) ?? "";
  const method = lines.find((l) => /^Method/i.test(l)) ?? "";
  const changes: Correction[] = [];
  let inChanges = false;
  for (const raw of lines) {
    if (/^#{2,4}\s/.test(raw)) {
      const h = raw.toLowerCase();
      if (/unchanged|no change|verified|flagged|notes|open items|first-aid|specifically|checked,/.test(h)) inChanges = false;
      else if (/change/.test(h)) inChanges = true;
      continue;
    }
    if (!inChanges || !raw.startsWith("- ")) continue;
    const parts = raw.slice(2).split(" — ");
    if (parts.length < 3) continue;
    const [species, field, ...rest] = parts;
    const body = rest.join(" — ");
    const urls = [...body.matchAll(/https?:\/\/[^\s)\];,]+/g)].map((m) => m[0]);
    const noUrl = body
      .replace(/\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g, "$1") // markdown links → their text
      .replace(/https?:\/\/\S+/g, "")
      .replace(/\[web\]/gi, "")
      .replace(/(\s*[—;,]\s*)+$/g, "")
      .replace(/\s+(sources?:)\s*$/i, "")
      .trim();
    const [was, ...nowParts] = noUrl.split(/\s*→\s*/);
    changes.push({ species: clean(species), field: clean(field), was: clean(was ?? ""), now: clean(nowParts.join(" → ")), sources: urls });
  }
  return { file, title, summary, method, changes };
}

export function correctionLogs(): CorrectionLog[] {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR).filter((f) => f.endsWith(".md")).sort().map(parse);
}

/** Resolve a log's species label ("Common myna (acridotheres-tristis)", "Apple (Malus domestica)", "ornithoptera-priamus") to a codex slug. */
export function makeResolver(entries: { slug: string; scientific: string; common: string }[]) {
  const m = new Map<string, string>();
  for (const e of entries) {
    m.set(e.slug, e.slug);
    m.set(e.scientific.toLowerCase(), e.slug);
    m.set(e.common.toLowerCase(), e.slug);
  }
  return (label: string) => {
    const inner = label.match(/\(([^)]+)\)/)?.[1]?.toLowerCase().trim();
    const outer = label.replace(/\(.*?\)/g, "").toLowerCase().trim();
    return (inner && m.get(inner)) || m.get(outer) || m.get(outer.replace(/\s+/g, "-")) || undefined;
  };
}

let bySlug: Map<string, number> | null = null;
export function correctionsFor(slug: string, entries: { slug: string; scientific: string; common: string }[]) {
  if (!bySlug) {
    bySlug = new Map();
    const resolve = makeResolver(entries);
    for (const log of correctionLogs())
      for (const c of log.changes) {
        const s = resolve(c.species);
        if (s) bySlug.set(s, (bySlug.get(s) ?? 0) + 1);
      }
  }
  return bySlug.get(slug) ?? 0;
}
