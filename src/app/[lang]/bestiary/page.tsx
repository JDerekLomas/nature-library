import Link from "next/link";
import type { Metadata } from "next";
import { codexIn } from "@/lib/codex";
import SpecimenCard from "@/components/SpecimenCard";
import { toCard } from "@/lib/cards";
import { asLang, lp } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const t = dict(asLang((await params).lang)).rooms.bestiary;
  return { title: t.title, description: t.metaDesc };
}

const CLASSES: [string, string][] = [
  ["Mammalia", "/checklists/mammals"],
  ["Aves", "/aviary"],
  ["Actinopterygii", "/checklists/fishes"],
  ["Elasmobranchii", "/checklists/fishes"],
  ["Sarcopterygii", "/checklists/fishes"],
  ["Reptilia", "/checklists/reptiles"],
  ["Amphibia", "/checklists/amphibians"],
  ["Insecta", "/taxon/47158"],
  ["Arachnida", "/taxon/47119"],
  ["Malacostraca", "/taxon/47187"],
  ["Mollusca", "/taxon/47115"],
  ["Cnidaria", "/taxon/47534"],
  ["Echinodermata", "/taxon/47549"],
];

export default async function Bestiary({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const t = dict(lang).rooms.bestiary;
  const L = (p: string) => lp(lang, p);
  const animals = codexIn(lang).filter((e) => e.kingdom === "Animalia");
  const used = new Set<string>();
  const groups = CLASSES.map(([taxon, more]) => {
    const list = animals.filter((e) => !used.has(e.slug) && e.ancestors?.some((a) => a.name === taxon));
    list.forEach((e) => used.add(e.slug));
    return { taxon, label: t.classes[taxon] ?? taxon, more, list };
  });
  const rest = animals.filter((e) => !used.has(e.slug));

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-none mt-2">{t.title}</h1>
      <p className="mt-4 max-w-[66ch] text-lg text-ink-2 leading-relaxed">{t.intro(animals.length)}</p>
      <Link href={L("/checklists")} className="group mt-6 flex items-center justify-between gap-4 border border-ink bg-card px-5 py-4 hover:bg-paper-2">
        <span className="font-display text-2xl group-hover:text-moss">{dict(lang).rooms.checklists.banner}</span>
      </Link>
      <nav className="double-rule mt-8 pt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {groups
          .filter((g) => g.list.length)
          .map((g) => (
            <a key={g.taxon} href={`#${g.taxon}`} className="hover:text-moss">
              {g.label} <span className="text-ink-2">({g.list.length})</span>
            </a>
          ))}
      </nav>
      {groups
        .filter((g) => g.list.length)
        .map((g) => (
          <section key={g.taxon} id={g.taxon} className="mt-12 scroll-mt-24">
            <div className="flex items-baseline justify-between border-b border-ink pb-2">
              <h2 className="font-display text-3xl">
                {g.label} <span className="latin text-lg text-ink-2">{g.taxon}</span>
              </h2>
              <Link href={L(g.more)} className="label text-moss hover:text-rust">
                {g.taxon === "Aves" ? t.enterAviary : t.everySpecies}
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8 mt-5">
              {g.list.slice(0, g.taxon === "Aves" ? 12 : 200).map((e) => (
                <SpecimenCard key={e.slug} e={toCard(e)} />
              ))}
            </div>
          </section>
        ))}
      {rest.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-3xl border-b border-ink pb-2">{t.rest}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8 mt-5">
            {rest.map((e) => (
              <SpecimenCard key={e.slug} e={toCard(e)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
