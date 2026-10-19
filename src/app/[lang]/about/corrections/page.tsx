import Link from "next/link";
import type { Metadata } from "next";
import { correctionLogs, makeResolver } from "@/lib/corrections";
import { CODEX, localize } from "@/lib/codex";
import { asLang, lp } from "@/i18n/config";
import { dict } from "@/i18n/dict";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const t = dict(asLang((await params).lang)).rooms.corrections;
  return { title: t.title, description: t.metaDesc };
}

export default async function Corrections({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const t = dict(lang).rooms.corrections;
  const L = (p: string) => lp(lang, p);
  const nameOf = new Map(CODEX.map((e) => [e.slug, localize(e, lang).common]));
  const logs = correctionLogs().filter((l) => l.changes.length > 0);
  const total = logs.reduce((s, l) => s + l.changes.length, 0);
  const resolve = makeResolver(CODEX);
  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 pt-10">
      <Link href={L("/about")} className="label text-ink-2 hover:text-moss">{t.back}</Link>
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-none mt-3">{t.title}</h1>
      <p className="mt-5 max-w-[66ch] text-lg text-ink-2 leading-relaxed">{t.intro(CODEX.length, total)}</p>
      <p className="mt-4 max-w-[66ch] text-sm text-ink-2 border-l-2 border-ochre pl-4">{t.note} {t.langNote}</p>
      {logs.map((log) => (
        <section key={log.file} className="mt-12">
          <h2 className="font-display text-2xl border-b-[3px] border-double border-ink pb-2">{log.title.replace(/^Fact-check log:?\s*/i, "").replace("data/codex/", "")}</h2>
          {log.summary && <p className="label text-ink-2 mt-3">{log.summary}</p>}
          <ol className="mt-4 space-y-4">
            {log.changes.map((c, i) => (
              <li key={i} className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-x-6 gap-y-1 border-b rule pb-4" id={resolve(c.species)}>
                <div>
                  {resolve(c.species) ? (
                    <Link href={L(`/species/${resolve(c.species)}`)} className="hover:text-moss">
                      {lang === "es" ? nameOf.get(resolve(c.species)!) ?? c.species : c.species}
                    </Link>
                  ) : (
                    <span className="latin">{c.species}</span>
                  )}
                  <p className="label text-ink-2 !text-[0.58rem] mt-0.5">{c.field}</p>
                </div>
                <div className="text-[0.95rem] leading-relaxed">
                  {c.was && (
                    <p className="text-ink-2">
                      <span className="label text-stamp mr-2">{t.was}</span>
                      <span className="line-through decoration-stamp/40">{c.was}</span>
                    </p>
                  )}
                  {c.now && (
                    <p className="mt-1">
                      <span className="label text-moss mr-2">{t.now}</span>
                      {c.now}
                    </p>
                  )}
                  {c.sources.length > 0 && (
                    <p className="mt-1 text-xs">
                      {c.sources.map((u, k) => (
                        <a key={k} href={u} target="_blank" rel="noreferrer" className="link-ink text-ink-2 mr-3 break-all">
                          {u.replace(/^https?:\/\/(www\.)?/, "").slice(0, 70)}
                        </a>
                      ))}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
