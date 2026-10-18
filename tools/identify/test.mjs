import { embedTexts, embedImage } from "./lib.mjs";
const labels = [
  ["Plantae Tracheophyta Magnoliopsida Asterales Asteraceae Matricaria chamomilla", "German chamomile"],
  ["Plantae Tracheophyta Magnoliopsida Asterales Asteraceae Bellis perennis", "common daisy"],
  ["Animalia Arthropoda Insecta Hymenoptera Apidae Apis mellifera", "western honey bee"],
  ["Animalia Chordata Aves Passeriformes Corvidae Corvus corax", "common raven"],
  ["Fungi Basidiomycota Agaricomycetes Agaricales Amanitaceae Amanita muscaria", "fly agaric"],
  ["Fungi Basidiomycota Agaricomycetes Agaricales Amanitaceae Amanita phalloides", "death cap"],
  ["Plantae Tracheophyta Magnoliopsida Sapindales Meliaceae Azadirachta indica", "neem"],
].map(([t, c]) => `a photo of ${t} with common name ${c}.`);
const T = await embedTexts(labels);
const urls = {
  "fly agaric": "https://inaturalist-open-data.s3.amazonaws.com/photos/528185258/medium.jpg",
};
const codex = (await import("node:fs")).readFileSync("../../data/codex.built.json", "utf8");
const pick = JSON.parse(codex).filter((e) => ["amanita-muscaria", "apis-mellifera", "azadirachta-indica", "corvus-corax", "amanita-phalloides"].includes(e.slug));
for (const e of pick) {
  for (const ph of e.photos.slice(1, 3)) {
    const buf = Buffer.from(await (await fetch(ph.medium || ph.url)).arrayBuffer());
    const v = await embedImage(buf);
    const scores = labels.map((_, i) => { let s = 0; for (let k = 0; k < 512; k++) s += v[k] * T[i * 512 + k]; return s; });
    const best = scores.indexOf(Math.max(...scores));
    console.log(e.common.padEnd(22), "→", labels[best].split("common name ")[1], scores.map((s) => s.toFixed(3)).join(" "));
  }
}
