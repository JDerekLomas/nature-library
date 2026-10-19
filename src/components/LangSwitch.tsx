"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { switchLang, type Lang } from "@/i18n/config";
import { useLang } from "@/i18n/LangProvider";

/** EN · ES — keeps the visitor on the same page in the other language. */
export default function LangSwitch() {
  const lang = useLang();
  const path = usePathname() || "/";
  const q = typeof window !== "undefined" ? window.location.search : "";
  const opt = (l: Lang, label: string) =>
    l === lang ? (
      <span className="text-ink">{label}</span>
    ) : (
      <Link href={switchLang(path, l) + q} hrefLang={l} className="text-ink-2 hover:text-moss" lang={l}>
        {label}
      </Link>
    );
  return (
    <span className="label flex gap-1.5 shrink-0" aria-label="Language / Idioma">
      {opt("en", "EN")}
      <span className="text-ink-2/50">·</span>
      {opt("es", "ES")}
    </span>
  );
}
