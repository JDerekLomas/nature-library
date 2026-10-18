# Codex entry schema

Each file in `data/codex/*.json` is a JSON array of entries. Every entry:

```jsonc
{
  "slug": "matricaria-chamomilla",        // kebab-case of scientific name
  "scientific": "Matricaria chamomilla",  // accepted binomial (as iNaturalist / GBIF use it)
  "common": "German chamomile",
  "otherNames": ["Babunah (Urdu/Hindi)", "Manzanilla (Spanish)"],   // vernacular names from several cultures, with language in parens
  "kingdom": "Plantae",                   // Plantae | Animalia | Fungi | Protista | Chromista
  "form": "Herb",                         // one word/short phrase: Herb, Shrub, Tree, Vine, Grass, Succulent, Fern, Moss, Alga, Mushroom, Lichen, Insect, Bird, Mammal, Reptile, Amphibian, Fish, Mollusc, Crustacean, Cnidarian, Arachnid, Other
  "family": "Asteraceae",
  "shelves": ["medicinal", "edible", "pollinator-plant"],   // pick ALL that apply from the shelf list below
  "summary": "2–3 sentences, vivid but factual. What makes this organism remarkable.",
  "nativeRange": "Southern & Eastern Europe, Western Asia; naturalised worldwide",
  "regions": ["Europe", "West Asia"],     // from: North America, Central America, Caribbean, South America, Europe, North Africa, Sub-Saharan Africa, Madagascar, West Asia, Central Asia, South Asia, East Asia, Southeast Asia, Oceania, Australia, Antarctica, Arctic, Pacific Ocean, Atlantic Ocean, Indian Ocean, Southern Ocean, Cosmopolitan
  "biomes": ["Temperate grassland", "Disturbed ground"],
  "abilities": [                          // "what the species can do" — 3–6 striking, TRUE capabilities/ecological roles
    "Releases apigenin and bisabolol, compounds studied for calming and anti-inflammatory effects",
    "Thrives in poor, compacted soil where few plants establish"
  ],

  // ---- edibility (plants & fungi; animals may omit) ----
  "edibility": "edible",                  // edible | edible-with-care | not-edible | toxic | deadly
  "edibleParts": ["flowers (tea)"],
  "edibilityNote": "Flowers are brewed as tea. People allergic to ragweed may react.",

  // ---- medicinal (omit if none) ----
  "medicinal": {
    "uses": [ { "tradition": "European folk medicine", "use": "Tea for sleeplessness and indigestion" },
              { "tradition": "Unani", "use": "..." } ],
    "compounds": ["apigenin", "α-bisabolol", "chamazulene"],
    "evidence": "moderate",               // strong (approved drug / robust trials) | moderate (some clinical trials) | traditional (historical use, little modern evidence)
    "cautions": "Asteraceae allergy; may interact with warfarin."
  },

  // ---- fruit (omit if none) ----
  "fruit": { "type": "Cypsela (achene)", "season": "Summer", "description": "Tiny, dry, ribbed; not eaten." },

  // ---- seed (plants; omit for animals/fungi — fungi may use "spores" text in seed.description) ----
  "seed": { "description": "Minute pale-brown seeds, ~1 mm, ribbed", "size": "~1 mm", "dispersal": "Wind and water; self-sows freely", "germination": "Needs light; surface-sow, 7–14 days at 15–20 °C" },

  // ---- growing (cultivated / cultivable plants & fungi) ----
  "grow": {
    "zones": "USDA 2–9",                  // hardiness range, or "Tropical only (USDA 10–12)"
    "climates": ["Temperate", "Mediterranean"],
    "sun": "Full sun",
    "water": "Low–moderate",
    "soil": "Light, well-drained; tolerates poor soil",
    "propagation": "Seed, sown in spring or autumn",
    "timeToHarvest": "Flowers 6–8 weeks after sowing",
    "steps": ["Scatter seed on the surface...", "Keep moist until germination...", "Harvest flowers when fully open..."]   // 3–5 practical steps
  },

  // ---- animals (omit for plants/fungi) ----
  "animal": {
    "diet": "...", "habitat": "...", "lifespan": "...", "size": "...",
    "behaviour": "1–2 sentences on a remarkable behaviour",
    // field-guide fields — REQUIRED for birds, fish, reptiles, amphibians; use where meaningful for others
    "fieldMarks": ["3–5 features that identify it in the field: plumage/colour pattern, shape, bill, fins, scales, posture"],
    "voice": "Birds/frogs/insects: what the song or call sounds like, in words (e.g. 'a rich, fluty whistle, often rendered “teacher-teacher”')",
    "lookalikes": "Species it is confused with and exactly how to tell them apart",
    "whereToSee": "Best places/habitats to find it, named regions or famous sites",
    "season": "When to see it (resident / summer visitor Apr–Sep / passage migrant / spawning run Oct–Nov…)",
    "order": "Taxonomic order, e.g. Passeriformes"
  },

  "iucn": "LC",                           // NE | DD | LC | NT | VU | EN | CR | EW | EX — use the real IUCN Red List status; NE if not assessed
  "lore": "1–2 sentences of cultural history — how humans have known it across time. Concrete (a named text, ruler, or tradition).",
  "historicalNames": ["Chamaemelum", "Camomilla", "Anthemis"],  // names used in pre-1750 herbals / bestiaries, to match old woodcuts (Latin & period vernacular). 1–4 terms.
  "funFact": "One surprising, verifiable fact."
}
```

## Shelves (use these exact ids)

- `medicinal` — documented herbal/medicinal use in any tradition
- `edible` — some part safely eaten by people (with normal preparation)
- `fruit` — bears fruit eaten by humans (botanical or culinary)
- `spice` — spice, herb, or flavouring
- `staple` — staple food crop that feeds large populations
- `toxic` — poisonous to humans/pets in a meaningful way (including "edible-with-care")
- `deadly` — can kill a human
- `tree` — trees
- `ancient` — living fossil, or individuals of extraordinary age, or lineage little changed for tens of millions of years
- `carnivorous` — carnivorous plants
- `pollinator` — animals that pollinate
- `pollinator-plant` — plants important to pollinators
- `psychoactive` — alters consciousness (historical/ritual use)
- `endangered` — IUCN VU / EN / CR
- `keystone` — keystone or ecosystem-engineer species
- `marvel` — extraordinary ability (bioluminescence, regeneration, extremophile, record-holder)
- `ocean` — marine
- `dye-fibre` — used for dye, fibre, cloth, or building
- `sacred` — central to a religious or cultural tradition
- `migrant` — great migrations
- `venomous` — venomous or poisonous animals (bites, stings, toxic skin/flesh)
- `freshwater` — lives in rivers, lakes or wetlands
- `songbird` — a notable singer (birds, also frogs/insects with famous calls)

## Rules
- Accuracy over flourish. If unsure of a field, omit it rather than guess.
- Medicinal claims: state the tradition, never prescribe; `evidence` must be honest; always include `cautions` when anything is toxic or interacts.
- Edibility: if any part is poisonous, say which in `edibilityNote`. Never call a plant "edible" if a common lookalike or raw form is dangerous without saying so (use `edible-with-care`).
- Use the binomial iNaturalist currently accepts (e.g. `Salvia rosmarinus`, not `Rosmarinus officinalis`).
- Draw `otherNames` from many cultures — South Asian, Arabic/Persian, Chinese, Indigenous American, African, etc. — not only European.
