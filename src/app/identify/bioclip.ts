// In-browser species identification with BioCLIP (Stevens et al., CVPR 2024).
// The image encoder runs on the visitor's device via ONNX Runtime Web; the photo never leaves it.
// Label embeddings (≈10,000 most-observed iNaturalist species + the codex) are precomputed by tools/identify.

const ORT_BASE = "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.30.0/dist/";
const MODEL_URL = "https://huggingface.co/Virien/naturdex-bioclip-onnx/resolve/main/bioclip-image-int8.onnx";
const CACHE = "nl-bioclip-v1";
const MEAN = [0.48145466, 0.4578275, 0.40821073];
const STD = [0.26862954, 0.26130258, 0.27577711];

/* eslint-disable @typescript-eslint/no-explicit-any */
type Ort = any;
export type Label = [number, string, string, string, string]; // inatId, scientific, common, iconic, codexSlug

export interface Guess {
  id: number;
  name: string;
  common: string;
  iconic: string;
  slug: string;
  p: number;
  local: boolean;
}

export interface Result {
  guesses: Guess[];
  genus: { name: string; p: number } | null;
  confident: boolean;
  ms: number;
}

let loading: Promise<{ ort: Ort; session: any; labels: Label[]; scales: Float32Array; vecs: Int8Array; dim: number; logitScale: number }> | null = null;

function loadScript(src: string) {
  return new Promise<void>((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => res();
    s.onerror = () => rej(new Error("Could not load the vision runtime"));
    document.head.appendChild(s);
  });
}

async function fetchModel(onProgress?: (f: number) => void): Promise<ArrayBuffer> {
  try {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(MODEL_URL);
    if (hit) {
      onProgress?.(1);
      return hit.arrayBuffer();
    }
  } catch {}
  const res = await fetch(MODEL_URL);
  if (!res.ok || !res.body) throw new Error("Could not download the vision model");
  const total = Number(res.headers.get("content-length")) || 87_384_964;
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.length;
    onProgress?.(Math.min(0.99, got / total));
  }
  const buf = new Uint8Array(got);
  let o = 0;
  for (const c of chunks) {
    buf.set(c, o);
    o += c.length;
  }
  try {
    const cache = await caches.open(CACHE);
    await cache.put(MODEL_URL, new Response(buf, { headers: { "Content-Type": "application/octet-stream" } }));
  } catch {}
  onProgress?.(1);
  return buf.buffer;
}

export function loadIdentifier(onProgress?: (f: number) => void) {
  loading ??= (async () => {
    await loadScript(`${ORT_BASE}ort.min.js`);
    const ort = (window as any).ort as Ort;
    ort.env.wasm.wasmPaths = ORT_BASE;
    ort.env.wasm.numThreads = (self as any).crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 2) : 1;
    const [model, meta, bin] = await Promise.all([
      fetchModel(onProgress),
      fetch("/identify/labels.json").then((r) => r.json()),
      fetch("/identify/embeddings.bin").then((r) => r.arrayBuffer()),
    ]);
    const n = meta.count as number;
    const session = await ort.InferenceSession.create(new Uint8Array(model), { executionProviders: ["wasm"], graphOptimizationLevel: "all" });
    return {
      ort,
      session,
      labels: meta.labels as Label[],
      scales: new Float32Array(bin, 0, n),
      vecs: new Int8Array(bin, n * 4),
      dim: meta.dim as number,
      logitScale: meta.logitScale as number,
    };
  })();
  loading.catch(() => (loading = null));
  return loading;
}

function preprocess(ort: Ort, img: ImageBitmap) {
  const size = 224;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = "high";
  const side = Math.min(img.width, img.height);
  ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  const px = new Float32Array(3 * size * size);
  for (let i = 0; i < size * size; i++) for (let k = 0; k < 3; k++) px[k * size * size + i] = (data[i * 4 + k] / 255 - MEAN[k]) / STD[k];
  return new ort.Tensor("float32", px, [1, 3, size, size]);
}

// Extended tier: the 10,000 most-recorded species of each major group, fetched only when the photo looks like that group
const GROUP_FILES = new Set(["Aves", "Plantae", "Insecta", "Fungi", "Mammalia", "Reptilia", "Amphibia", "Actinopterygii", "Mollusca", "Arachnida"]);
const groupCache = new Map<string, Promise<{ labels: Label[]; scales: Float32Array; vecs: Int8Array } | null>>();
function loadGroup(g: string) {
  if (!groupCache.has(g))
    groupCache.set(
      g,
      Promise.all([fetch(`/identify/ext/${g}.json`).then((r) => (r.ok ? r.json() : null)), fetch(`/identify/ext/${g}.bin`).then((r) => (r.ok ? r.arrayBuffer() : null))])
        .then(([meta, bin]) => (meta && bin ? { labels: meta.labels as Label[], scales: new Float32Array(bin, 0, meta.count), vecs: new Int8Array(bin, meta.count * 4) } : null))
        .catch(() => null)
    );
  return groupCache.get(g)!;
}

/** Classify a photo. `nearby` = iNaturalist ids recorded near the visitor; they get a prior boost. */
export async function identify(img: ImageBitmap, nearby?: Set<number>, onStage?: (s: string) => void): Promise<Result & { searched: number }> {
  const t0 = performance.now();
  const m = await loadIdentifier();
  const out = await m.session.run({ [m.session.inputNames[0]]: preprocess(m.ort, img) });
  const emb = out[m.session.outputNames[0]].data as Float32Array;
  const D = m.dim;
  const ids = new Set<number>();
  const labels: Label[] = [];
  const logits: number[] = [];
  const score = (vecs: Int8Array, scales: Float32Array, lab: Label[]) => {
    for (let i = 0; i < lab.length; i++) {
      if (ids.has(lab[i][0])) continue;
      ids.add(lab[i][0]);
      let s = 0;
      const o = i * D;
      for (let k = 0; k < D; k++) s += vecs[o + k] * emb[k];
      labels.push(lab[i]);
      logits.push(s * scales[i] * m.logitScale + (nearby?.has(lab[i][0]) ? Math.log(4) : 0));
    }
  };
  const softmax = () => {
    let max = -Infinity;
    for (const l of logits) if (l > max) max = l;
    const p = logits.map((l) => Math.exp(l - max));
    const z = p.reduce((a, b) => a + b, 0);
    return p.map((x) => x / z);
  };
  score(m.vecs, m.scales, m.labels);
  // which groups does the first pass point at?
  let p = softmax();
  const mass = new Map<string, number>();
  labels.forEach((l, i) => mass.set(l[3], (mass.get(l[3]) ?? 0) + p[i]));
  const groups = [...mass.entries()].filter(([g, v]) => GROUP_FILES.has(g) && v > 0.15).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([g]) => g);
  if (groups.length) {
    onStage?.(`Searching deeper among ${groups.join(" and ")}…`);
    for (const g of await Promise.all(groups.map(loadGroup))) if (g) score(g.vecs, g.scales, g.labels);
    p = softmax();
  }
  const N = labels.length;
  const idx = Array.from({ length: N }, (_, i) => i).sort((a, b) => p[b] - p[a]).slice(0, 8);
  const z = 1;
  const guesses: Guess[] = idx.map((i) => {
    const [id, name, common, iconic, slug] = labels[i];
    return { id, name, common, iconic, slug, p: p[i] / z, local: !!nearby?.has(id) };
  });
  // roll up to genus when no single species stands out
  const byGenus = new Map<string, number>();
  for (let i = 0; i < N; i++) {
    const g = labels[i][1].split(" ")[0];
    byGenus.set(g, (byGenus.get(g) ?? 0) + p[i]);
  }
  const [gName, gP] = [...byGenus.entries()].sort((a, b) => b[1] - a[1])[0];
  return {
    guesses,
    genus: gP > guesses[0].p + 0.15 ? { name: gName, p: gP } : null,
    confident: guesses[0].p >= 0.5,
    ms: Math.round(performance.now() - t0),
    searched: N,
  };
}

/** Species iNaturalist naturalists have recorded within `km` of a point (up to 1,000). */
export async function speciesNear(lat: number, lng: number, km = 75): Promise<Set<number>> {
  const ids = new Set<number>();
  for (const page of [1, 2]) {
    const r = await fetch(`https://api.inaturalist.org/v1/observations/species_counts?lat=${lat}&lng=${lng}&radius=${km}&verifiable=true&per_page=500&page=${page}`);
    if (!r.ok) break;
    const j = await r.json();
    for (const x of j.results ?? []) ids.add(x.taxon.id);
    if ((j.results ?? []).length < 500) break;
  }
  return ids;
}
