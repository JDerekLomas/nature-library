// Finds openly licensed photographs of each plant's SEEDS (and fruit) on Wikimedia Commons.
// Writes data/raw/commons-cache.json, which build-codex.mjs folds into the codex.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const P = (...a) => path.join(ROOT, ...a);
const OUT = P("data/raw/commons-cache.json");
const cache = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = { "User-Agent": "NatureLibrary/0.1 (educational; https://nature-library.vercel.app)" };
const OPEN = /^(cc0|cc by|cc-by|public domain|pd)/i;
const strip = (s = "") => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function search(q, test, n) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=20" +
    `&gsrsearch=${encodeURIComponent(q)}&prop=imageinfo&iiprop=url|extmetadata|mime&iiurlwidth=640`;
  for (let i = 0; i < 3; i++) {
    const r = await fetch(url, { headers: UA }).catch(() => null);
    if (r?.ok) {
      const j = await r.json();
      const pages = Object.values(j.query?.pages ?? {}).sort((a, b) => a.index - b.index);
      const out = [];
      for (const p of pages) {
        const ii = p.imageinfo?.[0];
        if (!ii || !/image\/(jpeg|png|webp)/.test(ii.mime)) continue;
        const m = ii.extmetadata ?? {};
        const lic = m.LicenseShortName?.value ?? "";
        if (!OPEN.test(lic)) continue;
        if (!test(p.title)) continue;
        out.push({
          url: ii.thumburl,
          page: ii.descriptionurl,
          title: p.title.replace(/^File:/, "").replace(/\.[a-z]+$/i, ""),
          attribution: `${strip(m.Artist?.value) || "Unknown"} · ${lic}`,
        });
        if (out.length >= n) break;
      }
      return out;
    }
    await sleep(2000 * (i + 1));
  }
  return [];
}

const SEED = /seed|semen|samen|graine|semilla|frø|stone|kernel|\bpit\b|\bnuts?\b|bean|grain|pip|achene|caryopsis/i;
const FRUIT = /fruit|frucht|fruto|berry|berries|pod|drupe|capsule|cone/i;

const files = fs.readdirSync(P("data/codex")).filter((f) => f.endsWith(".json"));
const plants = files.flatMap((f) => JSON.parse(fs.readFileSync(P("data/codex", f), "utf8"))).filter((e) => e.kingdom === "Plantae");
console.log(`${plants.length} plants`);
let done = 0;
for (const e of plants) {
  const k = e.scientific;
  if (cache[k]) continue;
  const genusOk = (t) => t.toLowerCase().includes(k.split(" ")[0].toLowerCase()) || t.toLowerCase().includes(e.common.toLowerCase().split(" ").at(-1));
  const seeds = await search(`"${k}" seed`, (t) => SEED.test(t) && genusOk(t), 4);
  await sleep(400);
  const fruit = e.fruit ? await search(`"${k}" fruit`, (t) => FRUIT.test(t) && !SEED.test(t) && genusOk(t), 3) : [];
  cache[k] = { seeds, fruit };
  fs.writeFileSync(OUT, JSON.stringify(cache));
  if (++done % 20 === 0) console.log(`  ${done}`);
  await sleep(400);
}
const n = Object.values(cache).filter((c) => c.seeds.length).length;
console.log(`done: ${n}/${plants.length} plants have seed photographs`);
