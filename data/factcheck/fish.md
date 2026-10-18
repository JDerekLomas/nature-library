# Fact-check log: fish (fish-freshwater.json, fish-marine.json)

Checked 2026-10-18. 87 entries (44 freshwater, 43 marine). 31 entries changed, 38 field edits. Files were edited in place with a Python script (json.dump, ensure_ascii=False, indent=1) and then validated: all `iucn` values are legal codes, and every VU/EN/CR entry carries the `endangered` shelf.

Sources: IUCN categories were checked against current Wikipedia taxoboxes, which cite IUCN assessment IDs, and against FishBase (fishbase.net.br mirror; fishbase.se blocked automated access). Sizes, ages and orders come from FishBase. Other claims were checked with targeted searches. **Caveat:** the session's shared web-search quota ran out partway through. The remaining claims (in the "unchanged" list) were checked against Wikipedia article text where possible and otherwise against established knowledge, so they were not all searched one by one.

## Changes (species — field — wrong → now — source)

### Freshwater
- Tenualosa ilisha — funFact — "roughly doubling the national catch" → "more than doubling" (about 0.2 Mt in 2002–03 to over 0.5 Mt by 2020s) — https://en.wikipedia.org/wiki/Ilish
- Labeo catla — animal.size — "40 kg or more" → "39 kg" (FishBase max published weight 38.6 kg) — https://www.fishbase.net.br/summary/Labeo-catla
- Wallago attu — abilities — "swallow fish nearly a third of its own length" (unsourced figure) → "swallow large fish whole" — softened
- Cyprinus carpio — iucn — LC → **VU** (wild native populations, IUCN T6181A3107721); `endangered` shelf added; summary now explains why an invasive species is VU; lifespan "some over 40 in captivity" → "reported ages approach 40" — https://en.wikipedia.org/wiki/Common_carp
- Oncorhynchus mykiss — animal.whereToSee — McCloud River called the "type locality of many hatchery strains" (wrong term; the type locality is Kamchatka) → "source of the original hatchery strains" — https://en.wikipedia.org/wiki/Rainbow_trout
- Esox lucius — animal.order — Salmoniformes → **Esociformes** — https://www.fishbase.net.br/summary/Esox-lucius
- Silurus glanis — abilities, animal.size — max length "2.7 m" → "2.8 m" (Po River fish of 280 cm) — https://www.fieldandstream.com/stories/fishing/freshwater-fishing/catfishing/biggest-igfa-wels-catfish
- Silurus glanis — lore — Agassiz "1856 … Silurus aristotelis" → 1857, named *Glanis aristotelis* (now *Silurus aristotelis* Garman 1890) — https://gbif.org/species/5201679 ; https://en.wikipedia.org/wiki/Aristotle%27s_catfish
- Perca flavescens — animal.size — "up to about 40 cm" → "50 cm"; lifespan "up to about 20" → "maximum reported about 11" — https://www.fishbase.net.br/summary/Perca-flavescens
- Micropterus nigricans — animal.lifespan — "Usually 10–16 years" → "Up to about 16 years, rarely over 20" (FishBase max 23) — https://www.fishbase.net.br/summary/Micropterus-salmoides
- Electrophorus electricus — animal.lifespan — "About 15 years in the wild" (no wild data) → "Poorly known in the wild; 15–20+ years in captivity" — softened
- Scleropages formosus — animal.lookalikes — the saratoga names were muddled ("Australian saratoga and northern saratoga … S. jardinii, S. leichardti", "only in Australia and New Guinea") → northern/gulf saratoga *S. jardinii* (N Australia and New Guinea) and spotted saratoga *S. leichardti* (Queensland) — https://en.wikipedia.org/wiki/Scleropages
- Lates niloticus, Lates calcarifer, Toxotes jaculatrix — animal.order — "Carangiformes" → "Carangaria incertae sedis (traditionally Perciformes)" (FishBase: "Carangaria/misc") — https://www.fishbase.net.br/summary/Lates-niloticus ; https://www.fishbase.net.br/summary/Toxotes-jaculatrix
- Lates niloticus — funFact — "around 200 … species are thought to have disappeared" → "disappeared or become extremely rare, although a few have since been found again" — https://en.wikipedia.org/wiki/Nile_perch
- Symphysodon aequifasciatus — funFact — "fry cannot survive without it" (overstated; fry can be hand-raised) → "fry depend on it … very hard to raise without the parents" — softened
- Astyanax mexicanus — animal.lookalikes — "The only eyeless cave fish in its range" (Mexico has other blind cavefish) → limited to the Sierra de El Abra caves — softened
- Polyodon spathula — summary — "Its only living relative, the Chinese paddlefish, was declared extinct" (contradiction) → "Its only recent relative" — https://en.wikipedia.org/wiki/American_paddlefish
- Atractosteus spatula — funFact — "toxic … but not to the gar's own young" (unsupported) → "toxic to mammals and birds, which may help protect the eggs from egg-eating predators" — softened
- Amia calva — animal.size — "up to about 90 cm" → "1.1 m" (FishBase 109 cm) — https://www.fishbase.net.br/summary/Amia-calva

### Marine
- Thunnus thynnus — funFact — said **western** Atlantic stocks recovered under ICCAT quotas → the recovery was in the **eastern** stock (recovery plan from 2007); the western stock remains depleted (it fell by more than half). IUCN moved the species from EN to LC in 2021 — https://pina.com.fj/2021/09/06/tuna-species-recovering-despite-growing-pressures-on-marine-life/ ; https://www.mcsuk.org/goodfishguide/species/atlantic-bluefin-tuna/wild/1074/
- Istiophorus platypterus — iucn — LC → **VU** (assessed 1 May 2021, A2bd); `endangered` shelf added — https://www.fishbase.net.br/summary/Istiophorus-platypterus ; https://fishesoftexas.org/taxa/istiophorus-platypterus
- Coryphaena hippurus — animal.lookalikes — dorsal rays "55–66" → "58–66" — https://www.fishbase.net.br/summary/Coryphaena-hippurus
- Pterois volitans — funFact — "descends from a handful of females, perhaps fewer than ten" (outdated) → early mtDNA studies suggested about ten founders; Selwyn et al. 2017 modelling puts the likely number at around 100 or more — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5740958/
- Synanceia verrucosa — edibilityNote — "eaten as okoze in Japan" (okoze sashimi is usually *Inimicus*) → "eaten in Japan (especially Okinawa) and in Chinese cuisine" — softened
- Takifugu rubripes — animal.fieldMarks — "Black anal fin" → "White anal fin (the very similar karasu, T. chinensis, usually has a black one)" — https://www.frontiersin.org/journals/marine-science/articles/10.3389/fmars.2024.1506390/pdf
- Takifugu rubripes — abilities — "comes from symbiotic bacteria in its diet" → "made by bacteria and builds up through the food chain; farm-raised fish on a toxin-free diet are generally non-toxic" — https://pmc.ncbi.nlm.nih.gov/articles/PMC4979056
- Takifugu rubripes — edibilityNote — listed "skin" as a main toxic tissue (wild torafugu skin is low in TTX) and gave no warning about variability → liver, ovaries and intestines; toxin levels vary unpredictably between fish and between species; no antidote; licensed chefs only; liver banned; never prepare or eat home-caught or uninspected pufferfish — https://pmc.ncbi.nlm.nih.gov/articles/PMC4979056
- Zanclus cornutus — funFact — "It is so specialised that Zanclidae has just this single living species" (wrong causation; repeats the summary) → sole living species; closest relatives are the surgeonfishes — https://en.wikipedia.org/wiki/Moorish_idol
- Melanocetus johnsonii — lore — "was the first footage" → "is believed to be the first footage" — https://en.wikipedia.org/wiki/Humpback_anglerfish
- Regalecus glesne — animal.lookalikes — streamer fish "has no pelvic fins and lacks spots" → "lacks the long oar-like pelvic rays (adults have only low ridges)" — https://fishesofaustralia.net.au/home/species/1874
- Isurus oxyrinchus — abilities — "over 13,000 km in under two years" (not verified) → "many thousands of kilometres across ocean basins" — softened
- Pristis pristis — animal.whereToSee — "Atlantis (Bahamas)" (not verified) → "a few public aquariums in North America, Europe, Australia and Asia" (studbook data) — https://en.wikipedia.org/wiki/Largetooth_sawfish
- Pampus argenteus — iucn — field missing (null) → **NE** (no global assessment; the Persian Gulf regional assessment is VU, as the funFact already says) — https://www.fishbase.net.br/summary/Pampus-argenteus

## Checked, no change needed

**codex/fish-freshwater.json**
- Tor putitora (Golden mahseer)
- Labeo rohita (Rohu)
- Cirrhinus mrigala (Mrigal carp)
- Channa striata (Striped snakehead)
- Chitala chitala (Indian featherback (humped featherback))
- Anabas testudineus (Climbing perch)
- Cyprinus rubrofuscus (Koi (Amur carp))
- Carassius auratus (Goldfish)
- Salmo trutta (Brown trout (sea trout))
- Salvelinus alpinus (Arctic char)
- Oncorhynchus nerka (Sockeye salmon)
- Oncorhynchus tshawytscha (Chinook salmon (king salmon))
- Arapaima gigas (Arapaima (pirarucu))
- Pygocentrus nattereri (Red-bellied piranha)
- Osteoglossum bicirrhosum (Silver arowana)
- Oreochromis niloticus (Nile tilapia)
- Pangasianodon gigas (Mekong giant catfish)
- Pterophyllum scalare (Freshwater angelfish)
- Paracheirodon innesi (Neon tetra)
- Poecilia reticulata (Guppy)
- Betta splendens (Siamese fighting fish)
- Danio rerio (Zebrafish)
- Huso huso (Beluga sturgeon)
- Neoceratodus forsteri (Australian lungfish)
- Protopterus annectens (West African lungfish)

**codex/fish-marine.json**
- Thunnus albacares (Yellowfin tuna)
- Xiphias gladius (Swordfish)
- Gadus morhua (Atlantic cod)
- Clupea harengus (Atlantic herring)
- Engraulis encrasicolus (European anchovy)
- Scomber scombrus (Atlantic mackerel)
- Sardinops sagax (Pacific sardine)
- Mola mola (Ocean sunfish)
- Synchiropus splendidus (Mandarinfish)
- Phycodurus eques (Leafy seadragon)
- Scarus vetula (Queen parrotfish)
- Cheilinus undulatus (Humphead wrasse)
- Paracanthurus hepatus (Blue tang)
- Epinephelus itajara (Atlantic goliath grouper)
- Anarhichas lupus (Atlantic wolffish)
- Exocoetus volitans (Tropical two-wing flyingfish)
- Macropinna microstoma (Barreleye)
- Chauliodus macouni (Pacific viperfish)
- Hippoglossus hippoglossus (Atlantic halibut)
- Pleuronectes platessa (European plaice)
- Galeocerdo cuvier (Tiger shark)
- Sphyrna mokarran (Great hammerhead)
- Somniosus microcephalus (Greenland shark)
- Prionace glauca (Blue shark)
- Cetorhinus maximus (Basking shark)
- Hemiscyllium ocellatum (Epaulette shark)
- Aetobatus narinari (Spotted eagle ray)
- Hypanus americanus (Southern stingray)
- Torpedo marmorata (Marbled electric ray)
- Rastrelliger kanagurta (Indian mackerel)
- Harpadon nehereus (Bombay duck)

Notes on unchanged entries:
- IUCN categories were confirmed from Wikipedia/IUCN citations for every entry above except Protopterus annectens (rate-limited; LC kept).
- Anarhichas lupus is left as NE: FishBase reports no global assessment. Wikipedia's DD comes from a European regional assessment.
- Amia calva: since the 2022 split, Louisiana "choupique" may belong to *A. ocellicauda*. The text is left general, not changed.
