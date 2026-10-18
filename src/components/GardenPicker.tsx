"use client";

import { useEffect, useState } from "react";
import { CLIMATE_KEY, fetchClimate, type Climate } from "@/lib/climate";

/** Remembers the visitor's garden (in this browser only) across pages. */
export function useGarden() {
  const [garden, setGarden] = useState<Climate | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CLIMATE_KEY);
      if (raw) setGarden(JSON.parse(raw));
    } catch {}
    const on = (e: Event) => setGarden((e as CustomEvent<Climate | null>).detail);
    window.addEventListener("nl-garden", on);
    return () => window.removeEventListener("nl-garden", on);
  }, []);
  const save = (c: Climate | null) => {
    try {
      if (c) localStorage.setItem(CLIMATE_KEY, JSON.stringify(c));
      else localStorage.removeItem(CLIMATE_KEY);
    } catch {}
    window.dispatchEvent(new CustomEvent("nl-garden", { detail: c }));
  };
  return [garden, save] as const;
}

interface Place {
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

export default function GardenPicker({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  const [, save] = useGarden();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Place[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    const ctl = new AbortController();
    const t = setTimeout(() => {
      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en`, { signal: ctl.signal })
        .then((r) => r.json())
        .then((j) => setHits(j.results ?? []))
        .catch(() => {});
    }, 250);
    return () => {
      clearTimeout(t);
      ctl.abort();
    };
  }, [q]);

  const choose = async (lat: number, lon: number, place: string) => {
    setBusy(place);
    setErr(null);
    setHits([]);
    try {
      save(await fetchClimate(Math.round(lat * 100) / 100, Math.round(lon * 100) / 100, place));
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const locate = () => {
    if (!navigator.geolocation) return setErr("This browser cannot share its location.");
    setBusy("your location");
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const { latitude: la, longitude: lo } = p.coords;
        let place = "Your garden";
        try {
          const r = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${la}&longitude=${lo}&localityLanguage=en`);
          const j = await r.json();
          place = [j.city || j.locality, j.principalSubdivision, j.countryName].filter(Boolean).join(", ") || place;
        } catch {}
        choose(la, lo, place);
      },
      () => {
        setBusy(null);
        setErr("Location was not shared. Type a town instead.");
      },
      { timeout: 10000 }
    );
  };

  const line = dark ? "border-[#e8e2cf55]" : "border-ink/60";
  return (
    <div className={compact ? "" : "max-w-[620px]"}>
      <div className={`flex flex-wrap gap-3 items-end`}>
        <div className="relative flex-1 min-w-[220px]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Type your town or city"
            className={`w-full bg-transparent border-b ${line} py-2 outline-none focus:border-moss ${compact ? "text-sm" : "text-lg font-display"}`}
            aria-label="Town or city"
          />
          {hits.length > 0 && (
            <ul className="absolute z-30 mt-1 w-full bg-card border border-ink/70 text-ink shadow-[0_18px_40px_-20px_#0006]">
              {hits.map((h) => {
                const label = [h.name, h.admin1, h.country].filter(Boolean).join(", ");
                return (
                  <li key={`${h.latitude},${h.longitude}`}>
                    <button onClick={() => choose(h.latitude, h.longitude, label)} className="w-full text-left px-3 py-2 text-sm hover:bg-paper-2 border-b rule last:border-0">
                      {label}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <span className="label text-ink-2 pb-2.5">or</span>
        <button onClick={locate} className={`border ${dark ? "border-glow text-glow" : "border-ink"} px-4 py-2 text-sm hover:bg-moss hover:text-paper hover:border-moss transition-colors`}>
          Use my location
        </button>
      </div>
      {busy && <p className="label text-ink-2 mt-3">Reading ten years of weather for {busy}…</p>}
      {err && <p className="text-sm text-stamp mt-3">{err}</p>}
    </div>
  );
}
