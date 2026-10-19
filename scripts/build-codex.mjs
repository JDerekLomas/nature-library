// Builds data/codex.built.json and data/plates.json
//  1. merges hand-written entries in data/codex/*.json
//  2. enriches each with iNaturalist (id, photos, lineage), GBIF (usage key) and Wikipedia (summary) — cached in data/raw/enrich-cache.json
//  3. matches Source Library illustrations (data/raw/sl-gallery.json) to species by binomial, historical and common names
import fs from "node:fs";
import path from "node:path";
import { matchGerard } from "./match-gerard.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const P = (...a) => path.join(ROOT, ...a);
const CACHE_FILE = P("data/raw/enrich-cache.json");
const commons = fs.existsSync(P("data/raw/commons-cache.json")) ? JSON.parse(fs.readFileSync(P("data/raw/commons-cache.json"), "utf8")) : {};
const cache = fs.existsSync(CACHE_FILE) ? JSON.parse(fs.readFileSync(CACHE_FILE, "utf8")) : {};
const saveCache = () => fs.writeFileSync(CACHE_FILE, JSON.stringify(cache));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = { "User-Agent": "NatureLibrary/0.1 (educational; https://nature-library.vercel.app)" };

async function getJSON(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: UA });
      if (r.status === 429 || r.status >= 500) {
        await sleep(3000 * (i + 1));
        continue;
      }
      if (!r.ok) return null;
      return await r.json();
    } catch {
      await sleep(2000);
    }
  }
  return null;
}

const slugify = (s) =>
  s
    .normalize("NFKD")
    .replace(/[×]/g, "x")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

// ---------- 1. merge ----------
const files = fs.readdirSync(P("data/codex")).filter((f) => f.endsWith(".json"));
const byName = new Map();
for (const f of files) {
  let arr;
  try {
    arr = JSON.parse(fs.readFileSync(P("data/codex", f), "utf8"));
  } catch (e) {
    console.error("BAD JSON", f, e.message);
    continue;
  }
  for (const e of arr) {
    if (!e?.scientific || !e?.common) continue;
    const k = e.scientific.trim();
    if (byName.has(k)) {
      const prev = byName.get(k);
      prev.shelves = [...new Set([...(prev.shelves || []), ...(e.shelves || [])])];
      continue;
    }
    byName.set(k, { ...e, scientific: k, slug: slugify(k), shelves: [...new Set(e.shelves || [])], _file: f });
  }
}
let entries = [...byName.values()];
console.log(`merged ${entries.length} entries from ${files.length} files`);

// shelf hygiene
for (const e of entries) {
  const s = new Set(e.shelves);
  if (["VU", "EN", "CR", "EW"].includes(e.iucn)) s.add("endangered");
  if (e.edibility === "deadly") {
    s.add("deadly");
    s.add("toxic");
  }
  if (e.edibility === "toxic") s.add("toxic");
  // fungi that are edible once cooked don't belong in the Poison Garden
  if (e.kingdom === "Fungi" && ["edible", "edible-with-care"].includes(e.edibility)) s.delete("toxic");
  // plants that are fine once prepared stay out of the Poison Garden unless the note describes a fatal risk
  if (e.edibility === "edible-with-care" && !/fatal|death|kill|lethal|deadly/i.test(e.edibilityNote || "")) s.delete("toxic");
  if (e.edibility === "edible") s.delete("toxic");
  if (e.form === "Tree") s.add("tree");
  if (e.fruit && e.shelves.includes("edible") && e.kingdom === "Plantae" && /edible|eaten|sweet|juic|flesh/i.test(e.fruit.description || "")) s.add("fruit");
  e.shelves = [...s];
}

// ---------- 2. enrich ----------
async function enrich(e) {
  const c = (cache[e.scientific] ??= {});
  if (!c.inat) {
    const q = await getJSON(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(e.scientific)}&per_page=10&is_active=true&locale=en`);
    await sleep(900);
    const res = q?.results || [];
    const lc = e.scientific.toLowerCase();
    const hit = res.find((t) => t.name.toLowerCase() === lc) || res.find((t) => t.rank === "species" || t.rank === "hybrid") || res[0];
    if (hit) {
      const full = await getJSON(`https://api.inaturalist.org/v1/taxa/${hit.id}?locale=en`);
      await sleep(900);
      const t = full?.results?.[0] || hit;
      c.inat = {
        id: t.id,
        name: t.name,
        obs: t.observations_count,
        wiki: t.wikipedia_url,
        // only openly licensed photographs (license_code null = all rights reserved)
        photos: (t.taxon_photos?.map((p) => p.photo) || (t.default_photo ? [t.default_photo] : [])).filter((p) => p.license_code).slice(0, 8).map((p) => ({
          url: (p.url || p.medium_url).replace(/\/(square|small|medium|thumb)\./, "/large."),
          medium: (p.url || p.medium_url).replace(/\/(square|small|large|thumb)\./, "/medium."),
          square: p.square_url || (p.url || "").replace(/\/(small|medium|large|thumb)\./, "/square."),
          attribution: p.attribution,
          license: p.license_code,
          source: "iNaturalist",
        })),
        ancestors: (t.ancestors || [])
          .filter((a) => a.rank !== "stateofmatter")
          .map((a) => ({ id: a.id, name: a.name, rank: a.rank, common: a.preferred_common_name })),
      };
    } else c.inat = { missing: true };
    saveCache();
  }
  if (c.gbif === undefined) {
    const g = await getJSON(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(e.scientific)}${e.kingdom ? `&kingdom=${e.kingdom}` : ""}`);
    c.gbif = g?.usageKey && g.matchType !== "NONE" ? (g.acceptedUsageKey ?? g.usageKey) : null;
    saveCache();
  }
  if (c.wiki === undefined) {
    const title = c.inat?.wiki?.split("/wiki/")[1] || encodeURIComponent(e.scientific.replace(/ /g, "_"));
    const w = await getJSON(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
    c.wiki = w?.extract ? { url: w.content_urls?.desktop?.page, extract: w.extract, image: w.originalimage?.source } : null;
    saveCache();
  }
  const out = { ...e };
  delete out._file;
  if (c.inat && !c.inat.missing) {
    out.inatId = c.inat.id;
    out.observations = c.inat.obs;
    out.photos = c.inat.photos.filter((p) => p.license);
    out.ancestors = c.inat.ancestors;
  }
  if (!out.photos?.length && c.wiki?.image) out.photos = [{ url: c.wiki.image, attribution: "Wikimedia Commons", source: "Wikimedia" }];
  if (c.gbif) out.gbifKey = c.gbif;
  // a Commons photo must name this species (binomial or full common name), and not be pollen, an unidentified seed, etc.
  const BAD = /pollen|unidentified|civet|scat|seedling|herbarium|section \(|diagram|EB1911/i;
  const bin = e.scientific.toLowerCase().replace(/ × | x /g, " ").split(" ").slice(0, 2).join(" ");
  const common = e.common.toLowerCase().replace(/\(.*?\)/g, "").trim();
  const names = (t) => {
    const l = t.toLowerCase().replace(/[_-]/g, " ").replace(/ × | x /g, " ");
    return l.includes(bin) || (common.length > 4 && l.includes(common)) || (common.split(" ").at(-1).length > 5 && !/palm|plant|tree|pepper|bean/.test(common.split(" ").at(-1)) && l.includes(common.split(" ").at(-1)));
  };
  const ok = (ph) => !BAD.test(ph.title) && names(ph.title);
  const seeds = (commons[e.scientific]?.seeds || []).filter(ok);
  const fruit = (commons[e.scientific]?.fruit || []).filter(ok);
  if (seeds.length) out.seedPhotos = seeds;
  if (fruit.length) out.fruitPhotos = fruit;
  if (c.wiki) out.wiki = { url: c.wiki.url, extract: c.wiki.extract };
  return out;
}

const todo = entries.filter((e) => !cache[e.scientific]?.inat || cache[e.scientific]?.wiki === undefined).length;
console.log(`enriching (${todo} not yet cached)…`);
const enriched = [];
for (const [i, e] of entries.entries()) {
  enriched.push(await enrich(e));
  if ((i + 1) % 25 === 0) console.log(`  ${i + 1}/${entries.length}`);
}

// ---------- 3. plates ----------
const raw = fs.existsSync(P("data/raw/sl-gallery.json")) ? JSON.parse(fs.readFileSync(P("data/raw/sl-gallery.json"), "utf8")).items : {};
const SKIP_TYPES = new Set(["portrait", "map", "frontispiece", "decorative", "exlibris", "typography", "musical_score", "diagram", "symbol"]);
const NOT_LIFE = /\b(title page|portrait|coat of arms|map of|printer'?s (mark|device)|device of|initial letter|mineral|crystal|fossil shell|instrument|apparatus|furnace|alchemical|anatomical diagram|skeleton of a man)\b/i;
function catOf(it) {
  const s = (it.s || []).join(" ") + " " + it.subj + " " + it.d;
  if (/mycolog|fung|mushroom|toadstool|lichen/i.test(s)) return "fungi";
  if (/ornitholog|\bbird|feather|\bowl\b|eagle|parrot|duck|heron|falcon/i.test(s)) return "birds";
  if (/ichthyolog|\bfish|shark|\beel\b|whale|crab|lobster|shell|mollus|octopus/i.test(s)) return "fish";
  if (/botan|medicinal|herbal|plant|flower|tree|leaf|leaves|fruit|root|seed|vine|grass|fern|moss/i.test(s)) return "plants";
  if (/zoolog|animal|insect|beetle|butterfl|moth|serpent|snake|lizard|frog|beast|mammal|\bape\b|monkey|lion|elephant|deer|horse|dog|cat\b|bear|unicorn|dragon/i.test(s)) return "animals";
  return null;
}
const plates = [];
for (const it of Object.values(raw)) {
  if (!it.img || (it.q ?? 0) < 0.65 || SKIP_TYPES.has(it.ty) || NOT_LIFE.test(it.d || "")) continue;
  const cat = catOf(it);
  if (!cat) continue;
  plates.push({
    id: it.id,
    img: it.img,
    th: it.card || it.th || it.img,
    title: it.t,
    author: it.a || "Unknown",
    year: it.y ?? null,
    page: it.p,
    bookId: it.b,
    desc: (it.d || "").replace(/\s+/g, " ").trim(),
    long: (it.md || "").slice(0, 400),
    ar: it.ar ? Math.round(it.ar * 100) / 100 : undefined,
    cat,
    q: it.q,
  });
}
// order: best quality first, oldest first within ties, spread books
plates.sort((a, b) => b.q - a.q || (a.year ?? 9999) - (b.year ?? 9999));
const perBook = new Map();
const spread = [];
const rest = [];
for (const p of plates) {
  const n = perBook.get(p.bookId) || 0;
  perBook.set(p.bookId, n + 1);
  (n < 4 ? spread : rest).push(p);
}
const orderedPlates = [...spread, ...rest];
console.log(`plates: ${orderedPlates.length} usable of ${Object.keys(raw).length}`);

const GENERIC = new Set("plant flower tree palm grass fungus mushroom fern bird fish beetle moth butterfly snake lizard turtle tortoise frog shark whale dolphin monkey bear deer eagle owl parrot pepper nut berry apple bean pine oak cedar common giant great lesser greater wild sweet black white red yellow blue green golden".split(" "));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wordRe = (s) => new RegExp(`(^|[^a-z])${esc(s.toLowerCase())}([^a-z]|$)`);
// the caption (desc) names what is drawn; the long museum text often mentions other plants in passing
const plateCaption = orderedPlates.map((p) => p.desc.toLowerCase());
const plateLong = orderedPlates.map((p) => (p.long || "").toLowerCase());

for (const e of enriched) {
  const isPlant = e.kingdom === "Plantae";
  const allowCat = isPlant ? ["plants"] : e.kingdom === "Fungi" ? ["fungi", "plants"] : ["birds", "fish", "animals"];
  const terms = [];
  terms.push([e.scientific, 5]);
  const [genus] = e.scientific.split(" ");
  for (const h of e.historicalNames || []) if (h && h.length > 3) terms.push([h, 3]);
  terms.push([e.common, 3]);
  for (const o of e.otherNames || []) {
    const n = o.replace(/\(.*?\)/g, "").trim();
    if (n.length > 4 && /^[a-z\s'-]+$/i.test(n)) terms.push([n, 2]);
  }
  const words = e.common.split(/\s+/);
  const last = words.at(-1);
  if (words.length > 1 && last.length >= 5 && !GENERIC.has(last.toLowerCase())) terms.push([last, 1]);
  if (genus.length >= 5 && !["Prunus", "Citrus", "Allium"].includes(genus)) terms.push([genus, 1]);
  const res = terms.map(([t, w]) => [wordRe(t), w]);
  const scored = [];
  for (let i = 0; i < orderedPlates.length; i++) {
    const p = orderedPlates[i];
    if (!allowCat.includes(p.cat)) continue;
    let s = 0;
    for (const [re, w] of res) {
      if (re.test(plateCaption[i])) s = Math.max(s, w);
      else if (re.test(plateLong[i])) s = Math.max(s, w - 2); // mentioned only in the long description: weaker evidence
    }
    if (s) scored.push([s, p]);
  }
  scored.sort((a, b) => b[0] - a[0] || b[1].q - a[1].q);
  const best = scored[0]?.[0] ?? 0;
  const pick = [];
  const books = new Map();
  for (const [s, p] of scored) {
    if (s < Math.min(3, best)) break;
    const n = books.get(p.bookId) || 0;
    if (n >= 2) continue;
    books.set(p.bookId, n + 1);
    pick.push({ ...p, m: s >= 3 ? "named" : "relative" });
    if (pick.length >= 10) break;
  }
  e.plates = pick.map(({ q, ...p }) => p);
}

// ---------- Gerard's Herball (1597) ----------
const GERARD_BOOK = "6957ebcc57a4c14a9879ab9c";
const chFile = P("data/raw/gerard/chapters.json");
const gChapters = fs.existsSync(chFile) ? JSON.parse(fs.readFileSync(chFile, "utf8")) : [];
// stable ids from Gerard's own book and chapter numbers, so links survive re-parsing as more pages are transcribed
const BOOKNUM = { FIRST: 1, SECOND: 2, THIRD: 3 };
const gSlug = (c) => `${BOOKNUM[c.book] ?? 0}-${c.chap}-${slugify(c.title.replace(/^Of\s+(the\s+)?/i, "")).slice(0, 40)}`;
const seenIds = new Set();
gChapters.forEach((c) => {
  let id = gSlug(c);
  while (seenIds.has(id)) id += "-b";
  seenIds.add(id);
  c.id = id;
});
const concord = fs.existsSync(P("data/gerard-concordance.json")) ? JSON.parse(fs.readFileSync(P("data/gerard-concordance.json"), "utf8")) : {};
const auto = matchGerard(enriched);
const suggestions = [];
const trimTo = (t = "", n = 900) => (t.length <= n ? t : t.slice(0, t.lastIndexOf(".", n) > n * 0.5 ? t.lastIndexOf(".", n) + 1 : n) + (t.lastIndexOf(".", n) > n * 0.5 ? "" : "…"));
for (const e of enriched) {
  const title = concord[e.scientific];
  // hand-checked concordance only: automatic name matching linked Gerard's "Ginnie Pepper" (chilli) to black pepper, so it is used for review, not publishing
  const c = title ? gChapters.find((x) => x.title.toLowerCase() === title.toLowerCase()) : null;
  if (!c && auto.get(e.scientific)?.s >= 5) suggestions.push(`${e.scientific} ?→ ${auto.get(e.scientific).c.title}`);
  if (!c) continue;
  const chap = gChapters.find((x) => x.page === c.page && x.title === c.title);
  chap.codex = e.slug;
  e.gerard = {
    id: chap.id,
    title: c.title,
    chap: c.chap,
    book: c.book,
    page: c.page,
    printed: c.printed,
    names: trimTo(c.sections.names, 500),
    place: trimTo(c.sections.place, 400),
    time: trimTo(c.sections.time, 250),
    temperature: trimTo(c.sections.temperature, 300),
    vertues: trimTo(c.sections.vertues, 1100),
  };
}
fs.writeFileSync(P("data/gerard.json"), JSON.stringify(gChapters.filter((c) => c.sections.description || c.sections.vertues).map((c) => ({ ...c, bookId: GERARD_BOOK }))));
console.log(`gerard: ${gChapters.length} chapters, ${enriched.filter((e) => e.gerard).length} linked to the codex`);
if (suggestions.length) console.log("unreviewed Gerard matches (add to data/gerard-concordance.json if right):\n  " + suggestions.join("\n  "));

// ---------- accession numbers ----------
const KORDER = { Plantae: 0, Fungi: 1, Protista: 2, Chromista: 2, Animalia: 3 };
enriched.sort((a, b) => (KORDER[a.kingdom] ?? 4) - (KORDER[b.kingdom] ?? 4) || (a.family || "").localeCompare(b.family || "") || a.scientific.localeCompare(b.scientific));
enriched.forEach((e, i) => (e.nl = `NL·${String(i + 1).padStart(4, "0")}`));

fs.writeFileSync(P("data/codex.built.json"), JSON.stringify(enriched));

// ---------- Spanish overlays (data/codex-es/*.json, keyed by scientific name) → data/codex.es.json keyed by slug ----------
{
  const dir = P("data/codex-es");
  const bySci = new Map();
  if (fs.existsSync(dir))
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json"))) {
      try {
        for (const o of JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))) if (o?.scientific) bySci.set(o.scientific.trim(), o);
      } catch (e) {
        console.error("bad es file", f, e.message);
      }
    }
  const es = {};
  for (const e of enriched) {
    const o = bySci.get(e.scientific);
    if (!o) continue;
    const { scientific, ...rest } = o;
    es[e.slug] = rest;
  }
  fs.writeFileSync(P("data/codex.es.json"), JSON.stringify(es));
  console.log(`spanish: ${Object.keys(es).length}/${enriched.length} entries translated`);
}
// plates.json is compact: a book table plus one row per plate; src/lib/plates.ts expands it
{
  const G = "https://images.sourcelibrary.org/gallery/";
  const books = {};
  const rows = [];
  for (const p of orderedPlates) {
    books[p.bookId] ??= [p.title, p.author, p.year];
    const v = (u) => u?.match(/[?&]v=(\d+)/)?.[1] ?? "";
    const thKind = p.th === p.img ? "" : p.th?.includes("-card.") ? "card" : p.th?.includes("-thumb.") ? "thumb" : "";
    if (!p.img.startsWith(G)) continue;
    rows.push([p.id, p.bookId, p.page, p.desc.slice(0, 220), p.ar ?? 0, p.cat, v(p.img), thKind, v(p.th)]);
  }
  fs.writeFileSync(P("data/plates.json"), JSON.stringify({ books, rows }));
}
const withPlates = enriched.filter((e) => e.plates?.length).length;
const noInat = enriched.filter((e) => !e.inatId).map((e) => e.scientific);
console.log(`codex: ${enriched.length} entries · ${withPlates} with historical plates · ${enriched.filter((e) => e.photos?.length).length} with photos`);
if (noInat.length) console.log("no iNat match:", noInat.join(", "));
