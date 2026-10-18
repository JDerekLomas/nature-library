// Climate helpers shared by the Garden Planner and the "can it grow here?" check.
// USDA hardiness zones are bands of the average annual extreme minimum temperature, 10 °F (5.56 °C) wide, starting at −51.1 °C.

export function parseZones(z?: string): [number, number] | null {
  if (!z) return null;
  const m = z.match(/(\d{1,2})\s*[ab]?\s*(?:–|-|—|to)\s*(\d{1,2})/);
  if (m) return [parseInt(m[1]), parseInt(m[2])];
  const one = z.match(/(\d{1,2})/);
  return one ? [parseInt(one[1]), parseInt(one[1])] : null;
}

export function zoneFromMin(tminC: number) {
  const x = (tminC + 51.1) / 5.556;
  const zone = Math.max(1, Math.min(13, Math.floor(x) + 1));
  const half = x - Math.floor(x) < 0.5 ? "a" : "b";
  return { zone, label: `${zone}${half}` };
}

export interface Climate {
  lat: number;
  lon: number;
  place: string;
  avgExtremeMin: number; // °C
  hottestMonthMax: number; // °C, mean daily max of the hottest month
  annualRain: number; // mm
  zone: number;
  zoneLabel: string;
}

/** Ten years of daily ERA5 reanalysis from Open-Meteo → hardiness zone, heat and rainfall. */
export async function fetchClimate(lat: number, lon: number, place: string): Promise<Climate> {
  const end = new Date();
  end.setMonth(0, 0); // last day of previous year
  const start = new Date(end);
  start.setFullYear(end.getFullYear() - 10);
  const d = (x: Date) => x.toISOString().slice(0, 10);
  const r = await fetch(
    `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${d(new Date(start.getTime() + 86400000))}&end_date=${d(end)}&daily=temperature_2m_min,temperature_2m_max,precipitation_sum&timezone=UTC`
  );
  if (!r.ok) throw new Error("Climate service unavailable");
  const j = await r.json();
  const days: string[] = j.daily.time;
  const tmin: number[] = j.daily.temperature_2m_min;
  const tmax: number[] = j.daily.temperature_2m_max;
  const rain: number[] = j.daily.precipitation_sum;
  const yearMin = new Map<string, number>();
  const monthMax = new Map<string, { s: number; n: number }>();
  let rainSum = 0;
  days.forEach((t, i) => {
    const y = t.slice(0, 4);
    if (tmin[i] != null) yearMin.set(y, Math.min(yearMin.get(y) ?? Infinity, tmin[i]));
    const mo = t.slice(5, 7);
    if (tmax[i] != null) {
      const m = monthMax.get(mo) ?? { s: 0, n: 0 };
      m.s += tmax[i];
      m.n++;
      monthMax.set(mo, m);
    }
    rainSum += rain[i] ?? 0;
  });
  const mins = [...yearMin.values()].filter(Number.isFinite);
  const avgExtremeMin = mins.reduce((a, b) => a + b, 0) / mins.length;
  const hottestMonthMax = Math.max(...[...monthMax.values()].map((m) => m.s / m.n));
  const years = days.length / 365.25;
  const z = zoneFromMin(avgExtremeMin);
  return { lat, lon, place, avgExtremeMin, hottestMonthMax, annualRain: rainSum / years, zone: z.zone, zoneLabel: z.label };
}

export type Fit = "outdoors" | "shelter" | "too-cold" | "too-warm";

/** How a plant's zone range fits a garden's zone. */
export function fitFor(range: [number, number] | null, zone: number): Fit | null {
  if (!range) return null;
  if (zone >= range[0] && zone <= range[1]) return "outdoors";
  if (zone < range[0]) return range[0] - zone <= 2 ? "shelter" : "too-cold";
  return "too-warm";
}

export const FIT_TEXT: Record<Fit, string> = {
  outdoors: "Grows outdoors here",
  shelter: "Grow in a pot brought indoors for winter, or under glass",
  "too-cold": "Too cold here except in a heated greenhouse",
  "too-warm": "Winters here are too warm; it needs a cold spell to thrive",
};

export const CLIMATE_KEY = "nl-garden";
