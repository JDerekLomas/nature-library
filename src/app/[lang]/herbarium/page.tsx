import Link from "next/link";
import type { Metadata } from "next";
import { codexIn } from "@/lib/codex";
import SpecimenCard from "@/components/SpecimenCard";
import { toCard } from "@/lib/cards";
import { asLang, lp, LOCALE } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const t = dict(asLang((await params).lang)).rooms.herbarium;
  return { title: t.title, description: t.metaDesc };
}

// how each one grows, from the sheet's form
const PLANT_GROUPS: [string, string[]][] = [
  ["tree", ["Tree"]],
  ["shrub", ["Shrub"]],
  ["herb", ["Herb"]],
  ["vine", ["Vine"]],
  ["grass", ["Grass"]],
  ["succulent", ["Succulent"]],
];
const FUNGUS_GROUPS: [string, string[]][] = [
  ["mushroom", ["Mushroom"]],
  ["bracket", ["Bracket fungus"]],
  ["lichen", ["Lichen"]],
];

export default async function Herbarium({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const t = dict(lang).rooms.herbarium;
  const L = (p: string) => lp(lang, p);
  const byName = (a: { common: string }, b: { common: string }) => a.common.localeCompare(b.common, LOCALE[lang]);
  const all = codexIn(lang);
  const plants = all.filter((e) => e.kingdom === "Plantae");
  const fungi = all.filter((e) => e.kingdom === "Fungi");
  const neither = all.filter((e) => e.kingdom === "Protozoa" || e.kingdom === "Chromista" || e.kingdom === "Protista");
  const group = (list: typeof all, groups: [string, string[]][], rest: string) => {
    const out = groups.map(([id, forms]) => ({ id, list: list.filter((e) => forms.includes(e.form ?? "")).sort(byName) }));
    const used = new Set(out.flatMap((g) => g.list.map((e) => e.slug)));
    out.push({ id: rest, list: list.filter((e) => !used.has(e.slug)).sort(byName) });
    return out.filter((g) => g.list.length);
  };
  const sections = [
    { id: "plants", title: t.plants, latin: "Plantae", more: ["/taxon/47126", t.everyPlant], groups: group(plants, PLANT_GROUPS, "lower") },
    { id: "fungi", title: t.fungi, latin: "Fungi", more: ["/taxon/47170", t.everyFungus], groups: group(fungi, FUNGUS_GROUPS, "otherFungi") },
  ];

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <p className="label text-ink-2">{t.kicker}</p>
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-none mt-2">{t.title}</h1>
      <p className="mt-4 max-w-[66ch] text-lg text-ink-2 leading-relaxed">{t.intro(plants.length, fungi.length)}</p>
      <nav className="double-rule mt-8 pt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {sections.flatMap((s) =>
          s.groups.map((g) => (
            <a key={g.id} href={`#${g.id}`} className="hover:text-moss">
              {t.groups[g.id]} <span className="text-ink-2">({g.list.length})</span>
            </a>
          ))
        )}
      </nav>
      {sections.map((s) => (
        <section key={s.id} id={s.id} className="mt-14 scroll-mt-24">
          <div className="flex items-baseline justify-between border-b-[3px] border-double border-ink pb-2">
            <h2 className="font-display text-4xl">
              {s.title} <span className="latin text-xl text-ink-2">{s.latin}</span>
            </h2>
            <Link href={L(s.more[0])} className="label text-moss hover:text-rust">
              {s.more[1]}
            </Link>
          </div>
          {s.groups.map((g) => (
            <div key={g.id} id={g.id} className="mt-10 scroll-mt-24">
              <h3 className="font-display text-2xl border-b rule pb-1.5 flex items-baseline justify-between">
                {t.groups[g.id]}
                <span className="label text-ink-2">{t.sheets(g.list.length)}</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8 mt-5">
                {g.list.map((e) => (
                  <SpecimenCard key={e.slug} e={toCard(e)} />
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
      {neither.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-3xl border-b border-ink pb-2">{t.neither}</h2>
          <p className="text-sm text-ink-2 mt-2">{t.neitherNote}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8 mt-5">
            {neither.map((e) => (
              <SpecimenCard key={e.slug} e={toCard(e)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
