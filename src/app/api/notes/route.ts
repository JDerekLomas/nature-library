import { guard } from "@/lib/guard";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getTaxon } from "@/lib/inat";

// The librarian's field notes: Claude reads the species' full Wikipedia article and pulls out
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
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "no-key" }, { status: 503 });
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

  const client = new Anthropic();
  try {
    const msg = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 6000,
      betas: ["server-side-fallback-2026-07-01"],
      // @ts-expect-error -- "default" scalar form of fallbacks (beta server-side-fallback-2026-07-01)
      fallbacks: "default",
      system: SYSTEM,
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      messages: [
        {
          role: "user",
          content: `<article title="${page?.title}" organism="${t.name}" common_name="${t.preferred_common_name ?? ""}">\n${article}\n</article>`,
        },
      ],
    });
    if (msg.stop_reason === "refusal") return NextResponse.json({ error: "declined" }, { status: 422 });
    const text = msg.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") return NextResponse.json({ error: "empty" }, { status: 502 });
    const notes = { ...JSON.parse(text.text), source: { title: page?.title, url: t.wikipedia_url } };
    cache.set(id, notes);
    return NextResponse.json(notes, { headers: cacheHeaders });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) return NextResponse.json({ error: "The desk needs a valid ANTHROPIC_API_KEY." }, { status: 503 });
    if (err instanceof Anthropic.RateLimitError) return NextResponse.json({ error: "busy" }, { status: 429 });
    if (err instanceof Anthropic.APIError) return NextResponse.json({ error: err.message }, { status: 502 });
    throw err;
  }
}

const cacheHeaders = { "Cache-Control": "public, s-maxage=2592000, stale-while-revalidate=2592000" };
