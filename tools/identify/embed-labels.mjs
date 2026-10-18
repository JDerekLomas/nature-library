// Embeds every label with BioCLIP's text encoder → public/identify/{labels.json,embeddings.bin}
// Prompt format follows the BioCLIP paper's best zero-shot setting: full taxonomy + common name.
import fs from "node:fs";
import { embedTexts } from "./lib.mjs";

const raw = JSON.parse(fs.readFileSync("labels-raw.json"));
const RANKS = ["kingdom", "phylum", "class", "order", "family", "genus"];
const codex = JSON.parse(fs.readFileSync("../../data/codex.built.json"));
const codexIds = new Map(codex.filter((e) => e.inatId).map((e) => [e.inatId, e.slug]));

const species = Object.values(raw.species).filter((s) => s.name && s.anc?.length);
species.sort((a, b) => (b.obs ?? 0) - (a.obs ?? 0));
const prompts = species.map((s) => {
  const byRank = Object.fromEntries((s.anc || []).map((a) => raw.taxa[a]).filter(Boolean).map(([n, r]) => [r, n]));
  const tax = [...RANKS.map((r) => byRank[r]).filter(Boolean), s.name].join(" ");
  return `a photo of ${tax}${s.common ? ` with common name ${s.common}` : ""}.`;
});
console.log(prompts.slice(0, 3));

const OUT = "../../public/identify";
fs.mkdirSync(OUT, { recursive: true });
const D = 512;
const q = new Int8Array(species.length * D);
const scales = new Float32Array(species.length); // per-vector dequantisation factor
const B = 48;
for (let i = 0; i < species.length; i += B) {
  const e = await embedTexts(prompts.slice(i, i + B));
  for (let j = 0; j < e.length / D; j++) {
    let m = 0;
    for (let k = 0; k < D; k++) m = Math.max(m, Math.abs(e[j * D + k]));
    scales[i + j] = m / 127;
    for (let k = 0; k < D; k++) q[(i + j) * D + k] = Math.round(e[j * D + k] / scales[i + j]);
  }
  if ((i / B) % 20 === 0) console.log(i, "/", species.length);
}
// layout: float32 scales[N], then int8 vectors[N×512]
fs.writeFileSync(`${OUT}/embeddings.bin`, Buffer.concat([Buffer.from(scales.buffer), Buffer.from(q.buffer)]));
// compact label table: [inatId, scientific, common, iconic, codexSlug]
fs.writeFileSync(
  `${OUT}/labels.json`,
  JSON.stringify({ dim: D, count: species.length, logitScale: 100, model: "imageomics/bioclip (ViT-B/16)", labels: species.map((s) => [s.id, s.name, s.common ?? "", s.iconic ?? "", codexIds.get(s.id) ?? ""]) })
);
console.log("done", species.length);
