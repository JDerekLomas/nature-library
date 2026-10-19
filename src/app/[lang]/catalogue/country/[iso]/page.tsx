import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { speciesInCountry } from "@/lib/gbif";
import { COUNTRY_CODES, countryName, GROUPS } from "@/lib/countries";
import { asLang, lp, LOCALE } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export const revalidate = 604800;
const PER = 60;

export async function generateMetadata({ params }: { params: Promise<{ lang: string; iso: string }> }): Promise<Metadata> {
  const { lang, iso } = await params;
  const l = asLang(lang);
  return { title: dict(l).rooms.catalogue.countryTitle(countryName(iso.toUpperCase(), l)) };
}

export default async function CountryPage({ params, searchParams }: { params: Promise<{ lang: string; iso: string }>; searchParams: Promise<{ p?: string; g?: string }> }) {
  const pr = await params;
  const iso = pr.iso.toUpperCase();
  const lang = asLang(pr.lang);
  const t = dict(lang).rooms.catalogue;
  const L = (p: string) => lp(lang, p);
  const nf = (n: number) => n.toLocaleString(LOCALE[lang]);
  if (!COUNTRY_CODES.includes(iso)) notFound();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.p) || 1);
  const g = sp.g ? Number(sp.g) : undefined;
  const name = countryName(iso, lang);
  const { records, species, pageSize } = await speciesInCountry(iso, (page - 1) * PER, PER, g, lang === "es" ? "spa" : "eng");
  const qs = (o: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ g, p: page, ...o })) if (v !== undefined && String(v) !== "" && !(k === "p" && Number(v) === 1)) u.set(k, String(v));
    const s = u.toString();
    return L(`/catalogue/country/${iso.toLowerCase()}${s ? `?${s}` : ""}`);
  };

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <Link href={L("/catalogue")} className="label text-ink-2 hover:text-moss">{t.back}</Link>
      <h1 className="font-display text-[clamp(2.4rem,5.5vw,4.4rem)] leading-none mt-3">{t.lifeIn(name)}</h1>
      <p className="mt-4 max-w-[68ch] text-lg text-ink-2 leading-relaxed">{t.countryIntro(name, nf(records))}</p>
      <div className="double-rule mt-8 pt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link href={qs({ g: undefined, p: 1 })} className={!g ? "text-moss underline underline-offset-4" : "hover:text-moss"}>
          {t.allLife}
        </Link>
        {GROUPS.map((x) => (
          <Link key={x.key} href={qs({ g: x.key, p: 1 })} className={g === x.key ? "text-moss underline underline-offset-4" : "hover:text-moss"}>
            {t.groups[x.key] ?? x.label}
          </Link>
        ))}
      </div>
      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 mt-6" start={(page - 1) * PER + 1}>
        {species.map((s) => (
          <li key={s.key} className="border-b rule">
            <Link href={L(`/gbif/${s.key}`)} className="flex gap-3 py-2.5 group">
              <span className="font-mono text-xs text-ink-2 w-12 shrink-0 pt-1">{s.n}</span>
              <span className="min-w-0">
                <span className="block truncate group-hover:text-moss">{s.t!.vernacularName ?? <i>{s.t!.canonicalName}</i>}</span>
                <span className="block text-xs text-ink-2 truncate">
                  {s.t!.vernacularName && <i>{s.t!.canonicalName} · </i>}
                  {s.t!.family ?? s.t!.class} · {t.records(nf(s.records))}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      {species.length === 0 && <p className="mt-8 text-ink-2">{t.noMore}</p>}
      <div className="flex justify-between border-t rule pt-6 mt-6">
        {page > 1 ? <Link href={qs({ p: page - 1 })} className="hover:text-moss">{t.more}</Link> : <span />}
        <span className="label text-ink-2">{dict(lang).common.page(page)}</span>
        {pageSize === PER ? <Link href={qs({ p: page + 1 })} className="hover:text-moss">{t.less}</Link> : <span />}
      </div>
    </div>
  );
}
