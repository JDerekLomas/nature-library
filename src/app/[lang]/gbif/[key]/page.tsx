import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { gbifTaxon, gbifParents, gbifChildren, gbifVernacular, gbifEnglishName, gbifIucn, gbifDescriptions, gbifImages, occurrenceCount, wikidataImage } from "@/lib/gbif";
import { getByInat } from "@/lib/codex";
import { wikiSections } from "@/lib/wikipedia";
import { findImages } from "@/lib/images";
import FoundGallery from "@/components/FoundGallery";
import ShareButton from "@/components/ShareButton";
import FeedbackButton from "@/components/FeedbackButton";
import { asLang, lp, LOCALE } from "@/i18n/config";
import { dict } from "@/i18n/dict";
import WhereItLives from "@/components/WhereItLives";
import Stacks from "@/components/Stacks";
import { Section, IucnStamp } from "@/components/Sheet";

export const revalidate = 2592000;

export async function generateMetadata({ params }: { params: Promise<{ lang: string; key: string }> }): Promise<Metadata> {
  const t = await gbifTaxon(Number((await params).key));
  return t ? { title: t.canonicalName ?? t.scientificName } : {};
}

const RANK_ORDER = ["KINGDOM", "PHYLUM", "CLASS", "ORDER", "FAMILY", "GENUS", "SPECIES"];
const PER = 100;

// iNaturalist ids of the kingdoms, so a name shared across kingdoms (Morus: gannets and mulberries) resolves to the right one
const INAT_KINGDOM: Record<string, number> = { Animalia: 1, Plantae: 47126, Fungi: 47170, Chromista: 48222, Protozoa: 47686, Bacteria: 67333, Archaea: 151817, Viruses: 131236 };

async function inatMatch(name: string, rank: string, kingdom?: string) {
  try {
    const r = await fetch(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(name)}&per_page=10&is_active=true`, { next: { revalidate: 2592000 }, signal: AbortSignal.timeout(6000) });
    const j = await r.json();
    const k = kingdom ? INAT_KINGDOM[kingdom] : undefined;
    return (j.results as { id: number; name: string; rank: string; ancestor_ids?: number[] }[]).find(
      (x) => x.name.toLowerCase() === name.toLowerCase() && x.rank === rank.toLowerCase() && (!k || x.ancestor_ids?.includes(k))
    )?.id;
  } catch {
    return undefined;
  }
}

export default async function GbifPage({ params, searchParams }: { params: Promise<{ lang: string; key: string }>; searchParams: Promise<{ p?: string; stay?: string }> }) {
  const pr = await params;
  const key = Number(pr.key);
  const lang = asLang(pr.lang);
  const T = dict(lang);
  const g = T.rooms.gbif;
  const L = (x: string) => lp(lang, x);
  const nf = (n: number) => n.toLocaleString(LOCALE[lang]);
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.p) || 1);
  if (!Number.isFinite(key)) notFound();
  let t = await gbifTaxon(key);
  if (!t) notFound();
  if (t.acceptedKey && t.acceptedKey !== key) redirect(L(`/gbif/${t.acceptedKey}`));
  const name = t.canonicalName ?? t.scientificName;
  const isSpecies = t.rank === "SPECIES" || t.rank === "SUBSPECIES" || t.rank === "VARIETY";

  // the iNaturalist page is richer (photos, sounds), so prefer it when the same name exists there
  if (!sp.stay) {
    const inat = await inatMatch(name, t.rank, t.kingdom);
    if (inat) {
      const c = getByInat(inat);
      redirect(L(c ? `/species/${c.slug}` : `/taxon/${inat}`));
    }
  }

  const [parents, vern, englishBest, iucn, desc, images, children, records, wd] = await Promise.all([
    gbifParents(key),
    gbifVernacular(key),
    gbifEnglishName(key),
    isSpecies ? gbifIucn(key) : Promise.resolve(undefined),
    isSpecies ? gbifDescriptions(key) : Promise.resolve([]),
    gbifImages(key, 12),
    isSpecies ? Promise.resolve(null) : gbifChildren(key, (page - 1) * PER, PER),
    occurrenceCount(key),
    wikidataImage(key),
  ]);
  t = t!;
  const spanish = lang === "es" ? vern.find((v) => v.lang === "spa")?.name : undefined;
  const english = spanish ? spanish.charAt(0).toUpperCase() + spanish.slice(1) : englishBest;
  const enWiki = `https://en.wikipedia.org/wiki/${encodeURIComponent(name.replace(/ /g, "_"))}`;
  const wiki = (lang !== "en" ? await wikiSections(enWiki, lang) : null) ?? (await wikiSections(enWiki));
  // no record images and no Wikidata picture: look for the name on iNaturalist and Wikimedia Commons
  const found = !images.length && !wd && ["SPECIES", "SUBSPECIES", "VARIETY", "GENUS"].includes(t.rank) ? await findImages(name, 6) : [];
  const homeLang = lang === "es" ? "spa" : "eng";
  const otherNames = vern.filter((v) => v.lang && v.lang !== homeLang && !/^[A-Z]{3,6}$/.test(v.name)).slice(0, 14);

  return (
    <article className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-8">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 label text-ink-2 border-b border-ink pb-2">
        <span className="text-ink">GBIF·{key}</span>
        <span>{(T.common.ranks[t.rank.toLowerCase()] ?? t.rank).toLowerCase()}</span>
        {t.kingdom && <span>{t.kingdom}</span>}
        <span>{g.records(nf(records))}</span>
        {t.extinct && <span className="text-stamp">{g.extinct}</span>}
        <span className="ml-auto flex items-center gap-4">
          <span className="hidden sm:inline">{g.catalogue}</span>
          <FeedbackButton variant="pill" />
          <ShareButton name={english ?? name} scientific={name} />
        </span>
      </div>
      {parents && parents.length > 0 && (
        <ol className="flex flex-wrap items-center gap-y-1 text-sm mt-3 text-ink-2">
          {parents.map((a, i) => (
            <li key={a.key} className="flex items-center">
              {i > 0 && <span className="mx-1.5">›</span>}
              <Link href={L(`/gbif/${a.key}?stay=1`)} className="hover:text-moss">
                <span className="label !text-[0.55rem] mr-1">{(T.common.ranks[a.rank.toLowerCase()] ?? a.rank).toLowerCase()}</span>
                {a.rank === "GENUS" ? <i>{a.canonicalName}</i> : a.canonicalName}
              </Link>
            </li>
          ))}
        </ol>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-10 lg:gap-16 mt-8">
        <div className="self-start">
          {wd && (
            <figure className="mb-3">
              <a href={wd.page} target="_blank" rel="noreferrer" className="mount block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={wd.url} alt={name} className="w-full aspect-[4/3] object-cover bg-paper-3" />
              </a>
              <figcaption className="text-xs text-ink-2 mt-3">{g.commons}</figcaption>
            </figure>
          )}
          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {images.slice(0, 6).map((im, i) => (
                <a key={im.url} href={`https://www.gbif.org/occurrence/${im.occurrence}`} target="_blank" rel="noreferrer" className={`block bg-paper-3 overflow-hidden ${i === 0 ? "col-span-2 aspect-[4/3]" : "aspect-square"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.url} alt={`${name}: ${im.basis === "PRESERVED_SPECIMEN" ? g.specimens : g.fieldPhotos}`} loading={i ? "lazy" : "eager"} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          ) : wd ? null : (
            <FoundGallery images={found} alt={name} none={g.noImage} credit={g.foundCredit} />
          )}
          {images.length > 0 && (
            <p className="text-xs text-ink-2 mt-2 leading-snug">
              {g.imagesFrom([...new Set(images.map((i) => (i.basis === "PRESERVED_SPECIMEN" ? g.specimens : g.fieldPhotos)))].join(", "), [...new Set(images.map((i) => i.publisher).filter(Boolean))].slice(0, 3).join(", "))}
            </p>
          )}
          {iucn && (
            <div className="mt-6 text-center">
              <IucnStamp code={iucn} />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.95] tracking-tight">{english ?? name}</h1>
          <p className="latin text-2xl mt-2 text-moss">
            {name} <span className="not-italic font-serif text-base text-ink-2">{t.authorship}</span>
          </p>
          {otherNames.length > 0 && (
            <p className="mt-4 text-ink-2 leading-relaxed">
              <span className="label mr-2">{g.alsoCalled}</span>
              {otherNames.map((v) => `${v.name}${v.lang ? ` (${v.lang})` : ""}`).join(" · ")}
            </p>
          )}
          {t.publishedIn && <p className="mt-3 text-sm text-ink-2">{g.describedIn} {t.publishedIn}</p>}
          {wiki?.lead && (
            <div className="mt-8 space-y-4 max-w-[68ch]">
              {wiki.lead.split(/\n\n+/).map((p, i) => (
                <p key={i} className={i === 0 ? "drop-cap text-[1.15rem] leading-[1.65]" : "text-ink-2 leading-relaxed"}>
                  {p}
                </p>
              ))}
            </div>
          )}
          {!wiki?.lead && desc.length === 0 && isSpecies && (
            <p className="mt-8 text-ink-2 max-w-[62ch] leading-relaxed">
              {g.littleWritten}
            </p>
          )}
          {desc.length > 0 && (
            <div className="mt-10">
              <p className="label text-ink-2 border-b rule pb-2">{g.descriptions}</p>
              {desc.slice(0, 4).map((d, i) => (
                <div key={i} className="mt-5 max-w-[70ch]">
                  {d.type && <p className="label text-rust">{d.type}</p>}
                  <p className="mt-1 leading-relaxed">{d.description.replace(/<[^>]+>/g, " ").slice(0, 1200)}</p>
                  {d.source && <p className="text-xs text-ink-2 mt-1">{d.source}</p>}
                </div>
              ))}
            </div>
          )}
          {wiki && wiki.sections.length > 0 && isSpecies && (
            <div className="mt-12">
              <p className="label text-ink-2 border-b rule pb-2">{g.fromWikipedia}</p>
              <div className="mt-6">
                {wiki.sections.map((w, i) => (
                  <Section key={w.key} n={String(i + 1)} title={T.rooms.taxon.sections[w.key] ?? w.title}>
                    <div className="space-y-3 max-w-[70ch] leading-relaxed">
                      {w.text.split(/\n\n+/).map((p, k) => (
                        <p key={k}>{p}</p>
                      ))}
                    </div>
                  </Section>
                ))}
              </div>
            </div>
          )}
          {children && (
            <div className="mt-12">
              <p className="label text-ink-2 mb-3">
                {g.branches(t.numDescendants ? g.namesBelow(nf(t.numDescendants), (T.common.ranks[t.rank.toLowerCase()] ?? t.rank).toLowerCase()) : "", "", page)}
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
                {children.results
                  .filter((c) => c.taxonomicStatus === "ACCEPTED" || !c.taxonomicStatus)
                  .map((c) => (
                    <li key={c.key} className="border-b rule">
                      <Link href={L(`/gbif/${c.key}${RANK_ORDER.indexOf(c.rank) < 6 ? "?stay=1" : ""}`)} className="flex justify-between gap-3 py-2 hover:text-moss">
                        <span className="min-w-0 truncate">
                          {c.rank === "SPECIES" || c.rank === "GENUS" ? <i>{c.canonicalName}</i> : c.canonicalName}
                          {c.vernacularName ? <span className="text-ink-2 text-sm"> · {c.vernacularName}</span> : null}
                        </span>
                        <span className="label text-ink-2 !text-[0.55rem] shrink-0 pt-1">{(T.common.ranks[c.rank.toLowerCase()] ?? c.rank).toLowerCase()}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
              <div className="flex justify-between mt-4 text-sm">
                {page > 1 ? <Link href={L(`/gbif/${key}?stay=1&p=${page - 1}`)} className="hover:text-moss">{g.previous}</Link> : <span />}
                {!children.endOfRecords ? <Link href={L(`/gbif/${key}?stay=1&p=${page + 1}`)} className="hover:text-moss">{g.nextN(PER)}</Link> : <span />}
              </div>
            </div>
          )}
        </div>
      </div>

      {records > 0 && (
        <Section n="·" title={g.recorded}>
          <WhereItLives gbifKey={key} name={name} />
        </Section>
      )}
      <Section n="·" title={g.stacks}>
        <Stacks names={english ? [name, english] : [name]} scientific={name} />
      </Section>
      <p className="mt-16 text-xs text-ink-2 max-w-[90ch] leading-relaxed">
        {g.credit}{" "}
        <a className="link-ink" href={`https://www.gbif.org/species/${key}`} target="_blank" rel="noreferrer">
          {g.gbifSpecies(key)}
        </a>
        .
      </p>
    </article>
  );
}
