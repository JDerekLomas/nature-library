import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { GROUPS, findSpecies, groupTitle, loadGroup, familySlug, type GroupId } from "@/lib/checklists";
import { findImages } from "@/lib/images";
import { wikiSections } from "@/lib/wikipedia";
import FoundGallery from "@/components/FoundGallery";
import ShareButton from "@/components/ShareButton";
import WikiText from "@/components/WikiText";
import WhereItLives from "@/components/WhereItLives";
import Stacks from "@/components/Stacks";
import { Section, IucnStamp } from "@/components/Sheet";
import { asLang, lp } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export const revalidate = 2592000;
const KINGDOM = "Animalia";
const nameOf = (raw: string) => decodeURIComponent(raw).replace(/_/g, " ");

export async function generateMetadata({ params }: { params: Promise<{ lang: string; group: string; name: string }> }): Promise<Metadata> {
  const { group, name } = await params;
  const s = GROUPS.includes(group as GroupId) ? findSpecies(group as GroupId, nameOf(name)) : undefined;
  return s ? { title: s.en ? `${s.en} (${s.sci})` : s.sci } : {};
}

export default async function ChecklistSpecies({ params }: { params: Promise<{ lang: string; group: string; name: string }> }) {
  const { lang: l, group, name } = await params;
  const lang = asLang(l);
  if (!GROUPS.includes(group as GroupId)) notFound();
  const g = group as GroupId;
  const s = findSpecies(g, nameOf(name));
  if (!s) notFound();
  // if a general catalogue has since picked the name up, its fuller page wins
  if (s.gbif) redirect(lp(lang, `/gbif/${s.gbif}`));
  const T = dict(lang);
  const t = T.rooms.checklists;
  const L = (p: string) => lp(lang, p);
  const src = loadGroup(g)!.source;
  const [images, wiki] = await Promise.all([findImages(s.sci, 6), wikiSections(`https://en.wikipedia.org/wiki/${encodeURIComponent(s.sci.replace(/ /g, "_"))}`).catch(() => null)]);
  const epithet = s.sci.split(" ").at(-1)!;
  const where = s.countries || [...s.habitat].map((h) => t.habitat[h]).join(", ");
  return (
    <article className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-8">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 label text-ink-2 border-b border-ink pb-2">
        <Link href={L(`/checklists/${g}`)} className="text-ink hover:text-moss">{groupTitle(g, lang)}</Link>
        <span className="latin normal-case">{s.order}</span>
        <Link href={L(`/checklists/${g}/${familySlug(s.family)}`)} className="latin normal-case hover:text-moss">{s.family}</Link>
        {s.extinct && <span className="text-stamp">{T.rooms.gbif.extinct}</span>}
        <ShareButton name={s.en || s.sci} scientific={s.sci} className="ml-auto" />
      </div>
      <div className="grid lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] gap-10 lg:gap-16 mt-8">
        <div className="lg:sticky lg:top-24 self-start">
          <FoundGallery images={images} alt={s.sci} none={T.rooms.gbif.noImage} credit={T.rooms.gbif.foundCredit} />
          {s.iucn && (
            <div className="mt-6 text-center">
              <IucnStamp code={s.iucn} />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-[clamp(2.4rem,6vw,4.6rem)] leading-[0.95] tracking-tight">{s.en || s.sci}</h1>
          <p className="latin text-2xl mt-2 text-moss">
            {s.sci} <span className="not-italic font-serif text-base text-ink-2">{s.author}</span>
          </p>
          <p className="mt-6 text-ink-2 max-w-[66ch] leading-relaxed border-l-2 border-ochre pl-4">{t.recognisedBy(src)}</p>
          {where && (
            <p className="mt-6 max-w-[70ch] leading-relaxed">
              <span className="label text-ink-2 mr-2">{s.countries ? t.distribution : t.lives}</span>
              {where}
            </p>
          )}
          {wiki?.lead && (
            <div className="mt-8 space-y-4 max-w-[68ch]">
              {wiki.lead.split(/\n\n+/).map((p, i) => (
                <p key={i} className={i === 0 ? "drop-cap text-[1.15rem] leading-[1.65]" : "text-ink-2 leading-relaxed"}>{p}</p>
              ))}
            </div>
          )}
          <p className="mt-6 text-sm">
            <Link href={L(`/search?q=${encodeURIComponent(epithet)}`)} className="link-ink text-moss">{t.searchOld(epithet)}</Link>
          </p>
          {wiki?.sections.map((w, i) => (
            <Section key={w.key} n={String(i + 1)} title={T.rooms.taxon.sections[w.key] ?? w.title}>
              <WikiText text={w.text} />
            </Section>
          ))}
        </div>
      </div>
      <Section n="·" title={T.rooms.gbif.recorded}>
        <WhereItLives name={s.sci} kingdom={KINGDOM} rank="species" />
      </Section>
      <Section n="·" title={T.rooms.gbif.stacks}>
        <Stacks names={s.en ? [s.sci, s.en] : [s.sci]} scientific={s.sci} />
      </Section>
      <p className="mt-16 text-xs text-ink-2">{t.source(src, loadGroup(g)!.fetched)}</p>
    </article>
  );
}
