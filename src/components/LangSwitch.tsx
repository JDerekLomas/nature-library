"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { switchLang, type Lang } from "@/i18n/config";
import { useLang } from "@/i18n/LangProvider";

/** EN · ES — keeps the visitor on the same page in the other language. */
export default function LangSwitch() {
  const lang = useLang();
  const path = usePathname() || "/";
  const router = useRouter();
  const opt = (l: Lang, label: string) =>
    l === lang ? (
      <span className="text-ink">{label}</span>
    ) : (
      <Link
        href={switchLang(path, l)}
        hrefLang={l}
        className="text-ink-2 hover:text-moss"
        lang={l}
        onClick={(e) => {
          // carry the current query (Atlas place, filters, search) across, read at click time
          if (!window.location.search || e.metaKey || e.ctrlKey) return;
          e.preventDefault();
          router.push(switchLang(path, l) + window.location.search);
        }}
      >
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
