import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GROUPS, loadGroup, groupTitle, fishMatch, speciesHref, filterOf, qsOf, type GroupId } from "@/lib/checklists";
import { CODEX } from "@/lib/codex";
import { asLang, lp, LOCALE } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; group: string; family: string }> }): Promise<Metadata> {
  const { group, family } = await params;
  const d = GROUPS.includes(group as GroupId) ? loadGroup(group as GroupId) : null;
  const fam = d?.families.find((x) => x.slug === family);
  return fam ? { title: `${fam.family}${fam.common ? ` (${fam.common})` : ""}` } : {};
}

const codexBySci = new Map(CODEX.map((e) => [e.scientific.toLowerCase(), e.slug]));

export default async function FamilyPage({ params, searchParams }: { params: Promise<{ lang: string; group: string; family: string }>; searchParams: Promise<{ h?: string; c?: string; z?: string }> }) {
  const { lang: l, group, family } = await params;
  const lang = asLang(l);
  if (!GROUPS.includes(group as GroupId)) notFound();
  const g = group as GroupId;
  const data = loadGroup(g);
  const fam = data?.families.find((x) => x.slug === family);
  if (!data || !fam) notFound();
  const t = dict(lang).rooms.checklists;
  const L = (p: string) => lp(lang, p);
  const nf = (n: number) => n.toLocaleString(LOCALE[lang]);
  const fish = g === "fishes";
  const f = fish ? filterOf(await searchParams) : {};
  const all = data.species.filter((s) => s.family === fam.family);
  const list = fish ? all.filter((s) => fishMatch(s, f)) : all;
  const climate = (c: string) => (lang === "es" ? t.climates[c] ?? c : c);
  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 pt-10">
      <Link href={L(`/checklists/${g}${qsOf(f)}`)} className="label text-ink-2 hover:text-moss">
        ← {groupTitle(g, lang)}
      </Link>
      <h1 className="font-display text-[clamp(2.4rem,5vw,4.2rem)] leading-none mt-2 latin">{fam.family}</h1>
      {fam.common && <p className="text-xl text-moss mt-2">{fam.common}</p>}
      <p className="label text-ink-2 mt-3">{list.length !== all.length ? t.shown(nf(list.length), nf(all.length)) : t.species(nf(all.length))}</p>
      {list.length === 0 && <p className="mt-6 text-ink-2">{t.noneHere}</p>}
      <ol className="double-rule mt-6">
        {list.map((s, i) => {
          const slug = codexBySci.get(s.sci.toLowerCase());
          return (
            <li key={s.sci} className="grid grid-cols-[3rem_1fr] gap-3 items-baseline border-b rule py-2.5">
              <span className="text-ink-2 text-sm tabular-nums">{i + 1}</span>
              <Link href={L(slug ? `/species/${slug}` : speciesHref(g, s))} className="group min-w-0">
                <span className="group-hover:text-moss">
                  <i className={s.extinct ? "line-through decoration-stamp/60" : ""}>{s.sci}</i> <span className="text-ink-2 text-sm">{s.author}</span>
                </span>
                {s.en && <span className="text-ink-2"> · {s.en}</span>}
                <span className="block label text-ink-2 !text-[0.58rem] mt-0.5">
                  {fish && [...s.habitat].map((h) => t.habitat[h]).filter(Boolean).join(" · ")}
                  {fish && s.climate && ` · ${climate(s.climate)}`}
                  {fish && s.zone === "reef" && ` · ${t.reef.toLowerCase()}`}
                  {s.iucn && ["VU", "EN", "CR", "EW", "EX"].includes(s.iucn) && <span className="text-stamp"> · IUCN {s.iucn}</span>}
                  {s.extinct && <span className="text-stamp"> · {dict(lang).rooms.checklist.extinct}</span>}
                  {slug && <span className="text-moss"> · {dict(lang).rooms.checklist.sheet}</span>}
                  {!s.gbif && s.col && <span className="text-ochre"> · {t.newName}</span>}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      <p className="mt-10 text-xs text-ink-2">{t.source(data.source, data.fetched)}</p>
    </div>
  );
}
