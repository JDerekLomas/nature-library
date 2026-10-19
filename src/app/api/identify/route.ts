import { guard } from "@/lib/guard";
import { NextResponse } from "next/server";
import { getByInat } from "@/lib/codex";
import { geminiJson, GeminiError } from "@/lib/gemini";

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
  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: "The identify desk needs a GEMINI_API_KEY." }, { status: 503 });
  const blocked = guard(req, 20);
  if (blocked) return NextResponse.json({ error: blocked }, { status: blocked === "forbidden" ? 403 : 429 });
  const { image, note } = (await req.json().catch(() => ({}))) as { image?: string; note?: string };
  const m = image?.match(/^data:(image\/(jpeg|png|webp|gif));base64,(.+)$/);
  if (!m) return NextResponse.json({ error: "Send a JPEG, PNG or WebP image." }, { status: 400 });
  if (m[3].length > 7_000_000) return NextResponse.json({ error: "Image too large." }, { status: 413 });

  try {
    const out = await geminiJson<{ candidates: { scientific: string; common: string; confidence: number }[] }>({
      system: SYSTEM,
      schema: SCHEMA,
      maxTokens: 4000,
      parts: [
        { inlineData: { mimeType: m[1], data: m[3] } },
        { text: note ? `Visitor's note: ${note.slice(0, 500)}` : "What is this?" },
      ],
    });
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
    if (err instanceof GeminiError) {
      const error = err.status === 422 ? "The desk could not identify this image." : err.status === 429 ? "The desk is busy. Try again in a minute." : err.status === 503 ? "The desk needs a valid GEMINI_API_KEY." : err.message;
      return NextResponse.json({ error }, { status: err.status });
    }
    throw err;
  }
}
