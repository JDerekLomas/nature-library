import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { birdFamilies, birdsInFamily } from "@/lib/birds";
import { CODEX } from "@/lib/codex";
import { asLang, lp } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export function generateStaticParams() {
  return birdFamilies("en").map((f) => ({ family: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; family: string }> }): Promise<Metadata> {
  const { lang, family } = await params;
  const f = birdFamilies(asLang(lang)).find((x) => x.slug === family);
  return f ? { title: `${f.name} (${f.sci})` } : {};
}

const codexByInat = new Map(CODEX.filter((e) => e.inatId).map((e) => [e.inatId!, e.slug]));
const codexBySci = new Map(CODEX.map((e) => [e.scientific.toLowerCase(), e.slug]));

export default async function FamilyPage({ params }: { params: Promise<{ lang: string; family: string }> }) {
  const { lang: l, family } = await params;
  const lang = asLang(l);
  const T = dict(lang).rooms;
  const t = T.checklist;
  const L = (p: string) => lp(lang, p);
  const fams = birdFamilies(lang);
  const i = fams.findIndex((x) => x.slug === family);
  if (i < 0) notFound();
  const f = fams[i];
  const prev = fams[i - 1];
  const next = fams[i + 1];
  const birds = birdsInFamily(family, lang);
  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 pt-10">
      <Link href={L("/aviary/checklist")} className="label text-ink-2 hover:text-moss">
        {t.back}
      </Link>
      <p className="label text-ink-2 mt-4">
        {t.family} · {T.aviary.orders[f.order] ?? f.order} <span className="latin normal-case">({f.order})</span>
      </p>
      <h1 className="font-display text-[clamp(2.4rem,5vw,4.2rem)] leading-none mt-2">{f.name}</h1>
      {f.name !== f.sci && <p className="latin text-2xl text-moss mt-2">{f.sci}</p>}
      <p className="label text-ink-2 mt-3">{t.species(f.count)}</p>
      <ol className="double-rule mt-6">
        {birds.map((b, k) => {
          const slug = (b.inat && codexByInat.get(b.inat)) || codexBySci.get(b.sci.toLowerCase());
          const href = slug ? `/species/${slug}` : b.inat ? `/taxon/${b.inat}` : b.gbif ? `/gbif/${b.gbif}?stay=1` : `/search?q=${encodeURIComponent(b.sci)}`;
          return (
            <li key={b.code} className="grid grid-cols-[2.5rem_1fr_auto] gap-3 items-baseline border-b rule py-2.5">
              <span className="text-ink-2 text-sm tabular-nums">{k + 1}</span>
              <Link href={L(href)} className="group min-w-0">
                <span className={`group-hover:text-moss ${b.extinct ? "line-through decoration-stamp/60" : ""}`}>{b.name}</span>{" "}
                <span className="latin text-ink-2 text-sm">{b.sci}</span>
                {slug && <span className="label text-moss ml-2 !text-[0.6rem]">{t.sheet}</span>}
                {b.extinct && <span className="label text-stamp ml-2 !text-[0.6rem]">{t.extinct}</span>}
              </Link>
              <a href={`https://ebird.org/species/${b.code}`} target="_blank" rel="noreferrer" className="label text-ink-2 hover:text-moss !text-[0.62rem]">
                eBird ↗
              </a>
            </li>
          );
        })}
      </ol>
      <div className="flex justify-between gap-6 mt-12 border-t rule pt-6">
        {prev ? <Link href={L(`/aviary/checklist/${prev.slug}`)} className="hover:text-moss">← {prev.name}</Link> : <span />}
        {next ? <Link href={L(`/aviary/checklist/${next.slug}`)} className="hover:text-moss text-right">{next.name} →</Link> : <span />}
      </div>
    </div>
  );
}
