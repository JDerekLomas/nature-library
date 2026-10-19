"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLang, useT } from "@/i18n/LangProvider";
import { lp } from "@/i18n/config";

interface Row {
  count: number;
  taxon: { id: number; name: string; preferred_common_name?: string; default_photo?: { medium_url: string } };
}


/** Birds naturalists have recorded near the visitor in the current calendar month, across all years. */
export default function BirdsNear({ codex }: { codex: Record<number, string> }) {
  const lang = useLang();
  const t = useT().rooms.aviary.near;
  const MONTHS = t.months;
  const [rows, setRows] = useState<Row[] | null>(null);
  const [state, setState] = useState<"idle" | "locating" | "loading" | "denied">("idle");
  const [playing, setPlaying] = useState<number | null>(null);
  const [audio] = useState(() => (typeof Audio !== "undefined" ? new Audio() : null));
  // the visitor's own month, read after hydration (the server's clock is UTC and may be in another month)
  const [month, setMonth] = useState(0);
  useEffect(() => setMonth(new Date().getMonth() + 1), []);
  const want = useRef<number | null>(null); // the bird most recently asked for: a slower earlier fetch must not start playing
  useEffect(() => () => audio?.pause(), [audio]);

  const go = () => {
    if (!navigator.geolocation) return setState("denied");
    setState("locating");
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        setState("loading");
        const r = await fetch(
          `https://api.inaturalist.org/v1/observations/species_counts?taxon_id=3&lat=${p.coords.latitude}&lng=${p.coords.longitude}&radius=50&month=${month}&verifiable=true&per_page=48&locale=${lang}`
        ).catch(() => null);
        const j = r?.ok ? await r.json() : { results: [] };
        setRows(j.results ?? []);
        setState("idle");
      },
      () => setState("denied"),
      { timeout: 10000 }
    );
  };

  const play = async (id: number) => {
    if (!audio) return;
    if (playing === id) {
      audio.pause();
      want.current = null;
      return setPlaying(null);
    }
    audio.pause();
    want.current = id;
    setPlaying(id);
    const r = await fetch(`https://api.inaturalist.org/v1/observations?taxon_id=${id}&sounds=true&quality_grade=research&per_page=10&order_by=votes`).catch(() => null);
    const j = r?.ok ? await r.json() : { results: [] };
    const s = (j.results ?? []).flatMap((o: { sounds: { license_code?: string; file_url?: string }[] }) => o.sounds).find((x: { license_code?: string; file_url?: string }) => x.license_code && x.file_url);
    if (want.current !== id) return;
    if (!s) return setPlaying(null);
    audio.src = s.file_url;
    audio.onended = () => setPlaying(null);
    audio.play().catch(() => setPlaying(null));
  };

  return (
    <div className="night px-5 sm:px-8 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-glow/80">{t.kicker(month ? MONTHS[month - 1] : "")}</p>
          <p className="font-display text-3xl mt-1 text-[#f1ebd8]">{t.title}</p>
        </div>
        {!rows && (
          <button onClick={go} className="px-5 py-2.5 bg-glow text-night font-display text-lg hover:bg-[#f3d98f]">
            {state === "locating" ? t.finding : state === "loading" ? t.reading : t.use}
          </button>
        )}
      </div>
      {state === "denied" && <p className="mt-3 text-sm text-[#c9c2a8]">{t.denied}</p>}
      {rows && (
        <>
          <p className="mt-3 text-sm text-[#c9c2a8]">
            {t.summary(rows.length, MONTHS[month - 1] ?? "")}
          </p>
          <ul className="mt-5 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {rows.map((r) => (
              <li key={r.taxon.id} className="relative">
                <Link href={lp(lang, codex[r.taxon.id] ? `/species/${codex[r.taxon.id]}` : `/taxon/${r.taxon.id}`)} className="block group">
                  <div className="aspect-square bg-night-2 overflow-hidden">
                    {r.taxon.default_photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.taxon.default_photo.medium_url} alt="" loading="lazy" className="w-full h-full object-cover opacity-90 group-hover:opacity-100" />
                    )}
                  </div>
                  <p className="text-[0.78rem] leading-tight mt-1.5 text-[#efe9d6] line-clamp-2">{r.taxon.preferred_common_name ?? r.taxon.name}</p>
                </Link>
                <button
                  onClick={() => play(r.taxon.id)}
                  aria-label={t.play(r.taxon.preferred_common_name ?? r.taxon.name)}
                  className={`absolute top-1.5 right-1.5 w-7 h-7 rounded-full text-sm ${playing === r.taxon.id ? "bg-glow text-night" : "bg-night/70 text-glow"}`}
                >
                  {playing === r.taxon.id ? "■" : "♪"}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
