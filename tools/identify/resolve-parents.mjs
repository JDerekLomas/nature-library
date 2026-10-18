// Resolves lineages for the extended tier by fetching each species' parent (usually its genus) with its full ancestor chain.
import fs from "node:fs";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = async (u) => {
  for (let i = 0; i < 6; i++) {
    const r = await fetch(u, { headers: { "User-Agent": "NatureLibrary/0.1 (https://nature-library.vercel.app)" } }).catch(() => null);
    if (r?.ok) return r.json();
    await sleep(4000 * (i + 1));
  }
  return { results: [] };
};
const core = JSON.parse(fs.readFileSync("labels-raw.json"));
const ext = JSON.parse(fs.readFileSync("labels-ext-raw.json"));
ext.taxa ??= {};
const known = (id) => core.taxa[id] || ext.taxa[id];
const parents = new Set();
for (const g of Object.values(ext.groups)) for (const s of Object.values(g)) if (s.anc?.length > 1 && !known(s.anc.at(-2))) parents.add(s.anc.at(-2));
const ids = [...parents];
console.log("parents to resolve", ids.length);
for (let i = 0; i < ids.length; i += 30) {
  const j = await get(`https://api.inaturalist.org/v1/taxa/${ids.slice(i, i + 30).join(",")}`);
  for (const t of j.results ?? []) {
    ext.taxa[t.id] = [t.name, t.rank];
    for (const a of t.ancestors ?? []) ext.taxa[a.id] ??= [a.name, a.rank];
  }
  if ((i / 30) % 50 === 0) {
    fs.writeFileSync("labels-ext-raw.json", JSON.stringify(ext));
    console.log("  ", i, "/", ids.length);
  }
  await sleep(900);
}
fs.writeFileSync("labels-ext-raw.json", JSON.stringify(ext));
console.log("done; taxa known", Object.keys(ext.taxa).length);
