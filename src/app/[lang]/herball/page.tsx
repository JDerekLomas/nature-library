import Link from "next/link";
import type { Metadata } from "next";
import { GERARD, getEntry, gerardPage, localize } from "@/lib/codex";
import { asLang, lp } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const t = dict(asLang((await params).lang)).rooms.herball;
  return { title: t.title, description: t.metaDesc };
}


export default async function HerballRoom({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ q?: string }> }) {
  const lang = asLang((await params).lang);
  const t = dict(lang).rooms.herball;
  const L = (p: string) => lp(lang, p);
  const q = ((await searchParams).q ?? "").toLowerCase().trim();
  const list = q
    ? GERARD.filter((c) => (c.title + " " + Object.values(c.sections).join(" ")).toLowerCase().includes(q))
    : GERARD;
  const books = ["FIRST", "SECOND", "THIRD"].map((b) => [b, list.filter((c) => c.book === b)] as const).filter(([, l]) => l.length);
  const linked = GERARD.filter((c) => c.codex).length;

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <p className="label text-ink-2">{t.kicker}</p>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 items-end">
        <div>
          <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-none mt-2">{t.title}</h1>
          <p className="mt-5 max-w-[66ch] text-lg leading-relaxed text-ink-2">{t.intro}</p>
        </div>
        <div className="text-sm text-ink-2 border-l border-ink pl-5">
          <p>{t.count(GERARD.length, linked)}</p>
        </div>
      </div>
      <form action={L("/herball")} className="double-rule mt-8 pt-4 flex gap-3 max-w-[560px]">
        <input name="q" defaultValue={q} placeholder={t.placeholder} className="flex-1 bg-transparent border-b border-ink/60 py-2 outline-none focus:border-moss font-display text-lg" />
        <button className="label px-3">{t.search}</button>
      </form>
      {q && <p className="label text-ink-2 mt-4">{t.mentions(list.length, q)}</p>}
      {books.map(([b, chs]) => (
        <section key={b} className="mt-12">
          <h2 className="font-display text-2xl border-b-[3px] border-double border-ink pb-2">{t.books[b]}</h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
            {chs.map((c) => {
              const e0 = c.codex ? getEntry(c.codex) : undefined;
              const e = e0 ? localize(e0, lang) : undefined;
              return (
                <li key={c.id} className="border-b rule">
                  <Link href={L(`/herball/${c.id}`)} className="group flex gap-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={gerardPage(c.page).replace(".jpg", "-thumb.jpg")} alt="" loading="lazy" className="w-11 h-16 object-cover object-top bg-paper-3 border rule shrink-0" />
                    <span className="min-w-0">
                      <span className="block font-display text-lg leading-tight group-hover:text-moss">{c.title}</span>
                      <span className="block label text-ink-2 !text-[0.56rem] mt-1">
                        {t.chap} {c.chap}
                        {c.printed ? ` · p. ${c.printed}` : ""}
                        {e ? ` · ${t.inCodex(e.common)}` : ""}
                      </span>
                      {c.sections.vertues && <span className="text-sm text-ink-2 mt-1 line-clamp-2">{c.sections.vertues}</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
