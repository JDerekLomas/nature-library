import Link from "next/link";
import type { Metadata } from "next";
import { GERARD, getEntry, gerardPage } from "@/lib/codex";

export const metadata: Metadata = {
  title: "The Herball Room",
  description: "John Gerard's Herball of 1597, chapter by chapter, with his own words on the vertues, places and names of plants.",
};

const BOOK_TITLES: Record<string, string> = {
  FIRST: "The First Booke: grasses, rushes, corn, flags, bulbous and onion-like plants",
  SECOND: "The Second Booke: herbs for meat, medicine and sweet-smelling use",
  THIRD: "The Third Booke: trees, shrubs, fruits, gums and mushrooms",
};

export default async function HerballRoom({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").toLowerCase().trim();
  const list = q
    ? GERARD.filter((c) => (c.title + " " + Object.values(c.sections).join(" ")).toLowerCase().includes(q))
    : GERARD;
  const books = ["FIRST", "SECOND", "THIRD"].map((b) => [b, list.filter((c) => c.book === b)] as const).filter(([, l]) => l.length);
  const linked = GERARD.filter((c) => c.codex).length;

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <p className="label text-ink-2">The old books · Gerard, 1597</p>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-10 items-end">
        <div>
          <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-none mt-2">The Herball Room</h1>
          <p className="mt-5 max-w-[66ch] text-lg leading-relaxed text-ink-2">
            John Gerard&apos;s <i>Herball, or Generall Historie of Plantes</i>{" "}(London, 1597) was the largest herbal yet printed in English: some 1,400 pages and
            more than 1,800 woodcuts, built on Rembert Dodoens&apos; Latin herbal and on Gerard&apos;s own garden in Holborn. Here it is chapter by chapter, from the Source
            Library&apos;s transcription, in Gerard&apos;s spelling: what each plant looks like, where it grows, when it flowers, what it is called in a dozen languages, and
            its &ldquo;vertues&rdquo;.
          </p>
        </div>
        <div className="text-sm text-ink-2 border-l border-ink pl-5">
          <p>
            <b className="font-display text-3xl text-ink font-normal">{GERARD.length}</b> chapters transcribed so far, <b className="text-ink">{linked}</b> linked to codex
            sheets. The Source Library is still transcribing the rest of the book; chapters appear here as they do.
          </p>
        </div>
      </div>
      <form action="/herball" className="double-rule mt-8 pt-4 flex gap-3 max-w-[560px]">
        <input name="q" defaultValue={q} placeholder="Search Gerard: “garlick”, “melancholie”, “Virginia”…" className="flex-1 bg-transparent border-b border-ink/60 py-2 outline-none focus:border-moss font-display text-lg" />
        <button className="label px-3">Search</button>
      </form>
      {q && <p className="label text-ink-2 mt-4">{list.length} chapters mention “{q}”</p>}
      {books.map(([b, chs]) => (
        <section key={b} className="mt-12">
          <h2 className="font-display text-2xl border-b-[3px] border-double border-ink pb-2">{BOOK_TITLES[b]}</h2>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8">
            {chs.map((c) => {
              const e = c.codex ? getEntry(c.codex) : undefined;
              return (
                <li key={c.id} className="border-b rule">
                  <Link href={`/herball/${c.id}`} className="group flex gap-4 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={gerardPage(c.page).replace(".jpg", "-thumb.jpg")} alt="" loading="lazy" className="w-11 h-16 object-cover object-top bg-paper-3 border rule shrink-0" />
                    <span className="min-w-0">
                      <span className="block font-display text-lg leading-tight group-hover:text-moss">{c.title}</span>
                      <span className="block label text-ink-2 !text-[0.56rem] mt-1">
                        Chap. {c.chap}
                        {c.printed ? ` · p. ${c.printed}` : ""}
                        {e ? ` · ${e.common} in the codex` : ""}
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
