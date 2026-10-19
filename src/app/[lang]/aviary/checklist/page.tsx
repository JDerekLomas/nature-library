import Link from "next/link";
import type { Metadata } from "next";
import { birdFamilies, BIRD_COUNT, BIRDS_FETCHED } from "@/lib/birds";
import { asLang, lp, LOCALE } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const t = dict(asLang((await params).lang)).rooms.checklist;
  return { title: t.title, description: t.metaDesc };
}

export default async function Checklist({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const T = dict(lang).rooms;
  const t = T.checklist;
  const L = (p: string) => lp(lang, p);
  const fams = birdFamilies(lang);
  const orders = [...new Set(fams.map((f) => f.order))];
  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <Link href={L("/aviary")} className="label text-ink-2 hover:text-moss">
        {t.aviary}
      </Link>
      <p className="label text-ink-2 mt-4">{t.kicker}</p>
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-none mt-2">{t.title}</h1>
      <p className="mt-4 max-w-[66ch] text-lg text-ink-2 leading-relaxed">{t.intro(BIRD_COUNT.toLocaleString(LOCALE[lang]), fams.length)}</p>
      <div className="double-rule mt-8">
        {orders.map((o) => (
          <section key={o} className="border-b rule py-6 grid md:grid-cols-[260px_1fr] gap-x-8 gap-y-3">
            <h2 className="font-display text-2xl leading-tight">
              {T.aviary.orders[o] ?? o}
              <span className="block latin text-base text-ink-2">{o}</span>
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
              {fams
                .filter((f) => f.order === o)
                .map((f) => (
                  <li key={f.sci}>
                    <Link href={L(`/aviary/checklist/${f.slug}`)} className="group flex justify-between gap-3 py-1.5 border-b rule">
                      <span className="group-hover:text-moss">
                        {f.name === f.sci ? <span className="latin">{f.sci}</span> : <>{f.name} <span className="latin text-ink-2 text-sm">{f.sci}</span></>}
                      </span>
                      <span className="text-ink-2 text-sm tabular-nums shrink-0">{f.count}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="mt-10 text-xs text-ink-2">{t.source(BIRDS_FETCHED)}</p>
    </div>
  );
}
