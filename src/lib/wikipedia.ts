// Pulls a species' full Wikipedia article and returns the sections a naturalist's reference would want, verbatim.

export interface WikiSection {
  key: "description" | "ecology" | "food" | "medicine" | "toxicity" | "cultivation" | "culture" | "distribution";
  title: string; // our heading
  heading: string; // the article's own heading
  text: string;
}

// English and Spanish headings for the sections a reference would want
const KINDS: [WikiSection["key"], string, RegExp][] = [
  ["description", "Description", /^(description|morphology|appearance|characteristics|anatomy|descripci[oó]n|morfolog[ií]a|caracter[ií]sticas|anatom[ií]a)/i],
  ["distribution", "Range & habitat", /(distribution|habitat|range|distribuci[oó]n|h[aá]bitat|ecolog[ií]a y distribuci[oó]n)/i],
  ["ecology", "What it does", /(ecology|behaviou?r|reproduction|pollinat|life cycle|diet|feeding|symbio|interactions|ecolog[ií]a|comportamiento|reproducci[oó]n|polinizaci[oó]n|ciclo de vida|alimentaci[oó]n|dieta)/i],
  ["food", "At the table", /(culinary|food|cuisine|edib|nutrition|cooking|as food|uses|gastronom|culinari|cocina|aliment|comestib|nutrici|usos)/i],
  ["medicine", "In medicine", /(medic|pharmac|herbal|traditional|phytochem|therapeutic|medicin|farmacolog|propiedades|fitoqu[ií]mic|terap[eé]ut)/i],
  ["toxicity", "Toxicity", /(toxic|poison|venom|danger|toxicidad|veneno|t[oó]xic|peligro)/i],
  ["cultivation", "How it is grown", /(cultivat|horticult|growing|agricultur|propagat|husbandry|in gardens|cultivo|horticultur|propagaci[oó]n|agricultur|jardiner)/i],
  ["culture", "In human culture", /(culture|folklore|mytholog|history|symbolism|in religion|etymology|cultura|folclore|mitolog|historia|simbolog|religi[oó]n|etimolog)/i],
];

const MAX = 1400;
const trim = (t: string) => {
  const s = t.replace(/\n{2,}/g, "\n\n").trim();
  if (s.length <= MAX) return s;
  const cut = s.lastIndexOf(". ", MAX);
  return s.slice(0, cut > MAX * 0.6 ? cut + 1 : MAX) + " …";
};

async function langTitle(enTitle: string, lang: string) {
  try {
    const ll = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&prop=langlinks&lllang=${lang}&redirects=1&format=json&titles=${enTitle}`,
      { headers: { "User-Agent": "NatureLibrary/0.1 (educational)" }, next: { revalidate: 2592000 }, signal: AbortSignal.timeout(6000) }
    ).then((r) => r.json());
    const page = Object.values(ll.query?.pages ?? {})[0] as { langlinks?: { "*": string }[] } | undefined;
    const t = page?.langlinks?.[0]?.["*"];
    return t ? encodeURIComponent(t.replace(/ /g, "_")) : null;
  } catch {
    return null;
  }
}

export async function wikiSections(articleUrl?: string | null, lang = "en"): Promise<{ sections: WikiSection[]; url: string; title: string; lead: string } | null> {
  let title = articleUrl?.split("/wiki/")[1];
  if (!title) return null;
  let host = "en.wikipedia.org";
  if (lang !== "en") {
    const lt = await langTitle(title, lang);
    if (!lt) return null; // no article in this language: the page falls back to its English lead
    title = lt;
    host = `${lang}.wikipedia.org`;
  }
  const r = await fetch(
    `https://${host}/w/api.php?action=query&prop=extracts&explaintext=1&exsectionformat=wiki&redirects=1&format=json&titles=${title}`,
    { headers: { "User-Agent": "NatureLibrary/0.1 (educational)" }, next: { revalidate: 604800 }, signal: AbortSignal.timeout(8000) }
  ).catch(() => null);
  if (!r?.ok) return null;
  const j = await r.json();
  const page = Object.values(j.query?.pages ?? {})[0] as { extract?: string; title?: string } | undefined;
  if (!page?.extract) return null;
  // split on "== Heading ==" (any level)
  const parts = page.extract.split(/\n(={2,4})\s*(.+?)\s*\1\n/);
  const blocks: { heading: string; level: number; text: string }[] = [];
  for (let i = 1; i < parts.length; i += 3) blocks.push({ level: parts[i].length, heading: parts[i + 1], text: parts[i + 2] ?? "" });
  const out: WikiSection[] = [];
  const used = new Set<string>();
  for (const [key, label, re] of KINDS) {
    // gather the top match plus its subsections
    const idx = blocks.findIndex((b) => re.test(b.heading) && !used.has(b.heading) && b.text.trim().length > 80 && !/see also|references|further|external|v[eé]ase tambi[eé]n|referencias|bibliograf|enlaces externos/i.test(b.heading));
    if (idx < 0) continue;
    const b = blocks[idx];
    let text = b.text;
    for (let k = idx + 1; k < blocks.length && blocks[k].level > b.level; k++) {
      used.add(blocks[k].heading);
      if (blocks[k].text.trim().length > 60) text += `\n\n${blocks[k].heading}. ${blocks[k].text.trim()}`;
    }
    used.add(b.heading);
    if (out.some((o) => o.key === key)) continue;
    out.push({ key, title: label, heading: b.heading, text: trim(text) });
  }
  const lead = (parts[0] ?? "").trim().split(/\n+/).slice(0, 2).join("\n\n");
  return { sections: out, url: lang === "en" ? decodeURIComponent(articleUrl!) : `https://${host}/wiki/${title}`, title: page.title ?? title, lead: lead.length > 1600 ? lead.slice(0, lead.lastIndexOf(". ", 1600) + 1) : lead };
}

/** The lead of the same article on another-language Wikipedia, found through the English article's interlanguage link. */
export async function wikiSummaryIn(lang: string, enUrl?: string | null): Promise<{ extract: string; url: string } | null> {
  const title = enUrl?.split("/wiki/")[1];
  if (!title || lang === "en") return null;
  try {
    const ll = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&prop=langlinks&lllang=${lang}&redirects=1&format=json&titles=${title}`,
      { headers: { "User-Agent": "NatureLibrary/0.1 (educational)" }, next: { revalidate: 2592000 }, signal: AbortSignal.timeout(6000) }
    ).then((r) => r.json());
    const page = Object.values(ll.query?.pages ?? {})[0] as { langlinks?: { "*": string }[] } | undefined;
    const t = page?.langlinks?.[0]?.["*"];
    if (!t) return null;
    const sum = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t.replace(/ /g, "_"))}`, {
      headers: { "User-Agent": "NatureLibrary/0.1 (educational)" },
      next: { revalidate: 2592000 },
      signal: AbortSignal.timeout(6000),
    }).then((r) => (r.ok ? r.json() : null));
    return sum?.extract ? { extract: sum.extract, url: sum.content_urls?.desktop?.page ?? `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(t)}` } : null;
  } catch {
    return null;
  }
}
