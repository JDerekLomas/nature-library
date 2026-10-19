import { guard } from "@/lib/guard";
import { NextResponse } from "next/server";
import { getTaxon } from "@/lib/inat";
import { geminiJson, GeminiError } from "@/lib/gemini";

// The librarian's field notes: Gemini reads the species' full Wikipedia article and pulls out
// only what the article says about uses, edibility, medicine, cultivation and behaviour.
export const maxDuration = 120;

const cache = new Map<number, unknown>();

const str = { type: ["string", "null"] } as const;
const strArr = { type: "array", items: { type: "string" } } as const;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["abilities", "edibility", "edible_parts", "edibility_note", "medicinal", "medicinal_evidence", "cautions", "fruit", "seed", "grow", "animal", "lore"],
  properties: {
    abilities: { ...strArr, description: "3-6 notable things this organism can do or ecological roles, as stated in the article" },
    edibility: { type: ["string", "null"], enum: ["edible", "edible-with-care", "not-edible", "toxic", "deadly", null] },
    edible_parts: strArr,
    edibility_note: str,
    medicinal: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["tradition", "use"],
        properties: { tradition: { type: "string" }, use: { type: "string" } },
      },
    },
    medicinal_evidence: { type: ["string", "null"], enum: ["strong", "moderate", "traditional", null] },
    cautions: str,
    fruit: str,
    seed: str,
    grow: {
      type: ["object", "null"],
      additionalProperties: false,
      required: ["zones", "climate", "sun", "water", "soil", "propagation", "steps"],
      properties: { zones: str, climate: str, sun: str, water: str, soil: str, propagation: str, steps: strArr },
    },
    animal: {
      type: ["object", "null"],
      additionalProperties: false,
      required: ["diet", "habitat", "lifespan", "size", "behaviour"],
      properties: { diet: str, habitat: str, lifespan: str, size: str, behaviour: str },
    },
    lore: { ...str, description: "One or two sentences of human history or culture involving this organism" },
  },
} as const;

const SYSTEM = `You are the librarian of the Nature Library, a reference library of living things.
You are given the full text of a Wikipedia article about one organism. Extract field notes into the JSON schema.

Rules:
- Use only what the article states or directly implies. If the article is silent on a field, return null (or an empty array). Do not fill gaps from general knowledge.
- Edibility: only set it if the article discusses eating, toxicity or poisoning. If any part is poisonous, say which in edibility_note. If the organism is an animal, set edibility null.
- Medicinal uses: name the tradition the article attributes (e.g. "Traditional Chinese medicine", "Ayurveda", "Folk medicine"). Set medicinal_evidence to "strong" only if the article describes an approved drug or robust clinical evidence; "traditional" when it is only historical use.
- grow: only for organisms the article says are cultivated. steps are short practical instructions drawn from the cultivation section.
- Write plainly, in British English, without hype.`;

export async function GET(req: Request) {
  const id = Number(new URL(req.url).searchParams.get("taxon"));
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "taxon required" }, { status: 400 });
  if (cache.has(id)) return NextResponse.json(cache.get(id), { headers: cacheHeaders });
  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "no-key" }, { status: 503 });
  const blocked = guard(req, 40);
  if (blocked) return NextResponse.json({ error: blocked }, { status: blocked === "forbidden" ? 403 : 429 });

  const t = await getTaxon(id);
  const title = t?.wikipedia_url?.split("/wiki/")[1];
  if (!t || !title) return NextResponse.json({ error: "no-article" }, { status: 404 });

  const wr = await fetch(
    `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&redirects=1&format=json&titles=${title}`,
    { headers: { "User-Agent": "NatureLibrary/0.1 (educational)" }, next: { revalidate: 604800 } }
  );
  const wj = wr.ok ? await wr.json().catch(() => ({})) : {};
  const page = Object.values(wj.query?.pages ?? {})[0] as { extract?: string; title?: string } | undefined;
  const article = page?.extract;
  if (!article || article.length < 300) return NextResponse.json({ error: "no-article" }, { status: 404 });

  try {
    const notes = {
      ...(await geminiJson<Record<string, unknown>>({
        system: SYSTEM,
        schema: SCHEMA,
        maxTokens: 4000,
        parts: [{ text: `<article title="${page?.title}" organism="${t.name}" common_name="${t.preferred_common_name ?? ""}">\n${article}\n</article>` }],
      })),
      source: { title: page?.title, url: t.wikipedia_url },
    };
    cache.set(id, notes);
    return NextResponse.json(notes, { headers: cacheHeaders });
  } catch (err) {
    if (err instanceof GeminiError) {
      const error = err.status === 422 ? "declined" : err.status === 429 ? "busy" : err.status === 503 ? "The desk needs a valid GEMINI_API_KEY." : err.message;
      return NextResponse.json({ error }, { status: err.status });
    }
    throw err;
  }
}

const cacheHeaders = { "Cache-Control": "public, s-maxage=2592000, stale-while-revalidate=2592000" };
