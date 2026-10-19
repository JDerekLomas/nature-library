"use client";

import { useState } from "react";
import type { Photo } from "@/lib/types";
import { useT } from "@/i18n/LangProvider";

export default function PhotoPlate({ photos, alt, nl }: { photos: Photo[]; alt: string; nl?: string }) {
  const t = useT().widgets;
  const [i, setI] = useState(0);
  if (!photos.length)
    return (
      <div className="mount aspect-[4/5] flex items-center justify-center">
        <span className="label text-ink-2">{t.noPhoto}</span>
      </div>
    );
  const p = photos[i];
  return (
    <figure>
      <div className="mount">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.url} alt={alt} className="w-full aspect-[4/5] object-cover bg-paper-3" />
        {nl && (
          <span className="absolute top-5 right-5 stamp text-paper bg-ink/40 border-paper/80 backdrop-blur-[1px]">{nl}</span>
        )}
      </div>
      <figcaption className="mt-3 text-xs text-ink-2 leading-snug">
        {t.plateOf(i + 1, photos.length)} {p.attribution} · {t.via} {p.source}
      </figcaption>
      {photos.length > 1 && (
        <div className="mt-3 grid grid-cols-6 gap-1.5">
          {photos.map((ph, k) => (
            <button
              key={ph.url}
              onClick={() => setI(k)}
              aria-label={t.photograph(k + 1)}
              className={`aspect-square overflow-hidden border ${k === i ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ph.square || ph.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </figure>
  );
}
