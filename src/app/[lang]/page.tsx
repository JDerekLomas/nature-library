import Link from "next/link";
import { CODEX, GERARD, gerardPage, codexIn } from "@/lib/codex";
import { asLang, lp, LOCALE, type Lang } from "@/i18n/config";
import { dict } from "@/i18n/dict";
import { PLATES } from "@/lib/plates";
import { shelvesFor } from "@/lib/shelves";
import { exhibitionsFor } from "@/lib/exhibitions";
import HomeGlobe from "@/components/HomeGlobe";
import SearchBox from "@/components/SearchBox";
import SpecimenCard from "@/components/SpecimenCard";
import { toCard } from "@/lib/cards";
import LibraryPlan, { type Room } from "@/components/LibraryPlan";
import { libraryStats } from "@/lib/stats";
import { gbifTaxonQuiet } from "@/lib/gbif";

export const revalidate = 86400;

async function counts() {
  const safe = async (url: string, pick: (j: unknown) => number) => {
    try {
      const r = await fetch(url, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(5000) });
      return pick(await r.json());
    } catch {
      return null;
    }
  };
  const [occ, species, obs] = await Promise.all([
    safe("https://api.gbif.org/v1/occurrence/count", (j) => j as number),
    safe("https://api.gbif.org/v1/species/search?rank=SPECIES&status=ACCEPTED&datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c&limit=0", (j) => (j as { count: number }).count),
    safe("https://api.inaturalist.org/v1/observations?per_page=0&verifiable=true", (j) => (j as { total_results: number }).total_results),
  ]);
  return { occ, species, obs };
}

const big = (n: number | null, unit: "B" | "M", words: { million: string; billion: string }, locale = "en-GB") =>
  n == null ? "—" : unit === "B" ? `${(n / 1e9).toLocaleString(locale, { maximumFractionDigits: 2 })} ${words.billion}` : `${(n / 1e6).toLocaleString(locale, { maximumFractionDigits: 2 })} ${words.million}`;

function specimenOfTheDay() {
  const withPlates = CODEX.filter((e) => e.photos?.length && e.plates?.[0]?.m === "named");
  const pool = withPlates.length ? withPlates : CODEX;
  const day = Math.floor(Date.now() / 86400000);
  return pool[day % Math.max(1, pool.length)];
}

const KINGDOMS: [number, string][] = [
  [1, "Animals"],
  [6, "Plants"],
  [5, "Fungi"],
  [4, "Chromists"],
  [3, "Bacteria"],
  [8, "Viruses"],
  [7, "Protozoa"],
  [2, "Archaea"],
];

const BESTIARY: [string, string, string][] = [
  ["Mammalia", "Mammals", "/bestiary#Mammalia"],
  ["Actinopterygii", "Fishes", "/bestiary#Actinopterygii"],
  ["Reptilia", "Reptiles", "/bestiary#Reptilia"],
  ["Amphibia", "Amphibians", "/bestiary#Amphibia"],
  ["Insecta", "Insects", "/bestiary#Insecta"],
  ["Arachnida", "Spiders & kin", "/bestiary#Arachnida"],
  ["Mollusca", "Molluscs", "/bestiary#Mollusca"],
  ["Elasmobranchii", "Sharks & rays", "/bestiary#Elasmobranchii"],
];

// the Herbarium's tiles on the entrance: growth form → its section on the Herbarium page
const HERBARIUM: [string, string][] = [
  ["Tree", "tree"], ["Herb", "herb"], ["Shrub", "shrub"], ["Vine", "vine"], ["Grass", "grass"], ["Mushroom", "mushroom"], ["Bracket fungus", "bracket"], ["Lichen", "lichen"],
];


export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const T = dict(lang);
  const t = T.home;
  const L = (p: string) => lp(lang, p);
  const CX = codexIn(lang);
  const SHELVES = shelvesFor(lang);
  const EXHIBITIONS = exhibitionsFor(lang);
  const onShelf = (id: string) => CX.filter((e) => e.shelves?.includes(id));
  const c = await counts();
  const shown = new Set<string>();
  const st = libraryStats();
  const kingdoms = await Promise.all(KINGDOMS.map(([k]) => gbifTaxonQuiet(k)));
  const kingdomTotal = kingdoms.reduce((n, k) => n + (k?.numDescendants ?? 0), 0);
  const ph = (e?: (typeof CODEX)[number]) => e?.photos?.[0]?.medium ?? e?.photos?.[0]?.url;
  const birds = CX.filter((e) => e.form === "Bird").sort((a, b) => (b.observations ?? 0) - (a.observations ?? 0));
  const showcaseBirds = [...birds.slice(0, 3), ...birds.filter((b) => b.shelves.includes("endangered")).slice(0, 3)];
  const classOf = (name: string) => CX.filter((e) => e.ancestors?.some((a) => a.name === name)).sort((a, b) => (b.observations ?? 0) - (a.observations ?? 0));
  const bestiary = BESTIARY.map(([taxon, , href]) => ({ taxon, label: t.bestiaryClasses[taxon] ?? taxon, href: L(href), list: classOf(taxon) })).filter((x) => x.list.length);
  const shelfFace = (id: string) => onShelf(id).filter((e) => e.photos?.length).sort((a, b) => (b.observations ?? 0) - (a.observations ?? 0)).slice(0, 4).map((e) => ph(e)!);
  const green = HERBARIUM.map(([form, id]) => ({ form, id, list: CX.filter((e) => e.form === form && (e.kingdom === "Plantae" || e.kingdom === "Fungi")).sort((a, b) => (b.observations ?? 0) - (a.observations ?? 0)) })).filter((g) => g.list.length);
  const IMG: Record<string, string[]> = {
    aviary: birds.slice(0, 4).map((e) => ph(e)!),
    bestiary: bestiary.slice(0, 4).map((x) => ph(x.list[0])!).filter(Boolean),
    herbarium: green.slice(0, 4).map((g) => ph(g.list[0])!).filter(Boolean),
    herball: GERARD.filter((g) => g.codex).slice(0, 4).map((g) => gerardPage(g.page).replace(".jpg", "-thumb.jpg")),
    plates: PLATES.slice(0, 4).map((p) => p.th),
    identify: shelfFace("toxic").slice(0, 2).concat(birds.slice(4, 6).map((e) => ph(e)!)),
    grow: shelfFace("fruit"),
    catalogue: shelfFace("marvel"),
    wheel: shelfFace("ancient"),
    shelves: shelfFace("medicinal"),
    exhibitions: shelfFace("spice"),
  };
  const COUNT: Record<string, number> = {
    aviary: st.birds, bestiary: st.animals, herbarium: st.plants + st.fungi, herball: st.gerard, plates: Math.round(PLATES.length / 1000), identify: Math.round(st.identify / 1000), grow: 0,
    catalogue: Number((kingdomTotal / 1e6).toFixed(1)), wheel: 0, shelves: st.shelves, exhibitions: st.exhibitions,
  };
  // walking order: the living collections, what they do for us, how to find your way, the old books, and the exhibitions by the door
  const ROOM_HREF: Record<string, string> = {
    bestiary: "/bestiary", aviary: "/aviary", herbarium: "/herbarium", shelves: "/shelves", grow: "/grow", identify: "/identify",
    wheel: "/wheel", catalogue: "/catalogue", plates: "/plates", herball: "/herball", exhibitions: "/exhibitions",
  };
  const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  const rooms: Room[] = Object.keys(ROOM_HREF).map((k, i) => {
    const [name, count, blurb] = t.rooms[k];
    return { href: L(ROOM_HREF[k]), numeral: NUMERALS[i], name, count: count(COUNT[k]), blurb, images: IMG[k] };
  });

  const nf = (n: number) => n.toLocaleString(LOCALE[lang]);
  const sotdRaw = specimenOfTheDay();
  const sotd = sotdRaw ? CX.find((e) => e.slug === sotdRaw.slug) ?? sotdRaw : sotdRaw;
  const plates = PLATES.filter((p) => p.cat === "plants").slice(0, 3).concat(PLATES.filter((p) => p.cat === "birds").slice(0, 2), PLATES.filter((p) => p.cat === "fungi").slice(0, 1), PLATES.filter((p) => p.cat === "animals").slice(0, 2));

  return (
    <div>
      {/* ——— Frontispiece ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10 lg:pt-14 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)] gap-8 lg:gap-12 items-center">
        <div className="fade-up">
          <h1 className="font-display text-[clamp(3.4rem,8.4vw,7.4rem)] leading-[0.86] tracking-[-0.02em] mt-5">
            {t.titleLines[0]}
            <br />
            {t.titleLines[1]}
          </h1>
          <p className="latin text-2xl text-moss mt-3">Liber Naturae</p>
          <p className="mt-7 text-[1.2rem] leading-[1.65] max-w-[50ch] text-ink-2">
            {t.intro}
          </p>
          <div className="mt-8 max-w-[560px]">
            <SearchBox big />
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-6 max-w-[620px] border-t border-ink pt-4">
            <div>
              <dt className="label text-ink-2">{t.speciesNamed}</dt>
              <dd className="font-display text-[1.7rem] leading-tight mt-1">{big(c.species, "M", t, LOCALE[lang])}</dd>
            </div>
            <div>
              <dt className="label text-ink-2">{t.recordsOnGlobe}</dt>
              <dd className="font-display text-[1.7rem] leading-tight mt-1">{big(c.occ, "B", t, LOCALE[lang])}</dd>
            </div>
            <div>
              <dt className="label text-ink-2">{t.fieldPhotos}</dt>
              <dd className="font-display text-[1.7rem] leading-tight mt-1">{big(c.obs, "M", t, LOCALE[lang])}</dd>
            </div>
          </dl>
        </div>
        <div className="relative">
          <HomeGlobe />
        </div>
      </section>

      {/* ——— The plan ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-20">
        <div className="flex items-baseline justify-between border-b-[3px] border-double border-ink pb-3 mb-8">
          <h2 className="font-display text-[2.2rem] leading-none">{t.planTitle}</h2>
          <span className="label text-ink-2 hidden sm:inline">{t.planSub}</span>
        </div>
        <LibraryPlan rooms={rooms} />
      </section>

      {/* ——— Room I: the Bestiary ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-24">
        <div className="flex items-baseline justify-between border-b-[3px] border-double border-ink pb-3">
          <h2 className="font-display text-[2.2rem] leading-none">
            {t.bestiaryTitle}
          </h2>
          <Link href={L("/bestiary")} className="label text-moss hover:text-rust">{t.animalsArrow(st.animals)}</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-rule border-x border-b rule">
          {bestiary.map((x) => (
            <Link key={x.taxon} href={x.href} className="group relative block aspect-[4/3] overflow-hidden bg-paper-3">
              {ph(x.list[0]) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ph(x.list[0])} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover saturate-[.85] group-hover:scale-105 group-hover:saturate-100 transition duration-700" />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-[#0d1310cc] via-transparent to-transparent" />
              <span className="absolute left-4 bottom-3 text-[#f4efe2]">
                <span className="block font-display text-2xl leading-none">{x.label}</span>
                <span className="block label !text-[0.58rem] mt-1 text-[#e7dfc6]">
                  {t.sheets(x.list.length)} · <i className="normal-case tracking-normal">{x.taxon}</i>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ——— Room II: the Aviary ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] gap-10 items-end">
          <div>
            <h2 className="font-display text-[clamp(2.4rem,4.5vw,3.6rem)] leading-[0.95] mt-1">{t.aviaryTitle}</h2>
            <p className="mt-4 text-ink-2 leading-relaxed">
              {t.aviaryText(st.birds)}
            </p>
            <Link href={L("/aviary")} className="inline-block mt-5 px-5 py-2.5 bg-ink text-paper font-display text-lg hover:bg-moss">
              {t.enterAviary}
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {showcaseBirds.map((b) => (
              <Link key={b.slug} href={L(`/species/${b.slug}`)} className="group block">
                <div className="aspect-[3/4] overflow-hidden bg-paper-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ph(b)} alt={b.common} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <p className="text-sm leading-tight mt-1.5 group-hover:text-moss">{b.common}</p>
                {b.shelves.includes("endangered") && <p className="label text-stamp !text-[0.55rem]">IUCN {b.iucn}</p>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Room III: the Herbarium ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-20">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-[3px] border-double border-ink pb-3">
          <h2 className="font-display text-[2.2rem] leading-none">
            {t.herbariumTitle}
          </h2>
          <Link href={L("/herbarium")} className="label text-moss hover:text-rust">{t.enterHerbarium} →</Link>
        </div>
        <p className="mt-4 text-ink-2 leading-relaxed max-w-[70ch]">{t.herbariumText(st.plants, st.fungi)}</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-rule border rule mt-5">
          {green.map((g) => (
            <Link key={g.id} href={L(`/herbarium#${g.id}`)} className="group relative block aspect-[4/3] overflow-hidden bg-paper-3">
              {ph(g.list[0]) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ph(g.list[0])} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover saturate-[.85] group-hover:scale-105 group-hover:saturate-100 transition duration-700" />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-[#0d1310cc] via-transparent to-transparent" />
              <span className="absolute left-4 bottom-3 text-[#f4efe2]">
                <span className="block font-display text-2xl leading-none">{t.herbariumGroups[g.form] ?? g.form}</span>
                <span className="block label !text-[0.58rem] mt-1 text-[#e7dfc6]">{t.sheets(g.list.length)}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ——— Card catalogue ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-24">
        <div className="flex items-baseline justify-between border-b-[3px] border-double border-ink pb-3">
          <h2 className="font-display text-[2.2rem] leading-none">{t.catalogueCard}</h2>
          <Link href={L("/shelves")} className="label text-moss hover:text-rust">{t.allShelves(SHELVES.length)}</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-rule border-x border-b rule">
          {SHELVES.slice(0, 8).map((s) => {
            const items = onShelf(s.id);
            // faces for the card: well-observed members not already shown on an earlier card
            const faces = [...items]
              .filter((e) => e.photos?.length && !shown.has(e.slug))
              .sort((a, b) => (b.observations ?? 0) - (a.observations ?? 0))
              .slice(0, 4);
            faces.forEach((e) => shown.add(e.slug));
            return (
              <Link key={s.id} href={L(`/shelves/${s.id}`)} className="group bg-paper p-5 flex flex-col min-h-[260px] hover:bg-card">
                <div className="flex justify-between items-start">
                  <span className="font-display text-3xl text-ochre">{s.numeral}</span>
                  <span className="font-mono text-xs text-ink-2">{t.vols(items.length)}</span>
                </div>
                <p className="font-display text-[1.6rem] leading-tight mt-3 group-hover:text-moss">{s.title}</p>
                <p className="text-sm text-ink-2 mt-2 leading-relaxed line-clamp-3">{s.blurb}</p>
                {faces.length > 0 && (
                  <div className="mt-auto pt-4 flex gap-1.5">
                    {faces.map((e) =>
                      e.photos?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={e.slug} src={e.photos[0].square || e.photos[0].url} alt="" loading="lazy" className="w-12 h-12 object-cover saturate-[.8] group-hover:saturate-100" />
                      ) : null
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ——— Rooms V & VI: the Garden and Identify ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-rule border rule">
        <Link href={L("/grow")} className="group bg-paper p-8 hover:bg-card">
          <p className="font-display text-4xl mt-1 group-hover:text-moss">{t.gardenTitle}</p>
          <p className="mt-3 text-ink-2 leading-relaxed max-w-[48ch]">
            {t.gardenText}
          </p>
          <p className="mt-5 label text-moss">{t.planGarden}</p>
        </Link>
        <Link href={L("/identify")} className="group bg-paper p-8 hover:bg-card">
          <p className="font-display text-4xl mt-1 group-hover:text-moss">{t.idTitle}</p>
          <p className="mt-3 text-ink-2 leading-relaxed max-w-[48ch]">
            {t.idText(nf(st.identify))}
          </p>
          <p className="mt-5 label text-moss">{t.bringPhoto}</p>
        </Link>
        </div>
      </section>

      {/* ——— Night: the Atlas ——— */}
      <section className="night mt-28">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-[clamp(2.4rem,5vw,4rem)] leading-[0.95] mt-3 text-[#f1ebd8]">{t.atlasTitle}</h2>
            <p className="mt-6 text-lg leading-relaxed text-[#c9c2a8] max-w-[54ch]">
              {t.atlasText}
            </p>
            <Link href={L("/atlas")} className="inline-block mt-8 px-6 py-3 bg-glow text-night font-display text-lg hover:bg-[#f3d98f]">
              {t.openAtlas}
            </Link>
          </div>
          <div className="max-w-[520px] w-full mx-auto">
            <HomeGlobe night />
          </div>
        </div>
      </section>

      {/* ——— Room VIII: Catalogue of All Life ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-12">
          <div>
            <h2 className="font-display text-[clamp(2.4rem,4.5vw,3.6rem)] leading-[0.95] mt-1">{t.catalogueTitle}</h2>
            <p className="mt-4 text-ink-2 leading-relaxed">
              {t.catalogueText((kingdomTotal / 1e6).toLocaleString(LOCALE[lang], { maximumFractionDigits: 1 }), st.countries)}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={L("/catalogue")} className="px-5 py-2.5 bg-ink text-paper font-display text-lg hover:bg-moss">
                {t.openCatalogue}
              </Link>
              <Link href={L("/catalogue/country/pk")} className="px-4 py-2.5 border border-ink hover:bg-paper-2">
                {t.lifeInPakistan}
              </Link>
              <Link href={L("/checklists")} className="px-4 py-2.5 border border-ink hover:bg-paper-2">
                {T.rooms.checklists.title}
              </Link>
              <Link href={L("/wheel")} className="px-4 py-2.5 border border-ink hover:bg-paper-2">
                {t.seeWheel}
              </Link>
            </div>
          </div>
          <ol className="self-center">
            {KINGDOMS.map(([k, label], i) => (
              <li key={k} className="border-b rule">
                <Link href={L(`/gbif/${k}?stay=1`)} className="group grid grid-cols-[2.2rem_1fr_auto] items-baseline gap-3 py-3">
                  <span className="font-mono text-xs text-ink-2">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-2xl group-hover:text-moss">
                    {t.kingdomNames[k] ?? label} <span className="latin text-base text-ink-2">{kingdoms[i]?.canonicalName}</span>
                  </span>
                  <span className="font-mono text-sm text-ink-2">{kingdoms[i]?.numDescendants ? nf(kingdoms[i]!.numDescendants!) : "—"} {t.names}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ——— Plate room ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-24">
        <div className="flex items-baseline justify-between border-b-[3px] border-double border-ink pb-3">
          <h2 className="font-display text-[2.2rem] leading-none">{t.plateRoom}</h2>
          <Link href={L("/plates")} className="label text-moss hover:text-rust">{t.platesArrow(nf(PLATES.length))}</Link>
        </div>
        <div className="scroll-x mt-6 -mx-4 px-4">
          <div className="flex gap-6 pb-4">
            {plates.map((p) => (
              <a key={p.id} href={`https://sourcelibrary.org/book/${p.bookId}?page=${p.page}`} target="_blank" rel="noreferrer" className="group shrink-0 w-[240px]">
                <div className="bg-[#efe6cf] p-3 border rule h-[300px] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.th || p.img} alt={p.desc} loading="lazy" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                </div>
                <p className="mt-2 text-sm leading-snug line-clamp-2">{p.desc}</p>
                <p className="label text-ink-2 !text-[0.58rem] mt-1">
                  {p.year ?? T.sheet.nd} · {p.author}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Gerard ——— */}
      {GERARD.length > 0 && (
        <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-12 items-center">
            <div>
              <h2 className="font-display text-[clamp(2.2rem,4vw,3.4rem)] leading-[0.98] mt-2">{t.herballTitle}</h2>
              <p className="mt-5 text-lg leading-relaxed text-ink-2 max-w-[54ch]">
                {t.herballText(GERARD.length)}
              </p>
              <Link href={L("/herball")} className="inline-block mt-6 label text-moss hover:text-rust">{t.enterHerball}</Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {GERARD.filter((c) => c.codex && c.sections.vertues).slice(0, 3).map((c) => (
                <Link key={c.id} href={L(`/herball/${c.id}`)} className="group block">
                  <div className="bg-[#efe6cf] p-2 border rule group-hover:border-ink">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={gerardPage(c.page)} alt="" loading="lazy" className="w-full aspect-[3/4] object-cover object-top mix-blend-multiply" />
                  </div>
                  <p className="font-display text-lg mt-2 leading-tight group-hover:text-moss">{c.title}</p>
                  <p className="label text-ink-2 !text-[0.56rem]">{t.chap} {c.chap}{c.printed ? ` · p. ${c.printed}` : ""}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ——— Exhibitions ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-24">
        <div className="flex items-baseline justify-between border-b-[3px] border-double border-ink pb-3">
          <h2 className="font-display text-[2.2rem] leading-none">{t.exhibitions}</h2>
          <Link href={L("/exhibitions")} className="label text-moss hover:text-rust">{t.allExhibitions}</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10">
          {EXHIBITIONS.slice(0, 3).map((x) => {
            const m = CX.filter((e) => x.members.includes(e.scientific));
            return (
              <Link key={x.slug} href={L(`/exhibitions/${x.slug}`)} className="group block py-6 border-b rule">
                <div className="grid grid-cols-3 gap-1 h-32">
                  {m.slice(0, 3).map((e) => (
                    <div key={e.slug} className="bg-paper-3 overflow-hidden">
                      {e.photos?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={e.photos[0].square || e.photos[0].url} alt="" loading="lazy" className="w-full h-full object-cover saturate-[.75] group-hover:saturate-100" />
                      )}
                    </div>
                  ))}
                </div>
                <p className="font-display text-2xl mt-4 group-hover:text-moss">{x.title}</p>
                <p className="text-ink-2 mt-1">{x.dek}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ——— Specimen of the day ——— */}
      {sotd && (
        <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-24">
          <p className="label text-ink-2">{t.sotd} · {sotd.nl}</p>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.8fr)] gap-10 mt-4 items-center">
            <Link href={L(`/species/${sotd.slug}`)} className="mount block">
              {sotd.photos?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={sotd.photos[0].url} alt={sotd.common} className="w-full aspect-[5/4] object-cover" />
              )}
            </Link>
            <div>
              <h2 className="font-display text-[clamp(2.4rem,4.5vw,3.8rem)] leading-[0.95]">{sotd.common}</h2>
              <p className="latin text-xl text-moss mt-2">{sotd.scientific}</p>
              <p className="mt-6 text-lg leading-relaxed">{sotd.summary}</p>
              {sotd.abilities?.[0] && (
                <p className="mt-5 text-ink-2 border-l-2 border-ochre pl-4 leading-relaxed">
                  <span className="label mr-2">{t.itCan}</span>
                  {sotd.abilities[0]}
                </p>
              )}
              <Link href={L(`/species/${sotd.slug}`)} className="inline-block mt-6 label text-moss hover:text-rust">
                {t.readSheet}
              </Link>
            </div>
            {sotd.plates?.[0] && (
              <figure>
                <div className="bg-[#efe6cf] p-4 border rule">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sotd.plates[0].img} alt="" className="w-full max-h-[420px] object-contain mix-blend-multiply" />
                </div>
                <figcaption className="text-xs text-ink-2 mt-2 leading-snug">
                  {t.asDrawnIn} <i>{sotd.plates[0].title}</i>
                  {sotd.plates[0].author !== "Unknown" ? `, ${sotd.plates[0].author}` : ""}, {sotd.plates[0].year}
                </figcaption>
              </figure>
            )}
          </div>
        </section>
      )}

      {/* ——— Recently catalogued ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-24">
        <div className="flex items-baseline justify-between border-b-[3px] border-double border-ink pb-3">
          <h2 className="font-display text-[2.2rem] leading-none">{t.fromCodex}</h2>
          <span className="label text-ink-2">{t.codexCount(CODEX.length)}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-5 gap-y-8 mt-6">
          {pickVaried(CX, 12).map((e) => (
            <SpecimenCard key={e.slug} e={toCard(e)} />
          ))}
        </div>
      </section>

      {/* ——— Why ——— */}
      <section className="mx-auto max-w-[1000px] px-4 sm:px-6 mt-28 text-center">
        <p className="label text-ink-2">{t.whyKicker}</p>
        <p className="font-display text-[clamp(1.8rem,3.6vw,2.8rem)] leading-[1.2] mt-6">
          {t.why}
        </p>
        <p className="mt-6 text-ink-2">
          {t.why2}
        </p>
      </section>
    </div>
  );
}

function pickVaried<T extends { kingdom: string; photos?: unknown[] }>(list: T[], n: number) {
  const day = Math.floor(Date.now() / 86400000);
  const withPhoto = list.filter((e) => e.photos?.length);
  const out: T[] = [];
  for (let i = 0; out.length < n && i < withPhoto.length; i++) out.push(withPhoto[(day * 7 + i * 29) % withPhoto.length]);
  return [...new Set(out)];
}
