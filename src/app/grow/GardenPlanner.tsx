"use client";

import Link from "next/link";
import GardenPicker, { useGarden } from "@/components/GardenPicker";
import { fitFor, FIT_TEXT, type Fit } from "@/lib/climate";

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

  const fitted = g
    ? items
        .map((it) => ({ it, fit: fitFor(it.range, g.zone) }))
        .filter((x): x is { it: GrowItem; fit: Fit } => x.fit === "outdoors" || x.fit === "shelter")
    : [];
  const aridity = g ? (g.annualRain < 300 ? "arid" : g.annualRain < 600 ? "dry" : g.annualRain > 1500 ? "wet" : "moderate") : null;
  const sortForRain = (a: { it: GrowItem; fit: Fit }, b: { it: GrowItem; fit: Fit }) =>
    (a.fit === "outdoors" ? 0 : 1) - (b.fit === "outdoors" ? 0 : 1) || (aridity === "arid" || aridity === "dry" ? Number(dry(b.it.water)) - Number(dry(a.it.water)) : 0) || a.it.common.localeCompare(b.it.common);

  return (
    <div>
      {!g ? (
        <div className="mt-2">
          <GardenPicker />
        </div>
      ) : (
        <div className="grid md:grid-cols-[1fr_auto] gap-6 items-end border border-ink p-6 bg-card">
          <div>
            <p className="label text-ink-2">Your garden · {g.lat.toFixed(2)}°, {g.lon.toFixed(2)}°</p>
            <p className="font-display text-4xl mt-1 leading-tight">{g.place}</p>
            <dl className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <dt className="label text-ink-2">Hardiness zone</dt>
                <dd className="font-display text-4xl text-moss">{g.zoneLabel}</dd>
              </div>
              <div>
                <dt className="label text-ink-2">Coldest night, avg.</dt>
                <dd className="font-display text-3xl">{g.avgExtremeMin.toFixed(1)} °C</dd>
              </div>
              <div>
                <dt className="label text-ink-2">Hottest month</dt>
                <dd className="font-display text-3xl">{g.hottestMonthMax.toFixed(0)} °C</dd>
              </div>
              <div>
                <dt className="label text-ink-2">Rain a year</dt>
                <dd className="font-display text-3xl">{Math.round(g.annualRain).toLocaleString()} mm</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-ink-2 max-w-[70ch]">
              From ten years of daily ERA5 weather reanalysis (Open-Meteo). The zone is the average of each year&apos;s coldest night.
              {aridity === "arid" || aridity === "dry"
                ? " Your climate is dry: drought-tolerant plants are listed first, and everything else will need watering."
                : aridity === "wet"
                  ? " Your climate is wet: favour plants that like moisture, and give Mediterranean herbs sharp drainage."
                  : ""}
            </p>
          </div>
          <button onClick={() => save(null)} className="label text-ink-2 hover:text-stamp justify-self-start md:justify-self-end">
            Change place
          </button>
        </div>
      )}

      {g && (
        <div className="mt-12 space-y-14">
          <p className="text-lg">
            <b className="font-semibold">{fitted.filter((x) => x.fit === "outdoors").length}</b> plants in the codex will grow outdoors in {g.place.split(",")[0]}, and{" "}
            <b className="font-semibold">{fitted.filter((x) => x.fit === "shelter").length}</b> more with winter shelter.
          </p>
          {BEDS.map((bed) => {
            const list = fitted.filter((x) => x.it.shelves.includes(bed.id)).sort(sortForRain);
            if (!list.length) return null;
            return (
              <section key={bed.id}>
                <div className="flex items-baseline justify-between border-b-[3px] border-double border-ink pb-2">
                  <h2 className="font-display text-3xl">{bed.title}</h2>
                  <span className="label text-ink-2">{list.length} plants</span>
                </div>
                <p className="text-ink-2 mt-2">{bed.note}</p>
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 mt-4">
                  {list.map(({ it, fit }) => (
                    <li key={it.slug} className="border-b rule">
                      <Link href={`/species/${it.slug}`} className="flex gap-4 py-3 group">
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
                            {fit === "outdoors" ? "Outdoors" : "Needs winter shelter"}
                            {it.water ? ` · water: ${it.water.split(/[;,.(]/)[0].toLowerCase()}` : ""}
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
            Hardiness zones describe winter cold only. Soil, summer heat, humidity, day length and local frost pockets matter too; each specimen sheet has the
            full growing notes. {FIT_TEXT.shelter}.
          </p>
        </div>
      )}
    </div>
  );
}
