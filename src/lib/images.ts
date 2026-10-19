// Finding pictures for species that have none in the usual places: iNaturalist's photos, then Wikimedia Commons
// (photographs and old natural-history plates). Only openly licensed files that name the species, each with its credit.

export interface FoundImage {
  url: string; // display size
  thumb: string;
  page: string; // where the credit and licence live
  attribution: string;
  license: string;
  source: "iNaturalist" | "Wikimedia Commons";
}

const UA = { "User-Agent": "NatureLibrary/0.1 (https://nature-library.vercel.app)" };
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
      `&gsrsearch=${encodeURIComponent(`"${name}"`)}&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=900`;
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
          thumb: (i!.thumburl ?? i!.url).replace(/\/\d+px-/, "/240px-"),
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

/** The first source that has pictures wins; Commons fills in where iNaturalist has none. */
export async function findImages(name: string, limit = 6): Promise<FoundImage[]> {
  const a = await inatPhotosByName(name, limit);
  if (a.length >= 2) return a;
  const b = await commonsImages(name, limit);
  return [...a, ...b].slice(0, limit);
}
