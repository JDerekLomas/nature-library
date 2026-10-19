"use client";

import Link from "next/link";
import { useLang } from "@/i18n/LangProvider";
import { lp } from "@/i18n/config";
import type { CardData } from "@/lib/cards";
import { EDIBILITY, edibilityLabel } from "@/lib/shelves";

/** A codex entry as a small mounted specimen: photo, accession number, names. */
export default function SpecimenCard({ e, small = false }: { e: CardData; small?: boolean }) {
  const lang = useLang();
  const img = e.img;
  const ed = e.edibility ? EDIBILITY[e.edibility] : undefined;
  return (
    <Link href={lp(lang, `/species/${e.slug}`)} className="group block">
      <div className="relative bg-card p-2 border rule group-hover:border-ink transition-colors">
        <div className={`overflow-hidden bg-paper-3 ${small ? "aspect-square" : "aspect-[4/5]"}`}>
          {img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={e.common}
              loading="lazy"
              className="w-full h-full object-cover saturate-[.85] group-hover:saturate-100 group-hover:scale-[1.03] transition duration-500"
            />
          )}
        </div>
        {!small && ed && ed.step >= 3 && (
          <span className="absolute top-4 left-4 stamp bg-card/90" style={{ color: ed.tone }}>
            {edibilityLabel(lang, e.edibility!)}
          </span>
        )}
      </div>
      <div className="mt-2.5">
        {!small && <p className="label text-ink-2 !text-[0.58rem]">{e.nl} · {e.family}</p>}
        <p className={`${small ? "text-sm" : "text-[1.05rem]"} leading-tight mt-0.5 group-hover:text-moss`}>{e.common}</p>
        <p className={`latin text-ink-2 ${small ? "text-xs" : "text-sm"} leading-tight mt-0.5`}>{e.scientific}</p>
      </div>
    </Link>
  );
}
