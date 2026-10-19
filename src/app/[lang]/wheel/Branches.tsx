"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang, useT } from "@/i18n/LangProvider";
import { lp, LOCALE } from "@/i18n/config";

interface Kid {
  id: number;
  name: string;
  rank: string;
  rank_level: number;
  preferred_common_name?: string;
  observations_count: number;
}
interface Extra {
  colId: string | null;
  col: { id: string; name: string; rank: string; count?: number }[];
  checklist: { group: string; sci: string; en: string }[];
}

const API = "https://api.inaturalist.org/v1";
const PER = 200;
const SPECIES = ["species", "subspecies", "variety", "form", "hybrid"];

/** Under the wheel: every branch one step down, so nothing is hidden by the 18 arcs the wheel has room for,
 *  then what the Catalogue of Life and the world checklists hold there that iNaturalist does not. */
export default function Branches({ focus, target, go }: { focus: { id: number; name: string; rank: string; preferred_common_name?: string }; target?: string; go: (id: number) => void }) {
  const lang = useLang();
  const T = useT();
  const t = T.rooms.wheel;
  const R = T.common.ranks;
  const nf = (n: number) => n.toLocaleString(LOCALE[lang]);
  const L = (p: string) => lp(lang, p);
  const [kids, setKids] = useState<Kid[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [extra, setExtra] = useState<Extra | null>(null);

  // the first page as soon as the focus changes, further pages on request
  useEffect(() => {
    setKids(null);
    setPage(1);
    setExtra(null);
  }, [focus.id]);
  useEffect(() => {
    let dead = false;
    // everything at the next main rank down (as the rings do), or the direct children where there is none
    const scope = target ? `taxon_id=${focus.id}&rank=${target}` : `parent_id=${focus.id}`;
    fetch(`${API}/taxa?${scope}&is_active=true&per_page=${PER}&page=${page}&order_by=observations_count&order=desc&locale=${lang}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        if (dead) return;
        setTotal(j.total_results ?? 0);
        setKids((prev) => (page === 1 ? j.results : [...(prev ?? []), ...j.results]));
      })
      .catch(() => !dead && setKids((prev) => prev ?? []));
    return () => {
      dead = true;
    };
  }, [focus.id, page, lang, target]);
  // what the current Catalogue of Life and the checklists know under this branch
  useEffect(() => {
    if (focus.rank === "stateofmatter" || SPECIES.includes(focus.rank)) return;
    let dead = false;
    fetch(`/api/branches?name=${encodeURIComponent(focus.name)}&rank=${encodeURIComponent(focus.rank)}${target ? `&target=${target}` : ""}`)
      .then((r) => r.json())
      .then((j) => !dead && setExtra(j))
      .catch(() => {});
    return () => {
      dead = true;
    };
  }, [focus.id, focus.name, focus.rank, target]);

  if (SPECIES.includes(focus.rank)) return null;
  const complete = kids !== null && kids.length >= total;
  const known = new Set((kids ?? []).map((k) => k.name.toLowerCase()));
  const missing = complete && extra ? extra.col.filter((c) => !known.has(c.name.toLowerCase())) : [];
  const listed = extra?.checklist.filter((c) => !known.has(c.sci.toLowerCase())) ?? [];
  const label = focus.preferred_common_name || focus.name;
  const rankOf = (r: string) => (R[r] ?? r).toLowerCase();
  const short = (n: string) => (focus.rank === "genus" && n.startsWith(`${focus.name} `) ? `${focus.name.charAt(0)}. ${n.slice(focus.name.length + 1)}` : n);

  return (
    <section id="branches" className="mt-14 scroll-mt-24">
      <div className="flex flex-wrap items-baseline justify-between gap-3 border-b-[3px] border-double border-ink pb-2">
        <h2 className="font-display text-3xl">{t.every(label, kids === null ? "…" : nf(total))}</h2>
      </div>
      <p className="mt-2 text-sm text-ink-2 max-w-[80ch]">{t.everyNote}</p>
      {kids === null ? (
        <p className="label text-ink-2 mt-5">{t.loading2}</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 mt-4">
          {kids.map((k) => {
            const sp = SPECIES.includes(k.rank);
            // two lines, nothing cut: the name, then what it is called and how often it has been seen
            const inner = (
              <span className="block min-w-0">
                <span className="block leading-snug">{k.rank_level <= 20 ? <i>{short(k.name)}</i> : k.name}</span>
                <span className="block text-xs text-ink-2 leading-snug mt-0.5">
                  {k.preferred_common_name && <>{k.preferred_common_name} · </>}
                  <span className="font-mono">{rankOf(k.rank)} · {k.observations_count ? nf(k.observations_count) : t.notSeen}</span>
                </span>
              </span>
            );
            return (
              <li key={k.id} className="border-b rule min-w-0">
                {sp ? (
                  <Link href={L(`/taxon/${k.id}`)} className="block py-2 hover:text-moss">{inner}</Link>
                ) : (
                  <button onClick={() => { go(k.id); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="w-full text-left block py-2 hover:text-moss">{inner}</button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {kids !== null && !complete && (
        <button onClick={() => setPage((p) => p + 1)} className="mt-5 border border-ink px-4 py-2 text-sm hover:bg-ink hover:text-paper">
          {t.loadMore(nf(Math.min(PER, total - kids.length)))}
        </button>
      )}
      {missing.length > 0 && (
        <div className="mt-10">
          <h3 className="font-display text-2xl border-b rule pb-1.5">{t.alsoCol(nf(missing.length))}</h3>
          <p className="mt-2 text-sm text-ink-2">{t.alsoColNote}</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 mt-3">
            {missing.map((c) => (
              <li key={c.id} className="border-b rule min-w-0">
                <Link href={L(`/col/${encodeURIComponent(c.id)}${SPECIES.includes(c.rank) ? "" : "?stay=1"}`)} className="block py-2 hover:text-moss">
                  <span className="block leading-snug">{SPECIES.includes(c.rank) || c.rank === "genus" ? <i>{short(c.name)}</i> : c.name}</span>
                  <span className="block text-xs text-ink-2 font-mono mt-0.5">{rankOf(c.rank)}{c.count ? ` · ${nf(c.count)}` : ""} · Catalogue of Life</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!complete && kids !== null && extra?.colId && total > PER * 5 && (
        <p className="mt-6 text-sm">
          <Link href={L(`/col/${encodeURIComponent(extra.colId)}?stay=1`)} className="link-ink text-moss">{t.tooMany(nf(total))}</Link>
        </p>
      )}
      {listed.length > 0 && (
        <div className="mt-10">
          <h3 className="font-display text-2xl border-b rule pb-1.5">{t.alsoChecklist(nf(listed.length))}</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 mt-3">
            {listed.map((c) => (
              <li key={c.sci} className="border-b rule">
                <Link href={L(`/checklists/${c.group}/s/${encodeURIComponent(c.sci.replace(/ /g, "_"))}`)} className="block py-2 hover:text-moss">
                  <i>{short(c.sci)}</i>
                  {c.en && <span className="text-ink-2"> · {c.en}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
