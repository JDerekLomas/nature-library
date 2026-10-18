import Link from "next/link";
import type { Metadata } from "next";
import { gbifTaxon } from "@/lib/gbif";
import { COUNTRY_CODES, countryName, GROUPS } from "@/lib/countries";
import SearchBox from "@/components/SearchBox";

export const metadata: Metadata = {
  title: "Catalogue of All Life",
  description: "Every species catalogued on Earth, browsable by kinship from the kingdoms down, by group, and by country.",
};
export const revalidate = 604800;

const KINGDOMS = [
  [1, "Animals"],
  [6, "Plants"],
  [5, "Fungi"],
  [4, "Chromists: kelp, diatoms, forams"],
  [7, "Protozoa"],
  [3, "Bacteria"],
  [2, "Archaea"],
  [8, "Viruses"],
] as const;

export default async function Catalogue() {
  const [kingdoms, groups] = await Promise.all([Promise.all(KINGDOMS.map(([k]) => gbifTaxon(k))), Promise.all(GROUPS.map((g) => gbifTaxon(g.key)))]);
  const countries = COUNTRY_CODES.map((c) => [c, countryName(c)] as const).sort((a, b) => a[1].localeCompare(b[1]));
  const total = kingdoms.reduce((s, k) => s + (k?.numDescendants ?? 0), 0);

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <p className="label text-ink-2">The open stacks</p>
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-none mt-2">The Catalogue of All Life</h1>
      <p className="mt-5 max-w-[68ch] text-lg text-ink-2 leading-relaxed">
        Every species the world&apos;s museums, herbaria, checklists and naturalists have catalogued, {total ? `some ${(total / 1e6).toFixed(1)} million names in all, ` : ""}from the
        GBIF Backbone Taxonomy and iNaturalist. Each has a page in this library. Walk down the tree from a kingdom, open a great group, or see every species ever
        recorded in a country.
      </p>
      <div className="max-w-[640px] mt-6">
        <SearchBox big />
      </div>

      <section className="mt-14">
        <h2 className="font-display text-3xl border-b-[3px] border-double border-ink pb-2">By kinship: the kingdoms</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-rule border-x border-b rule">
          {KINGDOMS.map(([k, label], i) => (
            <Link key={k} href={`/gbif/${k}?stay=1`} className="bg-paper p-5 hover:bg-card group">
              <p className="label text-ink-2">{kingdoms[i]?.canonicalName}</p>
              <p className="font-display text-2xl mt-1 group-hover:text-moss">{label}</p>
              <p className="font-mono text-sm text-ink-2 mt-3">{kingdoms[i]?.numDescendants?.toLocaleString() ?? "—"} names</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-3xl border-b-[3px] border-double border-ink pb-2">The great groups</h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
          {GROUPS.map((g, i) => (
            <li key={g.key} className="border-b rule">
              <Link href={`/gbif/${g.key}?stay=1`} className="flex justify-between py-3 hover:text-moss">
                <span>
                  {g.label} <span className="latin text-ink-2 text-sm">{groups[i]?.canonicalName}</span>
                </span>
                <span className="font-mono text-sm text-ink-2">{groups[i]?.numDescendants?.toLocaleString()}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-3xl border-b-[3px] border-double border-ink pb-2">By country: every species ever recorded there</h2>
        <ul className="columns-2 sm:columns-3 lg:columns-5 gap-6 mt-4 text-sm">
          {countries.map(([c, n]) => (
            <li key={c} className="break-inside-avoid py-1">
              <Link href={`/catalogue/country/${c.toLowerCase()}`} className="hover:text-moss">
                {n}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
