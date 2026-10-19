import Link from "next/link";
import type { Metadata } from "next";
import { PLATES } from "@/lib/plates";
import { asLang, lp, LOCALE } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const t = dict(asLang((await params).lang)).rooms.plates;
  return { title: t.title, description: t.metaDesc };
}

const CATS = [
  { id: "", label: "Everything" },
  { id: "plants", label: "Herbals" },
  { id: "fungi", label: "Fungi" },
  { id: "birds", label: "Birds" },
  { id: "fish", label: "Fishes" },
  { id: "animals", label: "Beasts" },
];
const PER = 60;

export default async function PlatesPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ c?: string; q?: string; p?: string }> }) {
  const lang = asLang((await params).lang);
  const T = dict(lang);
  const t = T.rooms.plates;
  const L = (x: string) => lp(lang, x);
  const { c = "", q = "", p = "1" } = await searchParams;
  const page = Math.max(1, parseInt(p) || 1);
  const ql = q.toLowerCase();
  const filtered = PLATES.filter((x) => (!c || x.cat === c) && (!ql || x.desc.toLowerCase().includes(ql) || x.title.toLowerCase().includes(ql) || x.author.toLowerCase().includes(ql)));
  const items = filtered.slice((page - 1) * PER, page * PER);
  const pages = Math.ceil(filtered.length / PER);
  const qs = (o: Record<string, string | number>) => {
    const sp = new URLSearchParams({ ...(c && { c }), ...(q && { q }), ...Object.fromEntries(Object.entries(o).map(([k, v]) => [k, String(v)])) });
    return L(`/plates?${sp}`);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 pt-10">
      <p className="label text-ink-2">{t.door}</p>
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-none mt-2">{t.heading}</h1>
      <p className="mt-4 max-w-[66ch] text-lg text-ink-2 leading-relaxed">
        {t.intro(PLATES.length.toLocaleString(LOCALE[lang]))}{" "}
        <a href="https://sourcelibrary.org/gallery" className="link-ink">
          Source Library
        </a>
        {t.intro2}{" "}
        <Link href={L("/herball")} className="link-ink">
          {t.herballRoom}
        </Link>
        .
      </p>
      <div className="double-rule mt-8 pt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex flex-wrap gap-4 text-sm">
          {CATS.map((k) => (
            <Link key={k.id} href={L(`/plates?${new URLSearchParams({ ...(k.id && { c: k.id }), ...(q && { q }) })}`)} className={c === k.id ? "text-moss underline underline-offset-4" : "hover:text-moss"}>
              {t.cats[k.id] ?? k.label}
            </Link>
          ))}
        </div>
        <form action={L("/plates")} className="ml-auto flex border-b border-ink/60">
          {c && <input type="hidden" name="c" value={c} />}
          <input name="q" defaultValue={q} placeholder={t.placeholder} className="bg-transparent outline-none py-1 px-1 text-sm w-56" />
          <button className="label px-2">{t.find}</button>
        </form>
        <span className="label text-ink-2 w-full">{t.count(filtered.length.toLocaleString(LOCALE[lang]))} {t.descNote}</span>
      </div>
      <div className="mt-8 columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-6">
        {items.map((x) => (
          <a
            key={x.id}
            href={`https://sourcelibrary.org/book/${x.bookId}?page=${x.page}`}
            target="_blank"
            rel="noreferrer"
            className="group block break-inside-avoid mb-8"
          >
            <div className="bg-[#efe6cf] p-3 border rule group-hover:border-ink transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={x.th || x.img} alt={x.desc} loading="lazy" className="w-full mix-blend-multiply" style={x.ar ? { aspectRatio: String(x.ar) } : undefined} />
            </div>
            <p className="mt-2 text-sm leading-snug">{x.desc}</p>
            <p className="label text-ink-2 !text-[0.58rem] mt-1 line-clamp-2">
              {x.year ?? T.sheet.nd} · <i className="normal-case tracking-normal">{x.title}</i>
            </p>
          </a>
        ))}
      </div>
      {pages > 1 && (
        <div className="flex justify-between items-center border-t rule pt-6 mt-6">
          {page > 1 ? <Link href={qs({ p: page - 1 })} className="hover:text-moss">{t.earlier}</Link> : <span />}
          <span className="label text-ink-2">
            {T.common.page(page, pages)}
          </span>
          {page < pages ? <Link href={qs({ p: page + 1 })} className="hover:text-moss">{t.later}</Link> : <span />}
        </div>
      )}
    </div>
  );
}
