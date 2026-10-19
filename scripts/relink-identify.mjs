// Re-point the identifier's label tables at codex sheets after codex ids change. Only the slug column is rewritten;
// the embeddings are untouched. A label links to a sheet by iNaturalist id, or failing that by identical scientific name.
// Run: node scripts/relink-identify.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const codex = JSON.parse(fs.readFileSync(path.join(ROOT, "data/codex.built.json"), "utf8"));
const byId = new Map(codex.filter((e) => e.inatId).map((e) => [e.inatId, e.slug]));
const byName = new Map(codex.map((e) => [e.scientific.toLowerCase(), e.slug]));

const files = [path.join(ROOT, "public/identify/labels.json"), ...fs.readdirSync(path.join(ROOT, "public/identify/ext")).filter((f) => f.endsWith(".json")).map((f) => path.join(ROOT, "public/identify/ext", f))];
let changed = 0, linked = 0;
for (const f of files) {
  const j = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const l of j.labels) {
    const slug = byId.get(l[0]) ?? byName.get(String(l[1]).toLowerCase()) ?? "";
    if (l[4] !== slug) changed++;
    l[4] = slug;
    if (slug) linked++;
  }
  fs.writeFileSync(f, JSON.stringify(j));
}
console.log(`relinked: ${changed} labels changed, ${linked} labels link to a codex sheet, across ${files.length} files`);
