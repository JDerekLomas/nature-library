import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { gbifTaxon, gbifParents, gbifChildren, gbifVernacular, gbifEnglishName, gbifIucn, gbifDescriptions, gbifImages, occurrenceCount, wikidataImage } from "@/lib/gbif";
import { getByInat } from "@/lib/codex";
import { wikiSections } from "@/lib/wikipedia";
import WhereItLives from "@/components/WhereItLives";
import Stacks from "@/components/Stacks";
import { Section, IucnStamp } from "@/components/Sheet";

export const revalidate = 2592000;

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }): Promise<Metadata> {
  const t = await gbifTaxon(Number((await params).key));
  return t ? { title: t.canonicalName ?? t.scientificName } : {};
}

const RANK_ORDER = ["KINGDOM", "PHYLUM", "CLASS", "ORDER", "FAMILY", "GENUS", "SPECIES"];
const PER = 100;

async function inatMatch(name: string) {
  try {
    const r = await fetch(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(name)}&per_page=5&is_active=true`, { next: { revalidate: 2592000 }, signal: AbortSignal.timeout(6000) });
    const j = await r.json();
    return (j.results as { id: number; name: string }[]).find((x) => x.name.toLowerCase() === name.toLowerCase())?.id;
  } catch {
    return undefined;
  }
}

export default async function GbifPage({ params, searchParams }: { params: Promise<{ key: string }>; searchParams: Promise<{ p?: string; stay?: string }> }) {
  const key = Number((await params).key);
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.p) || 1);
  if (!Number.isFinite(key)) notFound();
  let t = await gbifTaxon(key);
  if (!t) notFound();
  if (t.acceptedKey && t.acceptedKey !== key) redirect(`/gbif/${t.acceptedKey}`);
  const name = t.canonicalName ?? t.scientificName;
  const isSpecies = t.rank === "SPECIES" || t.rank === "SUBSPECIES" || t.rank === "VARIETY";

  // the iNaturalist page is richer (photos, sounds), so prefer it when the same name exists there
  if (!sp.stay) {
    const inat = await inatMatch(name);
    if (inat) {
      const c = getByInat(inat);
      redirect(c ? `/species/${c.slug}` : `/taxon/${inat}`);
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
  const english = englishBest;
  const wiki = await wikiSections(`https://en.wikipedia.org/wiki/${encodeURIComponent(name.replace(/ /g, "_"))}`);
  const otherNames = vern.filter((v) => v.lang && v.lang !== "eng" && !/^[A-Z]{3,6}$/.test(v.name)).slice(0, 14);

  return (
    <article className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-8">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 label text-ink-2 border-b border-ink pb-2">
        <span className="text-ink">GBIF·{key}</span>
        <span>{t.rank.toLowerCase()}</span>
        {t.kingdom && <span>{t.kingdom}</span>}
        <span>{records.toLocaleString()} occurrence records</span>
        {t.extinct && <span className="text-stamp">Extinct</span>}
        <span className="ml-auto hidden sm:inline">The Nature Library · Catalogue of all life</span>
      </div>
      {parents && parents.length > 0 && (
        <ol className="flex flex-wrap items-center gap-y-1 text-sm mt-3 text-ink-2">
          {parents.map((a, i) => (
            <li key={a.key} className="flex items-center">
              {i > 0 && <span className="mx-1.5">›</span>}
              <Link href={`/gbif/${a.key}?stay=1`} className="hover:text-moss">
                <span className="label !text-[0.55rem] mr-1">{a.rank.toLowerCase()}</span>
                {a.rank === "GENUS" ? <i>{a.canonicalName}</i> : a.canonicalName}
              </Link>
            </li>
          ))}
        </ol>
      )}

      <div className="grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-10 lg:gap-16 mt-8">
        <div className="self-start">
          {wd && (
            <figure className="mb-3">
              <a href={wd.page} target="_blank" rel="noreferrer" className="mount block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={wd.url} alt={name} className="w-full aspect-[4/3] object-cover bg-paper-3" />
              </a>
              <figcaption className="text-xs text-ink-2 mt-3">Wikimedia Commons, via Wikidata. Click for the photographer and licence.</figcaption>
            </figure>
          )}
          {images.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {images.slice(0, 6).map((im, i) => (
                <a key={im.url} href={`https://www.gbif.org/occurrence/${im.occurrence}`} target="_blank" rel="noreferrer" className={`block bg-paper-3 overflow-hidden ${i === 0 ? "col-span-2 aspect-[4/3]" : "aspect-square"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={im.url} alt={`${name}: ${im.basis === "PRESERVED_SPECIMEN" ? "museum specimen" : "record photograph"}`} loading={i ? "lazy" : "eager"} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          ) : wd ? null : (
            <div className="mount aspect-[4/5] flex items-center justify-center text-center px-8">
              <span className="label text-ink-2">No openly licensed image yet. Many species are known only from a description and a specimen in a drawer.</span>
            </div>
          )}
          {images.length > 0 && (
            <p className="text-xs text-ink-2 mt-2 leading-snug">
              Images attached to GBIF records ({[...new Set(images.map((i) => (i.basis === "PRESERVED_SPECIMEN" ? "museum & herbarium specimens" : "field photographs")))].join(", ")}), from{" "}
              {[...new Set(images.map((i) => i.publisher).filter(Boolean))].slice(0, 3).join(", ")}. Open licences; click for the record.
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
              <span className="label mr-2">Also called</span>
              {otherNames.map((v) => `${v.name}${v.lang ? ` (${v.lang})` : ""}`).join(" · ")}
            </p>
          )}
          {t.publishedIn && <p className="mt-3 text-sm text-ink-2">First described in: {t.publishedIn}</p>}
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
              This species is catalogued but little written about: there is no encyclopaedia article for it yet. What the world knows is in its records below
              and in the literature linked under “In the stacks”.
            </p>
          )}
          {desc.length > 0 && (
            <div className="mt-10">
              <p className="label text-ink-2 border-b rule pb-2">Descriptions from checklists and floras indexed by GBIF</p>
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
              <p className="label text-ink-2 border-b rule pb-2">From Wikipedia (CC BY-SA), quoted section by section</p>
              <div className="mt-6">
                {wiki.sections.map((w, i) => (
                  <Section key={w.key} n={String(i + 1)} title={w.title}>
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
                {t.numDescendants ? `${t.numDescendants.toLocaleString()} names below this ${t.rank.toLowerCase()} · ` : ""}direct branches, page {page}
              </p>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
                {children.results
                  .filter((c) => c.taxonomicStatus === "ACCEPTED" || !c.taxonomicStatus)
                  .map((c) => (
                    <li key={c.key} className="border-b rule">
                      <Link href={`/gbif/${c.key}${RANK_ORDER.indexOf(c.rank) < 6 ? "?stay=1" : ""}`} className="flex justify-between gap-3 py-2 hover:text-moss">
                        <span className="min-w-0 truncate">
                          {c.rank === "SPECIES" || c.rank === "GENUS" ? <i>{c.canonicalName}</i> : c.canonicalName}
                          {c.vernacularName ? <span className="text-ink-2 text-sm"> · {c.vernacularName}</span> : null}
                        </span>
                        <span className="label text-ink-2 !text-[0.55rem] shrink-0 pt-1">{c.rank.toLowerCase()}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
              <div className="flex justify-between mt-4 text-sm">
                {page > 1 ? <Link href={`/gbif/${key}?stay=1&p=${page - 1}`} className="hover:text-moss">← Previous</Link> : <span />}
                {!children.endOfRecords ? <Link href={`/gbif/${key}?stay=1&p=${page + 1}`} className="hover:text-moss">Next {PER} →</Link> : <span />}
              </div>
            </div>
          )}
        </div>
      </div>

      {records > 0 && (
        <Section n="·" title="Where it has been recorded">
          <WhereItLives gbifKey={key} name={name} />
        </Section>
      )}
      <Section n="·" title="In the stacks">
        <Stacks names={english ? [name, english] : [name]} scientific={name} />
      </Section>
      <p className="mt-16 text-xs text-ink-2 max-w-[90ch] leading-relaxed">
        From the GBIF Backbone Taxonomy and occurrence records (GBIF.org), with Wikipedia and the Source Library.{" "}
        <a className="link-ink" href={`https://www.gbif.org/species/${key}`} target="_blank" rel="noreferrer">
          GBIF species {key}
        </a>
        .
      </p>
    </article>
  );
}
