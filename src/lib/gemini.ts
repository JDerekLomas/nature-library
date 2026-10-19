import "server-only";

// The two AI desks (identify's second opinion, the field notes) run on Gemini 3.1 Flash Lite:
// cheap enough to leave open to anonymous visitors, with JSON-schema output like the codex expects.
export const GEMINI_MODEL = "gemini-3.1-flash-lite";

export class GeminiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

/** One generateContent call that must come back as JSON matching `schema`. */
export async function geminiJson<T>({ system, parts, schema, maxTokens }: { system: string; parts: Part[]; schema: object; maxTokens: number }): Promise<T> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new GeminiError(503, "no-key");
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts }],
      generationConfig: { responseMimeType: "application/json", responseJsonSchema: schema, maxOutputTokens: maxTokens },
    }),
  });
  if (!r.ok) {
    const msg = ((await r.json().catch(() => null)) as { error?: { message?: string } } | null)?.error?.message ?? `Gemini ${r.status}`;
    throw new GeminiError(r.status === 400 || r.status === 403 ? 503 : r.status === 429 ? 429 : 502, msg);
  }
  const j = (await r.json()) as { candidates?: { finishReason?: string; content?: { parts?: { text?: string }[] } }[]; promptFeedback?: { blockReason?: string } };
  const c = j.candidates?.[0];
  if (j.promptFeedback?.blockReason || c?.finishReason === "SAFETY" || c?.finishReason === "PROHIBITED_CONTENT") throw new GeminiError(422, "declined");
  const text = c?.content?.parts?.map((p) => p.text ?? "").join("");
  if (!text) throw new GeminiError(502, "empty");
  return JSON.parse(text) as T;
}
