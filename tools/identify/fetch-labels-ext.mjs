// Extended identification tier: the most-observed 10,000 species within each major group.
import fs from "node:fs";
const GROUPS = ["Aves", "Plantae", "Insecta", "Fungi", "Mammalia", "Reptilia", "Amphibia", "Actinopterygii", "Mollusca", "Arachnida"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = async (u) => {
  for (let i = 0; i < 6; i++) {
    const r = await fetch(u, { headers: { "User-Agent": "NatureLibrary/0.1 (https://nature-library.vercel.app)" } }).catch(() => null);
    if (r?.ok) return r.json();
    await sleep(4000 * (i + 1));
  }
  throw new Error("failed " + u);
};
const core = JSON.parse(fs.readFileSync("labels-raw.json"));
const CACHE = "labels-ext-raw.json";
const ext = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE)) : { groups: {}, done: {} };
for (const g of GROUPS) {
  ext.groups[g] ??= {};
  for (let p = (ext.done[g] ?? 0) + 1; p <= 20; p++) {
    const j = await get(`https://api.inaturalist.org/v1/observations/species_counts?verifiable=true&iconic_taxa=${g}&per_page=500&page=${p}&locale=en`);
    for (const { count, taxon: t } of j.results) ext.groups[g][t.id] = { id: t.id, name: t.name, common: t.preferred_common_name, iconic: t.iconic_taxon_name, anc: t.ancestor_ids, obs: count };
    ext.done[g] = p;
    fs.writeFileSync(CACHE, JSON.stringify(ext));
    if (j.results.length < 500) break;
    await sleep(1100);
  }
  console.log(g, Object.keys(ext.groups[g]).length);
}
// ancestors not already known
const need = new Set();
for (const g of GROUPS) for (const s of Object.values(ext.groups[g])) for (const a of s.anc || []) if (!core.taxa[a]) need.add(a);
const ids = [...need];
console.log("ancestors to fetch", ids.length);
ext.taxa ??= {};
for (let i = 0; i < ids.length; i += 30) {
  const batch = ids.slice(i, i + 30).filter((x) => !ext.taxa[x]);
  if (!batch.length) continue;
  const j = await get(`https://api.inaturalist.org/v1/taxa/${batch.join(",")}`);
  for (const t of j.results) ext.taxa[t.id] = [t.name, t.rank];
  if ((i / 30) % 25 === 0) {
    fs.writeFileSync(CACHE, JSON.stringify(ext));
    console.log("  ancestors", i, "/", ids.length);
  }
  await sleep(1000);
}
fs.writeFileSync(CACHE, JSON.stringify(ext));
console.log("done");
