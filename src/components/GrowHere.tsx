"use client";

import Link from "next/link";
import GardenPicker, { useGarden } from "./GardenPicker";
import { fitFor, parseZones } from "@/lib/climate";
import { useLang, useT } from "@/i18n/LangProvider";
import { lp } from "@/i18n/config";

/** "Can it grow where you are?" — on each plant's sheet. */
export default function GrowHere({ zones, name }: { zones?: string; name: string }) {
  const [g, save] = useGarden();
  const lang = useLang();
  const t = useT().widgets;
  const range = parseZones(zones);
  if (!range) return null;
  const fit = g ? fitFor(range, g.zone) : null;
  const tone = fit === "outdoors" ? "#2e4a32" : fit === "shelter" ? "#b5852a" : "#9b2f25";
  return (
    <div className="border border-ink p-5 bg-card">
      <p className="label text-ink-2">{t.canItGrow}</p>
      {!g ? (
        <div className="mt-3">
          <GardenPicker compact />
        </div>
      ) : (
        <div className="mt-2">
          <p className="font-display text-2xl leading-snug" style={{ color: tone }}>
            {fit ? t.fit[fit] : "—"}
          </p>
          <p className="mt-2 text-sm text-ink-2">
            {t.growSummary(g.place, g.zoneLabel, g.avgExtremeMin.toFixed(1), Math.round(g.annualRain), name, range[0], range[1])}
          </p>
          <p className="mt-3 flex gap-5 text-sm">
            <Link href={lp(lang, "/grow")} className="link-ink text-moss">
              {t.everythingYouCanGrow}
            </Link>
            <button onClick={() => save(null)} className="text-ink-2 hover:text-stamp">
              {t.changePlace}
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
