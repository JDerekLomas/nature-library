# Fact-check log: birds-1 (wings.json, birds-americas.json)

Date: 2026-10-18. Scope: 107 entries (52 in wings.json, 55 in birds-americas.json).
Format: species — field — wrong → now — source.

**How this was checked.** The session's shared web-search budget ran out partway through. The items marked [web] were confirmed live this session. Every other entry was reviewed against standard references (Birds of the World/Cornell, BirdLife DataZone, Wikipedia, the primary papers each entry names), and the URLs given are where to confirm them. For a few IUCN categories no live re-check was possible, and they are flagged at the end.

## Changes — wings.json

- Monarch butterfly — summary — "flies up to about 4,000 km" → "up to about 4,800 km" — https://www.fws.gov/species/monarch-danaus-plexippus
- Monarch butterfly — summary — "the return is completed by its great-grandchildren" (too precise, and the generation count varies) → "the journey north is completed over several generations by its descendants" — https://en.wikipedia.org/wiki/Monarch_butterfly_migration
- Common eastern firefly — funFact — "nearly every photon goes to light rather than heat" (based on the obsolete ~88% quantum-yield figure) → now says about 40% (Ando et al. 2008), almost no heat — https://doi.org/10.1038/nphoton.2007.251
- Leafcutter ant — abilities — "agriculture over 50 million years old" → "part of an ant agriculture tens of millions of years old" — https://en.wikipedia.org/wiki/Leafcutter_ant [web]
- Leafcutter ant — abilities — "Carries Pseudonocardia on its body" (true of Acromyrmex and lower attines; Atta largely lacks this visible bacterial cover) → it secretes antimicrobials and weeds out Escovopsis — https://en.wikipedia.org/wiki/Leafcutter_ant [web]
- Common green darner — summary — "the first insect migration of this kind tracked with chemical markers" (monarchs were isotope-tracked in 1998) → "revealed in 2018 by chemical markers in its wings" — https://doi.org/10.1098/rsbl.2018.0101
- Seven-spot ladybird — lore — "released in the USA repeatedly from 1956 onward" (date not supported) → released repeatedly, established by the 1970s — https://en.wikipedia.org/wiki/Coccinella_septempunctata
- Orchid mantis — abilities — "Reflects UV light like flowers" (not supported by the O'Hanlon studies) → its colour is hard for bee and fly eyes to tell from flowers — https://doi.org/10.1086/674553
- Orchid mantis — animal.size — "males about half that" (contradicted its own behaviour line) → "males ~2.5 cm" — https://en.wikipedia.org/wiki/Hymenopus_coronatus
- Bee hummingbird — lore — "a national natural symbol there" (Cuba's national bird is the Cuban trogon) → removed; stamps kept — https://en.wikipedia.org/wiki/Bee_hummingbird
- Peregrine falcon — lore — "medieval European law reserved it for earls" (it was a hawking hierarchy, not law) → "the 15th-century Boke of St Albans assigned it to earls" — https://en.wikipedia.org/wiki/Book_of_Saint_Albans
- Bald eagle — animal.lifespan — "record over 38" → "record about 38" — https://www.allaboutbirds.org/guide/Bald_Eagle/lifehistory
- Common ostrich — summary — "largest eggs of any living animal" → "of any living bird" — https://en.wikipedia.org/wiki/Common_ostrich
- Resplendent quetzal — summary — "tail coverts up to about 1 m long" (contradicted its own size field) → streamers up to ~65 cm, bird about 1 m long overall — https://en.wikipedia.org/wiki/Resplendent_quetzal
- Common raven — abilities — "Leads wolves to carcasses" (mostly anecdotal) → "Associates with wolves and human hunters to scavenge their kills" — https://en.wikipedia.org/wiki/Common_raven
- Raggiana bird-of-paradise — summary and abilities — "flip upside down" / "hanging" (that is Blue or Emperor BoP behaviour) → wing-clapping and head-shaking while raising plumes — https://en.wikipedia.org/wiki/Raggiana_bird-of-paradise [web]
- Griffon vulture — abilities — "Stomach acid destroys anthrax and cholera" (overstated) → "Extremely acidic stomach kills many pathogens in rotting meat" — https://en.wikipedia.org/wiki/Vulture

## Changes — birds-americas.json

- Wood thrush — abilities — "Requires calcium-rich prey such as snails to lay eggs" → "Relies on calcium-rich prey such as snails when laying eggs" — https://www.allaboutbirds.org/guide/Wood_Thrush/lifehistory
- Northern mockingbird — animal.lifespan — "Typically about 8 years" (not supported) → removed; banding record kept — https://www.allaboutbirds.org/guide/Northern_Mockingbird/lifehistory
- Scarlet tanager — funFact — "named from a specimen in olive plumage" (unsourced) → olivacea describes the plumage of females and young birds — https://en.wikipedia.org/wiki/Scarlet_tanager [web]
- Kirtland's warbler — animal.whereToSee — "Grayling and Mio (US Fish and Wildlife Service / Michigan Audubon)" → Grayling (Michigan Audubon) and Mio (US Forest Service) — https://www.michiganaudubon.org/kirtlands-warbler-tours/
- Hermit thrush — funFact — Catharus "a reference to the songs of the group" (unsupported) → "katharos, 'pure' or 'clean'" — https://en.wikipedia.org/wiki/Catharus
- Rufous hornero — lore — "after a 1928 schoolchildren's poll" (poll not verifiable) → "Argentina's national bird since 1928" — https://es.wikipedia.org/wiki/Furnarius_rufus [web]
- White bellbird — animal.lookalikes — "Three-wattled Bellbird is chestnut" → "chestnut with a white head and neck and three wattles" — https://en.wikipedia.org/wiki/Three-wattled_bellbird
- Paradise tanager — animal.lookalikes — Seven-colored Tanager "greener throat" (its throat is black) → "turquoise-green head, black throat and orange rump" — https://en.wikipedia.org/wiki/Seven-colored_tanager [web]
- Oilbird — summary — "only nocturnal fruit-eating bird" (the kākāpō also eats fruit at night) → "only nocturnal flying fruit-eating bird" — https://en.wikipedia.org/wiki/Oilbird
- Toco toucan — funFact — "a major egg predator of the manduvi tree" (garbled) → main seed disperser of the manduvi and a major predator of Hyacinth Macaw eggs — https://doi.org/10.1017/S0959270908000087 (Pizo et al. 2008)
- California condor — summary — "the last 27 birds were taken into captivity" (22 wild birds were captured, giving 27 in total) → "the last wild bird was captured, leaving 27 condors, all in captivity" — https://www.fws.gov/species/california-condor-gymnogyps-californianus
- Whooping crane — summary — "fell to about 15 wild birds in 1941" (about 21 wild birds existed counting the Louisiana flock) → "whose only migratory flock fell to about 15 birds in 1941" — https://en.wikipedia.org/wiki/Whooping_crane
- Cuban trogon — funFact — Priotelus "means 'saw-tail'" → "from Greek for 'saw' and 'end'" — https://en.wikipedia.org/wiki/Cuban_trogon
- Greater rhea — animal.voice — "'nan-doo', the source of its name" (folk etymology) → claim removed — https://en.wikipedia.org/wiki/Greater_rhea [web]
- Greater rhea — lore — "saw a rhea in the dark dust lanes of the Milky Way" → a star constellation (Ema) near the Southern Cross — https://en.wikipedia.org/wiki/Guarani_astronomy

## Verified live and kept (notable)

- California condor funFact (607 total, 392 wild at end of 2025) — https://www.fws.gov/sites/default/files/documents/2026-02/2025-california-condor-population-status_508-compliant.pdf [web]
- Whooping crane funFact (about 540 in 2025–26) — https://www.fws.gov/press-release/2026-06/service-estimates-540-whooping-cranes-wintered-texas-coast-2025-2026 [web]
- IUCN: Keel-billed toucan NT, North Island brown kiwi VU, Piping plover NT, Kirtland's warbler NT, Emperor penguin NT — BirdLife DataZone factsheets [web]
- American goldfinch, Washington state bird chosen by schoolchildren (1951) — https://en.wikipedia.org/wiki/American_goldfinch [web]

## Unchanged entries (reviewed, no errors found)

wings.json: Western honey bee, Buff-tailed bumblebee, Atlas moth, Dung beetle (South African ball-roller), Mound-building termite, Domestic silkmoth (medicinal claims fine; cautions adequate), Menelaus blue morpho, Globe skimmer, Desert locust, Elephant hawk-moth, Violet carpenter bee, Ruby-throated hummingbird, Rufous hummingbird, Anna's hummingbird, Golden eagle, Emperor penguin, North Island brown kiwi, Wandering albatross, Arctic tern, Snowy owl, Kākāpō, Superb lyrebird, Scarlet macaw, Greater flamingo, Shoebill, Hoatzin, Bar-tailed godwit, Eurasian hoopoe, Indian peafowl, Barn swallow, Sulphur-crested cockatoo, Common starling, Rock dove, Red junglefowl, Satin bowerbird, Great hornbill, Mute swan, Red-crowned crane.
(The honey bee's medicinal entry was checked. Its infant-botulism and anaphylaxis cautions are present and correct.)

birds-americas.json: Northern cardinal, American robin, Blue jay, Baltimore oriole, Black-capped chickadee, Cedar waxwing, Painted bunting, Eastern bluebird, American goldfinch, Dark-eyed junco, Song sparrow, Red-winged blackbird, Andean cock-of-the-rock, Club-winged manakin, Sword-billed hummingbird, Common potoo, Pileated woodpecker, Northern flicker, Keel-billed toucan, Greater roadrunner, Red-tailed hawk, Harpy eagle, Crested caracara, Andean condor, King vulture, Great horned owl, Burrowing owl, Barred owl, Wood duck, Sandhill crane, Great blue heron, Roseate spoonbill, Scarlet ibis, Humboldt penguin, Common loon, Piping plover, American flamingo, Hyacinth macaw, Puerto Rican amazon, Turquoise-browed motmot, Wild turkey.

## Open items (not re-verified live because the search budget ran out)

- IUCN categories taken from standard references but not re-fetched this session: Bar-tailed godwit NT, Snowy owl VU, Rufous hummingbird NT, Bee hummingbird NT, Greater rhea NT (Wikipedia [web] agrees), Red-crowned crane VU, Western honey bee DD (a European regional assessment; a global assessment may not exist, so NE could be the more accurate code).
- Insect IUCN codes (Photinus pyralis LC, Bombus terrestris LC, Xylocopa violacea LC) may reflect regional or European assessments.
- wings.json bird entries have no fieldMarks, voice, lookalikes, whereToSee, season or order fields, although SCHEMA.md says these are required for birds. They were not added because this task was fact-checking only.
