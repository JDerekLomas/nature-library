import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GROUPS, loadGroup, groupTitle, GROUP_LATIN, fishMatch, filterOf, qsOf, type FishFilter, type GroupId } from "@/lib/checklists";
import { asLang, lp, LOCALE } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; group: string }> }): Promise<Metadata> {
  const { lang, group } = await params;
  return GROUPS.includes(group as GroupId) ? { title: groupTitle(group as GroupId, asLang(lang)) } : {};
}

export default async function GroupPage({ params, searchParams }: { params: Promise<{ lang: string; group: string }>; searchParams: Promise<{ h?: string; c?: string; z?: string }> }) {
  const { lang: l, group } = await params;
  const lang = asLang(l);
  if (!GROUPS.includes(group as GroupId)) notFound();
  const g = group as GroupId;
  const data = loadGroup(g);
  if (!data) notFound();
  const T = dict(lang).rooms;
  const t = T.checklists;
  const L = (p: string) => lp(lang, p);
  const nf = (n: number) => n.toLocaleString(LOCALE[lang]);
  const fish = g === "fishes";
  const f = fish ? filterOf(await searchParams) : {};
  const shown = fish ? data.species.filter((s) => fishMatch(s, f)) : data.species;
  const counts = new Map<string, number>();
  for (const s of shown) counts.set(s.family, (counts.get(s.family) ?? 0) + 1);
  const fams = data.families.filter((x) => counts.get(x.family));
  const orders = [...new Set(fams.map((x) => x.order))];
  const chip = (label: string, next: FishFilter, on: boolean) => (
    <Link href={L(`/checklists/${g}${qsOf(next)}`)} className={`px-3 py-1.5 text-sm border ${on ? "bg-ink text-paper border-ink" : "border-ink/30 hover:border-ink"}`}>
      {label}
    </Link>
  );
  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <Link href={L("/checklists")} className="label text-ink-2 hover:text-moss">{t.back}</Link>
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-none mt-4">
        {groupTitle(g, lang)} <span className="latin text-2xl text-ink-2">{GROUP_LATIN[g]}</span>
      </h1>
      <p className="mt-3 max-w-[66ch] text-lg text-ink-2 leading-relaxed">{t.blurbs[g]}</p>
      {fish && (
        <div className="mt-6 flex flex-wrap gap-2 items-center">
          {chip(t.all, {}, !f.h && !f.c && !f.z)}
          {chip(t.marine, { ...f, h: f.h === "marine" ? undefined : "marine" }, f.h === "marine")}
          {chip(t.fresh, { ...f, h: f.h === "fresh" ? undefined : "fresh" }, f.h === "fresh")}
          {chip(t.brackish, { ...f, h: f.h === "brackish" ? undefined : "brackish" }, f.h === "brackish")}
          <span className="w-px h-6 bg-rule mx-1" />
          {chip(t.tropical, { ...f, c: f.c ? undefined : "tropical" }, !!f.c)}
          {chip(t.reef, { ...f, z: f.z ? undefined : "reef" }, !!f.z)}
        </div>
      )}
      <p className="label text-ink-2 mt-5">
        {fish && shown.length !== data.species.length ? t.shown(nf(shown.length), nf(data.species.length)) : t.species(nf(shown.length))} · {t.families(fams.length)}
      </p>
      <div className="double-rule mt-4">
        {orders.map((o) => (
          <section key={o} className="border-b rule py-5 grid md:grid-cols-[240px_1fr] gap-x-8 gap-y-3">
            <h2 className="font-display text-xl leading-tight">
              <span className="latin">{o}</span>
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
              {fams
                .filter((x) => x.order === o)
                .map((x) => (
                  <li key={x.family} className="min-w-0">
                    <Link href={L(`/checklists/${g}/${x.slug}${qsOf(f)}`)} className="group flex justify-between gap-3 py-1.5 border-b rule">
                      <span className="min-w-0 truncate group-hover:text-moss">
                        <span className="latin">{x.family}</span>
                        {x.common && <span className="text-ink-2 text-sm"> · {x.common}</span>}
                      </span>
                      <span className="text-ink-2 text-sm tabular-nums shrink-0">{nf(counts.get(x.family) ?? 0)}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-10 text-xs text-ink-2">{t.source(data.source, data.fetched)}</p>
    </div>
  );
}
