# The Nature Library

**Live:** https://thenaturelibrary.org

A library of living things, built as a sister to the [Source Library](https://sourcelibrary.org). Every catalogued species on Earth has a page. A hand-edited codex goes deep on the ones people most need. Each living thing is set beside the herbals and bestiaries that first tried to name it.

## Rooms

| Room | Path | What it does |
|---|---|---|
| Atlas | `/atlas` | An engraved globe of GBIF occurrence density for all life or one group. Search a country, province, city or village, paste coordinates, or tap anywhere, and get the species recorded there. Countries and provinces use their official boundaries. Every view has a shareable URL. |
| Wheel | `/wheel` | The tree of life as a sunburst, live from iNaturalist's taxonomy. |
| Catalogue of All Life | `/catalogue` | The GBIF Backbone Taxonomy, millions of names, browsable from the kingdoms down, plus every species ever recorded in each country. |
| Shelves | `/shelves` | The codex by use: medicine cabinet, orchard, granary, poison garden, pollinators, venom cabinet and more. |
| Bestiary & Aviary | `/bestiary`, `/aviary` | Animals by class. The birding room has field marks, written and recorded songs, look-alikes, where and when to look, and the birds recorded near you this month. |
| Plates | `/plates` | About 32,000 historical woodcuts and engravings from the Source Library. |
| Herball Room | `/herball` | John Gerard's *Herball* (1597), chapter by chapter, in his own spelling beside the printed page. |
| Identify | `/identify` | Photo identification with BioCLIP, run entirely in the visitor's browser. No API key is needed and the photo never leaves the device. |
| Garden Planner | `/grow` | Reads ten years of local weather (Open-Meteo ERA5) to find your hardiness zone, then lists the codex plants you can grow. |
| Corrections | `/about/corrections` | Every statement changed when the codex was fact-checked, with its source. |

Species pages:

- `/species/[slug]`: hand-edited codex sheets (~790).
- `/taxon/[id]`: any iNaturalist taxon, assembled live with its Wikipedia sections, sounds, records and old books.
- `/gbif/[key]`: any GBIF backbone name, including species never photographed.

## How it's built

- **Next.js 16** (App Router), Tailwind 4, d3-geo canvas globes, deployed on Vercel.
- **Data sources** (all open; attribution is shown on every page): iNaturalist, GBIF, Wikipedia, Wikimedia Commons, Wikidata, the Source Library, the Internet Archive, the Biodiversity Heritage Library, Open-Meteo, and Photon/OpenStreetMap.
- **Identification:** the [BioCLIP](https://imageomics.github.io/bioclip/) image encoder, int8 ONNX ([NaturDex conversion](https://huggingface.co/Virien/naturdex-bioclip-onnx)), running on onnxruntime-web 1.30. Species text embeddings are precomputed with the [Trail Bingo](https://huggingface.co/jsteinshouer/trail-bingo-bioclip-onnx) text encoder:
  - a core file of the 10,000 most-recorded species, plus the codex;
  - per-group files with the next ~70,000, loaded only when a photo looks like that group.

## Data pipeline

```bash
npm install
node scripts/pull-sourcelibrary.mjs      # Source Library natural-history illustrations → data/raw (resumable)
node scripts/pull-gerard.mjs 520         # transcribed pages of Gerard's Herball → chapters
node scripts/enrich-commons.mjs          # seed & fruit photographs from Wikimedia Commons
npm run data                             # merge codex, enrich (iNat/GBIF/Wikipedia), match plates → data/*.json

# identifier label embeddings (separate tool; downloads ~230 MB of models)
cd tools/identify && npm install
node fetch-labels.mjs 20 && node embed-labels.mjs                               # core tier
node fetch-labels-ext.mjs && node resolve-parents.mjs && node embed-ext.mjs     # per-group tier
```

The hand-edited entries live in `data/codex/*.json` (schema in `data/SCHEMA.md`). The links from codex species to Gerard's chapters are hand-checked in `data/gerard-concordance.json`. Fact-check logs are in `data/factcheck/`.

## Run locally

```bash
npm install
npm run dev
```

Optional: set `GEMINI_API_KEY` in `.env.local` (Gemini 3.1 Flash Lite, `src/lib/gemini.ts`). This adds an AI "second opinion" on the Identify desk and structured field notes on open-stacks pages. Everything else works without it.

## Licences and attribution

The site's text and data come from sources with their own licences:

- iNaturalist photos: per-photo CC licences, and only openly licensed photos are used.
- Wikipedia text: CC BY-SA 4.0.
- Source Library transcriptions and images: CC BY-SA 4.0, with public-domain originals.
- GBIF-mediated data: per dataset.
- BioCLIP: MIT.

Each page credits its sources. Medicinal and edibility content is historical and educational, not advice.

---

Powered by [Source Library](https://sourcelibrary.org) and [Wisdom Frontiers](https://wisdom-frontiers.com/).
