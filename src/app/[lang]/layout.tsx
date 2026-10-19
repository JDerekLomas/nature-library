import type { Metadata } from "next";
import { IM_Fell_English, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import SearchBox from "@/components/SearchBox";
import LangSwitch from "@/components/LangSwitch";
import Mark from "@/components/Mark";
import { LangProvider } from "@/i18n/LangProvider";
import { LANGS, isLang, lp, type Lang } from "@/i18n/config";
import { dict } from "@/i18n/dict";
import "../globals.css";

const fell = IM_Fell_English({ variable: "--font-fell", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const serif = Source_Serif_4({ variable: "--font-source-serif", subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"] });
const mono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const t = dict(isLang(lang) ? lang : "en").common;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://nature-library.vercel.app"),
    twitter: { card: "summary_large_image" },
    title: { default: t.siteName, template: `%s · ${t.siteName}` },
    description: t.siteDescription,
  };
}

export default async function RootLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ lang: string }> }>) {
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const t = dict(lang).common;
  const L = (p: string) => lp(lang, p);
  return (
    <html lang={lang} className={`${fell.variable} ${serif.variable} ${mono.variable} antialiased`}>
      <body className="min-h-screen flex flex-col">
        <LangProvider lang={lang}>
          <header className="sticky top-0 z-50 border-b rule bg-paper/92 backdrop-blur-sm">
            <div className="mx-auto flex max-w-[1320px] items-center gap-4 px-4 sm:px-6 py-3">
              <Link href={L("/")} className="group flex items-center gap-2.5 shrink-0" aria-label={t.siteName}>
                <Mark size={38} className="text-moss shrink-0 w-[30px] h-[30px] sm:w-[38px] sm:h-[38px] transition-colors group-hover:text-rust" />
                <span className="flex flex-col">
                  <span className="font-display text-[1.05rem] sm:text-[1.35rem] leading-none tracking-tight">{t.siteName}</span>
                  <span className="label text-ink-2 !text-[0.56rem] mt-1 tracking-[0.2em] hidden sm:block">{t.imprint}</span>
                </span>
              </Link>
              <nav className="hidden xl:flex items-stretch ml-4">
                {t.nav.map((d) => (
                  <Link key={d.href} href={L(d.href)} className="px-2.5 py-1 border-l rule first:border-l-0 hover:text-moss group">
                    <span className="block text-[0.95rem] leading-tight">{d.label}</span>
                    <span className="block label text-ink-2/70 !text-[0.58rem] group-hover:text-moss">{d.sub}</span>
                  </Link>
                ))}
              </nav>
              {/* the full search box where there is room for it beside ten rooms; a search button elsewhere */}
              <div className="ml-auto w-full max-w-[260px] hidden 2xl:block">
                <SearchBox />
              </div>
              <Link href={L("/search")} aria-label={t.search.title} title={t.search.title} className="ml-auto 2xl:hidden p-2 -m-2 text-ink-2 hover:text-moss">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <path d="M15.5 15.5 21 21" />
                </svg>
              </Link>
              <span className="2xl:ml-0">
                <LangSwitch />
              </span>
            </div>
            <nav className="xl:hidden flex scroll-x border-t rule px-2">
              {t.nav.map((d) => (
                <Link key={d.href} href={L(d.href)} className="px-3 py-2 text-sm shrink-0">
                  {d.label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="mt-24 border-t-[3px] border-double border-ink">
            <div className="mx-auto max-w-[1320px] px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] text-sm">
              <div>
                <div className="flex items-center gap-3">
                  <Mark size={52} className="text-moss shrink-0" />
                  <span>
                    <span className="block font-display text-2xl leading-none">{t.siteName}</span>
                    <span className="block label text-ink-2 !text-[0.58rem] mt-1.5 tracking-[0.2em]">{t.imprint}</span>
                  </span>
                </div>
                <p className="mt-3 text-ink-2 max-w-sm leading-relaxed">
                  {t.footerAbout[0]}{" "}
                  <a className="link-ink" href="https://sourcelibrary.org">
                    {t.footerAbout[1]}
                  </a>
                  {t.footerAbout[2]}
                </p>
              </div>
              <FooterCol title={t.footerDoors} links={t.nav.map((d) => [L(d.href), `${d.label} — ${d.sub}`])} />
              <FooterCol
                title={t.footerSources}
                links={[
                  ["https://www.inaturalist.org", "iNaturalist"],
                  ["https://www.gbif.org", "GBIF"],
                  ["https://www.wikipedia.org", "Wikipedia & Wikimedia"],
                  ["https://sourcelibrary.org", "Source Library"],
                  ["https://archive.org", "Internet Archive"],
                  ["https://www.biodiversitylibrary.org", "Biodiversity Heritage Library"],
                ]}
              />
              <FooterCol title={t.footerLibrary} links={t.footerLinks.map(([h, l]) => [L(h), l])} />
            </div>
            <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pb-8 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3 border-t rule pt-5">
              <p className="text-sm flex flex-wrap items-center gap-x-2.5 gap-y-2">
                <span>{t.poweredBy[0]}</span>
                <a href="https://sourcelibrary.org" target="_blank" rel="noreferrer" className="inline-flex opacity-90 hover:opacity-100 transition-opacity" aria-label="Source Library">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/source-library.svg" alt="Source Library" width={143} height={22} className="h-[22px] w-auto" />
                </a>
                <span>{t.poweredBy[1]}</span>
                <a className="link-ink" href="https://wisdom-frontiers.com/" target="_blank" rel="noreferrer">
                  Wisdom Frontiers
                </a>
              </p>
              <p className="label text-ink-2/70 sm:text-right sm:max-w-[60ch]">{t.disclaimer}</p>
            </div>
          </footer>
        </LangProvider>
      </body>
    </html>
  );
}

function FooterCol({ title, links }: { title: string; links: string[][] }) {
  return (
    <div>
      <p className="label text-ink-2 mb-3">{title}</p>
      <ul className="space-y-1.5">
        {links.map(([href, label]) => (
          <li key={href}>
            <Link href={href} className="hover:text-moss">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

