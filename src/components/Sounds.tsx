"use client";

import { useEffect, useState } from "react";
import { useT } from "@/i18n/LangProvider";

interface Rec {
  url: string;
  type: string;
  attribution: string;
  license: string;
  place?: string;
  date?: string;
  obs: number;
}

/** Field recordings of this species from iNaturalist, openly licensed only. */
export default function Sounds({ inatId, name }: { inatId?: number; name: string }) {
  const t = useT().widgets;
  const [recs, setRecs] = useState<Rec[] | null>(null);
  useEffect(() => {
    if (!inatId) return setRecs([]);
    fetch(`https://api.inaturalist.org/v1/observations?taxon_id=${inatId}&sounds=true&quality_grade=research&per_page=30&order_by=votes`)
      .then((r) => r.json())
      .then((j) => {
        const out: Rec[] = [];
        for (const o of j.results ?? [])
          for (const s of o.sounds ?? [])
            if (s.license_code && s.file_url && out.length < 4)
              out.push({ url: s.file_url, type: s.file_content_type, attribution: s.attribution, license: s.license_code, place: o.place_guess, date: o.observed_on, obs: o.id });
        setRecs(out);
      })
      .catch(() => setRecs([]));
  }, [inatId]);

  if (recs === null) return <p className="label text-ink-2">{t.lookingRecordings}</p>;
  if (!recs.length) return <p className="text-sm text-ink-2">{t.noRecordings(name.toLowerCase())}</p>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {recs.map((r) => (
        <figure key={r.url} className="border rule bg-card p-3">
          <audio controls preload="none" className="w-full h-9">
            <source src={r.url} type={r.type === "audio/x-wav" ? "audio/wav" : r.type} />
          </audio>
          <figcaption className="text-xs text-ink-2 mt-2 leading-snug">
            {r.place ? `${r.place.split(",").slice(-2).join(",").trim()}` : t.unknownPlace}
            {r.date ? `, ${r.date}` : ""}. {r.attribution}.{" "}
            <a href={`https://www.inaturalist.org/observations/${r.obs}`} target="_blank" rel="noreferrer" className="link-ink">
              {t.observation}
            </a>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
