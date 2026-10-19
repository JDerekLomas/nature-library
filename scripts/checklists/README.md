# World checklists

How `data/checklists/*.json` were built (October 2026). Run from the project root; intermediate files go in `work/`.

- `fish_*.py` — FishBase (via the `cboettig/fishbase` parquet tables on Hugging Face): every valid species with habitat (fresh / brackish / marine), climate and reef/pelagic zone, matched to the GBIF backbone and, where GBIF has no match, to the current Catalogue of Life.
- `vertebrates_*.py` — reptiles and amphibians (and a first mammal list) from the current Catalogue of Life release via ChecklistBank (`dataset/3LR`), matched to GBIF.
- `mammals_mdd.py` — the mammal list rebuilt from the Mammal Diversity Database CSV (the taxonomy mammalogists use), keeping the GBIF / COL links.

Species that neither GBIF nor the Catalogue of Life knows under the checklist's name (recent descriptions and genus moves) are served from the checklist itself at `/checklists/<group>/s/<Genus_species>`.
