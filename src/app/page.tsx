import Link from "next/link";
import { CODEX, GERARD, onShelf, gerardPage } from "@/lib/codex";
import { PLATES } from "@/lib/plates";
import { SHELVES } from "@/lib/shelves";
import { EXHIBITIONS } from "@/lib/exhibitions";
import HomeGlobe from "@/components/HomeGlobe";
import SearchBox from "@/components/SearchBox";
import SpecimenCard from "@/components/SpecimenCard";
import LibraryPlan, { type Room } from "@/components/LibraryPlan";
import { libraryStats } from "@/lib/stats";
import { gbifTaxon } from "@/lib/gbif";
import { correctionLogs, makeResolver } from "@/lib/corrections";

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

const big = (n: number | null, unit: "B" | "M") =>
  n == null ? "—" : unit === "B" ? `${(n / 1e9).toFixed(2)} billion` : `${(n / 1e6).toFixed(2)} million`;

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

const fmtBig = (n: number) => (n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e4 ? `${Math.round(n / 1000)},000` : n.toLocaleString());
const LEDGER = (st: ReturnType<typeof libraryStats>, names: number, plates: number): [string, string, string][] => [
  [fmtBig(names), "names in the Catalogue of All Life", "/catalogue"],
  [String(st.codex), "hand-written specimen sheets", "/shelves"],
  [String(st.birds), "birds with field-guide sheets", "/aviary"],
  [fmtBig(st.identify), "species the desk can recognise", "/identify"],
  [fmtBig(plates), "historical plates", "/plates"],
  [String(st.gerard), "chapters of Gerard, 1597", "/herball"],
  [String(st.countries), "countries, every species listed", "/catalogue"],
  [String(st.corrections), "corrections, published", "/about/corrections"],
];


export default async function Home() {
  const c = await counts();
  const shown = new Set<string>();
  const st = libraryStats();
  const kingdoms = await Promise.all(KINGDOMS.map(([k]) => gbifTaxon(k)));
  const kingdomTotal = kingdoms.reduce((n, k) => n + (k?.numDescendants ?? 0), 0);
  const ph = (e?: (typeof CODEX)[number]) => e?.photos?.[0]?.medium ?? e?.photos?.[0]?.url;
  const birds = CODEX.filter((e) => e.form === "Bird").sort((a, b) => (b.observations ?? 0) - (a.observations ?? 0));
  const showcaseBirds = [...birds.slice(0, 3), ...birds.filter((b) => b.shelves.includes("endangered")).slice(0, 3)];
  const classOf = (name: string) => CODEX.filter((e) => e.ancestors?.some((a) => a.name === name)).sort((a, b) => (b.observations ?? 0) - (a.observations ?? 0));
  const bestiary = BESTIARY.map(([taxon, label, href]) => ({ taxon, label, href, list: classOf(taxon) })).filter((x) => x.list.length);
  const shelfFace = (id: string) => onShelf(id).filter((e) => e.photos?.length).sort((a, b) => (b.observations ?? 0) - (a.observations ?? 0)).slice(0, 4).map((e) => ph(e)!);
  const rooms: Room[] = [
    { href: "/aviary", numeral: "I", name: "Aviary", count: `${st.birds} birds`, blurb: "The birding room: field marks, songs written out and recorded, look-alikes, where and when to look, and what is singing near you this month.", images: birds.slice(0, 4).map((e) => ph(e)!) },
    { href: "/bestiary", numeral: "II", name: "Bestiary", count: `${st.animals} animals`, blurb: "Mammals, fishes, reptiles, amphibians, insects, spiders, molluscs and the rest, each with a field-guide sheet.", images: bestiary.slice(0, 4).map((x) => ph(x.list[0])!).filter(Boolean) },
    { href: "/herball", numeral: "III", name: "Herball", count: `${st.gerard} chapters`, blurb: "John Gerard's Herball of 1597, chapter by chapter in his own spelling, beside the page it was printed on.", images: GERARD.filter((g) => g.codex).slice(0, 4).map((g) => gerardPage(g.page).replace(".jpg", "-thumb.jpg")) },
    { href: "/plates", numeral: "IV", name: "Plates", count: `${(PLATES.length / 1000).toFixed(0)},000 plates`, blurb: "Five centuries of woodcuts and engravings from herbals, bestiaries and natural histories, via the Source Library.", images: PLATES.slice(0, 4).map((p) => p.th) },
    { href: "/identify", numeral: "V", name: "Identify", count: `${(st.identify / 1000).toFixed(0)},000 species`, blurb: "Photograph a plant, animal or fungus. A tree-of-life vision model runs in your own browser and suggests what it is.", images: shelfFace("toxic").slice(0, 2).concat(birds.slice(4, 6).map((e) => ph(e)!)) },
    { href: "/grow", numeral: "VI", name: "Garden", count: "your climate", blurb: "Ten years of your local weather turned into a hardiness zone, and every codex plant you can grow there.", images: shelfFace("fruit") },
    { href: "/catalogue", numeral: "VII", name: "Catalogue", count: `${(kingdomTotal / 1e6).toFixed(1)}M names`, blurb: "Every catalogued species on Earth, from the kingdoms down, and every species recorded in each of 249 countries.", images: shelfFace("marvel") },
    { href: "/wheel", numeral: "VIII", name: "Wheel", count: "the tree of life", blurb: "All of life drawn as a wheel. Click a branch to step inside it, down to a single species.", images: shelfFace("ancient") },
    { href: "/shelves", numeral: "IX", name: "Shelves", count: `${st.shelves} shelves`, blurb: "The codex by use: the medicine cabinet, orchard, granary, poison garden, nectary, venom cabinet and more.", images: shelfFace("medicinal") },
    { href: "/exhibitions", numeral: "X", name: "Exhibitions", count: `${st.exhibitions} exhibitions`, blurb: "Small selections with an argument: the herbalists who were right, the Columbian Exchange, the spice routes, the poison garden.", images: shelfFace("spice") },
    { href: "/about/corrections", numeral: "XI", name: "Corrections", count: `${st.corrections} errata`, blurb: "Every statement changed when the codex was fact-checked, with what it said, what it says now, and the source.", images: [] },
  ];
  const corr = correctionLogs().flatMap((l) => l.changes).filter((x) => x.was && x.now && x.was.length < 140 && x.now.length < 160);
  const resolve = makeResolver(CODEX);
  const sampleCorr = [corr[3], corr[Math.floor(corr.length / 2)], corr[corr.length - 8]].filter(Boolean);
  const sotd = specimenOfTheDay();
  const plates = PLATES.filter((p) => p.cat === "plants").slice(0, 3).concat(PLATES.filter((p) => p.cat === "birds").slice(0, 2), PLATES.filter((p) => p.cat === "fungi").slice(0, 1), PLATES.filter((p) => p.cat === "animals").slice(0, 2));

  return (
    <div>
      {/* ——— Frontispiece ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10 lg:pt-14 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,600px)] gap-8 lg:gap-12 items-center">
        <div className="fade-up">
          <p className="label text-ink-2">A library of living things · sister to the Source Library</p>
          <h1 className="font-display text-[clamp(3.4rem,8.4vw,7.4rem)] leading-[0.86] tracking-[-0.02em] mt-5">
            The Nature
            <br />
            Library
          </h1>
          <p className="latin text-2xl text-moss mt-3">Liber Naturae</p>
          <p className="mt-7 text-[1.2rem] leading-[1.65] max-w-[50ch] text-ink-2">
            Every plant, animal and fungus that people have recorded, on one turning planet. Read each one as the old herbalists did, by what it can heal,
            feed or poison, and as naturalists do now, by where it lives and what it is kin to.
          </p>
          <div className="mt-8 max-w-[560px]">
            <SearchBox big />
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-6 max-w-[620px] border-t border-ink pt-4">
            <div>
              <dt className="label text-ink-2">Species named</dt>
              <dd className="font-display text-[1.7rem] leading-tight mt-1">{big(c.species, "M")}</dd>
            </div>
            <div>
              <dt className="label text-ink-2">Records on the globe</dt>
              <dd className="font-display text-[1.7rem] leading-tight mt-1">{big(c.occ, "B")}</dd>
            </div>
            <div>
              <dt className="label text-ink-2">Field photographs</dt>
              <dd className="font-display text-[1.7rem] leading-tight mt-1">{big(c.obs, "M")}</dd>
            </div>
          </dl>
        </div>
        <div className="relative">
          <HomeGlobe />
        </div>
      </section>

      {/* ——— The holdings ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-20">
        <div className="flex items-baseline justify-between border-b-[3px] border-double border-ink pb-3">
          <h2 className="font-display text-[2.2rem] leading-none">The holdings</h2>
          <span className="label text-ink-2 hidden sm:inline">Accession register · {new Date().getFullYear()}</span>
        </div>
        <dl className="grid grid-cols-2 sm:grid-cols-4 border-l rule">
          {LEDGER(st, kingdomTotal, PLATES.length).map(([n, label, href]) => (
            <Link key={label} href={href} className="group border-r border-b rule p-5 hover:bg-card transition-colors">
              <dd className="font-display text-[clamp(1.9rem,3.4vw,2.8rem)] leading-none group-hover:text-moss">{n}</dd>
              <dt className="label text-ink-2 mt-2 leading-snug">{label}</dt>
            </Link>
          ))}
        </dl>
      </section>

      {/* ——— The plan ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-20">
        <div className="flex items-baseline justify-between border-b-[3px] border-double border-ink pb-3 mb-8">
          <h2 className="font-display text-[2.2rem] leading-none">A plan of the library</h2>
          <span className="label text-ink-2 hidden sm:inline">Ground floor · drawn to no scale</span>
        </div>
        <LibraryPlan rooms={rooms} />
      </section>

      {/* ——— Specimen of the day ——— */}
      {sotd && (
        <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-24">
          <p className="label text-ink-2">Specimen of the day · {sotd.nl}</p>
          <div className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.8fr)] gap-10 mt-4 items-center">
            <Link href={`/species/${sotd.slug}`} className="mount block">
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
                  <span className="label mr-2">It can</span>
                  {sotd.abilities[0]}
                </p>
              )}
              <Link href={`/species/${sotd.slug}`} className="inline-block mt-6 label text-moss hover:text-rust">
                Read the full specimen sheet →
              </Link>
            </div>
            {sotd.plates?.[0] && (
              <figure>
                <div className="bg-[#efe6cf] p-4 border rule">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sotd.plates[0].img} alt="" className="w-full max-h-[420px] object-contain mix-blend-multiply" />
                </div>
                <figcaption className="text-xs text-ink-2 mt-2 leading-snug">
                  As drawn in <i>{sotd.plates[0].title}</i>
                  {sotd.plates[0].author !== "Unknown" ? `, ${sotd.plates[0].author}` : ""}, {sotd.plates[0].year}
                </figcaption>
              </figure>
            )}
          </div>
        </section>
      )}

      {/* ——— Room I: the Aviary ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-24">
        <div className="grid lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] gap-10 items-end">
          <div>
            <p className="label text-rust">Room I</p>
            <h2 className="font-display text-[clamp(2.4rem,4.5vw,3.6rem)] leading-[0.95] mt-1">The Aviary</h2>
            <p className="mt-4 text-ink-2 leading-relaxed">
              {st.birds} birds from every continent and ocean, with the field marks that clinch an identification, the song written out and recorded, and the
              look-alikes that fool beginners. Share your location and it lists what is singing near you this month.
            </p>
            <Link href="/aviary" className="inline-block mt-5 px-5 py-2.5 bg-ink text-paper font-display text-lg hover:bg-moss">
              Enter the Aviary
            </Link>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {showcaseBirds.map((b) => (
              <Link key={b.slug} href={`/species/${b.slug}`} className="group block">
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

      {/* ——— Room II: the Bestiary ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-20">
        <div className="flex items-baseline justify-between border-b-[3px] border-double border-ink pb-3">
          <h2 className="font-display text-[2.2rem] leading-none">
            <span className="label text-rust mr-3 align-middle">Room II</span>The Bestiary
          </h2>
          <Link href="/bestiary" className="label text-moss hover:text-rust">{st.animals} animals →</Link>
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
                  {x.list.length} sheets · <i className="normal-case tracking-normal">{x.taxon}</i>
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ——— Card catalogue ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-24">
        <div className="flex items-baseline justify-between border-b-[3px] border-double border-ink pb-3">
          <h2 className="font-display text-[2.2rem] leading-none"><span className="label text-rust mr-3 align-middle">Room IX</span>The card catalogue</h2>
          <Link href="/shelves" className="label text-moss hover:text-rust">All {SHELVES.length} shelves →</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-rule border-x border-b rule">
          {SHELVES.slice(0, 8).map((s) => {
            const items = onShelf(s.id);
            // faces for the card: well-observed members not already shown on an earlier card
            const faces = [...items]
              .filter((e) => e.photos?.length && !shown.has(e.slug))
              .sort((a, b) => (b.observations ?? 0) - (a.observations ?? 0))
              .slice(0, 4);
            faces.forEach((e) => shown.add(e.slug));
            return (
              <Link key={s.id} href={`/shelves/${s.id}`} className="group bg-paper p-5 flex flex-col min-h-[260px] hover:bg-card">
                <div className="flex justify-between items-start">
                  <span className="font-display text-3xl text-ochre">{s.numeral}</span>
                  <span className="font-mono text-xs text-ink-2">{items.length} vols.</span>
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

      {/* ——— Night: the Atlas ——— */}
      <section className="night mt-28">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="label text-glow/80">The Reading Room · The Atlas</p>
            <h2 className="font-display text-[clamp(2.4rem,5vw,4rem)] leading-[0.95] mt-3 text-[#f1ebd8]">Where on Earth is life recorded?</h2>
            <p className="mt-6 text-lg leading-relaxed text-[#c9c2a8] max-w-[54ch]">
              The bright regions are not always the richest. They are where people have looked. Some of the most species-rich places on Earth, the Congo
              basin, New Guinea, the deep sea, are still dark on this map. Every observation you add lights it a little.
            </p>
            <Link href="/atlas" className="inline-block mt-8 px-6 py-3 bg-glow text-night font-display text-lg hover:bg-[#f3d98f]">
              Open the Atlas
            </Link>
          </div>
          <div className="max-w-[520px] w-full mx-auto">
            <HomeGlobe night />
          </div>
        </div>
      </section>

      {/* ——— Room VII: Catalogue of All Life ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-24">
        <div className="grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-12">
          <div>
            <p className="label text-rust">Room VII</p>
            <h2 className="font-display text-[clamp(2.4rem,4.5vw,3.6rem)] leading-[0.95] mt-1">The Catalogue of All Life</h2>
            <p className="mt-4 text-ink-2 leading-relaxed">
              Not a selection: every name the world&apos;s museums, herbaria and checklists have catalogued, {(kingdomTotal / 1e6).toFixed(1)} million of them, each
              with a page. Walk down the tree from a kingdom, or open any of {st.countries} countries and see every species ever recorded there, down to the ones
              seen once.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/catalogue" className="px-5 py-2.5 bg-ink text-paper font-display text-lg hover:bg-moss">
                Open the Catalogue
              </Link>
              <Link href="/catalogue/country/pk" className="px-4 py-2.5 border border-ink hover:bg-paper-2">
                Life recorded in Pakistan
              </Link>
            </div>
          </div>
          <ol className="self-center">
            {KINGDOMS.map(([k, label], i) => (
              <li key={k} className="border-b rule">
                <Link href={`/gbif/${k}?stay=1`} className="group grid grid-cols-[2.2rem_1fr_auto] items-baseline gap-3 py-3">
                  <span className="font-mono text-xs text-ink-2">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-2xl group-hover:text-moss">
                    {label} <span className="latin text-base text-ink-2">{kingdoms[i]?.canonicalName}</span>
                  </span>
                  <span className="font-mono text-sm text-ink-2">{kingdoms[i]?.numDescendants?.toLocaleString() ?? "—"} names</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ——— Plate room ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-24">
        <div className="flex items-baseline justify-between border-b-[3px] border-double border-ink pb-3">
          <h2 className="font-display text-[2.2rem] leading-none"><span className="label text-rust mr-3 align-middle">Room IV</span>From the Plate Room</h2>
          <Link href="/plates" className="label text-moss hover:text-rust">{PLATES.length.toLocaleString()} plates →</Link>
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
                  {p.year ?? "n.d."} · {p.author}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Gerard ——— */}
      {GERARD.length > 0 && (
        <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-24">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-12 items-center">
            <div>
              <p className="label text-rust">Room III · The Herball Room</p>
              <h2 className="font-display text-[clamp(2.2rem,4vw,3.4rem)] leading-[0.98] mt-2">Gerard&apos;s Herball, 1597, read chapter by chapter</h2>
              <p className="mt-5 text-lg leading-relaxed text-ink-2 max-w-[54ch]">
                England&apos;s great Elizabethan herbal, in its own spelling: the description, place, time, names and &ldquo;vertues&rdquo; of {GERARD.length} plants so far,
                each beside the page it was printed on, and linked to the living species in the codex.
              </p>
              <Link href="/herball" className="inline-block mt-6 label text-moss hover:text-rust">Enter the Herball Room →</Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {GERARD.filter((c) => c.codex && c.sections.vertues).slice(0, 3).map((c) => (
                <Link key={c.id} href={`/herball/${c.id}`} className="group block">
                  <div className="bg-[#efe6cf] p-2 border rule group-hover:border-ink">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={gerardPage(c.page)} alt="" loading="lazy" className="w-full aspect-[3/4] object-cover object-top mix-blend-multiply" />
                  </div>
                  <p className="font-display text-lg mt-2 leading-tight group-hover:text-moss">{c.title}</p>
                  <p className="label text-ink-2 !text-[0.56rem]">Chap. {c.chap}{c.printed ? ` · p. ${c.printed}` : ""}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ——— Rooms V & VI: Identify and the Garden ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-24 grid md:grid-cols-2 gap-px bg-rule border rule">
        <Link href="/identify" className="group bg-paper p-8 hover:bg-card">
          <p className="label text-rust">Room V</p>
          <p className="font-display text-4xl mt-1 group-hover:text-moss">The Identification Desk</p>
          <p className="mt-3 text-ink-2 leading-relaxed max-w-[48ch]">
            Photograph a leaf, a mushroom, a bird. BioCLIP, a vision model trained across the tree of life, runs in your own browser, compares it with{" "}
            {st.identify.toLocaleString()} species, and tells you what else it could be. The photo never leaves your phone.
          </p>
          <p className="mt-5 label text-moss">Bring a photograph →</p>
        </Link>
        <Link href="/grow" className="group bg-paper p-8 hover:bg-card">
          <p className="label text-rust">Room VI</p>
          <p className="font-display text-4xl mt-1 group-hover:text-moss">The Garden Planner</p>
          <p className="mt-3 text-ink-2 leading-relaxed max-w-[48ch]">
            Name your town. The library reads ten years of its weather, works out how cold your winters really get, and lists every codex plant you can grow:
            physic bed, orchard, kitchen garden and nectary.
          </p>
          <p className="mt-5 label text-moss">Plan a garden →</p>
        </Link>
      </section>

      {/* ——— Exhibitions ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-24">
        <div className="flex items-baseline justify-between border-b-[3px] border-double border-ink pb-3">
          <h2 className="font-display text-[2.2rem] leading-none"><span className="label text-rust mr-3 align-middle">Room X</span>Exhibitions</h2>
          <Link href="/exhibitions" className="label text-moss hover:text-rust">All exhibitions →</Link>
        </div>
        <div className="grid md:grid-cols-3 gap-x-10">
          {EXHIBITIONS.slice(0, 3).map((x) => {
            const m = CODEX.filter((e) => x.members.includes(e.scientific));
            return (
              <Link key={x.slug} href={`/exhibitions/${x.slug}`} className="group block py-6 border-b rule">
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

      {/* ——— Recently catalogued ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-24">
        <div className="flex items-baseline justify-between border-b-[3px] border-double border-ink pb-3">
          <h2 className="font-display text-[2.2rem] leading-none">From the codex</h2>
          <span className="label text-ink-2">{CODEX.length} hand-edited entries · and every other species in the open stacks</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-5 gap-y-8 mt-6">
          {pickVaried(CODEX, 12).map((e) => (
            <SpecimenCard key={e.slug} e={e} />
          ))}
        </div>
      </section>

      {/* ——— Room XI: Corrections ——— */}
      <section className="mx-auto max-w-[1320px] px-4 sm:px-6 mt-24">
        <div className="grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-10">
          <div>
            <p className="label text-rust">Room XI</p>
            <h2 className="font-display text-[clamp(2.2rem,4vw,3.2rem)] leading-[0.98] mt-1">We publish our errata</h2>
            <p className="mt-4 text-ink-2 leading-relaxed">
              Every sheet in the codex was checked against IUCN, BirdLife, FishBase, the Reptile Database, the EMA, Cochrane and museum sources. {st.corrections}{" "}
              statements were corrected, softened or removed, and every one is on the record.
            </p>
            <Link href="/about/corrections" className="inline-block mt-5 label text-moss hover:text-rust">
              Read all {st.corrections} corrections →
            </Link>
          </div>
          <ul className="space-y-5">
            {sampleCorr.map((x, i) => (
              <li key={i} className="border-l-2 border-ochre pl-5">
                <p className="label text-ink-2">
                  {resolve(x.species) ? <Link href={`/species/${resolve(x.species)}`} className="hover:text-moss">{x.species}</Link> : x.species} · {x.field}
                </p>
                <p className="mt-1 text-ink-2 line-through decoration-stamp/40">{x.was}</p>
                <p className="mt-1">{x.now}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ——— Why ——— */}
      <section className="mx-auto max-w-[1000px] px-4 sm:px-6 mt-28 text-center">
        <p className="label text-ink-2">Why a library of nature</p>
        <p className="font-display text-[clamp(1.8rem,3.6vw,2.8rem)] leading-[1.2] mt-6">
          In 2019 the UN&apos;s biodiversity panel estimated that around a million species face extinction, many within decades. It is hard to care for what you
          have never met.
        </p>
        <p className="mt-6 text-ink-2">
          The Nature Library is a place to meet them: by name, by place, by family, and through the eyes of everyone who drew them before us.
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
