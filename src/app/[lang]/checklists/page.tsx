import Link from "next/link";
import type { Metadata } from "next";
import { GROUPS, loadGroup, groupTitle, GROUP_LATIN } from "@/lib/checklists";
import { BIRD_COUNT } from "@/lib/birds";
import { asLang, lp, LOCALE } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const t = dict(asLang((await params).lang)).rooms.checklists;
  return { title: t.title, description: t.metaDesc };
}

export default async function Checklists({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const t = dict(lang).rooms.checklists;
  const L = (p: string) => lp(lang, p);
  const nf = (n: number) => n.toLocaleString(LOCALE[lang]);
  const rows = [
    ...GROUPS.slice(0, 1).map((g) => ({ id: g, href: `/checklists/${g}`, title: groupTitle(g, lang), latin: GROUP_LATIN[g], data: loadGroup(g) })),
    { id: "birds", href: "/aviary/checklist", title: lang === "es" ? "Aves" : "Birds", latin: "Aves", data: { species: { length: BIRD_COUNT }, families: { length: 251 } } },
    ...GROUPS.slice(1).map((g) => ({ id: g, href: `/checklists/${g}`, title: groupTitle(g, lang), latin: GROUP_LATIN[g], data: loadGroup(g) })),
  ].filter((r) => r.data);
  const total = rows.reduce((n, r) => n + r.data!.species.length, 0);
  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 pt-10">
      <p className="label text-ink-2">{t.kicker}</p>
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-none mt-2">{t.title}</h1>
      <p className="mt-4 max-w-[68ch] text-lg text-ink-2 leading-relaxed">{t.intro}</p>
      <p className="mt-3 label text-ink-2">{t.species(nf(total))}</p>
      <ol className="double-rule mt-8">
        {rows.map((r) => (
          <li key={r.id} className="border-b rule">
            <Link href={L(r.href)} className="group grid sm:grid-cols-[1fr_auto] gap-x-6 gap-y-1 py-5">
              <span>
                <span className="font-display text-3xl group-hover:text-moss">{r.title}</span> <span className="latin text-ink-2">{r.latin}</span>
                <span className="block text-ink-2 mt-1">{t.blurbs[r.id]}</span>
              </span>
              <span className="font-mono text-sm text-ink-2 sm:text-right">
                {t.species(nf(r.data!.species.length))}
                <span className="block">{t.families(r.data!.families.length)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
