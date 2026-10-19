"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Globe from "@/components/Globe";
import { atlasTree, pathTo } from "@/lib/atlas-tree";
import { useLang, useT } from "@/i18n/LangProvider";
import { lp, LOCALE, type Lang } from "@/i18n/config";

interface SpeciesCount {
  count: number;
  taxon: { id: number; name: string; preferred_common_name?: string; default_photo?: { square_url: string; medium_url: string }; iconic_taxon_name?: string };
}

/** Where the Atlas is looking: a point with a radius, or an official boundary (iNaturalist place). */
interface Where {
  label: string;
  sub?: string;
  lon: number;
  lat: number;
  radius: number; // km, used when there is no boundary
  placeId?: number; // iNaturalist standard place (country / province / district)
  placeName?: string;
  country?: string; // ISO2, for the GBIF country list
  kind?: string;
}

interface Hit {
  label: string;
  sub: string;
  lon: number;
  lat: number;
  kind: string;
  country?: string;
  extent?: [number, number, number, number]; // w, n, e, s
  admin?: 0 | 10 | 20;
}

const fmt = (lon: number, lat: number) => `${Math.abs(lat).toFixed(3)}°${lat >= 0 ? "N" : "S"}, ${Math.abs(lon).toFixed(3)}°${lon >= 0 ? "E" : "W"}`;

const PLACES: { name: string; es: string; ll: [number, number] }[] = [
  { name: "Amazon basin", es: "Cuenca amazónica", ll: [-62, -3.5] },
  { name: "Indus delta", es: "Delta del Indo", ll: [67.5, 24.4] },
  { name: "Great Barrier Reef", es: "Gran Barrera de Coral", ll: [146.5, -18] },
  { name: "Madagascar", es: "Madagascar", ll: [46.9, -19] },
  { name: "Hunza", es: "Hunza", ll: [74.66, 36.32] },
  { name: "Borneo", es: "Borneo", ll: [114, 1] },
  { name: "Serengeti", es: "Serengeti", ll: [34.8, -2.3] },
  { name: "Galápagos", es: "Galápagos", ll: [-90.5, -0.7] },
];

const RADII = [2, 5, 10, 25, 50, 200];

// how far around a named point to look, by the kind of place it is
function radiusFor(kind: string, extent?: Hit["extent"]) {
  if (extent) {
    const [w, n, e, s] = extent;
    const km = Math.hypot((e - w) * 111 * Math.cos((((n + s) / 2) * Math.PI) / 180), (n - s) * 111) / 2;
    return Math.max(2, Math.min(200, Math.round(km)));
  }
  if (/village|hamlet|locality|neighbourhood|suburb|house|isolated/.test(kind)) return 5;
  if (/town/.test(kind)) return 10;
  if (/city/.test(kind)) return 25;
  return 10;
}

const ADMIN: Record<string, 0 | 10 | 20> = { country: 0, state: 10, county: 20, district: 20 };

async function searchPlaces(q: string, signal: AbortSignal, lang: Lang, coordLabel: string, kinds: Record<string, string>): Promise<Hit[]> {
  const coord = q.match(/^\s*(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (coord) {
    const lat = Number(coord[1]);
    const lon = Number(coord[2]);
    if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) return [{ label: fmt(lon, lat), sub: coordLabel, lon, lat, kind: "point" }];
  }
  const [photon, meteo] = await Promise.all([
    fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=${lang === "es" ? "default" : "en"}`, { signal })
      .then((r) => r.json())
      .catch(() => ({ features: [] })),
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=${lang}`, { signal })
      .then((r) => r.json())
      .catch(() => ({ results: [] })),
  ]);
  const hits: Hit[] = [];
  for (const f of photon.features ?? []) {
    const p = f.properties ?? {};
    if (p.osm_key === "amenity" || p.osm_key === "shop" || p.osm_key === "building" || p.type === "house" && p.osm_key !== "place" && p.osm_key !== "historic" && p.osm_key !== "leisure") continue;
    const kind = p.type === "other" || p.type === "house" ? p.osm_value : p.type;
    hits.push({
      label: p.name,
      sub: [kinds[kind] ?? kind?.replace(/_/g, " "), [p.county, p.state, p.country].filter((x: string) => x && x !== p.name).join(", ")].filter(Boolean).join(" · "),
      lon: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
      kind: kind ?? "place",
      country: p.countrycode,
      extent: p.extent,
      admin: ADMIN[p.type],
    });
  }
  for (const m of meteo.results ?? []) {
    if (hits.some((h) => (Math.abs(h.lat - m.latitude) < 0.05 && Math.abs(h.lon - m.longitude) < 0.05) || (h.label === m.name && h.country?.toUpperCase() === m.country_code && Math.abs(h.lat - m.latitude) < 3))) continue;
    const kind = m.feature_code?.startsWith("PPL") ? (m.population > 100000 ? "city" : m.population > 10000 ? "town" : "village") : m.feature_code === "PCLI" ? "country" : "place";
    hits.push({
      label: m.name,
      sub: [kinds[kind] ?? kind, [m.admin2, m.admin1, m.country].filter(Boolean).join(", ")].join(" · "),
      lon: m.longitude,
      lat: m.latitude,
      kind,
      country: m.country_code,
      admin: kind === "country" ? 0 : undefined,
    });
  }
  return hits.slice(0, 10);
}

/** The iNaturalist standard place (official boundary) at a point, at the wanted admin level. */
async function boundaryAt(lat: number, lon: number, level: 0 | 10 | 20) {
  const d = 0.01;
  const r = await fetch(`https://api.inaturalist.org/v1/places/nearby?nelat=${lat + d}&nelng=${lon + d}&swlat=${lat - d}&swlng=${lon - d}&per_page=40`).catch(() => null);
  if (!r?.ok) return null;
  const j = await r.json();
  const p = (j.results?.standard ?? []).find((x: { admin_level: number }) => x.admin_level === level);
  return p ? { id: p.id as number, name: p.display_name as string } : null;
}

export default function AtlasClient() {
  const lang = useLang();
  const t = useT().rooms.atlas;
  const TREE = useMemo(() => atlasTree(lang), [lang]);
  const [layer, setLayer] = useState(TREE.get("all")!);
  const trail = pathTo(TREE, layer.id);
  const [where, setWhere] = useState<Where | null>(null);
  const [list, setList] = useState<SpeciesCount[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [cells, setCells] = useState(0);
  const [focus, setFocus] = useState<[number, number] | null>(null);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [copied, setCopied] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const [listErr, setListErr] = useState(false);
  const [retry, setRetry] = useState(0);
  const skipSearch = useRef(false); // a place was just chosen: don't reopen the suggestions for its label
  const req = useRef(0); // latest boundary lookup wins
  // the species list depends on where (as a search scope) and what, not on the place's display label
  const scope = where ? (where.placeId ? `place_id=${where.placeId}` : `lat=${where.lat}&lng=${where.lon}&radius=${where.radius}`) : null;

  // restore a shared view from the URL
  useEffect(() => {
    const u = new URL(window.location.href);
    const lat = Number(u.searchParams.get("lat"));
    const lon = Number(u.searchParams.get("lng"));
    const l = TREE.get(u.searchParams.get("layer") ?? "");
    if (l) setLayer(l);
    if (!u.searchParams.has("lat") || !Number.isFinite(lat) || !Number.isFinite(lon)) return;
    const w: Where = {
      label: u.searchParams.get("q") ?? fmt(lon, lat),
      lon,
      lat,
      radius: Number(u.searchParams.get("r")) || 10,
      placeId: Number(u.searchParams.get("place")) || undefined,
      placeName: u.searchParams.get("pn") ?? undefined,
      country: u.searchParams.get("cc") ?? undefined,
    };
    setWhere(w);
    setFocus([lon, lat]);
  }, []);

  // keep the URL in step so any view can be shared
  useEffect(() => {
    const u = new URL(window.location.href);
    if (!where) {
      if (layer.id === "all") u.searchParams.delete("layer");
      else u.searchParams.set("layer", layer.id);
      window.history.replaceState(null, "", u.toString());
      return;
    }
    u.search = "";
    u.searchParams.set("q", where.label);
    u.searchParams.set("lat", where.lat.toFixed(4));
    u.searchParams.set("lng", where.lon.toFixed(4));
    if (where.placeId) {
      u.searchParams.set("place", String(where.placeId));
      if (where.placeName) u.searchParams.set("pn", where.placeName);
    } else u.searchParams.set("r", String(where.radius));
    if (where.country) u.searchParams.set("cc", where.country);
    if (layer.id !== "all") u.searchParams.set("layer", layer.id);
    window.history.replaceState(null, "", u.toString());
  }, [where, layer]);

  // species list
  useEffect(() => {
    if (!scope) return;
    const ctl = new AbortController();
    if (page === 1) setList(null);
    setListErr(false);
    const iconic = layer.inat ? `&taxon_id=${layer.inat}` : "";
    fetch(`https://api.inaturalist.org/v1/observations/species_counts?${scope}&verifiable=true&per_page=60&page=${page}${iconic}&locale=${lang}`, { signal: ctl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((j) => {
        setList((prev) => {
          if (page === 1) return j.results || [];
          const have = new Set((prev ?? []).map((x) => x.taxon.id));
          return [...(prev ?? []), ...(j.results || []).filter((x: SpeciesCount) => !have.has(x.taxon.id))];
        });
        setTotal(j.total_results || 0);
      })
      .catch((e) => {
        if (e?.name === "AbortError") return;
        setListErr(true);
        setList((prev) => prev ?? []);
      });
    return () => ctl.abort();
  }, [scope, layer.inat, page, lang, retry]);

  // place search
  useEffect(() => {
    if (q.trim().length < 2) {
      setHits([]);
      return;
    }
    if (skipSearch.current) {
      skipSearch.current = false;
      return;
    }
    const ctl = new AbortController();
    const timer = setTimeout(() => {
      searchPlaces(q.trim(), ctl.signal, lang, t.coordinates, t.kinds).then((h) => {
        setHits(h);
        setOpen(true);
      });
    }, 280);
    return () => {
      clearTimeout(timer);
      ctl.abort();
    };
  }, [q, lang]);

  useEffect(() => {
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const goTo = useCallback(async (h: Hit) => {
    const id = ++req.current;
    setOpen(false);
    skipSearch.current = true;
    setQ(h.label);
    setPage(1);
    setFocus([h.lon, h.lat]);
    const base: Where = { label: h.label, sub: h.sub, lon: h.lon, lat: h.lat, radius: radiusFor(h.kind, h.admin === undefined ? h.extent : undefined), country: h.country?.toUpperCase(), kind: h.kind };
    if (h.admin !== undefined) {
      setResolving(true);
      const b = await boundaryAt(h.lat, h.lon, h.admin);
      if (id !== req.current) return; // a newer choice was made while this one resolved
      setResolving(false);
      if (b) return setWhere({ ...base, placeId: b.id, placeName: b.name });
      base.radius = radiusFor(h.kind, h.extent);
    }
    setWhere(base);
  }, []);

  const pickPoint = async (lon: number, lat: number) => {
    ++req.current;
    setResolving(false);
    setPage(1);
    const w: Where = { label: fmt(lon, lat), lon, lat, radius: where && !where.placeId ? where.radius : 25 };
    setWhere(w);
    // name the spot (Photon reverse geocoding, OpenStreetMap data)
    const r = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}&lang=${lang === "es" ? "default" : "en"}`).catch(() => null);
    const j = r?.ok ? await r.json() : null;
    const p = j?.features?.[0]?.properties;
    if (p) setWhere((cur) => (cur && cur.lat === lat ? { ...cur, label: p.name ?? p.city ?? p.county ?? p.state ?? cur.label, sub: [p.city, p.state, p.country].filter((x: string) => x && x !== p.name).join(", "), country: p.countrycode?.toUpperCase() } : cur));
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="night min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 py-8 grid xl:grid-cols-[minmax(0,1fr)_500px] gap-8">
        <div>
          <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
            <div>
              <h1 className="font-display text-[clamp(2.4rem,5vw,4rem)] leading-none mt-1">{t.heading}</h1>
            </div>
            <p className="text-[#c9c2a8] max-w-[52ch] text-sm leading-relaxed">{t.intro(cells ? t.cells(cells.toLocaleString(LOCALE[lang])) : "")}</p>
          </div>

          {/* place search */}
          <div ref={box} className="relative mt-6 max-w-[640px]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (hits[0]) goTo(hits[0]);
              }}
              className="flex items-center border-b border-[#e8e2cf66] focus-within:border-glow py-2"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" className="text-glow shrink-0" aria-hidden>
                <path d="M10 18s6-5.2 6-10A6 6 0 0 0 4 8c0 4.8 6 10 6 10z" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="10" cy="8" r="2" fill="currentColor" />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => hits.length && setOpen(true)}
                placeholder={t.placeholder}
                className="w-full bg-transparent outline-none px-3 font-display text-xl text-[#f1ebd8] placeholder:text-[#a9a28a]"
                aria-label={t.findAria}
              />
              {resolving && <span className="label text-glow/80 shrink-0">{t.resolving}</span>}
            </form>
            {open && hits.length > 0 && (
              <ul className="absolute z-40 mt-1 w-full bg-[#141c17] border border-[#e8e2cf33] shadow-[0_20px_40px_-20px_#000]">
                {hits.map((h, i) => (
                  <li key={`${h.lat},${h.lon},${i}`}>
                    <button onClick={() => goTo(h)} className="w-full text-left px-4 py-2.5 border-b border-[#e8e2cf14] last:border-0 hover:bg-[#1f2b23]">
                      <span className="block text-[#f1ebd8]">{h.label}</span>
                      <span className="block text-xs text-[#a9a28a]">{h.sub}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* the filter is a tree of life: each choice opens its branches beneath it */}
          <div className="mt-5 space-y-2" role="group" aria-label={t.filterAria}>
            {trail
              .filter((n) => n.children.length)
              .map((n, row) => (
                <div key={n.id} className={`flex flex-wrap items-center gap-2 ${row ? "pl-4 sm:pl-6 border-l border-glow/40 ml-1" : ""}`}>
                  {row > 0 && <span className="label text-glow/70 mr-1 !text-[0.6rem]">{n.label} ›</span>}
                  {(row === 0 ? [TREE.get("all")!, ...n.children.map((c) => TREE.get(c)!)] : n.children.map((c) => TREE.get(c)!)).map((l) => {
                    const on = l.id === layer.id;
                    const onPath = !on && trail.some((x) => x.id === l.id) && l.id !== "all";
                    return (
                      <button
                        key={l.id}
                        aria-pressed={on}
                        aria-expanded={l.children.length ? on || onPath : undefined}
                        onClick={() => {
                          setLayer(l);
                          setPage(1);
                        }}
                        title={l.sci}
                        className={`border transition-colors ${row ? "px-2.5 py-1 text-[0.82rem]" : "px-3 py-1.5 text-sm"} ${
                          on ? "bg-glow text-night border-glow" : onPath ? "border-glow text-glow" : "border-[#e8e2cf33] text-[#d8d1bb] hover:border-glow"
                        }`}
                      >
                        {l.label}
                        {l.children.length > 0 && <span className="ml-1.5 opacity-60">{on || onPath ? "▾" : "▸"}</span>}
                      </button>
                    );
                  })}
                </div>
              ))}
            {layer.sci && <p className="label text-glow/60 !text-[0.6rem] pl-1 latin normal-case">{trail.filter((n) => n.sci).map((n) => n.sci).join(" › ")}</p>}
          </div>
          <div className="max-w-[820px] mx-auto mt-4">
            <Globe gbif={layer.gbif} theme="night" step={1} onPick={pickPoint} marker={where ? [where.lon, where.lat] : null} focus={focus} initial={[30, 15]} onStats={(s) => setCells(s.cells)} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center label text-[#a9a28a]">
            <span>{t.goTo}</span>
            {PLACES.map((p) => (
              <button
                key={p.name}
                onClick={() => {
                  ++req.current;
                  setPage(1);
                  setFocus(p.ll);
                  skipSearch.current = true;
                  setQ(lang === "es" ? p.es : p.name);
                  setWhere({ label: lang === "es" ? p.es : p.name, lon: p.ll[0], lat: p.ll[1], radius: 50 });
                }}
                className="hover:text-glow"
              >
                {lang === "es" ? p.es : p.name}
              </button>
            ))}
          </div>
        </div>

        <aside className="xl:border-l border-[#e8e2cf22] xl:pl-8 min-w-0">
          {!where ? (
            <div className="xl:mt-28 text-[#c9c2a8]">
              <p className="font-display text-3xl text-[#efe9d6] leading-tight">{t.emptyTitle}</p>
              <p className="mt-3 leading-relaxed">{t.emptyText}</p>
            </div>
          ) : (
            <div>
              <p className="label text-glow/80">{fmt(where.lon, where.lat)}</p>
              <p className="font-display text-3xl mt-1 leading-tight text-[#efe9d6]">{where.label}</p>
              {where.sub && <p className="text-sm text-[#a9a28a] mt-1">{where.sub}</p>}
              {where.placeId ? (
                <p className="mt-4 text-sm text-[#c9c2a8]">
                  {t.boundary} <span className="text-glow">{where.placeName}</span>.{" "}
                  <button
                    onClick={() => {
                      setPage(1);
                      setWhere({ ...where, placeId: undefined, radius: 25 });
                    }} className="underline underline-offset-4 hover:text-glow">
                    {t.useRadius}
                  </button>
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-2 mt-4 text-sm text-[#c9c2a8]">
                  <span>{t.within}</span>
                  {RADII.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setPage(1);
                        setWhere({ ...where, radius: r });
                      }}
                      className={`px-2 py-0.5 border ${r === where.radius ? "border-glow text-glow" : "border-[#e8e2cf33]"}`}
                    >
                      {r} km
                    </button>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-4 text-sm">
                <button onClick={share} className="text-glow hover:underline underline-offset-4">
                  {copied ? t.copied : t.copy}
                </button>
                {where.country && (
                  <Link href={lp(lang, `/catalogue/country/${where.country.toLowerCase()}${/^taxonKey=\d+$/.test(layer.gbif) ? `?g=${layer.gbif.split("=")[1]}` : ""}`)} className="text-[#d8d1bb] hover:text-glow">
                    {t.everyInCountry}
                  </Link>
                )}
              </div>
              <p className="mt-5 text-sm text-[#a9a28a]">
                {list === null ? t.reading : t.recordedHere(total.toLocaleString(LOCALE[lang]), layer.label.toLowerCase())}
              </p>
              {listErr && (
                <p className="mt-3 text-sm text-[#e8b0a0]">
                  {t.listError}{" "}
                  <button onClick={() => setRetry((n) => n + 1)} className="underline underline-offset-4 hover:text-glow">
                    {t.retry}
                  </button>
                </p>
              )}
              <ul className="mt-4 grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-3 gap-3">
                {(list ?? []).map((s) => (
                  <li key={s.taxon.id}>
                    <Link href={lp(lang, `/taxon/${s.taxon.id}`)} className="group block">
                      <div className="aspect-square overflow-hidden bg-night-2">
                        {s.taxon.default_photo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={s.taxon.default_photo.medium_url} alt="" loading="lazy" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition duration-500" />
                        )}
                      </div>
                      <p className="text-[0.8rem] leading-tight mt-1.5 text-[#efe9d6] line-clamp-2">{s.taxon.preferred_common_name || s.taxon.name}</p>
                      <p className="font-mono text-[0.6rem] text-[#a9a28a]">{s.count.toLocaleString(LOCALE[lang])} obs.</p>
                    </Link>
                  </li>
                ))}
              </ul>
              {list && list.length < total && (
                <button onClick={() => setPage((p) => p + 1)} className="mt-6 w-full border border-[#e8e2cf33] py-2.5 text-sm text-[#d8d1bb] hover:border-glow hover:text-glow">
                  {t.more(Math.min(60, total - list.length), total.toLocaleString(LOCALE[lang]))}
                </button>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
