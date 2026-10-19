// Finding pictures for species that have none in the usual places: iNaturalist's photos, then Wikimedia Commons
// (photographs and old natural-history plates), then the figures of the paper that described it (Plazi's
// Biodiversity Literature Repository on Zenodo) — often the only pictures of a species named last year. Only openly licensed files that name the species, each with its credit.

export interface FoundImage {
  url: string; // display size
  thumb: string;
  page: string; // where the credit and licence live
  attribution: string;
  license: string;
  source: "iNaturalist" | "Wikimedia Commons" | "Plazi / Biodiversity Literature Repository";
}

const UA = { "User-Agent": "NatureLibrary/0.1 (https://thenaturelibrary.org)" };
const OPEN = /^(cc0|public domain|pd|cc by(-sa)?( \d\.\d)?|cc-by(-sa)?-\d\.\d|attribution|no restrictions)/i;
const NOT_THE_ORGANISM = /\b(map|range|distribution|locator|stamp|coin|logo|graph|chart|diagram|skeleton|herbarium sheet label|label)\b/i;
const strip = (h = "") => h.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, " ").trim();

/** iNaturalist taxon photos for an exact scientific name (CC-licensed only). */
export async function inatPhotosByName(name: string, limit = 6): Promise<FoundImage[]> {
  try {
    const r = await fetch(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(name)}&per_page=5&is_active=true`, { next: { revalidate: 2592000 }, signal: AbortSignal.timeout(8000) });
    const t = ((await r.json()).results ?? []).find((x: { name: string }) => x.name.toLowerCase() === name.toLowerCase());
    if (!t?.id) return [];
    const full = await fetch(`https://api.inaturalist.org/v1/taxa/${t.id}`, { next: { revalidate: 2592000 }, signal: AbortSignal.timeout(8000) }).then((x) => x.json());
    const photos = (full.results?.[0]?.taxon_photos ?? []).map((p: { photo: unknown }) => p.photo) as { url: string; medium_url?: string; square_url?: string; attribution: string; license_code?: string; id: number }[];
    return photos
      .filter((p) => p.license_code)
      .slice(0, limit)
      .map((p) => ({
        url: (p.medium_url ?? p.url).replace(/\/(square|small|medium|thumb)\./, "/large."),
        thumb: p.square_url ?? p.url,
        page: `https://www.inaturalist.org/photos/${p.id}`,
        attribution: p.attribution,
        license: p.license_code!.toUpperCase(),
        source: "iNaturalist" as const,
      }));
  } catch {
    return [];
  }
}

/** Wikimedia Commons files whose title names the species: photographs and public-domain plates. */
export async function commonsImages(name: string, limit = 6): Promise<FoundImage[]> {
  const words = name.toLowerCase().split(/\s+/);
  if (words.length < 2) return [];
  try {
    const u =
      `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=20` +
      `&gsrsearch=${encodeURIComponent(`"${name}"`)}&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=960`;
    const j = await fetch(u, { headers: UA, next: { revalidate: 2592000 }, signal: AbortSignal.timeout(9000) }).then((r) => r.json());
    const pages = Object.values(j.query?.pages ?? {}) as { title: string; index: number; imageinfo?: { thumburl?: string; url: string; descriptionurl: string; mime: string; extmetadata?: Record<string, { value: string }> }[] }[];
    return pages
      .sort((a, b) => a.index - b.index)
      .map((p) => ({ p, i: p.imageinfo?.[0] }))
      .filter(({ p, i }) => {
        if (!i || !/image\/(jpeg|png|webp)/.test(i.mime)) return false;
        const title = p.title.toLowerCase().replace(/_/g, " ");
        // the file must name this species (genus and epithet), and not be a map or a stamp
        return words.every((w) => title.includes(w)) && !NOT_THE_ORGANISM.test(title) && OPEN.test(i.extmetadata?.LicenseShortName?.value ?? "");
      })
      .slice(0, limit)
      .map(({ i }) => {
        const m = i!.extmetadata ?? {};
        const license = strip(m.LicenseShortName?.value);
        const artist = strip(m.Artist?.value).replace(/\s*(Copyright|Published|Publicada)\b.*$/i, "").slice(0, 90);
        return {
          url: i!.thumburl ?? i!.url,
          thumb: (i!.thumburl ?? i!.url).replace(/\/\d+px-/, "/250px-"),
          page: i!.descriptionurl,
          attribution: artist ? `${artist} (${license})` : license,
          license,
          source: "Wikimedia Commons" as const,
        };
      });
  } catch {
    return [];
  }
}

// figures that show the organism, not the analysis of it
const NOT_THE_ANIMAL = /phylogen|cladogram|dendrogram|bayesian|maximum[- ]likelihood|principal component|\bpca\b|scatter|morphospace|\bmap\b|distribution of|localit|habitat|sonogram|spectrogram|oscillogram|waveform|\bchart|\bgraph|haplotype|network/i;

/** Figures from the open-access paper that described the species, via Plazi's Biodiversity Literature Repository. */
export async function plaziFigures(name: string, limit = 6): Promise<FoundImage[]> {
  const epithet = name.split(/\s+/).at(-1)!.toLowerCase();
  try {
    const j = await fetch(`https://zenodo.org/api/records?communities=biosyslit&type=image&size=25&q=${encodeURIComponent(`"${name}"`)}`, {
      headers: UA,
      next: { revalidate: 2592000 },
      signal: AbortSignal.timeout(10000),
    }).then((r) => r.json());
    type Rec = { id: number; links?: { self_html?: string }; metadata: { description?: string; title?: string; license?: { id?: string }; creators?: { name: string }[]; publication_date?: string }; files?: { key: string; links?: { self?: string } }[] };
    const scored = ((j.hits?.hits ?? []) as Rec[])
      .map((r) => {
        const cap = strip(r.metadata.description ?? r.metadata.title ?? "");
        const lic = r.metadata.license?.id ?? "";
        const file = r.files?.find((f) => /\.(jpe?g|png)$/i.test(f.key));
        let score = /in life|\blive\b|living/i.test(cap) ? 4 : 0;
        if (/holotype|paratype|allotype|lectotype/i.test(cap)) score += 2;
        if (/dorsal|lateral|habitus|general view/i.test(cap)) score += 1;
        const ok = file && /^cc-by|^cc0|^cc-zero/i.test(lic) && cap.toLowerCase().includes(epithet) && !NOT_THE_ANIMAL.test(cap);
        return ok ? { r, cap, lic, file: file!, score } : null;
      })
      .filter(Boolean) as { r: Rec; cap: string; lic: string; file: { key: string; links?: { self?: string } }; score: number }[];
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ r, cap, lic, file }) => {
        const url = file.links?.self ?? `https://zenodo.org/records/${r.id}/files/${encodeURIComponent(file.key)}`;
        const who = (r.metadata.creators ?? []).slice(0, 3).map((c) => c.name.split(",")[0]).join(", ");
        const year = r.metadata.publication_date?.slice(0, 4);
        return {
          url,
          thumb: url,
          page: r.links?.self_html ?? `https://zenodo.org/records/${r.id}`,
          attribution: `${cap.split(/(?<=\.)\s/).slice(0, 2).join(" ").slice(0, 120)} ${who}${year ? `, ${year}` : ""} (${lic.toUpperCase().replace(/-/g, " ")})`,
          license: lic,
          source: "Plazi / Biodiversity Literature Repository" as const,
        };
      });
  } catch {
    return [];
  }
}

/** The first source that has pictures wins; Commons fills in where iNaturalist has none. */
export async function findImages(name: string, limit = 6): Promise<FoundImage[]> {
  const a = await inatPhotosByName(name, limit);
  if (a.length >= 2) return a;
  const b = await commonsImages(name, limit);
  if (a.length + b.length >= 2) return [...a, ...b].slice(0, limit);
  const c = await plaziFigures(name, limit);
  return [...a, ...b, ...c].slice(0, limit);
}
