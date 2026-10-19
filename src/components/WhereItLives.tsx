"use client";

import { useEffect, useState } from "react";
import Globe from "./Globe";
import { useLang, useT } from "@/i18n/LangProvider";
import { LOCALE } from "@/i18n/config";

/** Globe of GBIF occurrence records for one taxon, with record count and top countries. */
export default function WhereItLives({ gbifKey, name, nativeRange, kingdom, rank }: { gbifKey?: number; name: string; nativeRange?: string; kingdom?: string; rank?: string }) {
  const lang = useLang();
  const t = useT().widgets;
  const [key, setKey] = useState<number | undefined>(gbifKey);
  const [count, setCount] = useState<number | null>(null);
  const [countries, setCountries] = useState<{ name: string; count: number }[]>([]);

  useEffect(() => {
    if (key) return;
    // kingdom and rank keep homonyms apart (Morus the gannet, Morus the mulberry)
    const extra = `${kingdom ? `&kingdom=${kingdom}` : ""}${rank ? `&rank=${rank.toUpperCase()}` : ""}`;
    fetch(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(name)}${extra}`)
      .then((r) => r.json())
      .then((j) => j.usageKey && j.matchType !== "NONE" && (!kingdom || j.kingdom === kingdom) && setKey(j.acceptedUsageKey ?? j.usageKey))
      .catch(() => {});
  }, [key, name, kingdom, rank]);

  useEffect(() => {
    if (!key) return;
    fetch(`https://api.gbif.org/v1/occurrence/search?taxonKey=${key}&limit=0&facet=country&country.facetLimit=8&hasCoordinate=true`)
      .then((r) => r.json())
      .then((j) => {
        setCount(j.count);
        const dn = new Intl.DisplayNames([lang], { type: "region" });
        setCountries(
          (j.facets?.[0]?.counts || []).map((c: { name: string; count: number }) => ({
            name: (() => {
              try {
                return dn.of(c.name) || c.name;
              } catch {
                return c.name;
              }
            })(),
            count: c.count,
          }))
        );
      })
      .catch(() => {});
  }, [key]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_260px] gap-8 items-center">
      <div className="max-w-[560px] w-full mx-auto">
        {key ? (
          <Globe gbif={`taxonKey=${key}`} initial={[20, 25]} step={2} autoRotate autoCenter />
        ) : (
          <Globe gbif={null} autoRotate />
        )}
      </div>
      <div>
        <p className="label text-ink-2">{t.recordedSightings}</p>
        <p className="font-display text-5xl mt-1">{count == null ? "—" : count.toLocaleString(LOCALE[lang])}</p>
        <p className="text-sm text-ink-2 mt-1">{t.georef}</p>
        {nativeRange && (
          <>
            <p className="label text-ink-2 mt-6">{t.nativeRange}</p>
            <p className="mt-1 leading-snug">{nativeRange}</p>
          </>
        )}
        {countries.length > 0 && (
          <>
            <p className="label text-ink-2 mt-6">{t.mostRecorded}</p>
            <ol className="mt-2 text-sm space-y-1">
              {countries.map((c, i) => (
                <li key={c.name} className="flex justify-between border-b rule pb-1">
                  <span>
                    <span className="font-mono text-ink-2 mr-2">{String(i + 1).padStart(2, "0")}</span>
                    {c.name}
                  </span>
                  <span className="font-mono text-ink-2">{c.count.toLocaleString(LOCALE[lang])}</span>
                </li>
              ))}
            </ol>
          </>
        )}
        <p className="mt-4 text-xs text-ink-2">{t.dragNote}</p>
      </div>
    </div>
  );
}
