import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { getByInat } from "@/lib/codex";

export const maxDuration = 120;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["kind", "observed", "candidates", "caution", "photo_tips"],
  properties: {
    kind: { type: "string", enum: ["plant", "animal", "fungus", "lichen", "other-organism", "not-an-organism"] },
    observed: { type: "array", items: { type: "string" }, description: "Diagnostic features visible in the photo (leaf arrangement, cap colour, markings...)" },
    candidates: {
      type: "array",
      description: "Up to 4 candidate identifications, most likely first",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["scientific", "common", "rank", "confidence", "why", "lookalikes"],
        properties: {
          scientific: { type: "string", description: "Accepted scientific name at the most specific rank you can support" },
          common: { type: "string" },
          rank: { type: "string", enum: ["species", "genus", "family", "order", "class"] },
          confidence: { type: "number", description: "0 to 1" },
          why: { type: "string", description: "Which visible features support this, in one or two sentences" },
          lookalikes: { type: "string", description: "Species it could be confused with, and how to tell them apart" },
        },
      },
    },
    caution: { type: ["string", "null"], description: "Safety note if the organism or its lookalikes are toxic, venomous, or protected" },
    photo_tips: { type: ["string", "null"], description: "What extra photo would settle the identification (underside, flower, bark...)" },
  },
} as const;

const SYSTEM = `You are the identification desk of the Nature Library. A visitor has photographed a living thing.
Identify it as specifically as the photo honestly allows. Prefer stopping at genus or family over guessing a species.
Give calibrated confidences: 0.9+ only when diagnostic features are clearly visible. Consider where the visitor might be only if they say so.
For any mushroom or wild plant, always mention dangerous lookalikes in caution, and never say a wild specimen is safe to eat.
Use names accepted by iNaturalist.`;

interface Taxon {
  id: number;
  name: string;
  rank: string;
  preferred_common_name?: string;
  default_photo?: { medium_url: string };
  observations_count: number;
}

async function resolve(name: string): Promise<Taxon | null> {
  const r = await fetch(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(name)}&per_page=3&is_active=true&locale=en`);
  if (!r.ok) return null;
  const j = await r.json();
  const exact = (j.results as Taxon[]).find((t) => t.name.toLowerCase() === name.toLowerCase());
  return exact ?? j.results?.[0] ?? null;
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "The identify desk needs an ANTHROPIC_API_KEY." }, { status: 503 });
  const { image, note } = (await req.json()) as { image?: string; note?: string };
  const m = image?.match(/^data:(image\/(jpeg|png|webp|gif));base64,(.+)$/);
  if (!m) return NextResponse.json({ error: "Send a JPEG, PNG or WebP image." }, { status: 400 });
  if (m[3].length > 7_000_000) return NextResponse.json({ error: "Image too large." }, { status: 413 });

  const client = new Anthropic();
  try {
    const msg = await client.beta.messages.create({
      model: "claude-opus-5-5",
      max_tokens: 8000,
      betas: ["server-side-fallback-2026-07-01"],
      // @ts-expect-error -- "default" scalar form of fallbacks (beta server-side-fallback-2026-07-01)
      fallbacks: "default",
      system: SYSTEM,
      output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: m[1] as "image/jpeg", data: m[3] } },
            { type: "text", text: note ? `Visitor's note: ${note.slice(0, 500)}` : "What is this?" },
          ],
        },
      ],
    });
    if (msg.stop_reason === "refusal") return NextResponse.json({ error: "The desk could not identify this image." }, { status: 422 });
    const text = msg.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") return NextResponse.json({ error: "No answer." }, { status: 502 });
    const out = JSON.parse(text.text) as { candidates: { scientific: string; common: string; confidence: number }[] };
    const matched = await Promise.all(
      out.candidates.slice(0, 4).map(async (c) => {
        const t = await resolve(c.scientific).catch(() => null);
        const codex = t ? getByInat(t.id) : undefined;
        return {
          ...c,
          taxon: t ? { id: t.id, name: t.name, rank: t.rank, common: t.preferred_common_name, photo: t.default_photo?.medium_url, observations: t.observations_count } : null,
          href: codex ? `/species/${codex.slug}` : t ? `/taxon/${t.id}` : null,
          inCodex: !!codex,
        };
      })
    );
    return NextResponse.json({ ...out, candidates: matched });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) return NextResponse.json({ error: "The desk needs a valid ANTHROPIC_API_KEY." }, { status: 503 });
    if (err instanceof Anthropic.RateLimitError) return NextResponse.json({ error: "The desk is busy. Try again in a minute." }, { status: 429 });
    if (err instanceof Anthropic.APIError) return NextResponse.json({ error: err.message }, { status: 502 });
    throw err;
  }
}
