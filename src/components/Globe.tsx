"use client";

import { useEffect, useRef, useState } from "react";
import { geoOrthographic, geoPath, geoGraticule10 } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import land110 from "world-atlas/land-110m.json";

type Theme = "paper" | "night";

interface Props {
  /** GBIF occurrence query string, e.g. "taxonKey=6". Empty string = all life. null = no density layer. */
  gbif: string | null;
  theme?: Theme;
  autoRotate?: boolean;
  initial?: [number, number]; // [lon, lat] to face
  onPick?: (lon: number, lat: number) => void;
  marker?: [number, number] | null;
  /** when this changes, the globe turns to face it */
  focus?: [number, number] | null;
  className?: string;
  ring?: boolean;
  /** pixel sampling step over the GBIF tile; lower = denser */
  step?: number;
  onStats?: (s: { cells: number }) => void;
  /** turn to face the weighted centre of the density layer once loaded */
  autoCenter?: boolean;
}

const LAND = feature(
  land110 as unknown as Topology,
  (land110 as unknown as Topology).objects.land as GeometryCollection
);
const GRATICULE = geoGraticule10();
const RAD = Math.PI / 180;

// cache density layers between mounts
const layerCache = new Map<string, Float32Array>();

async function loadDensity(query: string, step: number): Promise<Float32Array> {
  const key = `${query}|${step}`;
  const hit = layerCache.get(key);
  if (hit) return hit;
  const out: number[] = [];
  await Promise.all(
    [0, 1].map(async (x) => {
      const url = `https://api.gbif.org/v2/map/occurrence/density/0/${x}/0@1x.png?srs=EPSG:4326&style=classic.point${query ? "&" + query : ""}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const bmp = await createImageBitmap(await res.blob());
      const c = document.createElement("canvas");
      c.width = bmp.width;
      c.height = bmp.height;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(bmp, 0, 0);
      const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);
      for (let py = 0; py < height; py += step) {
        for (let px = 0; px < width; px += step) {
          // take the max over the step×step block so sparse records still show
          let best = 0;
          let a = 0;
          for (let dy = 0; dy < step; dy++)
            for (let dx = 0; dx < step; dx++) {
              const i = ((py + dy) * width + (px + dx)) * 4;
              if (data[i + 3] > 0) {
                a = 1;
                // classic palette runs yellow (sparse) → red (dense): low green = dense
                const v = 1 - data[i + 1] / 255;
                if (v > best) best = v;
              }
            }
          if (!a) continue;
          const lon = -180 + ((x * width + px + step / 2) / (width * 2)) * 360;
          const lat = 90 - ((py + step / 2) / height) * 180;
          out.push(lon, lat, Math.max(0.12, best));
        }
      }
    })
  );
  const arr = new Float32Array(out);
  layerCache.set(key, arr);
  return arr;
}

export default function Globe({
  gbif,
  theme = "paper",
  autoRotate = true,
  initial = [20, 15],
  onPick,
  marker,
  focus,
  className = "",
  ring = true,
  step = 2,
  onStats,
  autoCenter = false,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const state = useRef({
    rot: [-initial[0], -initial[1]] as [number, number],
    drag: null as null | { x: number; y: number; rot: [number, number]; moved: number },
    vel: 0,
    idleUntil: 0,
    pts: null as Float32Array | null,
    size: 400,
    marker: marker ?? null,
    target: null as null | [number, number],
    sparse: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    state.current.marker = marker ?? null;
  }, [marker]);

  useEffect(() => {
    if (focus) {
      state.current.target = [-focus[0], -Math.max(-60, Math.min(60, focus[1]))];
      state.current.idleUntil = performance.now() + 9000;
    }
  }, [focus]);

  // density layer
  useEffect(() => {
    let cancelled = false;
    if (gbif === null) {
      state.current.pts = null;
      return;
    }
    setLoading(true);
    loadDensity(gbif, step)
      .then((pts) => {
        if (cancelled) return;
        state.current.pts = pts;
        state.current.sparse = pts.length / 3 < 40000;
        onStats?.({ cells: pts.length / 3 });
        if (autoCenter && pts.length) {
          // weighted spherical mean of the records
          let x = 0, y = 0, z = 0;
          for (let i = 0; i < pts.length; i += 3) {
            const lo = pts[i] * RAD, la = pts[i + 1] * RAD, w = 0.2 + pts[i + 2] * pts[i + 2];
            x += w * Math.cos(la) * Math.cos(lo);
            y += w * Math.cos(la) * Math.sin(lo);
            z += w * Math.sin(la);
          }
          const lon = Math.atan2(y, x) / RAD;
          const lat = Math.atan2(z, Math.hypot(x, y)) / RAD;
          state.current.target = [-lon, -Math.max(-45, Math.min(45, lat))];
          state.current.idleUntil = performance.now() + 7000;
        }
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gbif, step]);

  // render loop
  useEffect(() => {
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const night = theme === "night";

    // hatch pattern for land (engraved look)
    const pat = document.createElement("canvas");
    pat.width = pat.height = 6 * dpr;
    const pc = pat.getContext("2d")!;
    pc.strokeStyle = night ? "#e8e2cf18" : "#1b1d1626";
    pc.lineWidth = 0.7 * dpr;
    pc.beginPath();
    pc.moveTo(0, pat.height);
    pc.lineTo(pat.width, 0);
    pc.stroke();
    const hatch = ctx.createPattern(pat, "repeat")!;

    const ro = new ResizeObserver(() => {
      const w = wrap.current!.clientWidth;
      state.current.size = w;
      cv.width = w * dpr;
      cv.height = w * dpr;
      cv.style.width = `${w}px`;
      cv.style.height = `${w}px`;
    });
    ro.observe(wrap.current!);

    let raf = 0;
    const draw = () => {
      const s = state.current;
      const W = s.size * dpr;
      const r = (W / 2) * (ring ? 0.86 : 0.98);
      const cx = W / 2;
      const cy = W / 2;
      if (s.target && !s.drag) {
        const dl = ((s.target[0] - s.rot[0] + 540) % 360) - 180;
        const dp = s.target[1] - s.rot[1];
        s.rot[0] += dl * 0.08;
        s.rot[1] += dp * 0.08;
        s.vel = 0;
        if (Math.abs(dl) < 0.05 && Math.abs(dp) < 0.05) s.target = null;
      } else if (autoRotate && !s.drag && performance.now() > s.idleUntil) s.rot[0] += 0.08;
      if (!s.drag && Math.abs(s.vel) > 0.01) {
        s.rot[0] += s.vel;
        s.vel *= 0.95;
      }
      const proj = geoOrthographic().scale(r).translate([cx, cy]).rotate([s.rot[0], s.rot[1], 0]).clipAngle(90);
      const path = geoPath(proj, ctx);
      ctx.clearRect(0, 0, W, W);

      // sphere with soft light from upper left
      const g = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r);
      if (night) {
        g.addColorStop(0, "#1f2c24");
        g.addColorStop(1, "#0a0f0c");
      } else {
        g.addColorStop(0, "#f6f1e3");
        g.addColorStop(1, "#d6cbae");
      }
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = g;
      ctx.fill();

      ctx.beginPath();
      path(GRATICULE);
      ctx.strokeStyle = night ? "#e8e2cf14" : "#1b1d1618";
      ctx.lineWidth = 0.6 * dpr;
      ctx.stroke();

      ctx.beginPath();
      path(LAND);
      ctx.fillStyle = night ? "#1a261e" : "#e2d8bd";
      ctx.fill();
      ctx.fillStyle = hatch;
      ctx.fill();
      ctx.strokeStyle = night ? "#c9c2a855" : "#1b1d16aa";
      ctx.lineWidth = 0.8 * dpr;
      ctx.stroke();

      // density
      const pts = s.pts;
      if (pts) {
        const lam = -s.rot[0] * RAD;
        const phi = -s.rot[1] * RAD;
        const cxv = Math.cos(phi) * Math.cos(lam);
        const cyv = Math.cos(phi) * Math.sin(lam);
        const czv = Math.sin(phi);
        const dot = Math.max(1.1, (r / 260) * 1.25) * (step / 2);
        if (night) ctx.globalCompositeOperation = "lighter";
        for (let i = 0; i < pts.length; i += 3) {
          const lo = pts[i] * RAD;
          const la = pts[i + 1] * RAD;
          const cl = Math.cos(la);
          const d = cl * Math.cos(lo) * cxv + cl * Math.sin(lo) * cyv + Math.sin(la) * czv;
          if (d <= 0.02) continue;
          const p = proj([pts[i], pts[i + 1]]);
          if (!p) continue;
          const v = pts[i + 2];
          const size = dot * (s.sparse ? 1.5 : 0.7 + v * 0.9) * dpr;
          if (night) {
            ctx.fillStyle = `rgba(231,196,107,${(s.sparse ? 0.5 : 0.05) + Math.pow(v, 1.3) * 0.5})`;
          } else {
            ctx.fillStyle = `rgba(${Math.round(120 + v * 44)},${Math.round(70 - v * 10)},40,${(s.sparse ? 0.55 : 0.06) + Math.pow(v, 0.9) * (s.sparse ? 0.45 : 0.85)})`;
          }
          ctx.fillRect(p[0] - size / 2, p[1] - size / 2, size, size);
        }
        ctx.globalCompositeOperation = "source-over";
      }

      // marker
      if (s.marker) {
        const p = proj(s.marker);
        const lam = -s.rot[0] * RAD;
        const phi = -s.rot[1] * RAD;
        const lo = s.marker[0] * RAD;
        const la = s.marker[1] * RAD;
        const d =
          Math.cos(la) * Math.cos(lo) * Math.cos(phi) * Math.cos(lam) +
          Math.cos(la) * Math.sin(lo) * Math.cos(phi) * Math.sin(lam) +
          Math.sin(la) * Math.sin(phi);
        if (p && d > 0) {
          ctx.strokeStyle = night ? "#f3e7c4" : "#9b2f25";
          ctx.lineWidth = 1.6 * dpr;
          ctx.beginPath();
          ctx.arc(p[0], p[1], 9 * dpr, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(p[0] - 16 * dpr, p[1]);
          ctx.lineTo(p[0] - 4 * dpr, p[1]);
          ctx.moveTo(p[0] + 4 * dpr, p[1]);
          ctx.lineTo(p[0] + 16 * dpr, p[1]);
          ctx.moveTo(p[0], p[1] - 16 * dpr);
          ctx.lineTo(p[0], p[1] - 4 * dpr);
          ctx.moveTo(p[0], p[1] + 4 * dpr);
          ctx.lineTo(p[0], p[1] + 16 * dpr);
          ctx.stroke();
        }
      }

      // terminator shading on the limb
      const shade = ctx.createRadialGradient(cx, cy, r * 0.75, cx, cy, r);
      shade.addColorStop(0, "rgba(0,0,0,0)");
      shade.addColorStop(1, night ? "rgba(0,0,0,0.45)" : "rgba(60,45,20,0.18)");
      ctx.beginPath();
      path({ type: "Sphere" });
      ctx.fillStyle = shade;
      ctx.fill();
      ctx.strokeStyle = night ? "#e8e2cf55" : "#1b1d16";
      ctx.lineWidth = 1.2 * dpr;
      ctx.stroke();

      // brass meridian ring with degree ticks
      if (ring) {
        const r1 = r + 10 * dpr;
        const r2 = r + 22 * dpr;
        ctx.strokeStyle = night ? "#e8e2cf55" : "#1b1d16aa";
        ctx.lineWidth = 0.8 * dpr;
        ctx.beginPath();
        ctx.arc(cx, cy, r1, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, r2, 0, Math.PI * 2);
        ctx.stroke();
        for (let a = 0; a < 360; a += 5) {
          const t = (a - 90) * RAD;
          const long = a % 30 === 0;
          const ri = long ? r1 : r1 + 5 * dpr;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(t) * ri, cy + Math.sin(t) * ri);
          ctx.lineTo(cx + Math.cos(t) * r2, cy + Math.sin(t) * r2);
          ctx.stroke();
        }
        ctx.fillStyle = night ? "#e8e2cfaa" : "#1b1d16cc";
        ctx.font = `${10 * dpr}px var(--font-plex-mono), monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const lonFacing = ((-s.rot[0] % 360) + 540) % 360 - 180;
        const latFacing = -s.rot[1];
        ctx.fillText("N", cx, cy - r2 - 9 * dpr);
        ctx.fillText("S", cx, cy + r2 + 9 * dpr);
        ctx.textAlign = "right";
        ctx.fillText(
          `${Math.abs(latFacing).toFixed(0)}°${latFacing >= 0 ? "N" : "S"}  ${Math.abs(lonFacing).toFixed(0)}°${lonFacing >= 0 ? "E" : "W"}`,
          W - 8 * dpr,
          W - 8 * dpr
        );
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [theme, autoRotate, ring, step]);

  const toLonLat = (e: React.PointerEvent): [number, number] | null => {
    const s = state.current;
    const rect = canvas.current!.getBoundingClientRect();
    const W = s.size;
    const r = (W / 2) * (ring ? 0.86 : 0.98);
    const proj = geoOrthographic().scale(r).translate([W / 2, W / 2]).rotate([s.rot[0], s.rot[1], 0]);
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (Math.hypot(x - W / 2, y - W / 2) > r) return null;
    const ll = proj.invert!([x, y]);
    return ll ? [ll[0], ll[1]] : null;
  };

  return (
    <div ref={wrap} className={`relative select-none ${className}`}>
      <canvas
        ref={canvas}
        className={`block touch-none ${onPick ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"}`}
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          const s = state.current;
          s.drag = { x: e.clientX, y: e.clientY, rot: [...s.rot] as [number, number], moved: 0 };
          s.target = null;
          s.vel = 0;
        }}
        onPointerMove={(e) => {
          const s = state.current;
          if (!s.drag) return;
          const k = 180 / s.size / 1.1;
          const dx = e.clientX - s.drag.x;
          const dy = e.clientY - s.drag.y;
          s.drag.moved = Math.max(s.drag.moved, Math.hypot(dx, dy));
          const nl = s.drag.rot[0] + dx * k;
          s.vel = nl - s.rot[0];
          s.rot = [nl, Math.max(-80, Math.min(80, s.drag.rot[1] - dy * k))];
        }}
        onPointerUp={(e) => {
          const s = state.current;
          const moved = s.drag?.moved ?? 0;
          s.drag = null;
          s.idleUntil = performance.now() + 6000;
          if (moved < 4 && onPick) {
            s.vel = 0;
            const ll = toLonLat(e);
            if (ll) onPick(ll[0], ll[1]);
          }
        }}
      />
      {loading && gbif !== null && (
        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 label ${theme === "night" ? "text-glow" : "text-ink-2"}`}>
          Plotting records…
        </div>
      )}
    </div>
  );
}
