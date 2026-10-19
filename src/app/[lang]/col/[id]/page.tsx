import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { colInfo, colChildren, colSpeciesCount, colWebUrl, COL_LANG } from "@/lib/col";
import { wikiSections } from "@/lib/wikipedia";
import { Section } from "@/components/Sheet";
import WhereItLives from "@/components/WhereItLives";
import Stacks from "@/components/Stacks";
import WikiText from "@/components/WikiText";
import FoundGallery from "@/components/FoundGallery";
import ShareButton from "@/components/ShareButton";
import FeedbackButton from "@/components/FeedbackButton";
import { findImages } from "@/lib/images";
import { asLang, lp, LOCALE } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export const revalidate = 604800;
const SPECIES_RANKS = ["species", "subspecies", "variety", "form"];
const PER = 100;

export async function generateMetadata({ params }: { params: Promise<{ lang: string; id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const i = await colInfo(decodeURIComponent(id));
  return i ? { title: i.usage.name.scientificName } : {};
}

// the richer page wins: a species GBIF also knows goes to its GBIF page (which in turn goes to iNaturalist)
async function gbifExact(name: string, kingdom?: string) {
  try {
    const r = await fetch(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(name)}&strict=true${kingdom ? `&kingdom=${kingdom}` : ""}`, { next: { revalidate }, signal: AbortSignal.timeout(6000) });
    const g = await r.json();
    return g.matchType === "EXACT" && g.canonicalName?.toLowerCase() === name.toLowerCase() && (!kingdom || g.kingdom === kingdom) ? (g.acceptedUsageKey ?? g.usageKey) : undefined;
  } catch {
    return undefined;
  }
}

export default async function ColPage({ params, searchParams }: { params: Promise<{ lang: string; id: string }>; searchParams: Promise<{ stay?: string; p?: string }> }) {
  const pr = await params;
  const id = decodeURIComponent(pr.id);
  const lang = asLang(pr.lang);
  const T = dict(lang);
  const t = T.rooms.col;
  const L = (p: string) => lp(lang, p);
  const nf = (n: number) => n.toLocaleString(LOCALE[lang]);
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.p) || 1);

  const info = await colInfo(id);
  if (!info) notFound();
  const u = info.usage;
  if (u.accepted?.id && u.accepted.id !== id) redirect(L(`/col/${encodeURIComponent(u.accepted.id)}`));
  const name = u.name.scientificName;
  const rank = u.name.rank;
  const isSpecies = SPECIES_RANKS.includes(rank);
  const lineage = (info.classification ?? []).filter((c) => c.id !== id);
  const kingdom = lineage.find((c) => c.rank === "kingdom")?.name;
  if (isSpecies && !sp.stay) {
    const g = await gbifExact(name, kingdom);
    if (g) redirect(L(`/gbif/${g}`));
  }

  const vern = info.vernacularNames ?? [];
  const mine = vern.find((v) => v.language === COL_LANG[lang]) ?? (lang !== "en" ? vern.find((v) => v.language === "eng") : undefined);
  const others = vern.filter((v) => v !== mine && v.name).slice(0, 14);
  const areas = [...new Set((info.distributions ?? []).map((d) => d.area?.name).filter(Boolean))].slice(0, 40) as string[];
  const syns = [...(info.synonyms?.homotypic ?? []), ...(info.synonyms?.heterotypic ?? [])].map((s) => `${s.name.scientificName}${s.name.authorship ? ` ${s.name.authorship}` : ""}`).slice(0, 12);
  const refs = Object.values(info.references ?? {}).map((r) => r.citation).filter(Boolean).slice(0, 6) as string[];
  const [kids, nSpecies] = isSpecies ? [null, 0] : await Promise.all([colChildren(id, (page - 1) * PER, PER), colSpeciesCount(id)]);
  const enWiki = `https://en.wikipedia.org/wiki/${encodeURIComponent(name.replace(/ /g, "_"))}`;
  const wiki = (lang !== "en" ? await wikiSections(enWiki, lang).catch(() => null) : null) ?? (await wikiSections(enWiki).catch(() => null));
  const rankLabel = (r: string) => (T.common.ranks[r] ?? r).toLowerCase();
  const images = ["species", "subspecies", "variety", "form", "genus"].includes(rank) ? await findImages(name, 6) : [];

  return (
    <article className="mx-auto max-w-[1100px] px-4 sm:px-6 pt-8">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 label text-ink-2 border-b border-ink pb-2">
        <span className="text-ink">COL·{id}</span>
        <span>{rankLabel(rank)}</span>
        {u.extinct && <span className="text-stamp">{t.extinct}</span>}
        {u.status === "provisionally accepted" && <span>{t.provisional}</span>}
        <span className="ml-auto flex items-center gap-4">
          <span className="hidden sm:inline">{t.kicker("2026")}</span>
          <FeedbackButton variant="pill" />
          <ShareButton name={mine ? mine.name.charAt(0).toUpperCase() + mine.name.slice(1) : name} scientific={name} />
        </span>
      </div>
      <nav className="mt-3 text-sm text-ink-2 flex flex-wrap gap-x-1.5">
        {lineage.map((a, i) => (
          <span key={a.id}>
            {i > 0 && <span className="mx-1">›</span>}
            <Link href={L(`/col/${encodeURIComponent(a.id)}?stay=1`)} className="hover:text-moss">
              {a.name}
            </Link>
          </span>
        ))}
      </nav>

      <div className={`grid gap-10 lg:gap-14 mt-6 ${isSpecies || images.length ? "lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]" : ""}`}>
      {(isSpecies || images.length > 0) && (
        <div className="lg:sticky lg:top-24 self-start">
          <FoundGallery images={images} alt={name} none={T.rooms.gbif.noImage} credit={T.rooms.gbif.foundCredit} />
        </div>
      )}
      <div className="min-w-0">
      <h1 className="font-display text-[clamp(2.4rem,6vw,4.4rem)] leading-[0.95] tracking-tight">{mine ? mine.name.charAt(0).toUpperCase() + mine.name.slice(1) : name}</h1>
      <p className="latin text-2xl mt-2 text-moss">
        {name} {u.name.authorship && <span className="not-italic font-serif text-base text-ink-2">{u.name.authorship}</span>}
      </p>
      {others.length > 0 && (
        <p className="mt-4 text-ink-2 leading-relaxed">
          <span className="label mr-2">{t.alsoCalled}</span>
          {others.map((v) => `${v.name}${v.language ? ` (${v.language})` : ""}`).join(" · ")}
        </p>
      )}
      {isSpecies && !wiki?.lead && <p className="mt-6 text-ink-2 max-w-[66ch] leading-relaxed border-l-2 border-ochre pl-4">{t.recent}</p>}
      {wiki?.lead && (
        <div className="mt-8 space-y-4 max-w-[68ch]">
          {wiki.lead.split(/\n\n+/).map((p, i) => (
            <p key={i} className={i === 0 ? "drop-cap text-[1.15rem] leading-[1.65]" : "text-ink-2 leading-relaxed"}>
              {p}
            </p>
          ))}
        </div>
      )}
      {(areas.length > 0 || syns.length > 0) && (
        <dl className="mt-8 grid sm:grid-cols-2 gap-6 max-w-[900px]">
          {areas.length > 0 && (
            <div>
              <dt className="label text-ink-2">{t.range}</dt>
              <dd className="mt-1 leading-relaxed">{areas.join(", ")}</dd>
            </div>
          )}
          {syns.length > 0 && (
            <div>
              <dt className="label text-ink-2">{t.synonyms}</dt>
              <dd className="mt-1 leading-relaxed latin">{syns.join("; ")}</dd>
            </div>
          )}
        </dl>
      )}
      </div>
      </div>

      {kids && (
        <div className="mt-12">
          <p className="label text-ink-2 mb-3">
            {t.species(nf(nSpecies))} · {t.branches(nf(kids.total))}
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
            {kids.items.map((c) => (
              <li key={c.id} className="border-b rule min-w-0">
                <Link href={L(`/col/${encodeURIComponent(c.id)}${SPECIES_RANKS.includes(c.rank) ? "" : "?stay=1"}`)} className="flex justify-between gap-3 py-2 hover:text-moss">
                  <span className="min-w-0 truncate">
                    {SPECIES_RANKS.includes(c.rank) || c.rank === "genus" ? <i>{c.name}</i> : c.name}
                    {c.extinct && <span className="text-stamp"> †</span>}
                  </span>
                  <span className="label text-ink-2 !text-[0.55rem] shrink-0 pt-1">
                    {rankLabel(c.rank)}
                    {c.count ? ` · ${nf(c.count)}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {kids.total > PER && (
            <div className="flex justify-between mt-4 text-sm">
              {page > 1 ? <Link href={L(`/col/${encodeURIComponent(id)}?stay=1&p=${page - 1}`)} className="hover:text-moss">{t.previous}</Link> : <span />}
              {page * PER < kids.total ? <Link href={L(`/col/${encodeURIComponent(id)}?stay=1&p=${page + 1}`)} className="hover:text-moss">{t.next}</Link> : <span />}
            </div>
          )}
        </div>
      )}

      {wiki && wiki.sections.length > 0 && (
        <div className="mt-12">
          <p className="label text-ink-2 border-b rule pb-2">{T.rooms.gbif.fromWikipedia}</p>
          {wiki.sections.map((w, i) => (
            <Section key={w.key} n={String(i + 1)} title={T.rooms.taxon.sections[w.key] ?? w.title}>
              <WikiText text={w.text} />
            </Section>
          ))}
        </div>
      )}
      <Section n="·" title={T.rooms.gbif.recorded}>
        <WhereItLives name={name} kingdom={kingdom} rank={rank} />
      </Section>
      <Section n="·" title={T.rooms.gbif.stacks}>
        <Stacks names={mine ? [name, mine.name] : [name]} scientific={name} />
      </Section>
      {refs.length > 0 && (
        <Section n="·" title={t.references}>
          <ul className="space-y-2 text-sm text-ink-2 max-w-[80ch]">
            {refs.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </Section>
      )}
      <p className="mt-16 text-xs text-ink-2 max-w-[90ch] leading-relaxed">
        {t.credit}{" "}
        <a className="link-ink" href={colWebUrl(id)} target="_blank" rel="noreferrer">
          {t.onCol}
        </a>
        .
      </p>
    </article>
  );
}
