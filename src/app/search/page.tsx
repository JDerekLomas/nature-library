import Link from "next/link";
import type { Metadata } from "next";
import { searchCodex } from "@/lib/codex";
import { searchTaxa } from "@/lib/inat";
import { gbifSearch } from "@/lib/gbif";
import SpecimenCard from "@/components/SpecimenCard";
import SearchBox from "@/components/SearchBox";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim();
  const local = q ? searchCodex(q) : [];
  const [live, gb] = q ? await Promise.all([searchTaxa(q, 40), gbifSearch(q, 40)]) : [[], []];
  const localIds = new Set(local.map((e) => e.inatId));
  const open = live.filter((t) => !localIds.has(t.id));
  const inatNames = new Set(live.map((t) => t.name.toLowerCase()));
  const catalogued = gb.filter((g) => g.canonicalName && !inatNames.has(g.canonicalName.toLowerCase()) && ["SPECIES", "GENUS", "FAMILY", "SUBSPECIES"].includes(g.rank));

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <p className="label text-ink-2">Catalogue</p>
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
              <p className="label text-ink-2 border-b border-ink pb-2">In the codex · {local.length}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10 mt-6">
                {local.map((e) => (
                  <SpecimenCard key={e.slug} e={e} />
                ))}
              </div>
            </section>
          )}
          <section className="mt-12">
            <p className="label text-ink-2 border-b border-ink pb-2">In the open stacks of iNaturalist · {open.length}</p>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 mt-2">
              {open.map((t) => (
                <li key={t.id} className="border-b rule">
                  <Link href={`/taxon/${t.id}`} className="flex items-center gap-4 py-3 group">
                    <span className="w-14 h-14 bg-paper-3 shrink-0 overflow-hidden">
                      {t.default_photo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.default_photo.square_url} alt="" className="w-full h-full object-cover" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block group-hover:text-moss truncate">{t.preferred_common_name || t.name}</span>
                      <span className="block text-sm text-ink-2 truncate">
                        <i>{t.name}</i> · {t.rank} · {t.observations_count.toLocaleString()} obs.
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          {catalogued.length > 0 && (
            <section className="mt-12">
              <p className="label text-ink-2 border-b border-ink pb-2">In the Catalogue of All Life (GBIF backbone) · {catalogued.length} more names</p>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 mt-2">
                {catalogued.map((g) => (
                  <li key={g.key} className="border-b rule">
                    <Link href={`/gbif/${g.key}?stay=1`} className="block py-3 group">
                      <span className="block group-hover:text-moss">
                        <i>{g.canonicalName}</i> <span className="text-ink-2 text-sm">{g.authorship}</span>
                      </span>
                      <span className="block text-sm text-ink-2">
                        {g.rank.toLowerCase()} · {[g.kingdom, g.class, g.family].filter(Boolean).join(" › ")}
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
