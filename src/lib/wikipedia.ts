// Pulls a species' full Wikipedia article and returns the sections a naturalist's reference would want, verbatim.

export interface WikiSection {
  key: "description" | "ecology" | "food" | "medicine" | "toxicity" | "cultivation" | "culture" | "distribution";
  title: string; // our heading
  heading: string; // the article's own heading
  text: string;
}

const KINDS: [WikiSection["key"], string, RegExp][] = [
  ["description", "Description", /^(description|morphology|appearance|characteristics|anatomy)/i],
  ["distribution", "Range & habitat", /(distribution|habitat|range)/i],
  ["ecology", "What it does", /(ecology|behaviou?r|reproduction|pollinat|life cycle|diet|feeding|symbio|interactions)/i],
  ["food", "At the table", /(culinary|food|cuisine|edib|nutrition|cooking|as food|uses)/i],
  ["medicine", "In medicine", /(medic|pharmac|herbal|traditional|phytochem|therapeutic)/i],
  ["toxicity", "Toxicity", /(toxic|poison|venom|danger)/i],
  ["cultivation", "How it is grown", /(cultivat|horticult|growing|agricultur|propagat|husbandry|in gardens)/i],
  ["culture", "In human culture", /(culture|folklore|mytholog|history|symbolism|in religion|etymology)/i],
];

const MAX = 1400;
const trim = (t: string) => {
  const s = t.replace(/\n{2,}/g, "\n\n").trim();
  if (s.length <= MAX) return s;
  const cut = s.lastIndexOf(". ", MAX);
  return s.slice(0, cut > MAX * 0.6 ? cut + 1 : MAX) + " …";
};

export async function wikiSections(articleUrl?: string | null): Promise<{ sections: WikiSection[]; url: string; title: string; lead: string } | null> {
  const title = articleUrl?.split("/wiki/")[1];
  if (!title) return null;
  const r = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exsectionformat=wiki&redirects=1&format=json&titles=${title}`,
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
    const idx = blocks.findIndex((b) => re.test(b.heading) && !used.has(b.heading) && b.text.trim().length > 80 && !/see also|references|further|external/i.test(b.heading));
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
  return { sections: out, url: decodeURIComponent(articleUrl!), title: page.title ?? title, lead: lead.length > 1600 ? lead.slice(0, lead.lastIndexOf(". ", 1600) + 1) : lead };
}
