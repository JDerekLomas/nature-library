import type { Metadata } from "next";
import { codexIn } from "@/lib/codex";
import { asLang } from "@/i18n/config";
import { dict } from "@/i18n/dict";
import { parseZones } from "@/lib/climate";
import GardenPlanner, { type GrowItem } from "./GardenPlanner";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const t = dict(asLang((await params).lang)).rooms.grow;
  return { title: t.title, description: t.metaDesc };
}

export default async function GrowPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = asLang((await params).lang);
  const t = dict(lang).rooms.grow;
  const items: GrowItem[] = codexIn(lang).filter((e) => e.kingdom === "Plantae" && e.grow?.zones).map((e) => ({
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
      <h1 className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-none mt-2">{t.heading}</h1>
      <p className="mt-4 max-w-[64ch] text-lg text-ink-2 leading-relaxed">{t.intro}</p>
      <div className="double-rule mt-8 pt-8">
        <GardenPlanner items={items} />
      </div>
    </div>
  );
}
