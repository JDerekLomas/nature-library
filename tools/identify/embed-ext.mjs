// Embeds the extended tier → public/identify/ext/{Group}.{json,bin} (species already in the core file are skipped)
import fs from "node:fs";
import { embedTexts } from "./lib.mjs";
const core = JSON.parse(fs.readFileSync("labels-raw.json"));
const ext = JSON.parse(fs.readFileSync("labels-ext-raw.json"));
const taxa = { ...core.taxa, ...(ext.taxa ?? {}) };
const coreIds = new Set(Object.keys(core.species).map(Number));
const codex = JSON.parse(fs.readFileSync("../../data/codex.built.json"));
const codexIds = new Map(codex.filter((e) => e.inatId).map((e) => [e.inatId, e.slug]));
const RANKS = ["kingdom", "phylum", "class", "order", "family", "genus"];
const D = 512;
const OUT = "../../public/identify/ext";
fs.mkdirSync(OUT, { recursive: true });
const only = process.argv[2];
for (const [g, sp] of Object.entries(ext.groups)) {
  if (only && g !== only) continue;
  if (fs.existsSync(`${OUT}/${g}.bin`) && !only) continue;
  const species = Object.values(sp).filter((s) => !coreIds.has(s.id) && s.anc?.length).sort((a, b) => (b.obs ?? 0) - (a.obs ?? 0));
  const prompts = species.map((s) => {
    const byRank = Object.fromEntries(s.anc.map((a) => taxa[a]).filter(Boolean).map(([n, r]) => [r, n]));
    return `a photo of ${[...RANKS.map((r) => byRank[r]).filter(Boolean), s.name].join(" ")}${s.common ? ` with common name ${s.common}` : ""}.`;
  });
  const q = new Int8Array(species.length * D);
  const scales = new Float32Array(species.length);
  for (let i = 0; i < species.length; i += 48) {
    const e = await embedTexts(prompts.slice(i, i + 48));
    for (let j = 0; j < e.length / D; j++) {
      let m = 0;
      for (let k = 0; k < D; k++) m = Math.max(m, Math.abs(e[j * D + k]));
      scales[i + j] = m / 127;
      for (let k = 0; k < D; k++) q[(i + j) * D + k] = Math.round(e[j * D + k] / scales[i + j]);
    }
  }
  fs.writeFileSync(`${OUT}/${g}.bin`, Buffer.concat([Buffer.from(scales.buffer), Buffer.from(q.buffer)]));
  fs.writeFileSync(`${OUT}/${g}.json`, JSON.stringify({ count: species.length, labels: species.map((s) => [s.id, s.name, s.common ?? "", s.iconic ?? g, codexIds.get(s.id) ?? ""]) }));
  console.log(g, species.length);
}
