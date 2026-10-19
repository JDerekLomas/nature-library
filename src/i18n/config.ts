export const LANGS = ["en", "es"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

export const isLang = (x: string | undefined): x is Lang => !!x && (LANGS as readonly string[]).includes(x);
export const asLang = (x: string | undefined): Lang => (isLang(x) ? x : DEFAULT_LANG);

/** Locale-aware path: English stays unprefixed (so old links keep working), Spanish lives under /es. */
export function lp(lang: Lang, path: string) {
  if (/^https?:/.test(path) || path.startsWith("#")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return lang === "en" ? p : p === "/" ? `/${lang}` : `/${lang}${p}`;
}

/** The same page in another language. */
export function switchLang(pathname: string, to: Lang) {
  const bare = pathname.replace(/^\/(en|es)(?=\/|$)/, "") || "/";
  return lp(to, bare);
}

export const LOCALE: Record<Lang, string> = { en: "en-GB", es: "es-ES" };
export const INAT_LOCALE: Record<Lang, string> = { en: "en", es: "es" };
export const WIKI_HOST: Record<Lang, string> = { en: "en.wikipedia.org", es: "es.wikipedia.org" };
