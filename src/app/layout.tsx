import type { Metadata } from "next";
import { IM_Fell_English, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import SearchBox from "@/components/SearchBox";
import "./globals.css";

const fell = IM_Fell_English({ variable: "--font-fell", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });
const serif = Source_Serif_4({ variable: "--font-source-serif", subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"] });
const mono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://nature-library.vercel.app"),
  twitter: { card: "summary_large_image" },
  title: { default: "The Nature Library", template: "%s · The Nature Library" },
  description:
    "A library of living things: every plant, animal and fungus on Earth, mapped on the globe, read through the old herbals, and shelved by what they can do.",
};

const DOORS = [
  { href: "/atlas", label: "Atlas", sub: "by place" },
  { href: "/wheel", label: "Wheel", sub: "by kinship" },
  { href: "/catalogue", label: "Catalogue", sub: "all life" },
  { href: "/shelves", label: "Shelves", sub: "by use" },
  { href: "/bestiary", label: "Bestiary", sub: "animals" },
  { href: "/plates", label: "Plates", sub: "old books" },
  { href: "/identify", label: "Identify", sub: "by sight" },
  { href: "/grow", label: "Garden", sub: "by climate" },
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fell.variable} ${serif.variable} ${mono.variable} antialiased`}>
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 border-b rule bg-paper/92 backdrop-blur-sm">
          <div className="mx-auto flex max-w-[1320px] items-center gap-4 px-4 sm:px-6 py-3">
            <Link href="/" className="group flex items-baseline gap-2 shrink-0">
              <Seal />
              <span className="font-display text-[1.35rem] leading-none tracking-tight">The Nature Library</span>
            </Link>
            <nav className="hidden xl:flex items-stretch ml-4">
              {DOORS.map((d) => (
                <Link key={d.href} href={d.href} className="px-2.5 py-1 border-l rule first:border-l-0 hover:text-moss group">
                  <span className="block text-[0.95rem] leading-tight">{d.label}</span>
                  <span className="block label text-ink-2/70 !text-[0.58rem] group-hover:text-moss">{d.sub}</span>
                </Link>
              ))}
            </nav>
            <div className="ml-auto w-full max-w-[280px] hidden sm:block">
              <SearchBox />
            </div>
          </div>
          <nav className="xl:hidden flex scroll-x border-t rule px-2">
            {DOORS.map((d) => (
              <Link key={d.href} href={d.href} className="px-3 py-2 text-sm shrink-0">
                {d.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mt-24 border-t-[3px] border-double border-ink">
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] text-sm">
            <div>
              <p className="font-display text-2xl">The Nature Library</p>
              <p className="mt-3 text-ink-2 max-w-sm leading-relaxed">
                A sister to the <a className="link-ink" href="https://sourcelibrary.org">Source Library</a>. Living records from
                naturalists around the world, set beside the herbals and bestiaries that first tried to name them.
              </p>
            </div>
            <FooterCol title="Doors" links={DOORS.map((d) => [d.href, `${d.label} — ${d.sub}`])} />
            <FooterCol
              title="Sources"
              links={[
                ["https://www.inaturalist.org", "iNaturalist"],
                ["https://www.gbif.org", "GBIF"],
                ["https://www.wikipedia.org", "Wikipedia & Wikimedia"],
                ["https://sourcelibrary.org", "Source Library"],
                ["https://archive.org", "Internet Archive"],
                ["https://www.biodiversitylibrary.org", "Biodiversity Heritage Library"],
              ]}
            />
            <FooterCol title="Library" links={[["/aviary", "The Aviary"], ["/catalogue", "Catalogue of All Life"], ["/herball", "Gerard's Herball, 1597"], ["/exhibitions", "Exhibitions"], ["/shelves", "All shelves"], ["/about", "About & licences"]]} />
          </div>
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pb-8 label text-ink-2/70">
            Nothing here is medical advice. Never eat a wild plant or fungus on the strength of a website or a photo match.
          </div>
        </footer>
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

function Seal() {
  // a small engraved globe-and-leaf seal
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden className="text-moss translate-y-[5px]">
      <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="16" cy="16" rx="6.5" ry="14.5" fill="none" stroke="currentColor" strokeWidth=".8" />
      <path d="M1.5 16h29M4 9h24M4 23h24" stroke="currentColor" strokeWidth=".6" />
      <path d="M16 27c0-7 3-12 9-14-1 7-4 11-9 14z" fill="currentColor" opacity=".9" />
    </svg>
  );
}
