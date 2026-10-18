// Builds the identification label set: the most-observed species on iNaturalist + every codex species,
// each with its Linnaean ranks (BioCLIP is prompted with the full taxonomic string).
import fs from "node:fs";
const N_PAGES = Number(process.argv[2] || 20); // 500 per page
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = async (u) => {
  for (let i = 0; i < 5; i++) {
    const r = await fetch(u, { headers: { "User-Agent": "NatureLibrary/0.1 (https://nature-library.vercel.app)" } }).catch(() => null);
    if (r?.ok) return r.json();
    await sleep(3000 * (i + 1));
  }
  throw new Error("failed " + u);
};
const CACHE = "labels-raw.json";
const raw = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE)) : { species: {}, taxa: {}, pages: 0 };
for (let p = raw.pages + 1; p <= N_PAGES; p++) {
  const j = await get(`https://api.inaturalist.org/v1/observations/species_counts?verifiable=true&per_page=500&page=${p}&locale=en`);
  for (const { count, taxon: t } of j.results)
    raw.species[t.id] = { id: t.id, name: t.name, common: t.preferred_common_name, iconic: t.iconic_taxon_name, anc: t.ancestor_ids, obs: count };
  raw.pages = p;
  fs.writeFileSync(CACHE, JSON.stringify(raw));
  console.log("page", p, Object.keys(raw.species).length);
  await sleep(1100);
}
// codex species
const codex = JSON.parse(fs.readFileSync("../../data/codex.built.json"));
const missing = codex.filter((e) => e.inatId && !raw.species[e.inatId]).map((e) => e.inatId);
for (let i = 0; i < missing.length; i += 30) {
  const j = await get(`https://api.inaturalist.org/v1/taxa/${missing.slice(i, i + 30).join(",")}?locale=en`);
  for (const t of j.results) raw.species[t.id] = { id: t.id, name: t.name, common: t.preferred_common_name, iconic: t.iconic_taxon_name, anc: t.ancestor_ids, obs: t.observations_count };
  await sleep(1100);
}
// ancestor names for the main ranks
const need = new Set();
for (const s of Object.values(raw.species)) for (const a of s.anc || []) if (!raw.taxa[a]) need.add(a);
const ids = [...need];
console.log("ancestors to fetch", ids.length);
for (let i = 0; i < ids.length; i += 30) {
  const j = await get(`https://api.inaturalist.org/v1/taxa/${ids.slice(i, i + 30).join(",")}`);
  for (const t of j.results) raw.taxa[t.id] = [t.name, t.rank];
  if ((i / 30) % 20 === 0) {
    fs.writeFileSync(CACHE, JSON.stringify(raw));
    console.log("  ancestors", i);
  }
  await sleep(1000);
}
fs.writeFileSync(CACHE, JSON.stringify(raw));
console.log("species", Object.keys(raw.species).length, "taxa", Object.keys(raw.taxa).length);
