// What lives under a branch of the tree beyond iNaturalist: the current Catalogue of Life's children of the same-named
// taxon, and, for a genus, checklist species no general catalogue knows yet. The Wheel lists what iNaturalist lacks.
import { NextResponse } from "next/server";
import { fetchJson } from "@/lib/fetch-json";
import { colChildren } from "@/lib/col";
import { GROUPS, loadGroup } from "@/lib/checklists";

const COL = "https://api.checklistbank.org/dataset/3LR";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const name = (u.searchParams.get("name") ?? "").trim();
  const rank = (u.searchParams.get("rank") ?? "").trim().toLowerCase();
  const target = (u.searchParams.get("target") ?? "").trim().toLowerCase();
  if (!name || !/^[A-Za-z][A-Za-z -]{1,80}$/.test(name)) return NextResponse.json({ error: "name required" }, { status: 400 });
  try {
    const s = await fetchJson<{ result?: { usage: { id: string; name: { scientificName: string; rank: string }; status: string } }[] }>(
      `${COL}/nameusage/search?q=${encodeURIComponent(name)}${rank ? `&rank=${encodeURIComponent(rank)}` : ""}&status=accepted&limit=10`,
      { revalidate: 604800, tries: 2 }
    );
    const hit = s?.result?.find((r) => r.usage.name.scientificName === name);
    const col: { id: string; name: string; rank: string; count?: number }[] = [];
    if (hit && target && /^[a-z]+$/.test(target)) {
      // every accepted descendant at the target rank (the same rank the wheel's list shows), up to 3,000
      for (let off = 0; off < 3000; off += 1000) {
        const j = await fetchJson<{ result?: { usage: { id: string; name: { scientificName: string; rank: string } } }[]; total?: number }>(
          `${COL}/nameusage/search?TAXON_ID=${encodeURIComponent(hit.usage.id)}&rank=${target}&status=accepted&limit=1000&offset=${off}`,
          { revalidate: 604800, tries: 2 }
        );
        const rows = j?.result ?? [];
        col.push(...rows.map((r) => ({ id: r.usage.id, name: r.usage.name.scientificName, rank: r.usage.name.rank })));
        if (rows.length < 1000) break;
      }
    } else if (hit) {
      for (let off = 0; off < 3000; off += 1000) {
        const page = await colChildren(hit.usage.id, off, 1000);
        col.push(...page.items.map((c) => ({ id: c.id, name: c.name, rank: c.rank, count: c.count })));
        if (page.last || page.items.length < 1000) break;
      }
    }
    const checklist =
      rank === "genus"
        ? GROUPS.flatMap((g) =>
            (loadGroup(g)?.species ?? []).filter((sp) => sp.sci.startsWith(`${name} `) && !sp.gbif && !sp.col).map((sp) => ({ group: g, sci: sp.sci, en: sp.en }))
          )
        : [];
    return NextResponse.json({ colId: hit?.usage.id ?? null, col, checklist }, { headers: { "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=2592000" } });
  } catch {
    return NextResponse.json({ colId: null, col: [], checklist: [] }, { status: 200 });
  }
}
