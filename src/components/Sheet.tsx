import Link from "next/link";
import type { CommonsPhoto, Entry, Plate } from "@/lib/types";
import { EDIBILITY, IUCN, shelfById } from "@/lib/shelves";
import { parseZones } from "@/lib/climate";

export function Section({ n, title, children, id }: { n: string; title: string; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="pt-10 mt-10 border-t rule first:mt-0 first:border-0 first:pt-0">
      <div className="flex items-baseline gap-3 mb-5">
        <span className="font-mono text-xs text-ink-2">§{n}</span>
        <h2 className="font-display text-[1.9rem] leading-none">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function EdibilityScale({ value, note, parts }: { value?: string; note?: string; parts?: string[] }) {
  if (!value) return null;
  const cur = EDIBILITY[value];
  const steps = Object.entries(EDIBILITY);
  return (
    <div>
      <div className="grid grid-cols-5 border border-ink">
        {steps.map(([k, s]) => (
          <div
            key={k}
            className="relative px-2 py-2.5 text-center border-l border-ink first:border-l-0"
            style={k === value ? { background: s.tone, color: "#f4efe2" } : undefined}
          >
            <span className="label !text-[0.6rem] !tracking-[0.08em]">{s.label}</span>
          </div>
        ))}
      </div>
      {parts && parts.length > 0 && (
        <p className="mt-4">
          <span className="label text-ink-2 mr-2">Eaten</span>
          {parts.join(" · ")}
        </p>
      )}
      {note && (
        <p className={`mt-3 leading-relaxed ${cur && cur.step >= 3 ? "border-l-2 border-stamp pl-4 text-ink" : "text-ink-2"}`}>{note}</p>
      )}
    </div>
  );
}

export function IucnStamp({ code }: { code?: string }) {
  if (!code) return null;
  const s = IUCN[code] ?? IUCN.NE;
  return (
    <span className="stamp" style={{ color: s.color }} title="IUCN Red List status">
      IUCN {code} · {s.label}
    </span>
  );
}

const EVIDENCE: Record<string, { label: string; n: number; text: string }> = {
  strong: { label: "Strong", n: 3, text: "An approved drug, or consistent results in well-run clinical trials." },
  moderate: { label: "Moderate", n: 2, text: "Some clinical trials with promising but limited or mixed results." },
  traditional: { label: "Traditional", n: 1, text: "Long historical use; little or no modern clinical evidence." },
};

export function Medicinal({ m }: { m: NonNullable<Entry["medicinal"]> }) {
  const ev = m.evidence ? EVIDENCE[m.evidence] : undefined;
  return (
    <div className="grid md:grid-cols-[1fr_240px] gap-8">
      <table className="w-full text-[0.95rem]">
        <thead>
          <tr className="border-b border-ink">
            <th className="label text-left font-normal py-2 pr-4 w-[34%]">Tradition</th>
            <th className="label text-left font-normal py-2">Use</th>
          </tr>
        </thead>
        <tbody>
          {m.uses.map((u, i) => (
            <tr key={i} className="border-b rule align-top">
              <td className="py-2.5 pr-4 italic text-moss">{u.tradition}</td>
              <td className="py-2.5 leading-snug">{u.use}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="space-y-6">
        {ev && (
          <div>
            <p className="label text-ink-2">Weight of evidence</p>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3].map((k) => (
                <span key={k} className={`h-2 flex-1 ${k <= ev.n ? "bg-moss" : "bg-paper-3"}`} />
              ))}
            </div>
            <p className="mt-2 text-sm">
              <b className="font-semibold">{ev.label}.</b> <span className="text-ink-2">{ev.text}</span>
            </p>
          </div>
        )}
        {m.compounds && m.compounds.length > 0 && (
          <div>
            <p className="label text-ink-2">Active compounds</p>
            <p className="mt-2 text-sm leading-relaxed">{m.compounds.join(", ")}</p>
          </div>
        )}
      </div>
      {m.cautions && (
        <div className="md:col-span-2 border border-stamp/70 bg-stamp/[0.04] px-4 py-3">
          <span className="label text-stamp mr-2">Caution</span>
          <span className="leading-relaxed">{m.cautions}</span>
        </div>
      )}
    </div>
  );
}

// approximate average annual minimum temperature for each USDA zone (°C, lower bound)
const ZONE_MIN_C = [-51, -46, -40, -34, -29, -23, -18, -12, -7, -1, 4, 10, 16];

export function ZoneStrip({ zones }: { zones?: string }) {
  const r = parseZones(zones);
  if (!r) return zones ? <p>{zones}</p> : null;
  return (
    <div>
      <div className="grid grid-cols-13" style={{ gridTemplateColumns: "repeat(13, minmax(0, 1fr))" }}>
        {Array.from({ length: 13 }, (_, i) => i + 1).map((z) => {
          const on = z >= r[0] && z <= r[1];
          const hue = 210 - (z - 1) * 16; // cold blue → warm
          return (
            <div key={z} className="text-center">
              <div className="h-7 border-r border-paper" style={{ background: on ? `hsl(${hue} 38% 42%)` : `hsl(${hue} 18% 84%)` }} />
              <span className={`font-mono text-[0.62rem] ${on ? "text-ink" : "text-ink-2/50"}`}>{z}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-ink-2">
        {zones}. Survives winters down to about {ZONE_MIN_C[r[0] - 1]} °C.
      </p>
    </div>
  );
}

export function Grow({ g }: { g: NonNullable<Entry["grow"]> }) {
  const facts: [string, string | undefined][] = [
    ["Light", g.sun],
    ["Water", g.water],
    ["Soil", g.soil],
    ["Propagation", g.propagation],
    ["To harvest", g.timeToHarvest],
    ["Climates", g.climates?.join(", ")],
  ];
  return (
    <div className="space-y-8">
      <div>
        <p className="label text-ink-2 mb-2">Hardiness (USDA zones)</p>
        <ZoneStrip zones={g.zones} />
      </div>
      <dl className="grid sm:grid-cols-2 gap-x-8">
        {facts
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="flex gap-4 border-b rule py-2.5">
              <dt className="label text-ink-2 w-28 shrink-0 pt-1">{k}</dt>
              <dd className="leading-snug">{v}</dd>
            </div>
          ))}
      </dl>
      {g.steps && g.steps.length > 0 && (
        <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
          {g.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="font-display text-3xl leading-none text-ochre w-7 shrink-0">{i + 1}</span>
              <span className="leading-relaxed">{s}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function PhotoRow({ photos, label }: { photos?: CommonsPhoto[]; label: string }) {
  if (!photos?.length) return null;
  return (
    <div className="grid grid-cols-2 gap-2 mb-4 -mx-1">
      {photos.slice(0, 4).map((p) => (
        <a key={p.url} href={p.page} target="_blank" rel="noreferrer" title={`${p.title} — ${p.attribution}`} className="block aspect-[4/3] overflow-hidden bg-paper-3 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.url} alt={`${label}: ${p.title}`} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        </a>
      ))}
    </div>
  );
}

export function FruitSeed({ fruit, seed, fungal, seedPhotos, fruitPhotos }: { fruit?: Entry["fruit"]; seed?: Entry["seed"]; fungal?: boolean; seedPhotos?: CommonsPhoto[]; fruitPhotos?: CommonsPhoto[] }) {
  if (!fruit && !seed) return null;
  return (
    <div className="grid md:grid-cols-2 gap-6 items-start">
      {fruit && (
        <div className="specimen-label p-5">
          <PhotoRow photos={fruitPhotos} label="Fruit" />
          <p className="label text-ink-2">Fruit</p>
          {fruit.type && <p className="font-display text-2xl mt-1">{fruit.type}</p>}
          {fruit.season && <p className="text-sm text-moss mt-1">Ripens: {fruit.season}</p>}
          {fruit.description && <p className="mt-3 leading-relaxed">{fruit.description}</p>}
        </div>
      )}
      {seed && (
        <div className="specimen-label p-5">
          <PhotoRow photos={seedPhotos} label="Seed" />
          <p className="label text-ink-2">{fungal ? "Spores" : "Seed"}</p>
          {seed.size && <p className="font-display text-2xl mt-1">{seed.size}</p>}
          {seed.description && <p className="mt-3 leading-relaxed">{seed.description}</p>}
          <dl className="mt-3 text-sm space-y-1.5">
            {seed.dispersal && (
              <div>
                <dt className="inline label text-ink-2 mr-2">Dispersal</dt>
                <dd className="inline">{seed.dispersal}</dd>
              </div>
            )}
            {seed.germination && (
              <div>
                <dt className="inline label text-ink-2 mr-2">Germination</dt>
                <dd className="inline">{seed.germination}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
      {(seedPhotos?.length || fruitPhotos?.length) && (
        <p className="md:col-span-2 text-xs text-ink-2">Photographs from Wikimedia Commons under open licences; hover for the photographer, click for the file.</p>
      )}
    </div>
  );
}

export function Abilities({ items }: { items: string[] }) {
  return (
    <ol className="grid sm:grid-cols-2 gap-x-10">
      {items.map((a, i) => (
        <li key={i} className="flex gap-4 py-3 border-b rule">
          <span className="font-mono text-xs text-rust pt-1.5 w-6 shrink-0">{toRoman(i + 1)}</span>
          <span className="leading-relaxed">{a}</span>
        </li>
      ))}
    </ol>
  );
}

export function AnimalFacts({ a }: { a: NonNullable<Entry["animal"]> }) {
  const rows: [string, string | undefined][] = [
    ["Diet", a.diet],
    ["Habitat", a.habitat],
    ["Size", a.size],
    ["Lifespan", a.lifespan],
  ];
  return (
    <div>
      <dl className="grid sm:grid-cols-2 gap-x-8">
        {rows
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="flex gap-4 border-b rule py-2.5">
              <dt className="label text-ink-2 w-20 shrink-0 pt-1">{k}</dt>
              <dd className="leading-snug">{v}</dd>
            </div>
          ))}
      </dl>
      {a.behaviour && <p className="mt-6 text-lg leading-relaxed font-display">{a.behaviour}</p>}
    </div>
  );
}

export function Plates({ plates, name }: { plates: Plate[]; name: string }) {
  if (!plates.length) return null;
  return (
    <div className="scroll-x -mx-4 px-4">
      <div className="flex gap-6 pb-4">
        {plates.map((p) => (
          <a
            key={p.id}
            href={`https://sourcelibrary.org/book/${p.bookId}?page=${p.page}`}
            target="_blank"
            rel="noreferrer"
            className="group shrink-0 w-[220px]"
          >
            <div className="bg-[#efe6cf] p-3 border rule h-[280px] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt={`${name} in ${p.title}`} loading="lazy" className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-[1.02] transition" />
            </div>
            <p className="mt-2 text-sm leading-snug">
              <i>{p.title}</i>
            </p>
            <p className="label text-ink-2 mt-1 !text-[0.6rem]">
              {p.m === "relative" && <span className="text-ochre">Relative · </span>}
              {p.author !== "Unknown" ? p.author + " · " : ""}
              {p.year ?? "n.d."} · p.{p.page}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}

export function ShelfTags({ shelves }: { shelves: string[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {shelves.map((s) => {
        const sh = shelfById(s);
        if (!sh) return null;
        return (
          <Link key={s} href={`/shelves/${s}`} className="label text-moss hover:text-rust">
            Shelf {sh.numeral} · {sh.title.replace(/^The /, "")}
          </Link>
        );
      })}
    </div>
  );
}

export function toRoman(n: number) {
  const m: [number, string][] = [[10, "x"], [9, "ix"], [5, "v"], [4, "iv"], [1, "i"]];
  let s = "";
  for (const [v, r] of m) while (n >= v) { s += r; n -= v; }
  return s;
}

/** The field-guide box: how to recognise it, hear it, and where and when to find it. */
export function FieldGuide({ a }: { a: NonNullable<Entry["animal"]> }) {
  if (!a.fieldMarks?.length && !a.voice && !a.lookalikes && !a.whereToSee) return null;
  return (
    <div className="grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-8">
      {a.fieldMarks && a.fieldMarks.length > 0 && (
        <div className="specimen-label p-5">
          <p className="label text-ink-2">Field marks</p>
          <ul className="mt-3 space-y-2">
            {a.fieldMarks.map((m, i) => (
              <li key={i} className="flex gap-3 leading-snug">
                <span className="text-rust font-mono text-xs pt-1">{String.fromCharCode(97 + i)}</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <dl className="space-y-4">
        {a.voice && (
          <div>
            <dt className="label text-ink-2">Voice</dt>
            <dd className="font-display text-[1.2rem] leading-snug mt-1">{a.voice}</dd>
          </div>
        )}
        {a.lookalikes && (
          <div>
            <dt className="label text-ink-2">Not to be confused with</dt>
            <dd className="mt-1 leading-relaxed">{a.lookalikes}</dd>
          </div>
        )}
        {a.whereToSee && (
          <div>
            <dt className="label text-ink-2">Where to see it</dt>
            <dd className="mt-1 leading-relaxed">{a.whereToSee}</dd>
          </div>
        )}
        {a.season && (
          <div>
            <dt className="label text-ink-2">When</dt>
            <dd className="mt-1 leading-relaxed">{a.season}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
