import Link from "next/link";
import type { Metadata } from "next";
import { colRoots, colChildren } from "@/lib/col";
import { asLang, lp, LOCALE } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export const revalidate = 604800;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const t = dict(asLang((await params).lang)).rooms.col;
  return { title: t.title, description: t.metaDesc };
}

export default async function ColIndex({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const T = dict(lang);
  const t = T.rooms.col;
  const L = (p: string) => lp(lang, p);
  const nf = (n?: number) => (n ?? 0).toLocaleString(LOCALE[lang]);
  const roots = await colRoots();
  const euk = roots.find((r) => r.name === "Eukaryota");
  const kingdoms = euk ? (await colChildren(euk.id, 0, 20)).items : [];
  const total = roots.reduce((n, r) => n + (r.count ?? 0), 0);
  const rows = [...kingdoms, ...roots.filter((r) => r.name !== "Eukaryota")].sort((a, b) => (b.count ?? 0) - (a.count ?? 0));
  return (
    <div className="mx-auto max-w-[1000px] px-4 sm:px-6 pt-10">
      <Link href={L("/catalogue")} className="label text-ink-2 hover:text-moss">{T.rooms.catalogue.back}</Link>
      <h1 className="font-display text-[clamp(2.4rem,5.5vw,4.2rem)] leading-none mt-4">{t.title}</h1>
      <p className="mt-4 text-lg text-ink-2 leading-relaxed max-w-[66ch]">{t.intro(nf(total))}</p>
      <ol className="double-rule mt-8">
        {rows.map((k, i) => (
          <li key={k.id} className="border-b rule">
            <Link href={L(`/col/${encodeURIComponent(k.id)}?stay=1`)} className="group grid grid-cols-[2.2rem_1fr_auto] items-baseline gap-3 py-3">
              <span className="font-mono text-xs text-ink-2">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-display text-2xl group-hover:text-moss">
                {T.rooms.catalogue.kingdoms[{ Animalia: 1, Plantae: 6, Fungi: 5, Chromista: 4, Protozoa: 7, Bacteria: 3, Archaea: 2, Viruses: 8 }[k.name] ?? 0] ?? k.name}{" "}
                <span className="latin text-base text-ink-2">{k.name}</span>
              </span>
              <span className="font-mono text-sm text-ink-2">{t.species(nf(k.count))}</span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-xs text-ink-2">{t.credit}</p>
    </div>
  );
}
