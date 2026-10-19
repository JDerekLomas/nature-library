import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SHELVES, shelvesFor, shelfIn } from "@/lib/shelves";
import { codexIn } from "@/lib/codex";
import SpecimenCard from "@/components/SpecimenCard";
import { toCard } from "@/lib/cards";
import { asLang, lp, LOCALE } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export function generateStaticParams() {
  return SHELVES.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; id: string }> }): Promise<Metadata> {
  const { lang, id } = await params;
  const s = shelfIn(asLang(lang), id);
  return s ? { title: s.title, description: s.blurb } : {};
}

export default async function ShelfPage({ params, searchParams }: { params: Promise<{ lang: string; id: string }>; searchParams: Promise<{ k?: string }> }) {
  const { id, lang: l } = await params;
  const lang = asLang(l);
  const T = dict(lang);
  const t = T.rooms.shelves;
  const { k } = await searchParams;
  const s = shelfIn(lang, id);
  if (!s) notFound();
  const all = codexIn(lang)
    .filter((e) => e.shelves?.includes(id))
    .sort((a, b) => a.common.localeCompare(b.common, LOCALE[lang]));
  const kingdoms = [...new Set(all.map((e) => e.kingdom))];
  const items = k ? all.filter((e) => e.kingdom === k) : all;
  const list = shelvesFor(lang);
  const idx = list.findIndex((x) => x.id === id);
  const prev = list[(idx - 1 + list.length) % list.length];
  const next = list[(idx + 1) % list.length];
  const L = (p: string) => lp(lang, p);

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <Link href={L("/shelves")} className="label text-ink-2 hover:text-moss">
        {t.all}
      </Link>
      <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-6 mt-4 items-end">
        <span className="font-display text-[5.5rem] leading-none text-ochre">{s.numeral}</span>
        <div>
          <h1 className="font-display text-[clamp(2.4rem,5vw,4.2rem)] leading-none">{s.title}</h1>
          <p className="mt-3 max-w-[64ch] text-lg text-ink-2 leading-relaxed">{s.blurb}</p>
        </div>
      </div>
      <div className="double-rule mt-8 pt-4 flex flex-wrap items-center gap-4">
        <span className="label text-ink-2">{t.volumes(items.length)}</span>
        {kingdoms.length > 1 && (
          <span className="flex gap-3 text-sm">
            <Link href={L(`/shelves/${id}`)} className={!k ? "text-moss underline underline-offset-4" : "hover:text-moss"}>
              {t.allKingdoms}
            </Link>
            {kingdoms.map((kg) => (
              <Link key={kg} href={L(`/shelves/${id}?k=${kg}`)} className={k === kg ? "text-moss underline underline-offset-4" : "hover:text-moss"}>
                {T.common.kingdoms[kg] ?? kg}
              </Link>
            ))}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10 mt-8">
        {items.map((e) => (
          <SpecimenCard key={e.slug} e={toCard(e)} />
        ))}
      </div>
      <div className="flex justify-between mt-16 border-t rule pt-6">
        <Link href={L(`/shelves/${prev.id}`)} className="hover:text-moss">
          ← {prev.numeral}. {prev.title}
        </Link>
        <Link href={L(`/shelves/${next.id}`)} className="hover:text-moss text-right">
          {next.numeral}. {next.title} →
        </Link>
      </div>
    </div>
  );
}
