import Link from "next/link";
import type { Metadata } from "next";
import { searchCodex, codexIn } from "@/lib/codex";
import { asLang, lp, LOCALE } from "@/i18n/config";
import { dict } from "@/i18n/dict";
import { searchTaxa } from "@/lib/inat";
import { gbifSearch } from "@/lib/gbif";
import { colSearch } from "@/lib/col";
import SpecimenCard from "@/components/SpecimenCard";
import { toCard } from "@/lib/cards";
import SearchBox from "@/components/SearchBox";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return { title: dict(asLang((await params).lang)).rooms.search.title };
}

export default async function SearchPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ q?: string }> }) {
  const lang = asLang((await params).lang);
  const T = dict(lang);
  const tt = T.rooms.search;
  const R = T.common.ranks;
  const L = (p: string) => lp(lang, p);
  const q = ((await searchParams).q ?? "").trim();
  const local = q ? searchCodex(q, codexIn(lang)) : [];
  const [live, gb, col] = q ? await Promise.all([searchTaxa(q, 40, lang), gbifSearch(q, 40), colSearch(q, 30)]) : [[], [], []];
  const localIds = new Set(local.map((e) => e.inatId));
  const open = live.filter((t) => !localIds.has(t.id));
  const inatNames = new Set(live.map((t) => t.name.toLowerCase()));
  const catalogued = gb.filter((g) => g.canonicalName && !inatNames.has(g.canonicalName.toLowerCase()) && ["SPECIES", "GENUS", "FAMILY", "SUBSPECIES"].includes(g.rank));
  // more from the current Catalogue of Life: its pages hand over to GBIF/iNaturalist when they know the species too
  const known = new Set([...inatNames, ...catalogued.map((g) => g.canonicalName!.toLowerCase()), ...local.map((e) => e.scientific.toLowerCase())]);
  const recent = col.filter((c) => !c.acceptedId && !known.has(c.name.toLowerCase()) && !gb.some((g) => g.canonicalName?.toLowerCase() === c.name.toLowerCase()));

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <p className="label text-ink-2">{tt.kicker}</p>
      <div className="max-w-[720px] mt-3">
        <SearchBox big />
      </div>
      {q && (
        <>
          <h1 className="font-display text-4xl mt-10">
            “{q}”
          </h1>
          {local.length > 0 && (
            <section className="mt-8">
              <p className="label text-ink-2 border-b border-ink pb-2">{tt.inCodex(local.length)}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10 mt-6">
                {local.map((e) => (
                  <SpecimenCard key={e.slug} e={toCard(e)} />
                ))}
              </div>
            </section>
          )}
          <section className="mt-12">
            <p className="label text-ink-2 border-b border-ink pb-2">{tt.inInat(open.length)}</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 mt-2">
              {open.map((t) => (
                <li key={t.id} className="border-b rule">
                  <Link href={L(`/taxon/${t.id}`)} className="flex items-center gap-4 py-3 group">
                    <span className="w-14 h-14 bg-paper-3 shrink-0 overflow-hidden">
                      {t.default_photo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.default_photo.square_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block group-hover:text-moss truncate">{t.preferred_common_name || t.name}</span>
                      <span className="block text-sm text-ink-2 truncate">
                        <i>{t.name}</i> · {(R[t.rank] ?? t.rank).toLowerCase()} · {T.common.observations(t.observations_count.toLocaleString(LOCALE[lang]))}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          {catalogued.length > 0 && (
            <section className="mt-12">
              <p className="label text-ink-2 border-b border-ink pb-2">{tt.inGbif(catalogued.length)}</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 mt-2">
                {catalogued.map((g) => (
                  <li key={g.key} className="border-b rule">
                    <Link href={L(`/gbif/${g.key}?stay=1`)} className="block py-3 group">
                      <span className="block group-hover:text-moss">
                        <i>{g.canonicalName}</i> <span className="text-ink-2 text-sm">{g.authorship}</span>
                      </span>
                      <span className="block text-sm text-ink-2">
                        {(R[g.rank.toLowerCase()] ?? g.rank).toLowerCase()} · {[g.kingdom, g.class, g.family].filter(Boolean).join(" › ")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {recent.length > 0 && (
            <section className="mt-12">
              <p className="label text-ink-2 border-b border-ink pb-2">{tt.inCol(recent.length)}</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 mt-2">
                {recent.map((c) => (
                  <li key={c.id} className="border-b rule">
                    <Link href={L(`/col/${encodeURIComponent(c.id)}${["species", "subspecies", "variety", "form"].includes(c.rank) ? "" : "?stay=1"}`)} className="block py-3 group">
                      <span className="block group-hover:text-moss">
                        <i>{c.name}</i> <span className="text-ink-2 text-sm">{c.authorship}</span>
                      </span>
                      <span className="block text-sm text-ink-2">
                        {(R[c.rank] ?? c.rank).toLowerCase()} · {c.path}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
