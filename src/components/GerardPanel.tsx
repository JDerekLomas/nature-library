import Link from "next/link";
import type { GerardRef } from "@/lib/types";
import { gerardPage, gerardUrl } from "@/lib/codex";

const BOOKS: Record<string, string> = { FIRST: "First", SECOND: "Second", THIRD: "Third" };

/** Gerard's own words on this plant, in his 1597 spelling, beside the page they were printed on. */
export default function GerardPanel({ g, name }: { g: GerardRef; name: string }) {
  const rows: [string, string | undefined][] = [
    ["The vertues", g.vertues],
    ["The place", g.place],
    ["The time", g.time],
    ["The temperature", g.temperature],
    ["The names", g.names],
  ];
  return (
    <div className="grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-10">
      <a href={gerardUrl(g.page)} target="_blank" rel="noreferrer" className="block group self-start">
        <div className="bg-[#efe6cf] p-3 border rule group-hover:border-ink transition-colors">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={gerardPage(g.page)} alt={`Page ${g.printed ?? g.page} of Gerard's Herball, 1597: ${g.title}`} loading="lazy" className="w-full mix-blend-multiply" />
        </div>
        <p className="label text-ink-2 mt-2 !text-[0.6rem]">
          {BOOKS[g.book] ?? g.book} Booke · Chap. {g.chap}
          {g.printed ? ` · p. ${g.printed}` : ""} · read the page →
        </p>
      </a>
      <div className="min-w-0">
        <p className="font-display text-[2rem] leading-tight">{g.title}.</p>
        <p className="text-sm text-ink-2 mt-1">
          John Gerard, <i>The Herball, or Generall Historie of Plantes</i>, London, 1597. What England&apos;s best-known herbal said of {name.toLowerCase()}, in
          its own spelling.
        </p>
        <dl className="mt-6 space-y-5">
          {rows
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="grid sm:grid-cols-[130px_1fr] gap-1 sm:gap-5">
                <dt className="label text-rust pt-1.5">{k}</dt>
                <dd className={`leading-relaxed ${k === "The vertues" ? "font-display text-[1.25rem] leading-[1.45]" : "text-ink-2"}`}>{v}</dd>
              </div>
            ))}
        </dl>
        <p className="mt-6 text-xs text-ink-2 border-l-2 border-ochre pl-3 max-w-[70ch]">
          Gerard wrote within Galenic humoral medicine, and his opinions, including about the peoples of the Americas and their crops, are those of 1590s London.
          His &ldquo;vertues&rdquo; are history, not advice. Transcription: Source Library (CC BY-SA 4.0).{" "}
          <Link href={`/herball/${g.id}`} className="link-ink">
            The whole chapter in the Herball Room
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
