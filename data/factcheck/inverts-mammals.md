# Fact-check log: invertebrates.json & mammals-more.json

Checked 2026-10-18. 107 entries (57 invertebrates, 50 mammals); 67 field edits across 47 entries.
Format: species — field — wrong → now — source. 'deleted' means the field was removed because no source supported it.
Note: the session's shared web-search budget ran out partway through, so some later checks relied on WebFetch of known reference pages (mostly Wikipedia and museum pages) rather than fresh searches.

## invertebrates.json

### Changes

- **ornithoptera-priamus** — `summary` — A huge swallowtail of the New Guinea region whose males flash velvety black and iridescent emerald green across the rainforest canopy. It was one of the first birdwings known to European science and gave the whole group its name, Ornithoptera, 'bird-wing'. → A huge swallowtail of the New Guinea region whose males flash velvety black and iridescent emerald green across the rainforest canopy. Described by Linnaeus in 1758, it is the type species of the birdwing genus Ornithoptera, 'bird-wing'. — https://www.lepidoptera.butterflyhouse.com.au/papi/priamus.html  
  _Why:_ 'one of the first birdwings known… gave the whole group its name' overstated → it is the type species of Ornithoptera
- **ornithoptera-priamus** — `animal.size` — Wingspan roughly 12–19 cm; females the larger sex → Wingspan roughly 11–20 cm; females the larger sex — https://www.lepidoptera.butterflyhouse.com.au/papi/priamus.html  
  _Why:_ 12–19 cm → males up to ~11 cm, females up to ~20 cm
- **ornithoptera-priamus** — `animal.season` — Adults fly year-round in the tropics, most numerous in the wet season → deleted — https://www.lepidoptera.butterflyhouse.com.au/papi/priamus.html  
  _Why:_ Hedged 'most numerous in the wet season' unsupported by sources; removed
- **ornithoptera-alexandrae** — `abilities` — ["World's largest butterfly by wingspan", "Caterpillars depend on a single group of Pararistolochia vines and absorb their toxins", "Adults fly high in the rainforest canopy and rarely descend"] → ["World's largest butterfly by wingspan", "Caterpillars depend on a single group of Pararistolochia vines and absorb their toxins", "Adults usually fly high in the rainforest canopy, descending to within a few metres of the ground to feed or lay eggs"] — https://en.wikipedia.org/wiki/Queen_Alexandra%27s_birdwing  
  _Why:_ 'rarely descend' → both sexes descend low to feed and lay eggs
- **ornithoptera-alexandrae** — `animal.season` — Adults can be found through much of the year → deleted — https://en.wikipedia.org/wiki/Queen_Alexandra%27s_birdwing  
  _Why:_ Hedged 'much of the year' not supported by sources; removed
- **papilio-polytes** — `animal.season` — Year-round in the tropics, most numerous after the monsoon → Year-round in the tropics — https://en.wikipedia.org/wiki/Papilio_polytes  
  _Why:_ Removed unverified 'most numerous after the monsoon'
- **papilio-polytes** — `lore` — British naturalists in India called it the 'Mormon' in the 19th century, a joke about polygamy, because one male seemed to be paired with several very different-looking 'wives'. → Its English name 'Mormon' is usually explained as a 19th-century joke about polygamy, because one male seemed to be paired with several very different-looking 'wives'. — https://en.wikipedia.org/wiki/Papilio_polytes  
  _Why:_ Softened unsourced attribution to 'British naturalists in India'
- **tirumala-limniace** — `abilities` — ["Migrates in large numbers across peninsular India before and after the south-west monsoon", "Males gather alkaloids from Crotalaria and Heliotropium to make pheromones and boost their chemical defence", "Distasteful to predators thanks to compounds sequestered from its milkweed-family host plants"] → ["Migrates in large numbers across peninsular India around the south-west monsoon; migrating swarms are almost all males", "Males gather alkaloids from Crotalaria and Heliotropium to make pheromones and boost their chemical defence", "Distasteful to predators thanks to compounds sequestered from its milkweed-family host plants"] — https://en.wikipedia.org/wiki/Tirumala_limniace  
  _Why:_ Specific pre-/post-monsoon timing unverified → 'around the south-west monsoon'; added sourced male bias
- **tirumala-limniace** — `animal.season` — Year-round; migrations in South India mainly before (Apr–Jun) and after (Oct–Dec) the south-west monsoon → Year-round; in South India large migrations take place around the south-west monsoon — https://en.wikipedia.org/wiki/Tirumala_limniace  
  _Why:_ Month ranges (Apr–Jun, Oct–Dec) could not be verified; softened
- **tirumala-limniace** — `funFact` — Its blue spots are not pigment-filled scales but sparsely scaled, semi-transparent patches of wing. → The pale blue of its semi-transparent wing spots comes from pterobilin, a blue bile pigment. — https://en.wikipedia.org/wiki/Tirumala_limniace  
  _Why:_ Claimed spots are not pigment-coloured → colour is from the pigment pterobilin
- **macroglossum-stellatarum** — `lore` — In Japan its name hōjaku means 'hawk-bird', the same comparison Europeans make with hummingbirds; Linnaeus's epithet stellatarum refers to its larval food, the 'stellate' bedstraws with star-shaped whorls of leaves. → In Japan its name hōjaku (蜂雀) means 'bee-sparrow', likening the hovering moth to a tiny bird as Europeans do with hummingbirds; Linnaeus's epithet stellatarum refers to its larval food, the 'stellate' bedstraws with star-shaped whorls of leaves. — https://kotobank.jp/word/%E3%81%BB%E3%81%86%E3%81%98%E3%82%84%E3%81%8F-3169852  
  _Why:_ hōjaku = 蜂雀 'bee-sparrow', not 'hawk-bird'
- **acherontia-atropos** — `summary` — A large, heavy hawkmoth with a skull-like pattern on its thorax that squeaks loudly when handled. It raids beehives for honey, slipping past guard bees by smelling like them. → A large, heavy hawkmoth with a skull-like pattern on its thorax that squeaks loudly when disturbed. It raids beehives for honey, slipping past guard bees by smelling like them. — https://en.wikipedia.org/wiki/Acherontia_atropos  
  _Why:_ 'when handled' → 'when disturbed' (avoid implying handling; source says squeak when disturbed)
- **acherontia-atropos** — `animal.voice` — A sharp, mouse-like squeak, repeated when the moth is handled or alarmed. → A sharp, mouse-like squeak, repeated when the moth is disturbed or alarmed. — https://en.wikipedia.org/wiki/Acherontia_atropos  
  _Why:_ 'when handled' → 'when disturbed'
- **acherontia-atropos** — `lore` — Long treated in European folklore as an omen of death, it is named after Atropos, the Fate who cuts the thread of life. The skull-marked moth on the poster for The Silence of the Lambs (1991) is a death's-head hawkmoth. → Long treated in European folklore as an omen of death, it is named after Atropos, the Fate who cuts the thread of life. Death's-head hawkmoths are the killer's calling card in The Silence of the Lambs (1991); the moth on the film's poster is often identified as its Asian relative A. styx. — https://www.snopes.com/fact-check/silence-of-the-lambs-moth-poster/  
  _Why:_ Poster moth stated as this species → contested; Butterfly Conservation identifies poster moth as A. styx
- **acherontia-atropos** — `funFact` — Beekeepers once fitted hive entrances with small grilles specifically to keep these honey-stealing moths out. → Migrants occasionally travel far beyond Britain: one was recorded above the Arctic Circle in northern Sweden in 2019, after an unusually warm summer. — https://en.wikipedia.org/wiki/Acherontia_atropos  
  _Why:_ Beekeeper-grille claim unverifiable → replaced with sourced Arctic record
- **argema-mittrei** — `lore` — Félix Édouard Guérin-Méneville described it in 1847 and named it after Mittre, a French naval pharmacist who sent specimens from Madagascar. → Félix Édouard Guérin-Méneville described it in 1847 from Madagascar, originally as Bombyx mittrei. — https://en.wikipedia.org/wiki/Comet_moth  
  _Why:_ Eponym 'Mittre, a French naval pharmacist' could not be verified; removed
- **argema-mittrei** — `animal.season` — Adults present through much of the year in the humid east; each lives only a few days → deleted — https://en.wikipedia.org/wiki/Comet_moth  
  _Why:_ Hedged flight season not supported by sources; removed
- **argema-mittrei** — `funFact` — Captive breeding for zoos and collectors means comet moths are now more often seen in butterfly houses in Europe and North America than in the wild. → Captive breeding means comet moths are regularly displayed in butterfly houses in Europe and North America, far from their Madagascan rainforests. — https://en.wikipedia.org/wiki/Comet_moth  
  _Why:_ 'more often seen in butterfly houses than in the wild' unverifiable; softened
- **goliathus-goliatus** — `animal.season` — Adults emerge for a few months each year; timing varies across the range → deleted — https://en.wikipedia.org/wiki/Goliathus_goliatus  
  _Why:_ Vague, unsourced season guess; removed
- **dynastes-hercules** — `summary` — The longest of all beetles: horned males can reach about 17 cm, more than half of it horn. In current taxonomy the species in the strict sense lives in the Lesser Antilles, while related 'Hercules' beetles range from Mexico to Bolivia. → The longest of all beetles: horned males can reach about 17 cm, more than half of it horn. It ranges from southern Mexico to Bolivia and the Lesser Antilles; some recent studies split the mainland forms into separate species, leaving D. hercules in the strict sense on the Lesser Antilles. — https://en.wikipedia.org/wiki/Dynastes_hercules  
  _Why:_ Split presented as settled 'current taxonomy' → contested; Wikipedia still treats them as subspecies
- **dynastes-hercules** — `animal.lookalikes` — Mainland Dynastes species (D. lichyi, D. septentrionalis, D. occidentalis and others) are now separated by subtle horn and colour differences and by range. Neptune beetle (D. neptunus) is all black with extra short horns. Elephant beetles (Megasoma) lack the long thoracic horn. → Mainland Hercules beetles (D. h. lichyi, septentrionalis, occidentalis and others), treated by some authors as separate species, differ subtly in horn and colour and by range. Neptune beetle (D. neptunus) is all black with extra short horns. Elephant beetles (Megasoma) lack the long thoracic horn. — https://en.wikipedia.org/wiki/Dynastes_hercules  
  _Why:_ Softened 'now separated' species split to subspecies/contested
- **dynastes-hercules** — `animal.lifespan` — Larval stage 1–2 years; adults several months → Larval stage up to about 2 years; adults about 3–6 months in captivity — https://en.wikipedia.org/wiki/Dynastes_hercules  
  _Why:_ Tightened to sourced figures
- **dynastes-hercules** — `animal.season` — Nocturnal adults can be found for much of the year → deleted — https://en.wikipedia.org/wiki/Dynastes_hercules  
  _Why:_ Hedged 'much of the year' unsupported; removed
- **chrysochroa-fulgidissima** — `animal.season` — Adults July–August → Adults June–August, peaking in late July — https://www.honda.co.jp/outdoor/knowledge/adventure/picture-book/yamatotamamushi/  
  _Why:_ July–August → June–August with late-July peak
- **dytiscus-marginalis** — `animal.lifespan` — Adults can live 2–3 years → Adults can live several years — https://www.newforestnpa.gov.uk/discover/wildlife/beetles/great-diving-beetle  
  _Why:_ '2–3 years' → sources say several years (up to ~5)
- **phyllium-philippinicum** — `animal.season` — Year-round → deleted — https://phasmidstudygroup.org/phasmid-info/psg-culture-list/species-info?psg_no=278  
  _Why:_ Hedged 'Year-round' unverified for the wild; removed
- **deinacrida-heteracantha** — `animal.lifespan` — About 2 years in total, maturing after roughly 18 months → Up to about 2 years — https://en.wikipedia.org/wiki/Deinacrida_heteracantha  
  _Why:_ 'maturing after ~18 months' conflicts with sources (nymphs ~2 years); simplified
- **magicicada-septendecim** — `animal.lookalikes` — Magicicada cassini is smaller with an all-black abdomen underside and a rapid ticking-then-buzz song; M. septendecula has narrow orange abdominal stripes. The 13-year M. tredecim is near-identical but separated by its cycle and slightly higher-pitched song. Annual dog-day cicadas (Neotibicen) are green and brown with dark eyes. → Magicicada cassini is smaller with an all-black abdomen underside and a rapid ticking-then-buzz song; M. septendecula has narrow orange abdominal stripes. The 13-year M. tredecim is very similar but has a lower-pitched song, and the 13-year M. neotredecim can be told apart only by its cycle. Annual dog-day cicadas (Neotibicen) are green and brown with dark eyes. — https://cicadas.uconn.edu/species/m_tredecim/  
  _Why:_ M. tredecim song 'slightly higher-pitched' → lower-pitched; near-identical one is M. neotredecim
- **acheta-domesticus** — `summary` — The cricket of the hearth, a pale-brown chirper that has lived alongside people for thousands of years. Today it is the world's most widely farmed insect, raised as pet food and increasingly as human food. → The cricket of the hearth, a pale-brown chirper that has lived alongside people for thousands of years. Today it is the world's most widely farmed cricket, raised as pet food and increasingly as human food. — https://scholarworks.indianapolis.iu.edu/items/8d8757b5-9ef2-448f-9d6e-d82c89d7e808  
  _Why:_ 'most widely farmed insect' → most farmed cricket species
- **theraphosa-blondi** — `abilities` — ["Heaviest spider known, recorded at over 170 g", "Flicks clouds of barbed, irritating hairs from its abdomen at attackers", "Makes a loud hissing sound by rubbing bristles on its legs", "Fangs up to about 2 cm long"] → ["Heaviest spider known, recorded at over 170 g", "Flicks clouds of barbed, irritating hairs from its abdomen at attackers", "Makes a loud hissing sound by rubbing bristles on its legs", "Fangs about 2–4 cm long"] — https://en.wikipedia.org/wiki/Goliath_birdeater  
  _Why:_ Fang length understated: 'up to about 2 cm' → 'about 2–4 cm'
- **latrodectus-mactans** — `animal.whereToSee` — Woodpiles, stone walls and outbuildings in the south-eastern US; look with a torch at night. → Woodpiles, stone walls and outbuildings in the south-eastern US; look with a torch at night, but never touch or handle. — https://en.wikipedia.org/wiki/Southern_black_widow  
  _Why:_ Added no-handling caution
- **maratus-volans** — `lore` — Octavius Pickard-Cambridge described it in 1874 and named it volans, 'flying', believing the flaps let it glide. The photographs and films of Jürgen Otto made peacock spiders internet-famous from the 2010s. → Octavius Pickard-Cambridge described it in 1874 and named it volans, 'flying', after a collector's report that the flaps helped it glide. The photographs and films of Jürgen Otto made peacock spiders internet-famous from the 2010s. — https://en.wikipedia.org/wiki/Maratus_volans  
  _Why:_ Gliding belief was a NSW collector's, not Pickard-Cambridge's own
- **maratus-volans** — `animal.season` — Males display in austral spring, roughly Sep–Dec → Mature males Aug–Dec, displaying in the austral spring — https://en.wikipedia.org/wiki/Maratus_volans  
  _Why:_ 'roughly Sep–Dec' → mature males Aug–Dec per source
- **leiurus-quinquestriatus** — `animal.whereToSee` — Rocky desert in Egypt and Sudan, at night with an ultraviolet torch; best seen in zoos. → Rocky desert in Egypt and Sudan, where it glows under ultraviolet light at night; best seen in zoos. Never handle it, and shake out shoes and bedding in its range. — https://en.wikipedia.org/wiki/Deathstalker  
  _Why:_ Removed implicit encouragement to search for it in the wild; added no-handling caution
- **argyroneta-aquatica** — `family` — Dictynidae → Argyronetidae — https://wsc.nmbe.ch/species/8306  
  _Why:_ World Spider Catalog now places it in Argyronetidae (not Dictynidae)
- **nautilus-pompilius** — `animal.size` — Shell up to about 20 cm across → Shell usually about 15–20 cm across; exceptionally to about 25 cm — https://en.wikipedia.org/wiki/Chambered_nautilus  
  _Why:_ Max shell 'about 20 cm' → exceptional specimens to ~25 cm (254 mm)
- **sepia-officinalis** — `animal.behaviour` — In spring, adults move inshore to spawn; small males sometimes mimic females to slip past large rival males and mate. → In spring, adults move inshore to spawn; small males have been reported to mimic females to slip past large rival males and mate, a tactic better known in the giant Australian cuttlefish. — https://www.biorxiv.org/content/10.1101/226191  
  _Why:_ Female mimicry is well documented in Sepia apama; in S. officinalis it rests on preliminary (preprint) reports — softened
- **hapalochlaena-lunulata** — `summary` — A golf-ball-sized octopus that flashes vivid blue rings when alarmed. Its saliva carries tetrodotoxin, a nerve poison that can paralyse and kill an adult human within minutes, and there is no antidote. → A golf-ball-sized octopus that flashes vivid blue rings when alarmed. Its saliva carries tetrodotoxin, a nerve poison that can paralyse and kill an adult human within minutes to hours, and there is no antivenom. — https://australian.museum/learn/animals/molluscs/blue-ringed-octopus/  
  _Why:_ Death can follow within minutes to hours; softened 'within minutes'
- **homarus-americanus** — `animal.habitat` — Rocky and sandy bottoms from the shallows to about 700 m → Rocky and sandy bottoms from the shallows to about 480 m, mostly at 4–50 m — https://www.vims.edu/research/units/programs/multispecies_fisheries_research/speciesofinterest/american-lobster.php  
  _Why:_ Max depth '700 m' → about 480 m (FAO/FishBase); typical 4–50 m
- **alpheus-heterochaelis** — `nativeRange` — Western Atlantic, from Chesapeake Bay through the Gulf of Mexico and Caribbean to Brazil → Western Atlantic, from lower Chesapeake Bay and North Carolina to the Gulf of Mexico; Caribbean and Brazilian records are uncertain because the species was split into a complex — https://www.fao.org/docrep/pdf/009/ac477e/ac477e19.pdf  
  _Why:_ Range to Brazil overstated; southern records include misidentified sister species (e.g. A. estuariensis)
- **physalia-physalis** — `animal.whereToSee` — Atlantic beaches of Florida, the Caribbean, the Canary Islands and occasionally Britain and Ireland after strong westerlies. → Atlantic beaches of Florida, the Caribbean, the Canary Islands and occasionally Britain and Ireland after strong westerlies. Do not touch stranded ones: their tentacles still sting. — https://en.wikipedia.org/wiki/Portuguese_man_o%27_war  
  _Why:_ Added caution: stranded specimens still sting
- **acanthaster-solaris** — `animal.lookalikes` — Other crown-of-thorns species (A. planci in the northern Indian Ocean, A. mauritiensis in the western Indian Ocean, A. benziei in the Red Sea) are separated by range and genetics. No other reef starfish is as spiny. → Other crown-of-thorns species (A. planci in the northern Indian Ocean, A. mauritiensis in the southern Indian Ocean, A. benziei in the Red Sea) are separated by range and genetics. No other reef starfish is as spiny. — https://link.springer.com/10.1007/s00227-023-04355-5  
  _Why:_ A. mauritiensis is the southern (not western) Indian Ocean species
- **euperipatoides-rowelli** — `animal.size` — About 2–5 cm → About 3–6 cm (females); males smaller — https://en.wikipedia.org/wiki/Euperipatoides_rowelli  
  _Why:_ Size 2–5 cm → females about 3–6 cm, males smaller

### Unchanged (verified)

- vanessa-cardui — https://www.merriam-webster.com/dictionary/painted%20ladies
- papilio-machaon — https://en.wikipedia.org/wiki/Papilio_machaon
- aglais-io — https://en.wikipedia.org/wiki/Aglais_io
- danaus-chrysippus — https://en.wikipedia.org/wiki/Danaus_chrysippus
- actias-luna — https://en.wikipedia.org/wiki/Luna_moth
- dryocampa-rubicunda — https://en.wikipedia.org/wiki/Dryocampa_rubicunda
- lucanus-cervus — https://en.wikipedia.org/wiki/Lucanus_cervus
- brachinus-crepitans — https://en.wikipedia.org/wiki/Bombardier_beetle
- mantis-religiosa — https://en.wikipedia.org/wiki/European_mantis
- eciton-burchellii — https://www.nationalgeographic.com/science/article/an-entire-world-follows-the-march-of-the-army-ants
- vespa-mandarinia — https://en.wikipedia.org/wiki/Asian_giant_hornet
- paraponera-clavata — https://en.wikipedia.org/wiki/Paraponera_clavata
- anopheles-gambiae — https://en.wikipedia.org/wiki/Anopheles_gambiae
- musca-domestica — https://en.wikipedia.org/wiki/Housefly
- argiope-bruennichi — https://en.wikipedia.org/wiki/Argiope_bruennichi
- hottentotta-tamulus — https://heart.bmj.com/content/82/2/253
- enteroctopus-dofleini — https://en.wikipedia.org/wiki/Giant_Pacific_octopus
- tridacna-gigas — https://www.colorado.edu/today/2024/10/28/giant-clam-declared-critically-endangered-after-cu-boulder-assessment
- conus-geographus — https://en.wikipedia.org/wiki/Conus_geographus
- helix-pomatia — https://en.wikipedia.org/wiki/Helix_pomatia
- ariolimax-columbianus — https://en.wikipedia.org/wiki/Ariolimax_columbianus
- birgus-latro — https://en.wikipedia.org/wiki/Coconut_crab
- macrocheira-kaempferi — https://en.wikipedia.org/wiki/Japanese_spider_crab
- euphausia-superba — https://www.sealifebase.org/summary/27320
- aurelia-aurita — https://en.wikipedia.org/wiki/Aurelia_aurita
- pisaster-ochraceus — https://en.wikipedia.org/wiki/Pisaster_ochraceus
- strongylocentrotus-purpuratus — https://en.wikipedia.org/wiki/Strongylocentrotus_purpuratus
- hirudo-medicinalis — https://en.wikipedia.org/wiki/Hirudo_medicinalis
- lissachatina-fulica — https://en.wikipedia.org/wiki/Achatina_fulica

## mammals-more.json

### Changes

- **platanista-minor** — `lore` — In Sindhi folklore the bhulan was once a woman, turned into a dolphin after she was cursed by a saint, so fishermen traditionally avoided harming it. WWF-Pakistan's dolphin rescue programme has freed stranded animals from irrigation canals since 1992. → In Sindhi folklore the bhulan was once a woman, turned into a blind dolphin after she was cursed by a holy man. Since 1992 the Sindh Wildlife Department and WWF-Pakistan have run a programme rescuing dolphins stranded in irrigation canals. — https://journal.iwc.int/index.php/jcrm/article/download/349/665/4806 ; https://www.dawn.com/news/1881224  
  _Why:_ Rescue programme was started jointly by Sindh Wildlife Dept and WWF-Pakistan; 'fishermen avoided harming it' unsupported (Dawn notes the myths fed harmful beliefs, e.g. dolphin oil) → removed
- **vulpes-bengalensis** — `lore` — Foxes and jackals play the cunning roles in the Panchatantra and Jataka tales. The species was described from Bengal in 1797, hence the name, though it is now rare there. → Foxes and jackals play the cunning roles in the Panchatantra and Jataka tales. The species was described by George Shaw in 1800, hence the name, though it is now rare there. — https://en.wikipedia.org/wiki/Bengal_fox  
  _Why:_ Authority is (Shaw, 1800), not 1797
- **antilope-cervicapra** — `funFact` — The blackbuck is the only living member of the genus Antilope, the group that gave all antelopes their name. → The blackbuck is the only living member of the genus Antilope, the genus that gives the antelope subfamily Antilopinae its name. — https://en.wikipedia.org/wiki/Blackbuck  
  _Why:_ The English word 'antelope' predates the genus; Antilope is the type genus of Antilopinae → reworded
- **boselaphus-tragocamelus** — `lore` — The Mughal emperor Jahangir recorded hunting nilgai in his memoir, the Jahangirnama, and his court painter Ustad Mansur painted the animal from life. Its association with the sacred cow has long protected it, though Bihar declared it vermin in 2016 to allow culling. → The Mughal emperor Jahangir recorded hunting nilgai in his memoir, the Jahangirnama, and his court painter Ustad Mansur painted the animal from life. Its association with the sacred cow has long protected it, though India's environment ministry declared it vermin in Bihar in December 2015 to allow culling. — https://www.downtoearth.org.in/amp/story/wildlife-biodiversity/sc-refuses-to-stay-culling-of-vermin-in-hp-bihar-and-uttarakhand-54453  
  _Why:_ Notification was issued by the central MoEFCC on 1 Dec 2015 at Bihar's request, not by Bihar in 2016
- **melursus-ursinus** — `funFact` — European naturalists first classified it as a kind of sloth, based on its claws and hanging habits; the name stuck. → European naturalists first classified it as a kind of sloth, naming it Bradypus ursinus in 1791 on the strength of its long curved claws and missing upper incisors; the name 'sloth bear' stuck. — https://en.wikipedia.org/wiki/Sloth_bear  
  _Why:_ Shaw 1791 Bradypus ursinus confirmed; 'hanging habits' unsupported → replaced with claws/teeth
- **urva-edwardsii** — `lore` — Kubera, Hindu god of wealth, and the Buddhist Jambhala are depicted holding a mongoose that spits jewels. The Panchatantra tells of a loyal mongoose killed by a Brahmin who mistook the blood of a slain snake for that of his baby; Kipling's Rikki-Tikki-Tavi is the same species. → Kubera, Hindu god of wealth, and the Buddhist Jambhala are depicted holding a mongoose that spits jewels. The Panchatantra tells of a loyal mongoose killed by a Brahmin who mistook the blood of a slain snake for that of his baby; Kipling's Rikki-Tikki-Tavi is usually taken to be this species. — https://www.kiplingsociety.co.uk/tale/rikki-tikki-tavi.htm  
  _Why:_ Kipling never names the species → softened
- **manis-crassicaudata** — `abilities` — ["Toothless; a sticky tongue longer than its head and body together reaches deep into termite galleries", "Rolls into a tight ball, protected by sharp-edged scales, when threatened", "Digs burrows several metres long with powerful foreclaws", "Can close its nostrils and ears against biting ants"] → ["Toothless; a sticky tongue about 40 cm long, extending some 25 cm from the mouth, reaches deep into termite galleries", "Rolls into a tight ball, protected by sharp-edged scales, when threatened", "Digs burrows several metres long with powerful foreclaws", "Can close its nostrils and ears against biting ants"] — https://animaldiversity.org/accounts/Manis_crassicaudata/  
  _Why:_ Tongue is ~42.5 cm total (~37% of body length), not longer than head+body
- **manis-crassicaudata** — `lore` — A suit of armour made from Indian pangolin scales was presented to King George III in 1820 and is now in the Royal Armouries collection. Demand for its scales in traditional Chinese medicine, which have no proven medicinal effect, drives most poaching. → A suit of armour made from Indian pangolin scales was presented to King George III in 1820 by the Marquess of Hastings and is now displayed at the Royal Armouries in Leeds. Demand for its scales in traditional Chinese medicine, which have no proven medicinal effect, drives most poaching. — https://en.wikipedia.org/wiki/Pangolin_trade  
  _Why:_ Owned by the Royal Collection Trust, on loan to Royal Armouries → 'displayed at'
- **hoolock-hoolock** — `summary` — India's only ape, a long-armed gibbon of the forests of northeast India, Bangladesh and western Myanmar that swings through the canopy by its arms. Pairs greet each morning with loud duets that carry kilometres through the hills. Its range has shrunk sharply with forest clearance. → One of India's two apes (with the eastern hoolock), a long-armed gibbon of the forests of northeast India, Bangladesh and western Myanmar that swings through the canopy by its arms. Pairs greet each morning with loud duets that carry kilometres through the hills. Its range has shrunk sharply with forest clearance. — https://en.wikipedia.org/wiki/Eastern_hoolock_gibbon  
  _Why:_ Eastern hoolock (H. leuconedys) also occurs in Arunachal Pradesh/Assam, as the entry's own lookalikes note
- **hoolock-hoolock** — `funFact` — Hoolocks have 38 chromosomes, more than other gibbons, which is one reason they were placed in their own genus, Hoolock, in 2005. → Hoolocks have 38 chromosomes, the fewest of any gibbon (others have 44–52), which is one reason they were placed in their own genus, Hoolock, in 2005. — https://en.wikipedia.org/wiki/Gibbon  
  _Why:_ Hoolock 2n=38 is the lowest (Hylobates 44, Symphalangus 50, Nomascus 52), not the highest
- **elephas-maximus** — `summary` — The largest land animal in Asia, a forest elephant that has worked, fought and worshipped alongside people for more than 4,000 years. Fewer than about 50,000 remain in 13 countries, roughly 60% in India, increasingly squeezed into fragmented forest where conflict with farmers kills both people and elephants. → The largest land animal in Asia, a forest elephant that has worked, fought and worshipped alongside people for more than 4,000 years. Fewer than about 50,000 remain in 13 countries, the largest share in India, increasingly squeezed into fragmented forest where conflict with farmers kills both people and elephants. — https://ruralindiaonline.org/en/library/resource/status-of-elephants-in-india-dna-based-synchronous-all-india-population-estimation-of-elephants-saiee-2021-2025/  
  _Why:_ India's 2025 DNA-based estimate is 22,446 (~45% of ~50,000), so 60% (based on the 2017 count of ~30,000) is outdated
- **panthera-pardus** — `summary` — The most adaptable big cat, found from the Cape to the Russian Far East and from rainforest to desert and the edges of Mumbai. A stealthy, solitary hunter, it is strong enough to drag prey heavier than itself up into trees. It has lost much of its historic range, and several subspecies are critically endangered. → The most adaptable big cat, found from the Cape to the Russian Far East and from rainforest to desert and the edges of Mumbai. A stealthy, solitary hunter, it is strong enough to drag prey heavier than itself up into trees. It has lost much of its historic range, and some subspecies, such as the Amur and Arabian leopards, are critically endangered. — https://en.wikipedia.org/wiki/Leopard  
  _Why:_ Only two subspecies are CR → named them
- **panthera-onca** — `funFact` — Belize's Cockscomb Basin, declared in 1984 and expanded in 1986, was the world's first protected area set aside for jaguars. → Belize's Cockscomb Basin, made a no-hunting forest reserve in 1984 and a wildlife sanctuary in 1986, is widely credited as the world's first protected area set aside for jaguars. — https://www.amnh.org/learn-teach/curriculum-collections/biodiversity-crisis/the-biodiversity-crisis-jaguars  
  _Why:_ 1986 was the sanctuary declaration, not an expansion (expansions came in 1990 and 1995)
- **puma-concolor** — `lore` — Tradition holds that the Inca city of Cusco was laid out in the shape of a puma, with Sacsayhuamán as its head. In the Andes 'Puma' was a royal honorific. → Tradition holds that the Inca city of Cusco was laid out in the shape of a puma, with Sacsayhuamán as its head. — https://en.wikipedia.org/wiki/Cougar  
  _Why:_ 'Royal honorific' unverifiable → deleted
- **rangifer-tarandus** — `lore` — Reindeer herding has defined Sámi culture for centuries, and Nenets herders of the Yamal peninsula still migrate with their herds over 1,000 km a year. Clement Moore's 1823 poem 'A Visit from St. Nicholas' gave Santa his flying reindeer. → Reindeer herding has defined Sámi culture for centuries, and Nenets herders of the Yamal peninsula still migrate with their herds over 1,000 km a year. A single reindeer first pulled Santa's sleigh in the 1821 poem 'Old Santeclaus with Much Delight'; 'A Visit from St. Nicholas' (1823, attributed to Clement Clarke Moore) raised the team to eight and named them. — https://en.wikipedia.org/wiki/Old_Santeclaus_with_Much_Delight  
  _Why:_ Moore's poem did not originate Santa's reindeer; 1821 poem did
- **megaptera-novaeangliae** — `summary` — An acrobatic baleen whale with enormous wing-like flippers, known for breaching, bubble-net feeding and the most complex songs of any animal besides birds. After commercial whaling ended, most populations have recovered strongly. It migrates thousands of kilometres between cold feeding grounds and tropical breeding grounds every year. → An acrobatic baleen whale with enormous wing-like flippers, known for breaching, bubble-net feeding and some of the most complex songs in the animal kingdom. After commercial whaling ended, most populations have recovered strongly. It migrates thousands of kilometres between cold feeding grounds and tropical breeding grounds every year. — https://www.smithsonianmag.com/science-nature/songs-from-the-deep-16936683/  
  _Why:_ unrankable superlative softened
- **megaptera-novaeangliae** — `animal.whereToSee` — Hervey Bay (Queensland); Maui (Hawaii); Vava'u (Tonga); Silver Bank (Dominican Republic); Stellwagen Bank (Massachusetts); Monterey Bay (California); Juneau (Alaska); Húsavík (Iceland); Musandam and Masirah (Oman) for Arabian Sea whales → Hervey Bay (Queensland); Maui (Hawaii); Vava'u (Tonga); Silver Bank (Dominican Republic); Stellwagen Bank (Massachusetts); Monterey Bay (California); Juneau (Alaska); Húsavík (Iceland); Gulf of Masirah and the Dhofar coast (Oman) for Arabian Sea whales — https://journal.iwc.int/index.php/jcrm/article/view/329  
  _Why:_ Musandam (Strait of Hormuz) is not an Arabian Sea humpback site; Dhofar/Masirah are
- **odobenus-rosmarus** — `abilities` — ["Uses tusks up to about 1 m long as ice picks to haul out — 'Odobenus' means 'tooth-walker'", "Hundreds of stiff, sensitive whiskers detect clams in seafloor mud", "Produces powerful suction that pulls clam bodies from their shells, and jets water to dig them out", "Can slow its heart rate and stay under for 20–30 minutes"] → ["Uses tusks up to about 1 m long as ice picks to haul out — 'Odobenus' means 'tooth-walker'", "Hundreds of stiff, sensitive whiskers detect clams in seafloor mud", "Produces powerful suction that pulls clam bodies from their shells, and jets water to dig them out", "Can slow its heart rate on dives; most feeding dives last under 10 minutes, though dives of about 25 minutes have been recorded"] — https://seaworld.org/animals/all-about/walrus/adaptations/  
  _Why:_ 20–30 min overstated as typical; typical <10, record ~25
- **myrmecophaga-tridactyla** — `animal.lifespan` — About 15 years in the wild; to 25 in captivity → About 15 years in the wild; over 30 in captivity — https://www.independent.com/2014/03/14/giant-anteater-born-santa-barbara-zoo/  
  _Why:_ captive record ~31 years
- **lemur-catta** — `animal.fieldMarks` — ["Long black-and-white ringed tail (13–14 white rings) held up like a flag when walking", "Grey back and paler underside", "White face with black eye-patches and a dark nose", "Signs: troops on the ground and rocks; scent marks on saplings"] → ["Long black-and-white ringed tail (about 13 alternating black and white bands) held up like a flag when walking", "Grey back and paler underside", "White face with black eye-patches and a dark nose", "Signs: troops on the ground and rocks; scent marks on saplings"] — https://ielc.libguides.com/sdzg/factsheets/ringtailedlemur/characteristics  
  _Why:_ white ring count is 12–13, not 13–14
- **lemur-catta** — `funFact` — Studies suggest ring-tailed lemurs may have fallen to around 2,000–2,400 in the wild by 2016, fewer than in some zoo populations. → Surveys published in 2016–2017 counted only about 2,000–2,400 ring-tailed lemurs at the sites studied, raising fears the wild population had crashed; the true total is debated because many sites remain unsurveyed. — https://news.mongabay.com/2017/06/ring-tailed-lemurs-down-by-95-percent-maybe-not/  
  _Why:_ estimate was a minimum for surveyed sites and contested; 'fewer than zoos' dropped
- **desmodus-rotundus** — `animal.lifespan` — Up to about 20 years in captivity; about 9 in the wild → Up to about 29 years in captivity; about 9 in the wild — https://placentation.ucsd.edu/vampirebat.htm  
  _Why:_ captive record 29 yr (Weigl 2005)
- **desmodus-rotundus** — `animal.behaviour` — Leaves the roost after full darkness, often avoiding bright moonlight. Drinks up to about its own weight in blood in 20–30 minutes. → Leaves the roost after full darkness, often avoiding bright moonlight. Drinks about half its own body weight in blood in a 20–30 minute feed. — https://science.umd.edu/faculty/wilkinson/honr278c/Sppaccts/D_rotundus_Kolski.htm  
  _Why:_ ~40–60% body weight per meal, not 100%
- **solenodon-paradoxus** — `lore` — The Hispaniolan solenodon was described by Johann Friedrich Brandt in 1833 from a skull, and was so unusual it was named 'paradoxus'. It was reassessed from Endangered to Least Concern in 2020 as surveys showed it to be more widespread than feared. → The Hispaniolan solenodon was described by Johann Friedrich Brandt in 1833 from a specimen sent from Haiti, and was so unusual it was named 'paradoxus'. Long listed as Endangered, it was downlisted to Least Concern by the IUCN in 2020 as surveys showed it to be more widespread than feared. — https://en.wikipedia.org/wiki/Hispaniolan_solenodon  
  _Why:_ type was a specimen, not stated as skull; status went EN→NT→LC

### Unchanged (verified)

- capra-falconeri — https://en.wikipedia.org/wiki/Markhor
- panthera-leo — https://www.downtoearth.org.in/amp/story/wildlife-biodiversity/asiatic-lion-population-in-gujarat-rises-from-674-to-891-in-5-years-spreading-beyond-traditional-habitats
- rhinoceros-unicornis — https://en.wikipedia.org/wiki/Indian_rhinoceros
- ursus-arctos — https://en.wikipedia.org/wiki/Deosai_National_Park
- vulpes-vulpes — https://en.wikipedia.org/wiki/Red_fox
- canis-aureus — https://en.wikipedia.org/wiki/Golden_jackal
- macaca-mulatta — https://en.wikipedia.org/wiki/Albert_II_(monkey)
- bubalus-arnee — https://en.wikipedia.org/wiki/Wild_water_buffalo
- bos-gaurus — https://en.wikipedia.org/wiki/List_of_Indian_state_animals
- lynx-lynx — https://en.wikipedia.org/wiki/Accademia_dei_Lincei
- gulo-gulo — https://www.nationalgeographic.com/animals/article/wolverines-battling-climate-change-shrinking-north-territory-feature
- vulpes-lagopus — https://en.wikipedia.org/wiki/Arctic_fox
- alces-alces — https://en.wikipedia.org/wiki/Moose
- ovibos-moschatus — https://en.wikipedia.org/wiki/Muskox
- eschrichtius-robustus — https://en.wikipedia.org/wiki/Gray_whale
- balaena-mysticetus — https://en.wikipedia.org/wiki/Bowhead_whale
- delphinapterus-leucas — https://en.wikipedia.org/wiki/Beluga_whale
- trichechus-manatus — https://en.wikipedia.org/wiki/West_Indian_manatee
- dugong-dugon — https://en.wikipedia.org/wiki/Dugong
- hydrurga-leptonyx — https://www.britannica.com/animal/leopard-seal
- hydrochoerus-hydrochaeris — https://en.wikipedia.org/wiki/Capybara
- dasypus-novemcinctus — https://en.wikipedia.org/wiki/Nine-banded_armadillo
- gorilla-beringei — https://www.iucnredlist.org/species/39994/115576640
- pan-paniscus — https://en.wikipedia.org/wiki/Bonobo
- loris-tardigradus — https://en.wikipedia.org/wiki/Red_slender_loris
- sarcophilus-harrisii — https://en.wikipedia.org/wiki/Tasmanian_devil
- vombatus-ursinus — https://en.wikipedia.org/wiki/Common_wombat
- tachyglossus-aculeatus — https://en.wikipedia.org/wiki/Short-beaked_echidna
- plecotus-auritus — https://www.bats.org.uk/about-bats/what-are-bats/uk-bats/brown-long-eared-bat
- condylura-cristata — https://en.wikipedia.org/wiki/Star-nosed_mole
- nycticebus-bengalensis — https://en.wikipedia.org/wiki/Bengal_slow_loris
