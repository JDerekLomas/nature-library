"use client";

import { useState } from "react";
import Link from "next/link";
import { arc as d3arc } from "d3-shape";
import Globe from "./Globe";

export interface Room {
  href: string;
  name: string;
  numeral: string;
  count: string; // e.g. "255 birds"
  blurb: string;
  images: string[];
}

const C = 500;
const R_IN = 205; // reading-room wall
const R_OUT = 432; // outer wall
const R_WALL = 452;
const r2 = (v: number) => Math.round(v * 100) / 100;

/** The library drawn as an engraved floor plan: a domed reading room (the Atlas) ringed by rooms. */
export default function LibraryPlan({ rooms }: { rooms: Room[] }) {
  const [active, setActive] = useState<number | null>(null);
  const n = rooms.length;
  const gap = 0.035; // radians of wall between rooms
  // the entrance sits at the bottom: leave a gap in the ring there
  const start = Math.PI + 0.22;
  const span = 2 * Math.PI - 0.44;
  const each = span / n;
  const arcGen = d3arc<{ a0: number; a1: number; r0: number; r1: number }>()
    .startAngle((d) => d.a0)
    .endAngle((d) => d.a1)
    .innerRadius((d) => d.r0)
    .outerRadius((d) => d.r1);
  const room = active !== null ? rooms[active] : null;

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-10 items-center">
      {/* the plan */}
      <div className="relative w-full max-w-[760px] mx-auto hidden sm:block">
        <svg viewBox="0 0 1000 1000" className="w-full h-auto" role="img" aria-label="Floor plan of the Nature Library">
          <defs>
            <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="7" stroke="#1b1d16" strokeWidth="1.1" />
            </pattern>
            <pattern id="floor" width="22" height="22" patternUnits="userSpaceOnUse">
              <path d="M0 11h22M11 0v22" stroke="#1b1d1610" strokeWidth="1" />
            </pattern>
          </defs>
          <g transform={`translate(${C},${C})`}>
            {/* outer wall, hatched like an engraved plan, broken by the entrance */}
            <path d={arcGen({ a0: start - 0.06, a1: start + span + 0.06, r0: R_OUT, r1: R_WALL }) ?? ""} fill="url(#hatch)" stroke="#1b1d16" strokeWidth="1.4" />
            {/* rooms */}
            {rooms.map((rm, i) => {
              const a0 = start + i * each + gap / 2;
              const a1 = start + (i + 1) * each - gap / 2;
              const mid = (a0 + a1) / 2;
              const deg = ((mid * 180) / Math.PI) % 360;
              const flip = deg > 90 && deg < 270; // keep lower-half labels upright
              const lr = (R_IN + R_OUT) / 2 + 12;
              const x = r2(Math.sin(mid) * lr);
              const y = r2(-Math.cos(mid) * lr);
              const nx = r2(Math.sin(mid) * (R_OUT - 26));
              const ny = r2(-Math.cos(mid) * (R_OUT - 26));
              const on = active === i;
              return (
                <Link key={rm.href} href={rm.href} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} aria-label={`${rm.name}: ${rm.count}`}>
                  <path d={arcGen({ a0, a1, r0: R_IN + 14, r1: R_OUT }) ?? ""} fill={on ? "#b5852a2e" : "url(#floor)"} stroke="#1b1d16" strokeWidth={on ? 1.8 : 1.1} className="transition-[fill]" />
                  {/* doorway into the reading room */}
                  <path d={arcGen({ a0: mid - 0.04, a1: mid + 0.04, r0: R_IN + 8, r1: R_IN + 20 }) ?? ""} fill="#ede7d7" />
                  <text x={nx} y={ny} textAnchor="middle" dominantBaseline="middle" style={{ font: "500 15px var(--font-plex-mono), monospace", letterSpacing: "0.12em" }} fill={on ? "#a4472b" : "#77766a"}>
                    {rm.numeral}
                  </text>
                  <g transform={`translate(${x},${y}) rotate(${r2(flip ? deg - 180 : deg)})`}>
                    <text textAnchor="middle" y={-6} style={{ font: "27px var(--font-fell), serif" }} fill={on ? "#2e4a32" : "#1b1d16"}>
                      {rm.name}
                    </text>
                    <text textAnchor="middle" y={20} style={{ font: "12px var(--font-plex-mono), monospace", letterSpacing: "0.1em", textTransform: "uppercase" }} fill="#45463a">
                      {rm.count}
                    </text>
                  </g>
                </Link>
              );
            })}
            {/* colonnade around the reading room */}
            {Array.from({ length: 36 }, (_, i) => {
              const a = (i / 36) * Math.PI * 2;
              return <circle key={i} cx={r2(Math.sin(a) * (R_IN + 2))} cy={r2(-Math.cos(a) * (R_IN + 2))} r={3.2} fill="#1b1d16" />;
            })}
            <circle r={R_IN - 10} fill="none" stroke="#1b1d16" strokeWidth="1" />
            {/* entrance steps */}
            {[0, 1, 2, 3].map((k) => (
              <line key={k} x1={-46 + k * 4} x2={46 - k * 4} y1={R_WALL + 6 + k * 9} y2={R_WALL + 6 + k * 9} stroke="#1b1d16" strokeWidth="1.2" />
            ))}
            <text y={R_WALL + 60} textAnchor="middle" style={{ font: "12px var(--font-plex-mono), monospace", letterSpacing: "0.22em" }} fill="#45463a">
              ENTRANCE · SEARCH ANY LIVING THING
            </text>
            <text y={-R_IN + 34} textAnchor="middle" style={{ font: "12px var(--font-plex-mono), monospace", letterSpacing: "0.2em" }} fill="#45463a">
              THE READING ROOM
            </text>
            <text y={R_IN - 24} textAnchor="middle" style={{ font: "italic 20px var(--font-fell), serif" }} fill="#2e4a32">
              The Atlas of Life
            </text>
          </g>
        </svg>
        {/* the live globe under the dome */}
        <Link href="/atlas" className="absolute" style={{ left: "35.5%", top: "35.5%", width: "29%", height: "29%" }} aria-label="The Atlas of Life" onMouseEnter={() => setActive(null)}>
          <Globe gbif="" step={2} ring={false} initial={[60, 15]} />
        </Link>
      </div>

      {/* the room card (and, on phones, the whole directory) */}
      <div>
        <div className="hidden sm:block min-h-[330px]">
          {room ? (
            <div key={room.href} className="fade-up">
              <p className="label text-rust">Room {room.numeral}</p>
              <p className="font-display text-[2.6rem] leading-none mt-1">{room.name}</p>
              <p className="label text-ink-2 mt-2">{room.count}</p>
              <p className="mt-4 leading-relaxed text-ink-2">{room.blurb}</p>
              {room.images.length > 0 && (
                <div className="grid grid-cols-4 gap-1.5 mt-5">
                  {room.images.slice(0, 4).map((src) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={src} src={src} alt="" className="aspect-square object-cover bg-paper-3 w-full" />
                  ))}
                </div>
              )}
              <Link href={room.href} className="inline-block mt-5 label text-moss hover:text-rust">
                Enter the room →
              </Link>
            </div>
          ) : (
            <div>
              <p className="label text-ink-2">A plan of the library</p>
              <p className="font-display text-[2.4rem] leading-[1.05] mt-2">Eleven rooms around a reading room with the whole planet in it.</p>
              <p className="mt-4 text-ink-2 leading-relaxed">Hover over a room to see what it holds, and click to walk in. The globe at the centre is the Atlas: tap it to find what lives anywhere on Earth.</p>
            </div>
          )}
        </div>
        <ul className="sm:hidden divide-y divide-[var(--rule)] border-y rule">
          <li>
            <Link href="/atlas" className="flex gap-4 py-4">
              <span className="font-mono text-xs text-rust w-8 pt-1">0</span>
              <span>
                <span className="block font-display text-2xl leading-tight">The Atlas of Life</span>
                <span className="block text-sm text-ink-2">The reading room: what lives anywhere on Earth</span>
              </span>
            </Link>
          </li>
          {rooms.map((rm) => (
            <li key={rm.href}>
              <Link href={rm.href} className="flex gap-4 py-4">
                <span className="font-mono text-xs text-rust w-8 pt-1">{rm.numeral}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-2xl leading-tight">{rm.name}</span>
                  <span className="block label text-ink-2 mt-0.5">{rm.count}</span>
                </span>
                {rm.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={rm.images[0]} alt="" className="w-14 h-14 object-cover shrink-0" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
