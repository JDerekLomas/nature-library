import type { Metadata } from "next";
import { CODEX } from "@/lib/codex";
import { parseZones } from "@/lib/climate";
import GardenPlanner, { type GrowItem } from "./GardenPlanner";

export const metadata: Metadata = {
  title: "Garden Planner",
  description: "Tell the library where you live; it reads ten years of your weather and lists the plants you can grow there.",
};

export default function GrowPage() {
  const items: GrowItem[] = CODEX.filter((e) => e.kingdom === "Plantae" && e.grow?.zones).map((e) => ({
    slug: e.slug,
    common: e.common,
    scientific: e.scientific,
    range: parseZones(e.grow!.zones),
    shelves: e.shelves,
    photo: e.photos?.[0]?.square ?? e.photos?.[0]?.medium,
    water: e.grow!.water,
    sun: e.grow!.sun,
    harvest: e.grow!.timeToHarvest,
    edibility: e.edibility,
  }));
  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 pt-10">
      <p className="label text-ink-2">Door VI · By climate</p>
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-none mt-2">The Garden Planner</h1>
      <p className="mt-4 max-w-[64ch] text-lg text-ink-2 leading-relaxed">
        Tell the library where your garden is. It will read ten years of your local weather, work out how cold your winters really get, and list every plant
        in the codex you can grow there: physic bed, orchard, kitchen garden and nectary.
      </p>
      <div className="double-rule mt-8 pt-8">
        <GardenPlanner items={items} />
      </div>
    </div>
  );
}
