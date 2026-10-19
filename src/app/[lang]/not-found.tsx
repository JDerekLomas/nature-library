"use client";

import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import { useLang } from "@/i18n/LangProvider";
import { lp } from "@/i18n/config";

const T = {
  en: { kicker: "Not on the shelves", title: "No volume stands here.", body: "The page may have moved, or the name may be spelt another way. Look it up:", home: "Return to the entrance", atlas: "Open the Atlas" },
  es: { kicker: "No está en los estantes", title: "Aquí no hay ningún volumen.", body: "Puede que la página se haya movido o que el nombre se escriba de otro modo. Búscalo:", home: "Volver a la entrada", atlas: "Abrir el Atlas" },
};

export default function NotFound() {
  const lang = useLang();
  const t = T[lang];
  return (
    <div className="mx-auto max-w-[760px] px-4 sm:px-6 pt-20 pb-10">
      <h1 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-tight mt-2">{t.title}</h1>
      <p className="mt-4 text-lg text-ink-2 leading-relaxed">{t.body}</p>
      <div className="mt-6">
        <SearchBox big />
      </div>
      <p className="mt-8 flex gap-6">
        <Link href={lp(lang, "/")} className="link-ink">{t.home}</Link>
        <Link href={lp(lang, "/atlas")} className="link-ink">{t.atlas}</Link>
      </p>
    </div>
  );
}
