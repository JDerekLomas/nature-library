"use client";

import Link from "next/link";
import GardenPicker, { useGarden } from "./GardenPicker";
import { fitFor, FIT_TEXT, parseZones } from "@/lib/climate";

/** "Can it grow where you are?" — on each plant's sheet. */
export default function GrowHere({ zones, name }: { zones?: string; name: string }) {
  const [g, save] = useGarden();
  const range = parseZones(zones);
  if (!range) return null;
  const fit = g ? fitFor(range, g.zone) : null;
  const tone = fit === "outdoors" ? "#2e4a32" : fit === "shelter" ? "#b5852a" : "#9b2f25";
  return (
    <div className="border border-ink p-5 bg-card">
      <p className="label text-ink-2">Can it grow where you are?</p>
      {!g ? (
        <div className="mt-3">
          <GardenPicker compact />
        </div>
      ) : (
        <div className="mt-2">
          <p className="font-display text-2xl leading-snug" style={{ color: tone }}>
            {fit ? FIT_TEXT[fit] : "—"}
          </p>
          <p className="mt-2 text-sm text-ink-2">
            {g.place} is zone {g.zoneLabel} (coldest nights average {g.avgExtremeMin.toFixed(1)} °C, {Math.round(g.annualRain)} mm of rain a year). {name} is hardy
            in zones {range[0]}–{range[1]}.
          </p>
          <p className="mt-3 flex gap-5 text-sm">
            <Link href="/grow" className="link-ink text-moss">
              Everything you can grow there
            </Link>
            <button onClick={() => save(null)} className="text-ink-2 hover:text-stamp">
              Change place
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
