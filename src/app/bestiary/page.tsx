import Link from "next/link";
import type { Metadata } from "next";
import { CODEX } from "@/lib/codex";
import SpecimenCard from "@/components/SpecimenCard";

export const metadata: Metadata = { title: "The Bestiary", description: "Every animal in the codex, by class: mammals, birds, fish, reptiles, amphibians, insects and the rest." };

const CLASSES: [string, string, string][] = [
  ["Mammalia", "Mammals", "/taxon/40151"],
  ["Aves", "Birds", "/aviary"],
  ["Actinopterygii", "Ray-finned fishes", "/taxon/47178"],
  ["Elasmobranchii", "Sharks & rays", "/taxon/47273"],
  ["Sarcopterygii", "Lobe-finned fishes", "/gbif/238?stay=1"],
  ["Reptilia", "Reptiles", "/taxon/26036"],
  ["Amphibia", "Amphibians", "/taxon/20978"],
  ["Insecta", "Insects", "/taxon/47158"],
  ["Arachnida", "Spiders, scorpions & kin", "/taxon/47119"],
  ["Malacostraca", "Crabs, lobsters & krill", "/taxon/47187"],
  ["Mollusca", "Molluscs", "/taxon/47115"],
  ["Cnidaria", "Jellyfish & corals", "/taxon/47534"],
  ["Echinodermata", "Starfish & urchins", "/taxon/47549"],
];

export default function Bestiary() {
  const animals = CODEX.filter((e) => e.kingdom === "Animalia");
  const used = new Set<string>();
  const groups = CLASSES.map(([taxon, label, more]) => {
    const list = animals.filter((e) => !used.has(e.slug) && e.ancestors?.some((a) => a.name === taxon));
    list.forEach((e) => used.add(e.slug));
    return { taxon, label, more, list };
  });
  const rest = animals.filter((e) => !used.has(e.slug));

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <p className="label text-ink-2">The Bestiary</p>
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-none mt-2">The Bestiary</h1>
      <p className="mt-4 max-w-[66ch] text-lg text-ink-2 leading-relaxed">
        The medieval bestiaries mixed the elephant with the unicorn. This one keeps to animals that exist: {animals.length} with full field-guide sheets, and every
        other animal species on Earth one click away in the open stacks.
      </p>
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
              <Link href={g.more} className="label text-moss hover:text-rust">
                {g.taxon === "Aves" ? "Enter the Aviary" : "Every species"} →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8 mt-5">
              {g.list.slice(0, g.taxon === "Aves" ? 12 : 200).map((e) => (
                <SpecimenCard key={e.slug} e={e} />
              ))}
            </div>
          </section>
        ))}
      {rest.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-3xl border-b border-ink pb-2">And the rest of the animal kingdom</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-x-5 gap-y-8 mt-5">
            {rest.map((e) => (
              <SpecimenCard key={e.slug} e={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
