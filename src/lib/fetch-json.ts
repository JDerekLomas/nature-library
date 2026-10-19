// Fetch JSON from a public API with retries. "Missing" (404) is an answer; an outage is an error.
// Errors are thrown so Next.js never caches a temporary failure as a page (ISR keeps the last good version instead).

export class UpstreamError extends Error {}

export async function fetchJson<T>(url: string, opts: { revalidate?: number; timeout?: number; tries?: number; headers?: Record<string, string> } = {}): Promise<T | null> {
  const { revalidate = 604800, timeout = 10000, tries = 3, headers } = opts;
  let last = "";
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { next: { revalidate }, signal: AbortSignal.timeout(timeout), headers });
      if (r.ok) return (await r.json()) as T;
      if (r.status === 404 || r.status === 400 || r.status === 422) return null;
      last = `HTTP ${r.status}`;
    } catch (e) {
      last = e instanceof Error ? e.message : String(e);
    }
    await new Promise((res) => setTimeout(res, 600 * 2 ** i));
  }
  throw new UpstreamError(`${new URL(url).host} unavailable (${last})`);
}
