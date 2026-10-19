"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { arc as d3arc } from "d3-shape";
import { useLang, useT } from "@/i18n/LangProvider";
import { lp, LOCALE } from "@/i18n/config";
import { hierarchy, partition, type HierarchyRectangularNode } from "d3-hierarchy";

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
  complete_species_count?: number;
}
interface Node {
  t: T;
  children?: Node[];
  value?: number;
}

const API = "https://api.inaturalist.org/v1";
const cache = new Map<string, unknown>();
async function get<R>(url: string): Promise<R> {
  if (cache.has(url)) return cache.get(url) as R;
  const r = await fetch(url);
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

const SIZE = 820;
const R0 = 118;
const R1 = 250;
const R2 = 392;

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

  useEffect(() => {
    let dead = false;
    setLoading(true);
    (async () => {
      const f = (await get<{ results: (T & { ancestors?: T[] })[] }>(`${API}/taxa/${focusId}?locale=${lang}`)).results[0];
      const kids = (await get<{ results: T[] }>(`${API}/taxa?parent_id=${focusId}&is_active=true&per_page=24&order_by=observations_count&order=desc&locale=${lang}`)).results.filter(
        (k) => k.observations_count > 0
      );
      const top = kids.slice(0, 18);
      const grand = await Promise.all(
        top.map((k) =>
          get<{ results: T[] }>(`${API}/taxa?parent_id=${k.id}&is_active=true&per_page=10&order_by=observations_count&order=desc&locale=${lang}`)
            .then((j) => j.results.filter((g) => g.observations_count > 0))
            .catch(() => [] as T[])
        )
      );
      if (dead) return;
      const w = (n: number) => Math.log10(n + 10);
      const root: Node = {
        t: f,
        children: top.map((k, i) => ({
          t: k,
          children: grand[i].length ? grand[i].map((g) => ({ t: g, value: w(g.observations_count) })) : undefined,
          value: grand[i].length ? undefined : w(k.observations_count),
        })),
      };
      setFocus(f);
      setLineage((f.ancestors ?? []).filter((a) => a.rank !== "stateofmatter"));
      setTree(root);
      setLoading(false);
    })().catch(() => setLoading(false));
    return () => {
      dead = true;
    };
  }, [focusId, lang]);

  const nodes = useMemo(() => {
    if (!tree) return [];
    const h = hierarchy<Node>(tree, (d) => d.children).sum((d) => d.value ?? 0);
    const p = partition<Node>().size([2 * Math.PI, 2])(h);
    return p.descendants().filter((d) => d.depth > 0) as HierarchyRectangularNode<Node>[];
  }, [tree]);

  const arcGen = d3arc<HierarchyRectangularNode<Node>>()
    .startAngle((d) => d.x0)
    .endAngle((d) => d.x1)
    .padAngle(0.004)
    .innerRadius((d) => (d.depth === 1 ? R0 : R1))
    .outerRadius((d) => (d.depth === 1 ? R1 - 2 : R2));

  const go = (id: number) => router.push(lp(lang, `/wheel?focus=${id}`), { scroll: false });
  const shown = hover ?? focus;

  return (
    <div className="grid xl:grid-cols-[minmax(0,1fr)_340px] gap-10 items-start">
      <div className="relative w-full max-w-[860px] mx-auto">
        <svg viewBox={`${-SIZE / 2} ${-SIZE / 2} ${SIZE} ${SIZE}`} className={`w-full h-auto transition-opacity ${loading ? "opacity-40" : ""}`}>
          {/* engraved outer rings */}
          <circle r={R2 + 8} fill="none" stroke="#1b1d16" strokeWidth={0.8} />
          <circle r={R2 + 14} fill="none" stroke="#1b1d16" strokeWidth={0.4} />
          {Array.from({ length: 72 }, (_, i) => {
            const a = (i / 72) * Math.PI * 2;
            const f = (v: number) => Math.round(v * 100) / 100;
            return <line key={i} x1={f(Math.sin(a) * (R2 + 8))} y1={f(-Math.cos(a) * (R2 + 8))} x2={f(Math.sin(a) * (R2 + 14))} y2={f(-Math.cos(a) * (R2 + 14))} stroke="#1b1d16" strokeWidth={0.5} />;
          })}
          {nodes.map((d) => {
            const t = d.data.t;
            const isHover = hover?.id === t.id;
            const ang = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
            const mid = d.depth === 1 ? (R0 + R1) / 2 : (R1 + R2) / 2 + 6;
            const span = (d.x1 - d.x0) * mid;
            const label = t.preferred_common_name || t.name;
            const flip = ang > 180;
            const maxChars = Math.floor(((d.depth === 1 ? R1 - R0 : R2 - R1) - 14) / 6.2);
            return (
              <g key={`${d.depth}-${t.id}`} onMouseEnter={() => setHover(t)} onMouseLeave={() => setHover(null)} onClick={() => go(t.id)} className="cursor-pointer">
                <path
                  d={arcGen(d) ?? undefined}
                  fill={colorOf(t)}
                  fillOpacity={isHover ? 0.95 : d.depth === 1 ? 0.78 : 0.42}
                  stroke="#ede7d7"
                  strokeWidth={1}
                />
                {span > 11 && (
                  <text
                    transform={`rotate(${ang - 90}) translate(${mid},0) rotate(${flip ? 180 : 0})`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="pointer-events-none"
                    fill={d.depth === 1 ? "#f4efe2" : "#1b1d16"}
                    style={{ font: `${d.depth === 1 ? 12 : 10.5}px var(--font-source-serif), serif`, fontStyle: t.rank_level <= 20 ? "italic" : "normal" }}
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
              <circle r={R0 - 8} />
            </clipPath>
          </defs>
          <g
            className={focus?.parent_id ? "cursor-pointer" : ""}
            onClick={() => focus && lineage.length > 0 && go(lineage[lineage.length - 1].id)}
          >
            <circle r={R0 - 4} fill="#f4efe2" stroke="#1b1d16" strokeWidth={1} />
            {focus?.default_photo && (
              <image href={focus.default_photo.medium_url} x={-(R0 - 8)} y={-(R0 - 8)} width={(R0 - 8) * 2} height={(R0 - 8) * 2} clipPath="url(#hub)" preserveAspectRatio="xMidYMid slice" opacity={0.28} />
            )}
            <text y={-14} textAnchor="middle" style={{ font: "10px var(--font-plex-mono), monospace", letterSpacing: "0.14em" }} fill="#45463a">
              {focus?.rank === "stateofmatter" ? t.allLife : (ranksT[focus?.rank ?? ""] ?? focus?.rank ?? "").toUpperCase()}
            </text>
            <text y={12} textAnchor="middle" style={{ font: "24px var(--font-fell), serif" }} fill="#1b1d16">
              {cap(focus?.preferred_common_name || focus?.name || "…").slice(0, 18)}
            </text>
            {lineage.length > 0 && (
              <text y={38} textAnchor="middle" style={{ font: "10px var(--font-plex-mono), monospace", letterSpacing: "0.1em" }} fill="#a4472b">
                {t.upOne}
              </text>
            )}
          </g>
        </svg>
      </div>

      <aside className="xl:sticky xl:top-24">
        <ol className="flex flex-wrap gap-x-1 gap-y-1 text-sm text-ink-2">
          <li>
            <button onClick={() => go(48460)} className="hover:text-moss">{t.life}</button>
          </li>
          {lineage.slice(1).map((a) => (
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
              {t.observations(shown.observations_count.toLocaleString(LOCALE[lang]))}
              {shown.complete_species_count ? ` · ${t.species(shown.complete_species_count.toLocaleString(LOCALE[lang]))}` : ""}
            </p>
            <Link href={lp(lang, `/taxon/${shown.id}`)} className="inline-block mt-4 label text-moss hover:text-rust">
              {t.open}
            </Link>
          </div>
        )}
        <p className="mt-8 text-sm text-ink-2 leading-relaxed">{t.howTo}</p>
      </aside>
    </div>
  );
}
