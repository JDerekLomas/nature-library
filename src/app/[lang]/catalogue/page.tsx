import Link from "next/link";
import type { Metadata } from "next";
import { gbifTaxonQuiet } from "@/lib/gbif";
import { COUNTRY_CODES, countryName, GROUPS } from "@/lib/countries";
import SearchBox from "@/components/SearchBox";
import { asLang, lp, LOCALE } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const t = dict(asLang((await params).lang)).rooms.catalogue;
  return { title: t.title, description: t.metaDesc };
}
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

export default async function Catalogue({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const t = dict(lang).rooms.catalogue;
  const L = (p: string) => lp(lang, p);
  const nf = (n?: number) => (n == null ? "—" : n.toLocaleString(LOCALE[lang]));
  const [kingdoms, groups] = await Promise.all([Promise.all(KINGDOMS.map(([k]) => gbifTaxonQuiet(k))), Promise.all(GROUPS.map((g) => gbifTaxonQuiet(g.key)))]);
  const countries = COUNTRY_CODES.map((c) => [c, countryName(c, lang)] as const).sort((a, b) => a[1].localeCompare(b[1], LOCALE[lang]));
  const total = kingdoms.reduce((s, k) => s + (k?.numDescendants ?? 0), 0);

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <p className="label text-ink-2">{t.kicker}</p>
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-none mt-2">{t.title}</h1>
      <p className="mt-5 max-w-[68ch] text-lg text-ink-2 leading-relaxed">{t.intro(total ? t.someMillion((total / 1e6).toLocaleString(LOCALE[lang], { maximumFractionDigits: 1 })) : "")}</p>
      <div className="max-w-[640px] mt-6">
        <SearchBox big />
      </div>

      <section className="mt-14">
        <h2 className="font-display text-3xl border-b-[3px] border-double border-ink pb-2">{t.byKinship}</h2>
        <p className="mt-2 text-sm">
          <Link href={L("/col")} className="link-ink text-moss">{dict(lang).rooms.col.browse}</Link>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-rule border-x border-b rule">
          {KINGDOMS.map(([k, label], i) => (
            <Link key={k} href={L(`/gbif/${k}?stay=1`)} className="bg-paper p-5 hover:bg-card group">
              <p className="label text-ink-2">{kingdoms[i]?.canonicalName}</p>
              <p className="font-display text-2xl mt-1 group-hover:text-moss">{t.kingdoms[k] ?? label}</p>
              <p className="font-mono text-sm text-ink-2 mt-3">{nf(kingdoms[i]?.numDescendants)} {t.names}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-3xl border-b-[3px] border-double border-ink pb-2">{t.greatGroups}</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
          {GROUPS.map((g, i) => (
            <li key={g.key} className="border-b rule">
              <Link href={L(`/gbif/${g.key}?stay=1`)} className="flex justify-between py-3 hover:text-moss">
                <span>
                  {t.groups[g.key] ?? g.label} <span className="latin text-ink-2 text-sm">{groups[i]?.canonicalName}</span>
                </span>
                <span className="font-mono text-sm text-ink-2">{nf(groups[i]?.numDescendants)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="font-display text-3xl border-b-[3px] border-double border-ink pb-2">{t.byCountry}</h2>
        <ul className="columns-2 sm:columns-3 lg:columns-5 gap-6 mt-4 text-sm">
          {countries.map(([c, n]) => (
            <li key={c} className="break-inside-avoid py-1">
              <Link href={L(`/catalogue/country/${c.toLowerCase()}`)} className="hover:text-moss">
                {n}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
