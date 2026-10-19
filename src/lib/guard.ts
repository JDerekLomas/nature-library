// Best-effort protection for the AI routes, which spend money per call: same-site requests only, and a per-IP budget.
// The budget lives in each serverless instance's memory, so it slows abuse rather than guaranteeing a hard cap.
const hits = new Map<string, number[]>();

export function guard(req: Request, perHour: number): string | null {
  const host = req.headers.get("host");
  const from = req.headers.get("origin") ?? req.headers.get("referer");
  if (!from || !host || new URL(from).host !== host) return "forbidden";
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 3600_000);
  if (recent.length >= perHour) return "rate-limited";
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return null;
}
