"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useLang } from "@/i18n/LangProvider";
import { lp } from "@/i18n/config";

const T = {
  en: {
    kicker: "The stacks are out of reach",
    title: "A source did not answer.",
    body: "This page is assembled live from iNaturalist, GBIF and Wikipedia, and one of them did not respond just now. Nothing is lost; it usually answers again within a minute.",
    retry: "Try again",
    home: "Return to the entrance",
  },
  es: {
    kicker: "Los depósitos no responden",
    title: "Una fuente no ha contestado.",
    body: "Esta página se compone en directo a partir de iNaturalist, GBIF y Wikipedia, y una de ellas no ha respondido ahora mismo. No se ha perdido nada; suele volver a responder en un minuto.",
    retry: "Volver a intentarlo",
    home: "Volver a la entrada",
  },
};

export default function RoomError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const lang = useLang();
  const t = T[lang];
  useEffect(() => console.error(error), [error]);
  return (
    <div className="mx-auto max-w-[760px] px-4 sm:px-6 pt-20 pb-10">
      <p className="label text-ink-2">{t.kicker}</p>
      <h1 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-tight mt-2">{t.title}</h1>
      <p className="mt-4 text-lg text-ink-2 leading-relaxed">{t.body}</p>
      <div className="mt-8 flex gap-6 items-center">
        <button onClick={reset} className="border border-ink px-4 py-2 hover:bg-ink hover:text-paper">
          {t.retry}
        </button>
        <Link href={lp(lang, "/")} className="link-ink">
          {t.home}
        </Link>
      </div>
    </div>
  );
}
