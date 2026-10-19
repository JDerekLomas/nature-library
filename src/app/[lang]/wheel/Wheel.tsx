"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { arc as d3arc } from "d3-shape";
import { useLang, useT } from "@/i18n/LangProvider";
import { lp, LOCALE } from "@/i18n/config";
import { hierarchy, partition, type HierarchyRectangularNode } from "d3-hierarchy";
import Branches from "./Branches";

interface T {
  id: number;
  name: string;
  rank: string;
  rank_level: number;
  preferred_common_name?: string;
  iconic_taxon_name?: string;
  observations_count: number;
  default_photo?: { square_url: string; medium_url: string };
  parent_id?: number;
  ancestor_ids?: number[];
  complete_species_count?: number;
}
interface Node {
  t: T;
  children?: Node[];
  value?: number;
  more?: number; // a "+N more" arc standing for the branches there is no room to draw
}

const API = "https://api.inaturalist.org/v1";
const cache = new Map<string, unknown>();
// only successful answers are remembered; a rate-limit (429) is retried once, then reported
async function get<R>(url: string, tries = 2): Promise<R> {
  if (cache.has(url)) return cache.get(url) as R;
  const r = await fetch(url);
  if (!r.ok) {
    if (tries > 1 && (r.status === 429 || r.status >= 500)) {
      await new Promise((res) => setTimeout(res, 1500));
      return get<R>(url, tries - 1);
    }
    throw new Error(String(r.status));
  }
  const j = await r.json();
  cache.set(url, j);
  return j;
}

const ICONIC: Record<string, string> = {
  Plantae: "#4f6f3a",
  Fungi: "#a8772a",
  Animalia: "#8c4a32",
  Aves: "#4d6a7d",
  Insecta: "#9a5b22",
  Mammalia: "#7a3f2e",
  Reptilia: "#6b7334",
  Amphibia: "#3f7360",
  Actinopterygii: "#35607a",
  Mollusca: "#7a5a7a",
  Arachnida: "#5e4a3a",
  Chromista: "#5b6f6a",
  Protozoa: "#7d6d4d",
};
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const colorOf = (t: T) => ICONIC[t.iconic_taxon_name ?? ""] ?? "#6d6a58";

// the wheel's rings follow the main ranks of the tree of life, skipping the sub- and super- ranks in between,
// so that from Animals you see phyla, then classes (mammals, birds, insects...), then orders
const MAIN: [number, string][] = [
  [70, "kingdom"],
  [60, "phylum"],
  [50, "class"],
  [40, "order"],
  [30, "family"],
  [20, "genus"],
  [10, "species"],
];
const CAPS = [16, 7, 5]; // arcs per ring: in the first ring, and per parent in the next two

const SIZE = 860;
const RADII = [96, 196, 296, 408]; // hub edge, then the outer edge of each of the three rings

export default function Wheel() {
  const params = useSearchParams();
  const lang = useLang();
  const TT = useT();
  const t = TT.rooms.wheel;
  const ranksT = TT.common.ranks;
  const router = useRouter();
  const focusId = Number(params.get("focus")) || 48460; // 48460 = Life
  const [focus, setFocus] = useState<T | null>(null);
  const [tree, setTree] = useState<Node | null>(null);
  const [hover, setHover] = useState<T | null>(null);
  const [lineage, setLineage] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let dead = false;
    setLoading(true);
    setFailed(false);
    (async () => {
      const f = (await get<{ results: (T & { ancestors?: T[] })[] }>(`${API}/taxa/${focusId}?locale=${lang}`)).results[0];
      const levels = MAIN.filter(([lv]) => lv < f.rank_level).slice(0, 3);
      // one request per ring: the most-observed descendants at that rank, placed under their parent by ancestry
      const rings = await Promise.all(
        levels.map(([, rank]) =>
          get<{ results: T[]; total_results: number }>(
            `${API}/taxa?taxon_id=${focusId}&rank=${rank}&is_active=true&per_page=200&order_by=observations_count&order=desc&locale=${lang}`
          ).catch(() => ({ results: [] as T[], total_results: 0 }))
        )
      );
      if (dead) return;
      const w = (n: number) => Math.log10(n + 10);
      const seen = rings.map((r) => r.results.filter((x) => x.observations_count > 0));
      const build = (depth: number, parentId: number | null): Node[] => {
        if (depth >= seen.length) return [];
        const pool = parentId === null ? seen[depth] : seen[depth].filter((x) => x.ancestor_ids?.includes(parentId));
        const shown = pool.slice(0, CAPS[depth]);
        const nodes: Node[] = shown.map((x) => {
          const kids = build(depth + 1, x.id);
          return kids.length ? { t: x, children: kids } : { t: x, value: w(x.observations_count) };
        });
        const hidden = pool.slice(CAPS[depth]);
        if (hidden.length && depth === 0) {
          const total = depth === 0 ? Math.max(rings[0].total_results, pool.length) : pool.length;
          const extra = total - shown.length;
          // the remainder as one quiet arc, never more than a fifth of the ring
          const sum = nodes.reduce((n, d) => n + (d.value ?? (d.children ?? []).reduce((m, c) => m + (c.value ?? 1), 0)), 0);
          const v = Math.min(hidden.reduce((n, x) => n + w(x.observations_count), 0), sum * 0.2);
          nodes.push({ t: { id: -1 - depth, name: "", rank: "more", rank_level: 0, observations_count: 0 }, value: v, more: extra });
        }
        return nodes;
      };
      setFocus(f);
      setLineage((f.ancestors ?? []).filter((a) => a.rank !== "stateofmatter"));
      setTree({ t: f, children: build(0, null) });
      setLoading(false);
    })().catch(() => {
      if (dead) return;
      setLoading(false);
      setFailed(true);
    });
    return () => {
      dead = true;
    };
  }, [focusId, lang, attempt]);

  const nodes = useMemo(() => {
    if (!tree) return [];
    const h = hierarchy<Node>(tree, (d) => d.children).sum((d) => d.value ?? 0);
    const p = partition<Node>().size([2 * Math.PI, 4])(h);
    return p.descendants().filter((d) => d.depth > 0) as HierarchyRectangularNode<Node>[];
  }, [tree]);

  const arcGen = d3arc<HierarchyRectangularNode<Node>>()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle(0.004)
    .innerRadius((d) => RADII[d.depth - 1] + (d.depth > 1 ? 2 : 0))
    .outerRadius((d) => RADII[d.depth] - (d.depth < 3 ? 2 : 0));

  const go = (id: number) => router.push(lp(lang, `/wheel?focus=${id}`), { scroll: false });
  const shown = hover ?? focus;
  const nf = (n: number) => n.toLocaleString(LOCALE[lang]);

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-10 items-start">
        <div className="relative w-full max-w-[900px] mx-auto">
          <svg viewBox={`${-SIZE / 2} ${-SIZE / 2} ${SIZE} ${SIZE}`} className={`w-full h-auto transition-opacity ${loading ? "opacity-40" : ""}`}>
            {/* engraved outer rings */}
            <circle r={RADII[3] + 8} fill="none" stroke="#1b1d16" strokeWidth={0.8} />
            <circle r={RADII[3] + 14} fill="none" stroke="#1b1d16" strokeWidth={0.4} />
            {Array.from({ length: 72 }, (_, i) => {
              const a = (i / 72) * Math.PI * 2;
              const f = (v: number) => Math.round(v * 100) / 100;
              return <line key={i} x1={f(Math.sin(a) * (RADII[3] + 8))} y1={f(-Math.cos(a) * (RADII[3] + 8))} x2={f(Math.sin(a) * (RADII[3] + 14))} y2={f(-Math.cos(a) * (RADII[3] + 14))} stroke="#1b1d16" strokeWidth={0.5} />;
            })}
            {nodes.map((d) => {
              const node = d.data;
              const tx = node.t;
              const isMore = node.more !== undefined;
              const isHover = hover?.id === tx.id;
              const ang = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
              const inner = RADII[d.depth - 1];
              const outer = RADII[d.depth];
              const mid = (inner + outer) / 2;
              const span = (d.x1 - d.x0) * mid;
              const label = isMore ? t.moreArc(nf(node.more!)) : tx.preferred_common_name || tx.name;
              const flip = ang > 180;
              const size = [12.5, 11, 10][d.depth - 1];
              const maxChars = Math.floor((outer - inner - 12) / (size * 0.52));
              return (
                <g
                  key={`${d.depth}-${tx.id}`}
                  onMouseEnter={() => !isMore && setHover(tx)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => (isMore ? document.getElementById("branches")?.scrollIntoView({ behavior: "smooth" }) : go(tx.id))}
                  className="cursor-pointer"
                >
                  <path
                    d={arcGen(d) ?? undefined}
                    fill={isMore ? "#b9b29d" : colorOf(tx)}
                    fillOpacity={isMore ? 0.55 : isHover ? 0.95 : [0.85, 0.6, 0.36][d.depth - 1]}
                    stroke="#ede7d7"
                    strokeWidth={1}
                  />
                  {span > size + 1 && (
                    <text
                      transform={`rotate(${ang - 90}) translate(${mid},0) rotate(${flip ? 180 : 0})`}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none"
                      fill={d.depth === 3 || isMore ? "#1b1d16" : "#f4efe2"}
                      style={{ font: `${size}px var(--font-source-serif), serif`, fontStyle: !isMore && tx.rank_level <= 20 ? "italic" : "normal" }}
                    >
                      {label.length > maxChars ? label.slice(0, maxChars - 1) + "…" : label}
                    </text>
                  )}
                </g>
              );
            })}
            {/* centre: the focus taxon */}
            <defs>
              <clipPath id="hub">
                <circle r={RADII[0] - 8} />
              </clipPath>
            </defs>
            <g
              className={focus?.parent_id ? "cursor-pointer" : ""}
              onClick={() => {
                if (!focus) return;
                const up = lineage.length ? lineage[lineage.length - 1].id : focus.parent_id;
                if (up && up !== focus.id) go(up);
              }}
            >
              <circle r={RADII[0] - 4} fill="#f4efe2" stroke="#1b1d16" strokeWidth={1} />
              {focus?.default_photo && (
                <image href={focus.default_photo.medium_url} x={-(RADII[0] - 8)} y={-(RADII[0] - 8)} width={(RADII[0] - 8) * 2} height={(RADII[0] - 8) * 2} clipPath="url(#hub)" preserveAspectRatio="xMidYMid slice" opacity={0.28} />
              )}
              <text y={-14} textAnchor="middle" style={{ font: "10px var(--font-plex-mono), monospace", letterSpacing: "0.14em" }} fill="#45463a">
                {focus?.rank === "stateofmatter" ? t.allLife : (ranksT[focus?.rank ?? ""] ?? focus?.rank ?? "").toUpperCase()}
              </text>
              <text y={12} textAnchor="middle" style={{ font: "22px var(--font-fell), serif" }} fill="#1b1d16">
                {cap(focus?.preferred_common_name || focus?.name || "…").slice(0, 16)}
              </text>
              {focus?.parent_id && focus.rank !== "stateofmatter" && (
                <text y={36} textAnchor="middle" style={{ font: "10px var(--font-plex-mono), monospace", letterSpacing: "0.1em" }} fill="#a4472b">
                  {t.upOne}
                </text>
              )}
            </g>
          </svg>
        </div>

        <aside className="xl:sticky xl:top-24">
          {failed && (
            <p className="mb-4 text-stamp text-sm">
              {t.failed}{" "}
              <button onClick={() => setAttempt((n) => n + 1)} className="underline underline-offset-4">
                {t.retry}
              </button>
            </p>
          )}
          <ol className="flex flex-wrap gap-x-1 gap-y-1 text-sm text-ink-2">
            <li>
              <button onClick={() => go(48460)} className="hover:text-moss">{t.life}</button>
            </li>
            {lineage.map((a) => (
              <li key={a.id}>
                <span className="mx-1">›</span>
                <button onClick={() => go(a.id)} className="hover:text-moss">
                  {a.preferred_common_name || a.name}
                </button>
              </li>
            ))}
          </ol>
          {shown && (
            <div className="mt-6 border-t border-ink pt-5">
              <div className="aspect-[4/3] bg-paper-3 overflow-hidden">
                {shown.default_photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={shown.default_photo.medium_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <p className="label text-ink-2 mt-4">{shown.rank === "stateofmatter" ? t.everythingAlive : (ranksT[shown.rank] ?? shown.rank)}</p>
              <p className="font-display text-3xl leading-tight mt-1">{cap(shown.preferred_common_name || shown.name)}</p>
              <p className="latin text-moss">{shown.name}</p>
              <p className="mt-3 text-sm text-ink-2">
                {t.observations(nf(shown.observations_count))}
                {shown.complete_species_count ? ` · ${t.species(nf(shown.complete_species_count))}` : ""}
              </p>
              <Link href={lp(lang, `/taxon/${shown.id}`)} className="inline-block mt-4 label text-moss hover:text-rust">
                {t.open}
              </Link>
            </div>
          )}
          <p className="mt-8 text-sm text-ink-2 leading-relaxed">{t.howTo}</p>
        </aside>
      </div>
      {focus && <Branches focus={focus} target={MAIN.find(([lv]) => lv < focus.rank_level)?.[1]} go={go} />}
    </>
  );
}
