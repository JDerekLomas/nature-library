import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SHELVES, shelfById } from "@/lib/shelves";
import { onShelf, KINGDOM_LABEL } from "@/lib/codex";
import SpecimenCard from "@/components/SpecimenCard";

export function generateStaticParams() {
  return SHELVES.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const s = shelfById((await params).id);
  return s ? { title: s.title, description: s.blurb } : {};
}

export default async function ShelfPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ k?: string }> }) {
  const { id } = await params;
  const { k } = await searchParams;
  const s = shelfById(id);
  if (!s) notFound();
  const all = onShelf(id).sort((a, b) => a.common.localeCompare(b.common));
  const kingdoms = [...new Set(all.map((e) => e.kingdom))];
  const items = k ? all.filter((e) => e.kingdom === k) : all;
  const idx = SHELVES.findIndex((x) => x.id === id);
  const prev = SHELVES[(idx - 1 + SHELVES.length) % SHELVES.length];
  const next = SHELVES[(idx + 1) % SHELVES.length];

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <Link href="/shelves" className="label text-ink-2 hover:text-moss">← All shelves</Link>
      <div className="grid md:grid-cols-[120px_1fr] gap-6 mt-4 items-end">
        <span className="font-display text-[5.5rem] leading-none text-ochre">{s.numeral}</span>
        <div>
          <h1 className="font-display text-[clamp(2.4rem,5vw,4.2rem)] leading-none">{s.title}</h1>
          <p className="mt-3 max-w-[64ch] text-lg text-ink-2 leading-relaxed">{s.blurb}</p>
        </div>
      </div>
      <div className="double-rule mt-8 pt-4 flex flex-wrap items-center gap-4">
        <span className="label text-ink-2">{items.length} volumes</span>
        {kingdoms.length > 1 && (
          <span className="flex gap-3 text-sm">
            <Link href={`/shelves/${id}`} className={!k ? "text-moss underline underline-offset-4" : "hover:text-moss"}>All</Link>
            {kingdoms.map((kg) => (
              <Link key={kg} href={`/shelves/${id}?k=${kg}`} className={k === kg ? "text-moss underline underline-offset-4" : "hover:text-moss"}>
                {KINGDOM_LABEL[kg] ?? kg}
              </Link>
            ))}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10 mt-8">
        {items.map((e) => (
          <SpecimenCard key={e.slug} e={e} />
        ))}
      </div>
      <div className="flex justify-between mt-16 border-t rule pt-6">
        <Link href={`/shelves/${prev.id}`} className="hover:text-moss">← {prev.numeral}. {prev.title}</Link>
        <Link href={`/shelves/${next.id}`} className="hover:text-moss text-right">{next.numeral}. {next.title} →</Link>
      </div>
    </div>
  );
}
