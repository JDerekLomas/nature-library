# Spanish translation brief (codex → data/codex-es/)

Output: for each source file data/codex/<name>.json write data/codex-es/<name>.json — a JSON array with ONE object per source entry, same order, containing:
- "scientific": copied unchanged (the join key)
- "common": the Spanish common name actually used in the Spanish-speaking world (e.g. "Carraca india", "Manzanilla", "Oso polar", "Matamoscas / amanita muscaria"). If there are strong regional variants give the most widespread first, e.g. "Aguacate (palta)". If no Spanish name exists, use the scientific name.
- the translated text of every one of these fields that exists in the source (omit absent ones; keep the same structure):
  summary, nativeRange, biomes[], abilities[], edibleParts[], edibilityNote,
  medicinal.uses[].tradition, medicinal.uses[].use, medicinal.cautions,
  fruit.type, fruit.season, fruit.description,
  seed.description, seed.size, seed.dispersal, seed.germination,
  grow.climates[], grow.sun, grow.water, grow.soil, grow.propagation, grow.timeToHarvest, grow.steps[]   (keep grow.zones exactly as is),
  animal.diet, animal.habitat, animal.lifespan, animal.size, animal.behaviour, animal.fieldMarks[], animal.voice, animal.lookalikes, animal.whereToSee, animal.season, animal.order (keep the Latin order name unchanged),
  lore, funFact
Do NOT copy or translate: slug, kingdom, family, shelves, regions, iucn, historicalNames, otherNames, medicinal.compounds, medicinal.evidence, edibility, form.

Style: clear, natural neutral international Spanish (no regionalisms unless naming a regional name), as written by a careful science editor — not a literal machine translation. Metric units. Keep scientific names in italics-free plain text exactly as in the source. Keep safety meaning EXACT: never soften or strengthen any toxicity, edibility, venom, medical caution or first-aid statement. Keep quotations from historical texts in their original language and add a Spanish gloss in parentheses if the quote is in English.
Validate with python json.load; the array length must equal the source's.
