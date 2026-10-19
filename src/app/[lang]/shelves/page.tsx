import Link from "next/link";
import type { Metadata } from "next";
import { shelvesFor } from "@/lib/shelves";
import { CODEX } from "@/lib/codex";
import { asLang, lp } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const t = dict(asLang((await params).lang)).rooms.shelves;
  return { title: t.title, description: t.metaDesc };
}

export default async function ShelvesPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const t = dict(lang).rooms.shelves;
  const onShelf = (id: string) => CODEX.filter((e) => e.shelves?.includes(id));
  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-none mt-2">{t.title}</h1>
      <p className="mt-4 max-w-[62ch] text-lg text-ink-2 leading-relaxed">{t.intro}</p>
      <ul className="double-rule mt-8">
        {shelvesFor(lang).map((s) => {
          const items = onShelf(s.id);
          return (
            <li key={s.id} className="border-b rule">
              <Link href={lp(lang, `/shelves/${s.id}`)} className="group grid md:grid-cols-[90px_minmax(0,1fr)_minmax(0,420px)] gap-x-8 gap-y-3 py-7 items-center">
                <span className="font-display text-4xl text-ochre">{s.numeral}</span>
                <span>
                  <span className="block font-display text-3xl leading-tight group-hover:text-moss">{s.title}</span>
                  <span className="block mt-2 text-ink-2 leading-relaxed max-w-[60ch]">{s.blurb}</span>
                  <span className="block mt-2 label text-ink-2">{t.volumes(items.length)}</span>
                </span>
                <span className="flex gap-1.5 md:justify-end min-w-0">
                  {items.slice(0, 5).map((e) => (
                    <span key={e.slug} className="flex-1 max-w-[72px] aspect-[72/92] bg-paper-3 overflow-hidden border rule">
                      {e.photos?.[0] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={e.photos[0].square || e.photos[0].url} alt="" loading="lazy" className="w-full h-full object-cover saturate-[.8] group-hover:saturate-100" />
                      )}
                    </span>
                  ))}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
