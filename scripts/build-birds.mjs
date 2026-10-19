// Every bird on Earth: the eBird/Clements checklist, matched to iNaturalist taxa so each species has a page here.
// Run: node scripts/build-birds.mjs  → data/birds.json
import fs from "node:fs";

const UA = { "User-Agent": "NatureLibrary/0.1 (https://nature-library.vercel.app)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const csv = (text) => {
  const rows = [];
  for (const line of text.trim().split("\n")) {
    const out = [];
    let cur = "", q = false;
    for (const ch of line) {
      if (ch === '"') q = !q;
      else if (ch === "," && !q) out.push(cur), (cur = "");
      else cur += ch;
    }
    out.push(cur.replace(/\r$/, ""));
    rows.push(out);
  }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
};
async function get(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: UA });
      if (r.ok) return r;
      if (r.status === 429) await sleep(20000);
    } catch {}
    await sleep(2000 * (i + 1));
  }
  throw new Error("failed " + url);
}

const en = csv(await (await get("https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=csv&cat=species")).text());
const es = csv(await (await get("https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=csv&cat=species&locale=es")).text());
const esName = new Map(es.map((r) => [r.SPECIES_CODE, r.COMMON_NAME]));
console.log("eBird species:", en.length);

// all iNaturalist bird species, order by order (the API stops at 10,000 results per query)
const inat = new Map(); // lowercased name -> id
const orders = (await (await get("https://api.inaturalist.org/v1/taxa?parent_id=3&rank=order&per_page=200&is_active=true")).json()).results;
for (const o of orders) {
  for (let page = 1; ; page++) {
    const j = await (await get(`https://api.inaturalist.org/v1/taxa?taxon_id=${o.id}&rank=species&per_page=200&page=${page}&is_active=true`)).json();
    for (const t of j.results) inat.set(t.name.toLowerCase(), t.id);
    if (page * 200 >= j.total_results || !j.results.length) break;
    await sleep(1100);
  }
  process.stdout.write(`\r iNat species so far: ${inat.size}  `);
  await sleep(1100);
}
console.log();

// names that differ between the two taxonomies: ask iNaturalist (it knows synonyms), then GBIF
const birds = [];
let viaSearch = 0, viaGbif = 0, unmatched = 0;
for (const r of en) {
  const sci = r.SCIENTIFIC_NAME;
  let id = inat.get(sci.toLowerCase());
  let gbif;
  if (!id) {
    const j = await (await get(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(sci)}&rank=species,subspecies&per_page=5`)).json();
    const hit = j.results.find((t) => t.iconic_taxon_name === "Aves" && (t.name.toLowerCase() === sci.toLowerCase() || t.matched_term?.toLowerCase() === sci.toLowerCase()));
    if (hit) (id = hit.id), viaSearch++;
    await sleep(1100);
  }
  if (!id) {
    const g = await (await get(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(sci)}&class=Aves&strict=true`)).json();
    if (g.usageKey && g.matchType !== "NONE") (gbif = g.acceptedUsageKey ?? g.usageKey), viaGbif++;
    else unmatched++;
  }
  birds.push([sci, r.COMMON_NAME, esName.get(r.SPECIES_CODE) ?? r.COMMON_NAME, r.SPECIES_CODE, r.FAMILY_SCI_NAME, r.ORDER, id ?? 0, gbif ?? 0, r.EXTINCT === "true" ? 1 : 0]);
}
const families = [];
const seen = new Map();
for (const r of en) {
  if (!seen.has(r.FAMILY_SCI_NAME)) {
    seen.set(r.FAMILY_SCI_NAME, families.length);
    families.push([r.FAMILY_SCI_NAME, r.FAMILY_COM_NAME, r.ORDER]);
  }
}
const esFam = new Map(es.map((r) => [r.FAMILY_SCI_NAME, r.FAMILY_COM_NAME]));
for (const f of families) f.push(esFam.get(f[0]) ?? f[1]);
fs.writeFileSync("data/birds.json", JSON.stringify({ source: "eBird/Clements Checklist (Cornell Lab of Ornithology)", fetched: new Date().toISOString().slice(0, 10), families, birds }));
console.log(`birds: ${birds.length} · direct iNat ${birds.length - viaSearch - viaGbif - unmatched} · via iNat synonym ${viaSearch} · via GBIF ${viaGbif} · unmatched ${unmatched}`);

// eBird does not translate family names; take Spanish ones from iNaturalist, else fall back to the Latin
{
  const d = JSON.parse(fs.readFileSync("data/birds.json", "utf8"));
  let found = 0;
  for (const f of d.families) {
    const j = await (await get(`https://api.inaturalist.org/v1/taxa?q=${f[0]}&rank=family&locale=es&per_page=5`)).json();
    const t = j.results.find((x) => x.name === f[0]);
    const es = t?.preferred_common_name;
    f[3] = es && es.toLowerCase() !== f[1].toLowerCase() ? es.charAt(0).toUpperCase() + es.slice(1) : f[0];
    if (f[3] !== f[0]) found++;
    await sleep(1100);
  }
  fs.writeFileSync("data/birds.json", JSON.stringify(d));
  console.log(`Spanish family names: ${found}/${d.families.length}`);
}
