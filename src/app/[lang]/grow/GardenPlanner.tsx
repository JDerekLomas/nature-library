"use client";

import Link from "next/link";
import GardenPicker, { useGarden } from "@/components/GardenPicker";
import { fitFor, type Fit } from "@/lib/climate";
import { useLang, useT } from "@/i18n/LangProvider";
import { lp, LOCALE } from "@/i18n/config";

export interface GrowItem {
  slug: string;
  common: string;
  scientific: string;
  range: [number, number] | null;
  shelves: string[];
  photo?: string;
  water?: string;
  sun?: string;
  harvest?: string;
  edibility?: string;
}

const BEDS = [
  { id: "medicinal", title: "The physic bed", note: "Plants healers have used. Read each sheet for the evidence and the cautions." },
  { id: "fruit", title: "The orchard", note: "Trees, bushes and vines whose fruit people eat." },
  { id: "edible", title: "The kitchen garden", note: "Leaves, roots, seeds and flowers for the table." },
  { id: "spice", title: "The spice border", note: "Herbs and spices." },
  { id: "pollinator-plant", title: "The nectary", note: "For bees, butterflies and hummingbirds." },
  { id: "tree", title: "Trees to plant", note: "For shade, timber, or the next three centuries." },
];

const dry = (w?: string) => !!w && /low|drought|dry|little|sparing/i.test(w);

export default function GardenPlanner({ items }: { items: GrowItem[] }) {
  const [g, save] = useGarden();
  const lang = useLang();
  const T = useT();
  const t = T.rooms.grow;

  const fitted = g
    ? items
        .map((it) => ({ it, fit: fitFor(it.range, g.zone) }))
        .filter((x): x is { it: GrowItem; fit: Fit } => x.fit === "outdoors" || x.fit === "shelter")
    : [];
  const aridity = g ? (g.annualRain < 300 ? "arid" : g.annualRain < 600 ? "dry" : g.annualRain > 1500 ? "wet" : "moderate") : null;
  const sortForRain = (a: { it: GrowItem; fit: Fit }, b: { it: GrowItem; fit: Fit }) =>
    (a.fit === "outdoors" ? 0 : 1) - (b.fit === "outdoors" ? 0 : 1) || (aridity === "arid" || aridity === "dry" ? Number(dry(b.it.water)) - Number(dry(a.it.water)) : 0) || a.it.common.localeCompare(b.it.common, LOCALE[lang]);

  return (
    <div>
      {!g ? (
        <div className="mt-2">
          <GardenPicker />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-end border border-ink p-6 bg-card">
          <div>
            <p className="label text-ink-2">{t.yourGarden} · {g.lat.toFixed(2)}°, {g.lon.toFixed(2)}°</p>
            <p className="font-display text-4xl mt-1 leading-tight">{g.place}</p>
            <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <dt className="label text-ink-2">{t.zone}</dt>
                <dd className="font-display text-4xl text-moss">{g.zoneLabel}</dd>
              </div>
              <div>
                <dt className="label text-ink-2">{t.coldest}</dt>
                <dd className="font-display text-3xl">{g.avgExtremeMin.toFixed(1)} °C</dd>
              </div>
              <div>
                <dt className="label text-ink-2">{t.hottest}</dt>
                <dd className="font-display text-3xl">{g.hottestMonthMax.toFixed(0)} °C</dd>
              </div>
              <div>
                <dt className="label text-ink-2">{t.rain}</dt>
                <dd className="font-display text-3xl">{Math.round(g.annualRain).toLocaleString(LOCALE[lang])} mm</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-ink-2 max-w-[70ch]">
              {t.source}
              {aridity === "arid" || aridity === "dry" ? t.dry : aridity === "wet" ? t.wet : ""}
            </p>
          </div>
          <button onClick={() => save(null)} className="label text-ink-2 hover:text-stamp justify-self-start md:justify-self-end">
            {t.change}
          </button>
        </div>
      )}

      {g && (
        <div className="mt-12 space-y-14">
          <p className="text-lg">
            {(() => {
              const [a, mid, b, end] = t.summary(fitted.filter((x) => x.fit === "outdoors").length, g.place.split(",")[0], fitted.filter((x) => x.fit === "shelter").length);
              return (
                <>
                  <b className="font-semibold">{a}</b>
                  {mid}
                  <b className="font-semibold">{b}</b>
                  {end}
                </>
              );
            })()}
          </p>
          {BEDS.map((bed0) => {
            const bed = { ...bed0, title: t.beds[bed0.id]?.[0] ?? bed0.title, note: t.beds[bed0.id]?.[1] ?? bed0.note };
            const list = fitted.filter((x) => x.it.shelves.includes(bed.id)).sort(sortForRain);
            if (!list.length) return null;
            return (
              <section key={bed.id}>
                <div className="flex items-baseline justify-between border-b-[3px] border-double border-ink pb-2">
                  <h2 className="font-display text-3xl">{bed.title}</h2>
                  <span className="label text-ink-2">{t.plants(list.length)}</span>
                </div>
                <p className="text-ink-2 mt-2">{bed.note}</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 mt-4">
                  {list.map(({ it, fit }) => (
                    <li key={it.slug} className="border-b rule">
                      <Link href={lp(lang, `/species/${it.slug}`)} className="flex gap-4 py-3 group">
                        <span className="w-16 h-16 bg-paper-3 shrink-0 overflow-hidden">
                          {it.photo && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={it.photo} alt="" loading="lazy" className="w-full h-full object-cover" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block leading-tight group-hover:text-moss">{it.common}</span>
                          <span className="block latin text-sm text-ink-2">{it.scientific}</span>
                          <span className={`block label !text-[0.56rem] mt-1 ${fit === "outdoors" ? "text-moss" : "text-ochre"}`}>
                            {fit === "outdoors" ? t.outdoors : t.shelter}
                            {it.water ? ` · ${t.water}: ${it.water.split(/[;,.(]/)[0].toLowerCase()}` : ""}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          <p className="text-xs text-ink-2 max-w-[80ch]">
            {t.footnote} {T.widgets.fit.shelter}.
          </p>
        </div>
      )}
    </div>
  );
}
