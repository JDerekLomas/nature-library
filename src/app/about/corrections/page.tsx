import Link from "next/link";
import type { Metadata } from "next";
import { correctionLogs, makeResolver } from "@/lib/corrections";
import { CODEX } from "@/lib/codex";

export const metadata: Metadata = { title: "Corrections", description: "Every correction made when the codex was fact-checked, with its source." };

export default function Corrections() {
  const logs = correctionLogs().filter((l) => l.changes.length > 0);
  const total = logs.reduce((s, l) => s + l.changes.length, 0);
  const resolve = makeResolver(CODEX);
  return (
    <div className="mx-auto max-w-[1100px] px-4 sm:px-6 pt-10">
      <Link href="/about" className="label text-ink-2 hover:text-moss">← About</Link>
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.6rem)] leading-none mt-3">Corrections</h1>
      <p className="mt-5 max-w-[66ch] text-lg text-ink-2 leading-relaxed">
        A library should show its errata. After the codex was written, every one of its {CODEX.length} sheets was checked against primary references
        (IUCN, BirdLife, FishBase, the Reptile Database, EMA, Cochrane, museum and university pages, Wikipedia). {total} statements were corrected, softened
        or removed. Each is listed here with what it said, what it says now, and the source.
      </p>
      <p className="mt-4 max-w-[66ch] text-sm text-ink-2 border-l-2 border-ochre pl-4">
        Some claims were checked against standard references rather than a fresh search; the checkers recorded which. If you find an error, it belongs here
        too.
      </p>
      {logs.map((log) => (
        <section key={log.file} className="mt-12">
          <h2 className="font-display text-2xl border-b-[3px] border-double border-ink pb-2">{log.title.replace(/^Fact-check log:?\s*/i, "").replace("data/codex/", "")}</h2>
          {log.summary && <p className="label text-ink-2 mt-3">{log.summary}</p>}
          <ol className="mt-4 space-y-4">
            {log.changes.map((c, i) => (
              <li key={i} className="grid md:grid-cols-[220px_1fr] gap-x-6 gap-y-1 border-b rule pb-4" id={resolve(c.species)}>
                <div>
                  {resolve(c.species) ? (
                    <Link href={`/species/${resolve(c.species)}`} className="hover:text-moss">
                      {c.species}
                    </Link>
                  ) : (
                    <span className="latin">{c.species}</span>
                  )}
                  <p className="label text-ink-2 !text-[0.58rem] mt-0.5">{c.field}</p>
                </div>
                <div className="text-[0.95rem] leading-relaxed">
                  {c.was && (
                    <p className="text-ink-2">
                      <span className="label text-stamp mr-2">Was</span>
                      <span className="line-through decoration-stamp/40">{c.was}</span>
                    </p>
                  )}
                  {c.now && (
                    <p className="mt-1">
                      <span className="label text-moss mr-2">Now</span>
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
