import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GERARD, getEntry, gerardPage, gerardUrl, localize } from "@/lib/codex";
import { asLang, lp } from "@/i18n/config";
import { dict } from "@/i18n/dict";
import SpecimenCard from "@/components/SpecimenCard";
import { toCard } from "@/lib/cards";

export function generateStaticParams() {
  return GERARD.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = GERARD.find((x) => x.id === id);
  return c ? { title: `${c.title} — Gerard's Herball`, description: c.sections.vertues?.slice(0, 200) } : {};
}

const ORDER = ["intro", "kindes", "description", "place", "time", "names", "temperature", "vertues", "danger"] as const;

export default async function GerardChapterPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { id, lang: l } = await params;
  const lang = asLang(l);
  const t = dict(lang).rooms.herball;
  const L = (p: string) => lp(lang, p);
  const i = GERARD.findIndex((x) => x.id === id);
  if (i < 0) notFound();
  const c = GERARD[i];
  const e0 = c.codex ? getEntry(c.codex) : undefined;
  const e = e0 ? localize(e0, lang) : undefined;
  const prev = GERARD[i - 1];
  const next = GERARD[i + 1];

  return (
    <article className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-8">
      <div className="flex flex-wrap gap-x-5 label text-ink-2 border-b border-ink pb-2">
        <Link href={L("/herball")} className="text-ink hover:text-moss">{t.back}</Link>
        <span>Gerard, 1597</span>
        {t.englishNote && <span className="text-ochre">{t.englishNote}</span>}
        <span>{t.booke(c.book.charAt(0) + c.book.slice(1).toLowerCase())} · {t.chap} {c.chap}</span>
        {c.printed && <span>p. {c.printed}</span>}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] gap-12 mt-8">
        <div className="min-w-0">
          <h1 className="font-display text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.95]">{c.title}.</h1>
          <div className="mt-8 space-y-7 max-w-[70ch]">
            {ORDER.filter((k) => c.sections[k]).map((k) => (
              <section key={k}>
                {k !== "intro" && <h2 className="label text-rust mb-2">{t.labels[k]}.</h2>}
                <p className={`leading-[1.7] ${k === "vertues" ? "font-display text-[1.25rem] leading-[1.5]" : "text-[1.05rem]"}`}>{c.sections[k]}</p>
              </section>
            ))}
          </div>
          <p className="mt-10 text-xs text-ink-2 max-w-[70ch]">
            {t.note[0]}{" "}
            <a href={gerardUrl(c.page)} className="link-ink" target="_blank" rel="noreferrer">{t.note[1]}</a> {t.note[2]}
          </p>
        </div>
        <aside className="lg:sticky lg:top-24 self-start space-y-8">
          <a href={gerardUrl(c.page)} target="_blank" rel="noreferrer" className="block bg-[#efe6cf] p-3 border rule hover:border-ink">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={gerardPage(c.page)} alt={lang === "es" ? `Herball de Gerard, página ${c.printed ?? c.page}` : `Gerard's Herball, page ${c.printed ?? c.page}`} className="w-full mix-blend-multiply" />
          </a>
          {e && (
            <div>
              <p className="label text-ink-2 mb-3">{t.inCodexToday}</p>
              <div className="max-w-[220px]">
                <SpecimenCard e={toCard(e)} />
              </div>
            </div>
          )}
        </aside>
      </div>
      <div className="flex justify-between mt-16 border-t rule pt-6 gap-6">
        {prev ? <Link href={L(`/herball/${prev.id}`)} className="hover:text-moss">← {prev.title}</Link> : <span />}
        {next ? <Link href={L(`/herball/${next.id}`)} className="hover:text-moss text-right">{next.title} →</Link> : <span />}
      </div>
    </article>
  );
}
