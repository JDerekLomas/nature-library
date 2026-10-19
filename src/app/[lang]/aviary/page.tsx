import Link from "next/link";
import type { Metadata } from "next";
import { CODEX, codexIn } from "@/lib/codex";
import SpecimenCard from "@/components/SpecimenCard";
import { toCard } from "@/lib/cards";
import BirdsNear from "./BirdsNear";
import { BIRD_COUNT } from "@/lib/birds";
import { asLang, lp, LOCALE } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const t = dict(asLang((await params).lang)).rooms.aviary;
  return { title: t.title, description: t.metaDesc };
}

export default async function Aviary({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ r?: string }> }) {
  const lang = asLang((await params).lang);
  const t = dict(lang).rooms.aviary;
  const L = (p: string) => lp(lang, p);
  const { r } = await searchParams;
  const birds = codexIn(lang).filter((e) => e.form === "Bird" || e.ancestors?.some((a) => a.name === "Aves"));
  const regions = [...new Set(birds.flatMap((b) => b.regions ?? []))].sort((a, b) => (t.regions[a] ?? a).localeCompare(t.regions[b] ?? b, LOCALE[lang]));
  const shown = r ? birds.filter((b) => b.regions?.includes(r)) : birds;
  const orderOf = (b: (typeof birds)[number]) => b.animal?.order ?? b.ancestors?.find((a) => a.rank === "order")?.name ?? "Other";
  const orders = [...new Set(shown.map(orderOf))].sort((a, b) => (a === "Passeriformes" ? -1 : b === "Passeriformes" ? 1 : a.localeCompare(b)));
  const codexIds = Object.fromEntries(CODEX.filter((e) => e.inatId).map((e) => [e.inatId!, e.slug]));

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <p className="label text-ink-2">{t.kicker}</p>
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-none mt-2">{t.title}</h1>
      <p className="mt-4 max-w-[66ch] text-lg text-ink-2 leading-relaxed">
        {t.intro(birds.length)}{" "}
        <Link href={L("/taxon/3")} className="link-ink">
          {t.openStacks}
        </Link>
        .
      </p>

      <Link href={L("/aviary/checklist")} className="group mt-6 flex items-center justify-between gap-4 border border-ink bg-card px-5 py-4 hover:bg-paper-2">
        <span className="font-display text-2xl group-hover:text-moss">{dict(lang).rooms.checklist.banner(BIRD_COUNT.toLocaleString(LOCALE[lang]))}</span>
        <span className="label text-ink-2 hidden sm:block">eBird / Clements</span>
      </Link>
      <div className="mt-8">
        <BirdsNear codex={codexIds} />
      </div>

      <div className="double-rule mt-12 pt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link href={L("/aviary")} className={!r ? "text-moss underline underline-offset-4" : "hover:text-moss"}>
          {t.everyRegion}
        </Link>
        {regions.map((x) => (
          <Link key={x} href={L(`/aviary?r=${encodeURIComponent(x)}`)} className={r === x ? "text-moss underline underline-offset-4" : "hover:text-moss"}>
            {t.regions[x] ?? x}
          </Link>
        ))}
      </div>

      {orders.map((o) => {
        const list = shown.filter((b) => orderOf(b) === o).sort((a, b) => a.common.localeCompare(b.common, LOCALE[lang]));
        return (
          <section key={o} className="mt-12">
            <div className="flex items-baseline justify-between border-b border-ink pb-2">
              <h2 className="font-display text-3xl">
                {t.orders[o] ?? o} <span className="latin text-lg text-ink-2">{o}</span>
              </h2>
              <span className="label text-ink-2">{list.length}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8 mt-5">
              {list.map((b) => (
                <SpecimenCard key={b.slug} e={toCard(b)} />
              ))}
            </div>
          </section>
        );
      })}

      <p className="mt-16 text-sm text-ink-2">
        {t.footer[0]}{" "}
        <Link href={L("/gbif/212?stay=1")} className="link-ink">
          {t.footer[1]}
        </Link>
        {t.footer[2]}{" "}
        <Link href={L("/catalogue")} className="link-ink">
          {t.footer[3]}
        </Link>
        {t.footer[4]}
      </p>
    </div>
  );
}
