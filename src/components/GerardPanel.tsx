"use client";

import Link from "next/link";
import { useLang, useT } from "@/i18n/LangProvider";
import { lp } from "@/i18n/config";
import type { GerardRef } from "@/lib/types";
import { gerardPage, gerardUrl } from "@/lib/gerard-urls";


/** Gerard's own words on this plant, in his 1597 spelling, beside the page they were printed on. */
export default function GerardPanel({ g, name }: { g: GerardRef; name: string }) {
  const lang = useLang();
  const t = useT().widgets;
  const R = t.gerardRows;
  const rows: [string, string | undefined, boolean][] = [
    [R[0], g.vertues, true],
    [R[1], g.place, false],
    [R[2], g.time, false],
    [R[3], g.temperature, false],
    [R[4], g.names, false],
  ];
  return (
    <div className="grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] gap-10">
      <a href={gerardUrl(g.page)} target="_blank" rel="noreferrer" className="block group self-start">
        <div className="bg-[#efe6cf] p-3 border rule group-hover:border-ink transition-colors">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={gerardPage(g.page)} alt={t.gerardPageAlt(g.printed ?? g.page, g.title)} loading="lazy" className="w-full mix-blend-multiply" />
        </div>
        <p className="label text-ink-2 mt-2 !text-[0.6rem]">
          {t.gerardBooks[g.book] ?? g.book} {t.gerardBooke} · {t.gerardChap} {g.chap}
          {g.printed ? ` · p. ${g.printed}` : ""} · {t.readPage}
        </p>
      </a>
      <div className="min-w-0">
        <p className="font-display text-[2rem] leading-tight">{g.title}.</p>
        <p className="text-sm text-ink-2 mt-1">
          John Gerard, <i>The Herball, or Generall Historie of Plantes</i>, London, 1597. {t.gerardCaption(name)}
        </p>
        <dl className="mt-6 space-y-5">
          {rows
            .filter(([, v]) => v)
            .map(([k, v, big]) => (
              <div key={k} className="grid sm:grid-cols-[130px_1fr] gap-1 sm:gap-5">
                <dt className="label text-rust pt-1.5">{k}</dt>
                <dd className={`leading-relaxed ${big ? "font-display text-[1.25rem] leading-[1.45]" : "text-ink-2"}`}>{v}</dd>
              </div>
            ))}
        </dl>
        <p className="mt-6 text-xs text-ink-2 border-l-2 border-ochre pl-3 max-w-[70ch]">
          {t.gerardNote}{" "}
          <Link href={lp(lang, `/herball/${g.id}`)} className="link-ink">
            {t.gerardWhole}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
